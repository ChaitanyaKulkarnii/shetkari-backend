import os
import sys
import pickle
import logging
import threading
from typing import Optional

# Ensure project root is in sys.path so sangli_soy_model can be unpickled
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import sangli_soy_model  # noqa: E402 — needed so pickle can resolve the class
from app.config import settings

logger = logging.getLogger("soy_advisor.model_loader")


class ModelManager:
    """Manages thread-safe loading, swapping, and atomic saving of SoybeanAdvisor model."""

    def __init__(self):
        self._model = None
        self._lock = threading.Lock()

    @property
    def model_path(self) -> str:
        """Always read from settings so tests can override."""
        return settings.MODEL_PATH

    def load_model(self):
        """Load model once from disk into app state using pickle.load."""
        abs_path = os.path.abspath(self.model_path)
        if not os.path.exists(abs_path):
            err_msg = f"CRITICAL: SoybeanAdvisor model file missing at '{abs_path}'."
            logger.error(err_msg)
            raise FileNotFoundError(err_msg)

        logger.info("Loading SoybeanAdvisor model from %s...", abs_path)
        try:
            with open(abs_path, "rb") as f:
                loaded = pickle.load(f)
        except Exception as exc:
            logger.warning("Standard pickle.load encountered %s, attempting joblib fallback...", exc)
            import joblib
            loaded = joblib.load(abs_path)

        with self._lock:
            self._model = loaded

        version = getattr(loaded, "version", "unknown")
        trained_at = getattr(loaded, "trained_at", "unknown")
        logger.info("SoybeanAdvisor model loaded successfully (version=%s, trained_at=%s)", version, trained_at)
        return self._model

    def get_model(self):
        """Retrieve the currently loaded model instance."""
        with self._lock:
            if self._model is None:
                raise RuntimeError("SoybeanAdvisor model is not initialized in application state.")
            return self._model

    def save_and_reload(self, updated_model):
        """
        Thread-safe atomic model save:
        1. Write updated model to a temporary file in the same directory.
        2. Atomically rename/replace the target model file.
        3. Update in-memory reference under lock.
        """
        abs_path = os.path.abspath(self.model_path)
        dir_name = os.path.dirname(abs_path) or "."
        os.makedirs(dir_name, exist_ok=True)
        tmp_path = f"{abs_path}.tmp"

        with self._lock:
            logger.info("Writing updated model atomically to temporary file: %s", tmp_path)
            with open(tmp_path, "wb") as f:
                pickle.dump(updated_model, f, protocol=pickle.HIGHEST_PROTOCOL)

            # Atomic replace on POSIX and modern Windows NTFS
            os.replace(tmp_path, abs_path)
            self._model = updated_model
            logger.info("Atomically replaced '%s' and updated in-memory model state.", abs_path)

        return self._model


model_manager = ModelManager()
