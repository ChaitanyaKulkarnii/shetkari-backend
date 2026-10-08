import logging
from fastapi import APIRouter
from app.model_loader import model_manager
from app.schemas import HealthResponse

logger = logging.getLogger("soy_advisor.health")
router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def get_health():
    """Returns application health, model version, training timestamp, and market data as-of date."""
    model = model_manager.get_model()
    as_of = getattr(model.market, "as_of", None)
    as_of_str = str(as_of)[:10] if as_of is not None else "unknown"

    return HealthResponse(
        status="healthy",
        model_version=getattr(model, "version", "0.2.0"),
        trained_at=getattr(model, "trained_at", "unknown"),
        market_data_as_of=as_of_str,
    )
