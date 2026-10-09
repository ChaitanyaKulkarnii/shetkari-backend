import logging
import httpx
from typing import Any, Dict
from fastapi import APIRouter, HTTPException, status
from app.model_loader import model_manager
from app.schemas import AdvisoryRequest

logger = logging.getLogger("soy_advisor.advisory")
router = APIRouter()

TALUKA_COORDS = {
    "Atpadi": {"lat": 17.42, "lon": 74.95},
    "Jath": {"lat": 17.05, "lon": 75.22},
    "Kadegaon": {"lat": 17.31, "lon": 74.32},
    "Kavathe Mahankal": {"lat": 17.00, "lon": 74.85},
    "Khanapur": {"lat": 17.26, "lon": 74.72},
    "Miraj": {"lat": 16.83, "lon": 74.64},
    "Palus": {"lat": 17.10, "lon": 74.45},
    "Shirala": {"lat": 16.98, "lon": 74.13},
    "Tasgaon": {"lat": 17.03, "lon": 74.60},
    "Walwa": {"lat": 17.05, "lon": 74.37}
}
router = APIRouter()


@router.post("/advisory", response_model=Dict[str, Any])
@router.post("/crop/analyze", response_model=Dict[str, Any])
def create_advisory(payload: AdvisoryRequest):
    """
    Generates tailored harvest, yield outlook, and market storage advisory for a soybean farmer.
    Returns JSON matching the model contract.
    """
    model = model_manager.get_model()

    farmer_dict = {
        "name": payload.name or "",
        "taluka": payload.taluka,
        "crop": payload.crop,
        "sowing_date": str(payload.sowing_date),
        "soil": payload.soil,
        "variety": payload.variety,
        "acres": payload.acres,
        "storage_cost": payload.storage_cost,
        "interest_rate": payload.interest_rate,
    }
    today_arg = str(payload.today) if payload.today is not None else None

    logger.info(
        "Advisory requested for farmer='%s', taluka='%s', variety='%s', acres=%.1f",
        farmer_dict["name"], farmer_dict["taluka"], farmer_dict["variety"], farmer_dict["acres"]
    )

    try:
        advisory_result = model.predict(farmer_dict, today=today_arg)
        
        # Extract dynamic chart data from the model instance
        try:
            import pandas as pd
            m_df = model.market.m
            max_data_date = model.market.as_of
            
            # Determine the anchor date for the charts based on expected harvest
            harvest_str = advisory_result.get("harvest", {}).get("expected_date")
            if harvest_str:
                try:
                    harvest_date = pd.Timestamp(harvest_str)
                    # Use harvest date as anchor, but cap it at the max available data date
                    as_of = min(harvest_date, max_data_date)
                except Exception:
                    as_of = max_data_date
            else:
                as_of = max_data_date
            
            # Prices last 30 days
            prices_30 = m_df[(m_df.date <= as_of) & (m_df.date > as_of - pd.Timedelta(days=30))].sort_values("date")
            prices_30_list = [{"day": r.date.strftime("%d %b"), "price": r.modal_price} for r in prices_30.itertuples()]
            
            # Prices last 7 days
            prices_7 = m_df[(m_df.date <= as_of) & (m_df.date > as_of - pd.Timedelta(days=7))].sort_values("date")
            prices_7_list = [{"day": r.date.strftime("%d %b"), "price": r.modal_price} for r in prices_7.itertuples()]
            
            # Fetch real-time weather summary and last 8 weeks (56 days) for charts
            coords = TALUKA_COORDS.get(farmer_dict["taluka"], {"lat": 16.83, "lon": 74.64})
            weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={coords['lat']}&longitude={coords['lon']}&current=temperature_2m,relative_humidity_2m&daily=precipitation_sum,temperature_2m_mean&past_days=56&forecast_days=1"
            
            try:
                with httpx.Client(timeout=5.0) as client:
                    w_resp = client.get(weather_url)
                    if w_resp.status_code == 200:
                        w_data = w_resp.json()
                        temp = w_data.get("current", {}).get("temperature_2m", 29)
                        humidity = w_data.get("current", {}).get("relative_humidity_2m", 68)
                        
                        daily = w_data.get("daily", {})
                        precips = daily.get("precipitation_sum", [])
                        temps = daily.get("temperature_2m_mean", [])
                        times = daily.get("time", [])
                        
                        precip_sum = sum(x for x in precips[-8:-1] if x is not None)
                        advisory_result["weather_summary"] = {
                            "avg_temp": round(temp),
                            "humidity": round(humidity),
                            "rainfall_7d": round(precip_sum)
                        }
                        
                        if len(times) >= 56:
                            weather_list = []
                            for i in range(0, 56, 7):
                                w_precip = [x for x in precips[i:i+7] if x is not None]
                                w_temp = [x for x in temps[i:i+7] if x is not None]
                                weather_list.append({
                                    "week": pd.to_datetime(times[i]).strftime("%b %d"),
                                    "rainfall": round(sum(w_precip), 1) if w_precip else 0,
                                    "temp": round(sum(w_temp)/len(w_temp), 1) if w_temp else 29
                                })
                    else:
                        weather_list = []
                        advisory_result["weather_summary"] = {"avg_temp": 29, "humidity": 68, "rainfall_7d": 18}
            except Exception as e:
                logger.warning("Weather API error: %s", e)
                weather_list = []
                advisory_result["weather_summary"] = {"avg_temp": 29, "humidity": 68, "rainfall_7d": 18}

            # Extract NDVI data
            ndvi_list = []
            if hasattr(model.health, 'n'):
                n_df = model.health.n
                n_taluka = n_df[(n_df.taluka == farmer_dict["taluka"]) & (n_df.year == n_df.year.max())].sort_values("date")
                ndvi_list = [{"month": r.date.strftime("%b %d"), "value": round(r.NDVI, 2)} for r in n_taluka.itertuples()]
            else:
                # Fallback generator based on crop health table
                h = model.health.get(farmer_dict["taluka"])
                if h:
                    peak = h['now']
                    months = ["Jun 12", "Jun 28", "Jul 14", "Jul 30", "Aug 15", "Aug 31", "Sep 16", "Oct 02"]
                    curve = [0.4, 0.5, 0.75, 0.95, 1.0, 1.05, 0.95, 0.85]
                    # Scale curve so that the last value equals 'now'
                    scale = peak / curve[-1]
                    ndvi_list = [{"month": m, "value": round(c * scale, 2)} for m, c in zip(months, curve)]

            advisory_result["chart_data"] = {
                "prices30": prices_30_list,
                "prices7": prices_7_list,
                "weather": weather_list,
                "ndvi": ndvi_list
            }

            # Predictive Logic Based on Realtime Data
            w_summary = advisory_result.get("weather_summary", {})
            c_temp = w_summary.get("avg_temp", 29)
            c_hum = w_summary.get("humidity", 68)
            c_rain = w_summary.get("rainfall_7d", 18)
            
            c_price = 4760
            if "market" in advisory_result and "analysis" in advisory_result["market"]:
                c_price = advisory_result["market"]["analysis"].get("price_now", 4760)

            is_suitable = True
            unsuitable_reasons = []

            if c_temp < 20 or c_temp > 35:
                is_suitable = False
                unsuitable_reasons.append(f"temperature ({c_temp}°C)")
            if c_hum < 40 or c_hum > 85:
                is_suitable = False
                unsuitable_reasons.append(f"humidity ({c_hum}%)")
            if c_rain < 5 and c_temp > 30:
                is_suitable = False
                unsuitable_reasons.append("rainfall is too low (drought stress)")
            if c_price < 4600:
                is_suitable = False
                unsuitable_reasons.append(f"market price (₹{c_price}) is too low")

            if not is_suitable:
                if c_temp > 35 or (c_rain < 5 and c_temp > 30):
                    best_time = "in 2-3 weeks when the heatwave passes and conditions stabilize"
                elif c_price < 4600:
                    best_time = "next month when cyclical market prices recover"
                else:
                    best_time = "in a few weeks when conditions normalize"

                alert_msg = f"Weather/Market is not suitable for farming/selling because {', '.join(unsuitable_reasons)}. The best time will be {best_time}."
                if "alerts" not in advisory_result:
                    advisory_result["alerts"] = []
                advisory_result["alerts"].insert(0, alert_msg)
                
                if "advisory" in advisory_result:
                    advisory_result["advisory"]["decision"] = "HOLD"
                    advisory_result["advisory"]["sell_when"] = best_time
                    advisory_result["advisory"]["reason"] = alert_msg

            # Predict future price based on conditions
            future_price = c_price
            price_notes = ""
            if c_temp > 30 and c_rain < 10:
                future_price += 250
                price_notes = "Expected lower regional yields due to dry/hot conditions will likely drive prices up in upcoming months."
            elif c_rain > 50:
                future_price -= 150
                price_notes = "Favorable rainfall suggests a strong regional harvest, which may soften prices."
            else:
                future_price += 100
                price_notes = "Normal weather conditions support steady historical upward price trends."
                
            if "market" in advisory_result and "analysis" in advisory_result["market"]:
                advisory_result["market"]["analysis"]["market_notes"] = f"{price_notes} Predicted best upcoming price: ₹{future_price}/qtl."
            
            if "advisory" in advisory_result:
                if future_price > advisory_result["advisory"].get("expected_net_price", 0):
                    advisory_result["advisory"]["expected_net_price"] = future_price
            
            # Generate future prices for graph
            future_prices_list = []
            import datetime
            base_date = datetime.datetime.now()
            for i in range(1, 7):
                month_date = base_date + datetime.timedelta(days=30*i)
                # Trend towards future_price
                trend_price = c_price + ((future_price - c_price) * (i / 6.0))
                future_prices_list.append({
                    "month": month_date.strftime("%b %Y"),
                    "price": round(trend_price)
                })
            
            advisory_result["chart_data"]["future_prices"] = future_prices_list
            advisory_result["predicted_best_price"] = future_price
            advisory_result["predicted_price_notes"] = price_notes
                
        except Exception as e:
            logger.warning("Could not extract chart data: %s", e)

        return advisory_result
    except ValueError as val_err:
        logger.warning("Validation error in model.predict: %s", val_err)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(val_err)
        )
    except Exception as exc:
        logger.error("Unexpected error in model.predict: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate advisory prediction"
        )
