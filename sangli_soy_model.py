"""
sangli_soy_model.py  –  Trainable advisory model for SOYBEAN in SANGLI district.
"""
import os, glob, json, math, datetime as dt
import numpy as np, pandas as pd, joblib
from scipy.stats import norm
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

MODEL_VERSION = "0.2.0"
SANGLI_TALUKAS = ["Atpadi", "Jath", "Kadegaon", "Kavathe Mahankal", "Khanapur", "Miraj", "Palus", "Shirala", "Tasgaon", "Walwa"]
FILES = {"market": "market_daily_2017_2026.csv", "ndvi": "satellite_ndvi_2017_2026.csv",
         "weather": "weather_daily_2017_2026.csv", "yield": "yield_2017_2026.csv"}

SOIL = {
    "Deep black (heavy)":    dict(f=1.00, risk="waterlogging", note="Holds water well. Risk is waterlogging in heavy rain – use broad-bed-furrow / drainage channels."),
    "Medium black":          dict(f=0.97, risk="",             note="Good all-round soil. Keep moisture during flowering and pod filling."),
    "Alluvial / sandy loam": dict(f=0.97, risk="dry spell",    note="Drains fast. Needs frequent light irrigation in dry spells; split fertiliser doses."),
    "Shallow / murum":       dict(f=0.85, risk="dry spell",    note="Low water-holding. High risk in dry spells – use mulch/organic matter and protective irrigation if possible."),
    "Red / laterite":        dict(f=0.90, risk="low fertility",note="Often acidic and low in organic matter. Do a soil test; add FYM/compost, lime only if the test recommends it."),
}
VARIETIES = {"early": "Early (~90 days)", "medium": "Medium (~100 days)", "late": "Late (~110 days)"}
STAGES = [(0.08, "Germination", "Check even germination; re-sow gaps within ~7–10 days. Seed treatment protects young plants."),
          (0.35, "Vegetative growth", "First weeding / inter-culture by ~20–30 days after sowing. Watch for leaf-eating caterpillars and stem pests."),
          (0.50, "Flowering", "Moisture stress matters most now – irrigate if there is a dry spell. Scout for pests every 3–4 days."),
          (0.72, "Pod formation", "Keep soil moist, scout for pod-feeding pests, avoid spraying in the heat of the day."),
          (0.90, "Seed filling", "Last critical water period. Stop irrigation as leaves start turning yellow."),
          (9.99, "Maturity / harvest", "Harvest when ~95% of pods turn brown and leaves drop. Delay causes pod shattering and losses.")]

def jsonable(o):
    if isinstance(o, dict): return {str(k): jsonable(v) for k, v in o.items()}
    if isinstance(o, (list, tuple, np.ndarray)): return [jsonable(v) for v in o]
    if isinstance(o, pd.DataFrame): return jsonable(o.to_dict("records"))
    if isinstance(o, (np.integer,)): return int(o)
    if isinstance(o, (float, np.floating)): return None if (math.isnan(o) or math.isinf(o)) else round(float(o), 2)
    if isinstance(o, (pd.Timestamp, dt.date, dt.datetime)): return str(o)[:10]
    if o is pd.NaT: return None
    return o

def locate(fname, dirs=None):
    dirs = dirs or [".", "/kaggle/working", "/content"]
    hits = glob.glob(f"/kaggle/input/**/{fname}", recursive=True)
    for d in dirs: hits += glob.glob(os.path.join(d, fname))
    return hits[0] if hits else None

def load_clean(paths=None):
    paths = paths or {k: locate(v) for k, v in FILES.items()}
    miss = [k for k, p in paths.items() if not p]
    if miss: raise FileNotFoundError(f"CSV files not found for: {miss}")
    raw = {k: pd.read_csv(p) for k, p in paths.items()}
    y = raw["yield"]; y = y[(y.district == "Sangli") & (y.crop.str.lower().str.startswith("soy"))]
    y = y.sort_values(["year", "data_status"]); y = y[y.data_status == "VALID"].drop_duplicates("year", keep="last")
    y = y[["year", "area_ha", "production_t", "yield_kg_ha", "estimate_status"]].reset_index(drop=True)
    w = raw["weather"].copy(); w["date"] = pd.to_datetime(w["date"]); w = w[w.data_status == "VALID"].sort_values("date")
    n = raw["ndvi"].copy(); n["date"] = pd.to_datetime(n["date"])
    n = n[(n.district == "Sangli") & n.taluka.isin(SANGLI_TALUKAS) & (n.data_status == "VALID") & n.NDVI.between(-0.1, 1)]
    n["doy"] = n.date.dt.dayofyear
    m = raw["market"].copy(); m["date"] = pd.to_datetime(m["date"])
    m = m[(m.district == "Sangli") & (m.commodity == "Soybean") & (m.status == "VALID")]
    m = m[(m.modal_price > 0) & m.modal_price.between(m.min_price * 0.9, m.max_price * 1.1)].sort_values("date")
    return dict(y=y, w=w, n=n, m=m)

def longest_dry_spell(rain, thr=2.5):
    best = cur = 0
    for v in rain:
        cur = cur + 1 if v < thr else 0
        best = max(best, cur)
    return best

class HarvestModel:
    PRIOR_DAYS = {"early": 90, "medium": 100, "late": 110}
    def __init__(self):
        self.base_days = dict(self.PRIOR_DAYS); self.late_slope = 0.3; self.late_cap = 8; self.spread = 5
        self.n_obs = 0; self.calibrated = False; self.resid_sd = None
    @staticmethod
    def _delay(s): return max((s - pd.Timestamp(s.year, 7, 10)).days, 0)
    def duration(self, sowing, variety):
        return int(round(self.base_days[variety] - min(self.late_slope * self._delay(sowing), self.late_cap)))
    def predict(self, sowing, variety):
        sowing = pd.Timestamp(sowing); dur = self.duration(sowing, variety); mid = sowing + pd.Timedelta(days=dur)
        return dict(expected=mid, earliest=mid - pd.Timedelta(days=self.spread), latest=mid + pd.Timedelta(days=self.spread),
                    duration_days=dur, late_sowing_adjustment_days=min(int(round(self.late_slope * self._delay(sowing))), self.late_cap))
    def fit(self, obs, k_shrink=3, k_slope=8):
        obs = obs.copy(); obs["sowing_date"] = pd.to_datetime(obs["sowing_date"]); obs["harvest_date"] = pd.to_datetime(obs["harvest_date"])
        obs = obs[obs.variety.isin(self.PRIOR_DAYS) & (obs.harvest_date > obs.sowing_date)]
        if len(obs) < 3: return self
        obs["act"] = (obs.harvest_date - obs.sowing_date).dt.days; obs["delay"] = obs.sowing_date.map(self._delay)
        for v in self.PRIOR_DAYS:
            o = obs[obs.variety == v]
            if len(o): self.base_days[v] += (o.act + self.late_slope * np.minimum(o.delay, self.late_cap / self.late_slope) - self.base_days[v]).sum() / (len(o) + k_shrink)
        if len(obs) >= 8 and (obs.delay ** 2).sum() > 0:
            yv = obs.variety.map(self.base_days) - obs.act
            hat = float(np.clip((obs.delay * yv).sum() / (obs.delay ** 2).sum(), 0, 0.6))
            self.late_slope = (len(obs) * hat + k_slope * self.late_slope) / (len(obs) + k_slope)
        pred = obs.apply(lambda r: self.duration(r.sowing_date, r.variety), axis=1)
        self.resid_sd = float((obs.act - pred).std(ddof=0)); self.spread = int(np.clip(round(1.28 * self.resid_sd), 3, 10))
        self.n_obs, self.calibrated = len(obs), True
        return self
    @staticmethod
    def stage(das, total):
        if das < 0: return "Not sown yet", "Prepare land; sow after good rain (about 75–100 mm) when soil is moist."
        fr = das / max(total, 1)
        for end, name, tip in STAGES:
            if fr < end: return name, tip
    @staticmethod
    def sowing_check(s):
        d = s.dayofyear; lo, hi, late = [pd.Timestamp(s.year, mo, dd).dayofyear for mo, dd in [(6, 15), (7, 15), (7, 25)]]
        if s.month < 6 or (s.month == 6 and s.day < 10): return "Very early sowing – make sure there has been enough rain; seedlings die if rain fails."
        if d < lo: return "Slightly early sowing (before 15 June) – OK if soil moisture is good."
        if d <= hi: return "Sowing is within the best window (15 June – 15 July)."
        if d <= late: return "Slightly late sowing – use a shorter-duration variety and keep plant population high."
        return "Late sowing – yield risk is higher; consider a short-duration variety."

class YieldModel:
    CANDIDATES = {"Baseline (average yield)": [], "Rain only": ["rain_total"], "Rain + dry spell": ["rain_total", "dry_spell"],
                  "Jul-Aug rain": ["rain_jul_aug"], "Rain + humidity": ["rain_total", "humidity"]}
    @staticmethod
    def _mk(): return make_pipeline(StandardScaler(), Ridge(alpha=3.0))
    def fit(self, y, w):
        rows = []
        for yr, g in w.groupby("year"):
            s = g[g.date.dt.month.between(6, 9)]; jas = s[s.date.dt.month >= 7]
            rows.append(dict(year=yr, rain_total=s.rainfall.sum(), rain_jul_aug=s[s.date.dt.month.isin([7, 8])].rainfall.sum(),
                             dry_spell=longest_dry_spell(jas.rainfall.values), humidity=s.humidity.mean()))
        data = pd.DataFrame(rows).merge(y[["year", "yield_kg_ha"]], on="year", how="left")
        self.season = int(data.year.max()); tr = data.dropna(subset=["yield_kg_ha"]).reset_index(drop=True)
        res = {}
        for name, cols in self.CANDIDATES.items():
            pr = []
            for i in range(len(tr)):
                a, b = tr.drop(i), tr.iloc[[i]]
                pr.append(a.yield_kg_ha.mean() if not cols else self._mk().fit(a[cols], a.yield_kg_ha).predict(b[cols])[0])
            e = np.array(pr) - tr.yield_kg_ha.values
            res[name] = dict(cols=cols, rmse=float(np.sqrt((e ** 2).mean())), mae=float(np.abs(e).mean()))
        best = min(res, key=lambda k: res[k]["rmse"])
        beats = best != "Baseline (average yield)" and res[best]["rmse"] < 0.95 * res["Baseline (average yield)"]["rmse"]
        self.normal = float(tr.yield_kg_ha.mean()); self.n_seasons = len(tr); self.loyo = {k: dict(rmse=v["rmse"], mae=v["mae"]) for k, v in res.items()}
        if beats:
            cols = res[best]["cols"]; mdl = self._mk().fit(tr[cols], tr.yield_kg_ha)
            self.pred = float(mdl.predict(data[data.year == self.season][cols])[0]); self.err = res[best]["rmse"]; self.method = best
        else:
            self.pred, self.err = self.normal, float(tr.yield_kg_ha.std())
            self.method = "Climatology range (average of past seasons) – weather signal too weak with few seasons"
        self.low, self.high = max(self.pred - self.err, 0), self.pred + self.err
        self.history = tr[["year", "yield_kg_ha"]].to_dict("records")
        return self

class CropHealth:
    def fit(self, n):
        yr = int(n.year.max()); cur, hist = n[n.year == yr], n[n.year < yr]; recs = []
        for r in cur.itertuples():
            h = hist[(hist.taluka == r.taluka) & ((hist.doy - r.doy).abs() <= 10)]
            if len(h) >= 3: recs.append(dict(taluka=r.taluka, ndvi=r.NDVI, normal=h.NDVI.mean()))
        self.year, self.table = yr, {}
        if recs:
            g = pd.DataFrame(recs).groupby("taluka").agg(now=("ndvi", "mean"), normal=("normal", "mean"), n_obs=("ndvi", "size"))
            g = g[g.n_obs >= 2]; g["anomaly_pct"] = (g.now / g.normal - 1) * 100
            g["status"] = np.where(g.anomaly_pct < -10, "Stress", np.where(g.anomaly_pct < -5, "Watch", "Healthy"))
            self.table = g.round(3).to_dict("index")
        return self
    def get(self, taluka): return self.table.get(taluka)

class MarketModel:
    def fit(self, m):
        self.m = m[["date", "market", "modal_price", "arrivals"]].copy(); self.as_of = self.m.date.max()
        mp = self.m.set_index("date").modal_price.resample("MS").median(); self.monthly = mp
        tmp = mp.to_frame("p"); tmp["year"], tmp["month"] = tmp.index.year, tmp.index.month
        ok = tmp.groupby("year").p.count()[lambda s: s >= 8].index; tmp = tmp[tmp.year.isin(ok)]
        tmp["r"] = tmp.p / tmp.groupby("year").p.transform("mean")
        self.SI = tmp.groupby("month").r.median().reindex(range(1, 13)).interpolate(limit_direction="both").to_dict()
        lp = np.log(mp.asfreq("MS")); self.VOL = {h: float((lp.shift(-h) - lp).dropna().std()) for h in range(1, 7)}; self.VOL[0] = 0.0
        ma = self.m.set_index("date").arrivals.resample("MS").sum(min_count=1).dropna()
        self.arr_by_month = ma.groupby(ma.index.month).mean().round(1).to_dict() if len(ma) else {}
        self.arr_by_year = ma.groupby(ma.index.year).sum().round(0).to_dict() if len(ma) else {}
        return self
    def _vol(self, h): return self.VOL[h] if h <= 6 else self.VOL[6] * math.sqrt(h / 6)
    def _win(self, end, days=21):
        s = self.m[(self.m.date <= end) & (self.m.date > end - pd.Timedelta(days=days))].modal_price
        return float(s.median()) if len(s) else None
    def price_now(self): return self._win(self.as_of)

    def plan(self, start, storage=15.0, interest=0.01, horizon=6):
        start = max(pd.Timestamp(start), self.as_of.normalize()); pn, cm = self.price_now(), self.as_of.month
        h0 = max(0, (start.year - self.as_of.year) * 12 + start.month - self.as_of.month); rows = []
        for k in range(horizon + 1):
            h = h0 + k; mo = ((cm - 1 + h) % 12) + 1; exp = pn * self.SI[mo] / self.SI[cm]
            net = exp - (storage + pn * interest) * k
            sd = pn * math.sqrt(max(self._vol(h) ** 2 - self._vol(h0) ** 2, 1e-6)) if k else 0.0
            rows.append(dict(k=k, sell_month=(start + pd.DateOffset(months=k)).strftime("%b %Y"), expected_price=exp, net_price=net, sd=sd))
        df = pd.DataFrame(rows); base = df.net_price.iloc[0]
        df["low"], df["high"] = df.net_price - df.sd, df.net_price + df.sd
        df["gain_pct"] = (df.net_price / base - 1) * 100
        df["prob_beats_first"] = [np.nan] + [1 - norm.cdf((base - r.net_price) / r.sd) for r in df.iloc[1:].itertuples()]
        return df

    def analysis(self, today=None, msp=None):
        today = pd.Timestamp(today) if today is not None else pd.Timestamp.today().normalize()
        pn = self.price_now(); m = self.m
        ch = lambda d: (None if self._win(self.as_of - pd.Timedelta(days=d)) is None else round((pn / self._win(self.as_of - pd.Timedelta(days=d)) - 1) * 100, 1))
        last12 = m[m.date > self.as_of - pd.Timedelta(days=365)].modal_price
        pct = round(float((last12 <= pn).mean() * 100), 0) if len(last12) >= 10 else None
        level = None if pct is None else ("High" if pct >= 75 else "Low" if pct <= 25 else "Normal")
        r90 = m[m.date > self.as_of - pd.Timedelta(days=90)]; slope_pct = None
        if len(r90) >= 6:
            x = (r90.date - r90.date.min()).dt.days.values; slope_pct = round(float(np.polyfit(x, r90.modal_price.values, 1)[0] * 30 / pn * 100), 1)
        momentum = None if slope_pct is None else ("Rising" if slope_pct > 1.5 else "Falling" if slope_pct < -1.5 else "Flat")
        v1 = self.VOL[1]; volatility = "High" if v1 > 0.10 else "Medium" if v1 > 0.05 else "Low"
        mand = m[m.date > self.as_of - pd.Timedelta(days=365)].groupby("market").modal_price.agg(["median", "count"])
        mandis = dict(markets=[dict(market=i, median_price=round(float(r["median"])), n_quotes=int(r["count"])) for i, r in mand.iterrows()],
                      comparable=bool(len(mand) > 1 and (mand["count"] >= 5).all()),
                      note="Mandi comparison shown only when every market has enough price quotes in the last 12 months.")
        si = pd.Series(self.SI); mn = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
        best = [mn[i - 1] for i in si.sort_values(ascending=False).index[:3]]; worst = [mn[i - 1] for i in si.sort_values().index[:3]]
        pk = sorted(self.arr_by_month, key=lambda k: -self.arr_by_month[k])[:3]
        notes = []
        if level == "High" and momentum == "Falling": notes.append("Price is high versus the last 12 months but falling – selling in phases protects gains.")
        elif level == "High": notes.append("Price is high versus the last 12 months.")
        elif level == "Low": notes.append("Price is low versus the last 12 months – if you can store safely, waiting may help, but the evidence is weak.")
        if momentum == "Rising": notes.append("Short-term trend is rising.")
        if volatility == "High": notes.append("Prices are volatile month to month – avoid selling everything on one day.")
        if msp and pn < msp: notes.append(f"Market price is below MSP (₹{msp:,.0f}) – consider MSP procurement centres.")
        stale = (today - self.as_of).days
        return dict(as_of=self.as_of, days_since_last_price=int(stale), stale=bool(stale > 14),
                    price_now=round(pn), change_pct=dict(vs_30d=ch(30), vs_90d=ch(90), vs_1y=ch(365)),
                    last_12m=dict(low=round(float(last12.min())) if len(last12) else None, high=round(float(last12.max())) if len(last12) else None,
                                  percentile=pct, level=level),
                    momentum=momentum, trend_pct_per_month=slope_pct, volatility=volatility,
                    mandi_comparison=mandis, seasonality=dict(index={mn[k - 1]: round(v, 3) for k, v in self.SI.items()},
                    best_months=best, weakest_months=worst, note="Seasonal pattern is modest (about ±2%) – a tilt, not a guarantee."),
                    arrivals=dict(avg_tonnes_by_month={mn[k - 1]: v for k, v in self.arr_by_month.items()}, peak_months=[mn[k - 1] for k in pk],
                                  note="2025–26 arrivals are missing in the source data." if not self.arr_by_year.get(2026) else ""),
                    msp=msp, market_notes=notes)

class SoybeanAdvisor:
    def __init__(self): self.version = MODEL_VERSION
    @classmethod
    def train(cls, paths=None, harvest_obs=None):
        d = load_clean(paths); a = cls()
        a.harvest = HarvestModel();   a.harvest.fit(harvest_obs) if harvest_obs is not None else None
        a.yield_m = YieldModel().fit(d["y"], d["w"]); a.health = CropHealth().fit(d["n"]); a.market = MarketModel().fit(d["m"])
        a.weather = d["w"][["date", "rainfall"]].copy(); a.trained_at = dt.datetime.now().isoformat(timespec="seconds")
        return a
    def retrain_harvest(self, obs): self.harvest.fit(obs); return self
    def save(self, path):
        os.makedirs(os.path.dirname(path) or ".", exist_ok=True); joblib.dump(self, path)
        json.dump(jsonable(self.model_card()), open(os.path.splitext(path)[0] + "_card.json", "w"), indent=2, ensure_ascii=False)
    @staticmethod
    def load(path): return joblib.load(path)
    def model_card(self):
        return dict(version=self.version, trained_at=self.trained_at, data_as_of=dict(market=self.market.as_of, weather=self.weather.date.max()),
                    yield_model=dict(method=self.yield_m.method, n_seasons=self.yield_m.n_seasons, loyo=self.yield_m.loyo,
                                     outlook_kg_ha=[self.yield_m.low, self.yield_m.pred, self.yield_m.high]),
                    harvest_model=dict(base_days=self.harvest.base_days, late_slope=self.harvest.late_slope, spread_days=self.harvest.spread,
                                       calibrated=self.harvest.calibrated, n_obs=self.harvest.n_obs),
                    health_talukas=list(self.health.table), soil_factors={k: v["f"] for k, v in SOIL.items()},
                    limitations=["Few official yield seasons – yield is a range.", "Harvest date uses typical durations until calibrated with real harvest dates.",
                                 "Soil factors are planning assumptions.", "Market data has gaps; seasonal effect is small."])
    def options(self):
        return dict(talukas=SANGLI_TALUKAS, crops=["Soybean"], soils=list(SOIL), varieties=VARIETIES)

    def market_report(self, today=None, storage=15.0, interest=0.01, msp=None):
        pl = self.market.plan(self.market.as_of, storage, interest)
        return jsonable(dict(analysis=self.market.analysis(today, msp), forecast=pl.drop(columns=["k", "sd"])))

    def predict(self, f, today=None):
        today = pd.Timestamp(today) if today is not None else pd.Timestamp.today().normalize()
        taluka, soil = f["taluka"], f["soil"]; var = str(f.get("variety", "medium")).lower().split()[0].strip("(")
        if taluka not in SANGLI_TALUKAS: raise ValueError(f"taluka must be one of {SANGLI_TALUKAS}")
        if soil not in SOIL: raise ValueError(f"soil must be one of {list(SOIL)}")
        if var not in VARIETIES: raise ValueError(f"variety must be one of {list(VARIETIES)}")
        if str(f.get("crop", "Soybean")).lower().startswith("soy") is False: raise ValueError("this model supports Soybean only")
        sowing = pd.Timestamp(f["sowing_date"]); acres = float(f.get("acres", 1)); storage = float(f.get("storage_cost", 15)); interest = float(f.get("interest_rate", 0.01))
        hv = self.harvest.predict(sowing, var); das = (today - sowing).days; total = (hv["expected"] - sowing).days
        stage, tip = HarvestModel.stage(das, total)
        sf = SOIL[soil]["f"]; ylo, ymid, yhi = [v * sf for v in (self.yield_m.low, self.yield_m.pred, self.yield_m.high)]
        q = [acres * 0.4047 * v / 100 for v in (ylo, ymid, yhi)]
        plan = self.market.plan(hv["expected"], storage, interest)
        cand = plan[(plan.k > 0) & (plan.gain_pct >= 3) & (plan.prob_beats_first >= 0.60)]
        if len(cand):
            p = cand.sort_values("net_price", ascending=False).iloc[0]; decision, when, net = "HOLD", p.sell_month, float(p.net_price)
            why = f"Holding until {p.sell_month} is expected to give ~{p.gain_pct:.1f}% more after storage & interest (chance ≈ {p.prob_beats_first*100:.0f}%)."
            mr = f"{p.sell_month} पर्यंत साठवून ठेवा"
        else:
            decision, when, net = "SELL AT HARVEST", plan.sell_month.iloc[0], float(plan.net_price.iloc[0])
            why = "Waiting is not expected to beat the harvest-time price after storage and interest cost."; mr = "कापणीनंतर टप्प्याटप्प्याने विक्री करा"
        al = [HarvestModel.sowing_check(sowing)]
        if das >= 0:
            s = self.weather[self.weather.date >= sowing]
            if len(s) >= 3 and longest_dry_spell(s.rainfall.values) >= 10:
                al.append(f"A dry spell of {longest_dry_spell(s.rainfall.values)} days occurred since sowing – check soil moisture.")
        if SOIL[soil]["risk"] == "dry spell": al.append("Your soil dries quickly – plan protective irrigation for flowering/pod filling.")
        if SOIL[soil]["risk"] == "waterlogging": al.append("Keep drainage channels open during heavy rain.")
        h = self.health.get(taluka)
        health = dict(available=bool(h), **(h or {}), message=(f"Satellite greenness in {taluka} is {h['anomaly_pct']:+.1f}% vs same dates in past years ({h['status']})." if h
                      else f"No comparable satellite passes for {taluka} yet."))
        stale = (today - self.market.as_of).days
        if stale > 14: al.append(f"Market data was last updated {self.market.as_of.date()} – refresh prices for the latest advice.")
        return jsonable(dict(
            model_version=self.version, generated_on=today,
            farmer=dict(name=f.get("name", ""), taluka=taluka, crop="Soybean", soil=soil, variety=VARIETIES[var], acres=acres, sowing_date=sowing),
            harvest=dict(expected_date=hv["expected"], window=[hv["earliest"], hv["latest"]], duration_days=hv["duration_days"],
                         late_sowing_adjustment_days=hv["late_sowing_adjustment_days"], days_to_harvest=(hv["expected"] - today).days,
                         days_after_sowing=das, crop_stage=stage, stage_tip=tip, calibrated=self.harvest.calibrated),
            yield_outlook=dict(kg_per_ha=dict(low=ylo, expected=ymid, high=yhi), production_quintals=dict(low=q[0], expected=q[1], high=q[2]),
                               method=self.yield_m.method, soil_factor=sf, soil_factor_is_assumption=True, long_term_avg_kg_ha=self.yield_m.normal),
            market=dict(analysis=self.market.analysis(today), harvest_time_plan=plan.drop(columns=["k", "sd"])),
            advisory=dict(decision=decision, sell_when=when, expected_net_price=net, reason=why, reason_marathi=mr,
                          revenue_inr=dict(low=q[0] * net, expected=q[1] * net, high=q[2] * net)),
            soil=dict(type=soil, note=SOIL[soil]["note"]), crop_health=health, alerts=al,
            disclaimer="Prototype advisory from 2017–2026 Sangli records; yield is a range and soil factors are assumptions."))
