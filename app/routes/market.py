import logging
from datetime import date
from typing import Any, Dict, Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.model_loader import model_manager

logger = logging.getLogger("soy_advisor.market")
router = APIRouter()


@router.get("/market", response_model=Dict[str, Any])
def get_market_report(
    storage: float = Query(
        default=15.0,
        ge=0.0,
        description="Monthly storage cost in INR per quintal"
    ),
    interest: float = Query(
        default=0.01,
        ge=0.0,
        le=0.1,
        description="Monthly interest rate (e.g. 0.01 for 1%)"
    ),
    msp: Optional[float] = Query(
        default=None,
        gt=0.0,
        description="Optional Minimum Support Price in INR per quintal"
    ),
    today: Optional[date] = Query(
        default=None,
        description="Optional date override for analysis"
    ),
):
    """Returns market price analysis and 6-month storage vs immediate selling plan."""
    model = model_manager.get_model()
    today_str = str(today) if today is not None else None

    try:
        report = model.market_report(
            today=today_str,
            storage=storage,
            interest=interest,
            msp=msp,
        )
        return report
    except Exception as exc:
        logger.error("Error generating market report: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc)
        )
