import logging
from typing import Any, Dict
from fastapi import APIRouter
from app.model_loader import model_manager

logger = logging.getLogger("soy_advisor.options")
router = APIRouter()


@router.get("/options", response_model=Dict[str, Any])
def get_options():
    """Returns valid dropdown options: talukas, crops, soils, varieties."""
    model = model_manager.get_model()
    return model.options()
