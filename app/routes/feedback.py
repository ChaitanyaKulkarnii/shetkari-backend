import copy
import csv
import datetime as dt
import logging
import os
import threading
from typing import Optional
from fastapi import APIRouter, Header, HTTPException, status
import pandas as pd

from app.config import settings
from app.model_loader import model_manager
from app.schemas import (
    HarvestFeedbackRequest,
    HarvestFeedbackResponse,
    RetrainResponse,
)

logger = logging.getLogger("soy_advisor.feedback")
router = APIRouter()
file_lock = threading.Lock()


def ensure_feedback_csv_exists(filepath: str):
    """Ensure directory and CSV with appropriate headers exist."""
    dir_name = os.path.dirname(filepath)
    if dir_name:
        os.makedirs(dir_name, exist_ok=True)
    if not os.path.exists(filepath):
        with open(filepath, mode="w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["sowing_date", "harvest_date", "variety", "taluka", "recorded_at"])


@router.post("/harvest-feedback", response_model=HarvestFeedbackResponse)
def submit_harvest_feedback(payload: HarvestFeedbackRequest):
    """
    Records real-world farmer harvest observations to calibrate the harvest date model.
    Appends observation to data/harvest_feedback.csv.
    """
    feedback_file = settings.FEEDBACK_DATA_PATH
    with file_lock:
        ensure_feedback_csv_exists(feedback_file)
        recorded_at = dt.datetime.now().isoformat(timespec="seconds")
        row = [
            str(payload.sowing_date),
            str(payload.harvest_date),
            payload.variety,
            payload.taluka or "",
            recorded_at,
        ]
        with open(feedback_file, mode="a", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(row)

    logger.info("New harvest feedback appended: sowing=%s, harvest=%s, variety=%s", payload.sowing_date, payload.harvest_date, payload.variety)

    return HarvestFeedbackResponse(
        status="success",
        message="Harvest feedback recorded successfully.",
        feedback={
            "sowing_date": str(payload.sowing_date),
            "harvest_date": str(payload.harvest_date),
            "variety": payload.variety,
            "taluka": payload.taluka,
            "recorded_at": recorded_at,
        },
    )


@router.post("/retrain-harvest", response_model=RetrainResponse)
def retrain_harvest_model(x_api_key: Optional[str] = Header(default=None, alias="X-API-Key")):
    """
    Retrains the harvest date calibration using logged farmer feedback.
    Protected by the X-API-Key header.
    Requires at least 3 valid observations.
    Deep-copies the model before mutation, then atomically saves and hot-swaps.
    """
    # Verify API Key
    if not x_api_key or x_api_key != settings.ADMIN_API_KEY:
        logger.warning("Unauthorized retrain attempt with key: %s", x_api_key)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing X-API-Key header."
        )

    feedback_file = settings.FEEDBACK_DATA_PATH
    if not os.path.exists(feedback_file):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No feedback data available. At least 3 harvest feedback records are required to retrain."
        )

    try:
        with file_lock:
            df = pd.read_csv(feedback_file)
    except Exception as exc:
        logger.error("Failed to read feedback data: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not read feedback dataset."
        )

    if df.empty or len(df) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient feedback observations: found {len(df) if not df.empty else 0}, but at least 3 are required."
        )

    # Ensure required columns
    required_cols = {"sowing_date", "harvest_date", "variety"}
    if not required_cols.issubset(df.columns):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Feedback dataset is missing required columns: {required_cols - set(df.columns)}"
        )

    # Format and clean observations
    obs_df = df.copy()
    obs_df["sowing_date"] = pd.to_datetime(obs_df["sowing_date"], errors="coerce")
    obs_df["harvest_date"] = pd.to_datetime(obs_df["harvest_date"], errors="coerce")
    # Normalize variety to early, medium, late
    obs_df["variety"] = obs_df["variety"].astype(str).str.lower().str.split().str[0].str.strip("(")

    valid_mask = (
        obs_df["sowing_date"].notna()
        & obs_df["harvest_date"].notna()
        & (obs_df["harvest_date"] > obs_df["sowing_date"])
        & obs_df["variety"].isin(["early", "medium", "late"])
    )
    clean_obs = obs_df[valid_mask]

    if len(clean_obs) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only {len(clean_obs)} valid observations after data filtering. At least 3 valid observations are required."
        )

    logger.info("Retraining harvest model with %d feedback observations...", len(clean_obs))

    # CRITICAL: deep-copy model before mutation to avoid corrupting
    # the live in-memory model if save fails
    current_model = model_manager.get_model()
    updated_model = copy.deepcopy(current_model)
    updated_model.retrain_harvest(clean_obs)

    # Atomic write and in-memory reload
    model_manager.save_and_reload(updated_model)

    n_obs = getattr(updated_model.harvest, "n_obs", len(clean_obs))
    calibrated = getattr(updated_model.harvest, "calibrated", True)

    logger.info("Harvest model retrained successfully: n_obs=%d, calibrated=%s", n_obs, calibrated)

    return RetrainResponse(
        status="success",
        calibrated=calibrated,
        n_obs=n_obs,
        message=f"Harvest calibration successfully retrained with {n_obs} observations."
    )
