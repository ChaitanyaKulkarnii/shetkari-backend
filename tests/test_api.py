import os
import shutil
import pytest
from fastapi.testclient import TestClient
from app.config import settings
from app.model_loader import model_manager


@pytest.fixture(scope="session")
def client():
    """Create TestClient with lifespan events executed."""
    from app.main import app
    with TestClient(app) as test_client:
        yield test_client


# ── Read-only endpoint tests (never modify model or feedback) ──────────────

def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "model_version" in data
    assert "trained_at" in data
    assert "market_data_as_of" in data


def test_options_endpoint(client):
    response = client.get("/api/options")
    assert response.status_code == 200
    data = response.json()
    assert "talukas" in data
    assert "crops" in data
    assert "soils" in data
    assert "varieties" in data
    assert len(data["talukas"]) == 10
    assert "Miraj" in data["talukas"]
    assert "Soybean" in data["crops"]


def test_model_card_endpoint(client):
    response = client.get("/api/model-card")
    assert response.status_code == 200
    data = response.json()
    assert "version" in data
    assert "yield_model" in data
    assert "harvest_model" in data
    assert "health_talukas" in data


def test_market_endpoint(client):
    response = client.get("/api/market?storage=15.0&interest=0.01")
    assert response.status_code == 200
    data = response.json()
    assert "analysis" in data
    assert "forecast" in data


def test_advisory_valid_input(client):
    payload = {
        "name": "Raju Patil",
        "taluka": "Miraj",
        "crop": "Soybean",
        "sowing_date": "2026-06-25",
        "soil": "Deep black (heavy)",
        "variety": "Medium (~100 days)",
        "acres": 5,
        "storage_cost": 15,
        "interest_rate": 0.01,
    }
    response = client.post("/api/advisory", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "model_version" in data
    assert "harvest" in data
    assert "yield_outlook" in data
    assert "market" in data
    assert "advisory" in data
    assert "alerts" in data
    assert data["advisory"]["decision"] in ["HOLD", "SELL AT HARVEST"]
    assert data["farmer"]["taluka"] == "Miraj"
    assert data["farmer"]["acres"] == 5.0


# ── Validation error tests ─────────────────────────────────────────────────

def test_advisory_invalid_taluka_returns_422(client):
    payload = {
        "name": "Invalid Farmer",
        "taluka": "NonExistentTaluka",
        "crop": "Soybean",
        "sowing_date": "2026-06-25",
        "soil": "Deep black (heavy)",
        "variety": "Medium (~100 days)",
        "acres": 5,
    }
    response = client.post("/api/advisory", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert "error" in data
    assert "detail" in data
    assert data["error"] == "Validation Error"


def test_advisory_invalid_acres_returns_422(client):
    payload = {
        "name": "Raju Patil",
        "taluka": "Miraj",
        "crop": "Soybean",
        "sowing_date": "2026-06-25",
        "soil": "Deep black (heavy)",
        "variety": "Medium (~100 days)",
        "acres": -1.0,
    }
    response = client.post("/api/advisory", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert "error" in data


def test_advisory_invalid_crop_returns_422(client):
    payload = {
        "name": "Raju Patil",
        "taluka": "Miraj",
        "crop": "Sugarcane",
        "sowing_date": "2026-06-25",
        "soil": "Deep black (heavy)",
        "variety": "Medium (~100 days)",
        "acres": 5,
    }
    response = client.post("/api/advisory", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert "error" in data


# ── Auth tests ─────────────────────────────────────────────────────────────

def test_retrain_without_api_key_returns_401(client):
    response = client.post("/api/retrain-harvest")
    assert response.status_code in [401, 403]
    data = response.json()
    assert "error" in data
    assert "detail" in data


def test_retrain_with_invalid_api_key_returns_401(client):
    response = client.post("/api/retrain-harvest", headers={"X-API-Key": "wrong-key"})
    assert response.status_code in [401, 403]
    data = response.json()
    assert "error" in data


# ── Feedback validation test ───────────────────────────────────────────────

def test_harvest_feedback_validation(client):
    """harvest_date <= sowing_date should fail with 422."""
    payload = {
        "sowing_date": "2026-07-01",
        "harvest_date": "2026-06-01",
        "variety": "medium",
        "taluka": "Miraj",
    }
    response = client.post("/api/harvest-feedback", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["error"] == "Validation Error"


# ── Isolated retrain flow test (uses tmp_path, never touches real pkl/csv) ─

def test_harvest_feedback_and_retrain_flow(client, tmp_path):
    """
    Full feedback→retrain flow using ISOLATED copies.
    Swaps settings.MODEL_PATH and settings.FEEDBACK_DATA_PATH
    to temp locations. model_loader.model_path is a property
    reading settings dynamically, so the swap is effective.
    """
    test_feedback_file = str(tmp_path / "test_feedback.csv")
    test_model_file = str(tmp_path / "test_model.pkl")

    # Copy the pristine model to a temp location
    shutil.copy(os.path.abspath(settings.MODEL_PATH), test_model_file)

    # Backup original in-memory model reference
    original_model = model_manager.get_model()

    orig_feedback = settings.FEEDBACK_DATA_PATH
    orig_model = settings.MODEL_PATH
    settings.FEEDBACK_DATA_PATH = test_feedback_file
    settings.MODEL_PATH = test_model_file

    try:
        # 1. Retrain with 0 observations should fail with 400
        res = client.post("/api/retrain-harvest", headers={"X-API-Key": settings.ADMIN_API_KEY})
        assert res.status_code == 400

        # 2. Add 3 feedback observations to the TEMP feedback file
        obs = [
            {"sowing_date": "2026-06-15", "harvest_date": "2026-09-23", "variety": "early", "taluka": "Miraj"},
            {"sowing_date": "2026-06-20", "harvest_date": "2026-10-02", "variety": "medium", "taluka": "Walwa"},
            {"sowing_date": "2026-06-10", "harvest_date": "2026-09-28", "variety": "late", "taluka": "Tasgaon"},
        ]
        for item in obs:
            res_fb = client.post("/api/harvest-feedback", json=item)
            assert res_fb.status_code == 200

        # 3. Retrain should now succeed (writes to temp model)
        res_retrain = client.post("/api/retrain-harvest", headers={"X-API-Key": settings.ADMIN_API_KEY})
        assert res_retrain.status_code == 200
        data = res_retrain.json()
        assert data["status"] == "success"
        assert data["calibrated"] is True
        assert data["n_obs"] >= 3
    finally:
        # Restore original paths and in-memory model
        settings.FEEDBACK_DATA_PATH = orig_feedback
        settings.MODEL_PATH = orig_model
        # Restore the pristine in-memory model so later tests aren't affected
        model_manager._model = original_model


# ── Model loader error test ────────────────────────────────────────────────

def test_missing_model_file_raises_filenotfound(tmp_path):
    """ModelManager.load_model fails clearly when file is missing."""
    orig_path = settings.MODEL_PATH
    settings.MODEL_PATH = str(tmp_path / "non_existent_model.pkl")
    from app.model_loader import ModelManager
    mgr = ModelManager()
    try:
        with pytest.raises(FileNotFoundError) as exc_info:
            mgr.load_model()
        assert "CRITICAL: SoybeanAdvisor model file missing" in str(exc_info.value)
    finally:
        settings.MODEL_PATH = orig_path
