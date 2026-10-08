import logging
from typing import Any, Dict
from fastapi import APIRouter
import sangli_soy_model
from app.model_loader import model_manager

logger = logging.getLogger("soy_advisor.model_card")
router = APIRouter()


@router.get("/model-card", response_model=Dict[str, Any])
def get_model_card():
    """Returns model metadata, evaluation results, and assumptions (JSON safe)."""
    model = model_manager.get_model()
    card = model.model_card()
    return sangli_soy_model.jsonable(card)
