import logging
from typing import Any, Dict
from fastapi import APIRouter, HTTPException, status
from app.model_loader import model_manager
from app.schemas import AdvisoryRequest

logger = logging.getLogger("soy_advisor.advisory")
router = APIRouter()


@router.post("/advisory", response_model=Dict[str, Any])
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
