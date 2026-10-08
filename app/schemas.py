from datetime import date
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field, field_validator, model_validator

# Valid lists matching sangli_soy_model.py
SANGLI_TALUKAS = [
    "Atpadi", "Jath", "Kadegaon", "Kavathe Mahankal", "Khanapur",
    "Miraj", "Palus", "Shirala", "Tasgaon", "Walwa"
]

SOIL_TYPES = [
    "Deep black (heavy)",
    "Medium black",
    "Alluvial / sandy loam",
    "Shallow / murum",
    "Red / laterite"
]

VARIETIES = {
    "early": "Early (~90 days)",
    "medium": "Medium (~100 days)",
    "late": "Late (~110 days)"
}


def normalize_variety(val: str) -> str:
    """Normalize variety string to short key ('early', 'medium', 'late')."""
    if not val:
        raise ValueError("variety cannot be empty")
    v = str(val).lower().split()[0].strip("(")
    if v not in VARIETIES:
        raise ValueError(
            f"variety must be one of {list(VARIETIES.keys())} or {list(VARIETIES.values())}"
        )
    return v


class AdvisoryRequest(BaseModel):
    name: Optional[str] = Field(default="", description="Farmer's name")
    taluka: str = Field(..., description="Taluka in Sangli district")
    crop: str = Field(default="Soybean", description="Crop name (Soybean)")
    sowing_date: date = Field(..., description="Sowing date (YYYY-MM-DD)")
    soil: str = Field(..., description="Soil type from options")
    variety: str = Field(..., description="Soybean variety (early, medium, late or full description)")
    acres: float = Field(..., gt=0, description="Farm size in acres (must be > 0)")
    storage_cost: float = Field(default=15.0, ge=0, description="Monthly storage cost in INR per quintal (>= 0)")
    interest_rate: float = Field(default=0.01, ge=0.0, le=0.1, description="Monthly interest rate (between 0 and 0.1)")
    today: Optional[date] = Field(default=None, description="Optional current date override for demo/testing")

    @field_validator("taluka")
    @classmethod
    def validate_taluka(cls, v: str) -> str:
        # Match case-insensitively or exact
        match = next((t for t in SANGLI_TALUKAS if t.lower() == v.strip().lower()), None)
        if not match:
            raise ValueError(f"taluka must be one of {SANGLI_TALUKAS}")
        return match

    @field_validator("crop")
    @classmethod
    def validate_crop(cls, v: str) -> str:
        if not str(v).lower().startswith("soy"):
            raise ValueError("this model supports Soybean only")
        return "Soybean"

    @field_validator("soil")
    @classmethod
    def validate_soil(cls, v: str) -> str:
        match = next((s for s in SOIL_TYPES if s.lower() == v.strip().lower()), None)
        if not match:
            raise ValueError(f"soil must be one of {SOIL_TYPES}")
        return match

    @field_validator("variety")
    @classmethod
    def validate_variety(cls, v: str) -> str:
        normalize_variety(v)
        return v.strip()


class HarvestFeedbackRequest(BaseModel):
    sowing_date: date = Field(..., description="Sowing date (YYYY-MM-DD)")
    harvest_date: date = Field(..., description="Harvest date (YYYY-MM-DD)")
    variety: str = Field(..., description="Variety: early, medium, or late")
    taluka: Optional[str] = Field(default=None, description="Optional Sangli taluka")

    @field_validator("variety")
    @classmethod
    def validate_variety(cls, v: str) -> str:
        return normalize_variety(v)

    @field_validator("taluka")
    @classmethod
    def validate_taluka(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return None
        match = next((t for t in SANGLI_TALUKAS if t.lower() == v.strip().lower()), None)
        if not match:
            raise ValueError(f"taluka must be one of {SANGLI_TALUKAS}")
        return match

    @model_validator(mode="after")
    def validate_dates(self) -> "HarvestFeedbackRequest":
        if self.harvest_date <= self.sowing_date:
            raise ValueError("harvest_date must be strictly greater than sowing_date")
        return self


class HealthResponse(BaseModel):
    status: str
    model_version: str
    trained_at: str
    market_data_as_of: str


class HarvestFeedbackResponse(BaseModel):
    status: str
    message: str
    feedback: Dict[str, Any]


class RetrainResponse(BaseModel):
    status: str
    calibrated: bool
    n_obs: int
    message: str


class ErrorResponse(BaseModel):
    error: str
    detail: Any
