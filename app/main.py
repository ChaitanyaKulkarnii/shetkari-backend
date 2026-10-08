import logging
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.model_loader import model_manager
from app.routes.advisory import router as advisory_router
from app.routes.feedback import router as feedback_router
from app.routes.health import router as health_router
from app.routes.market import router as market_router
from app.routes.model_card import router as model_card_router
from app.routes.options import router as options_router

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] [%(name)s]: %(message)s",
)
logger = logging.getLogger("soy_advisor.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model ONCE at startup; fail fast if model file is missing."""
    logger.info("Initializing Sangli Soybean Advisory backend service...")
    try:
        model_manager.load_model()
    except FileNotFoundError as err:
        logger.critical("Backend startup aborted: %s", err)
        raise err
    yield
    logger.info("Sangli Soybean Advisory backend shutdown complete.")


app = FastAPI(
    title="Sangli Soybean Yield & Market Advisory API",
    description="Production-ready FastAPI backend providing harvest prediction, yield outlook, and market storage timing for Sangli farmers.",
    version="0.2.0",
    lifespan=lifespan,
)

# CORS Middleware
allow_credentials = False if settings.cors_origins == ["*"] else True
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request Logging Middleware
@app.middleware("http")
async def log_requests_middleware(request: Request, call_next):
    start_time = time.time()
    client_ip = request.client.host if request.client else "unknown"
    logger.info("--> %s %s (client: %s)", request.method, request.url.path, client_ip)
    try:
        response = await call_next(request)
        duration_ms = (time.time() - start_time) * 1000
        logger.info("<-- %s %s completed %d in %.2fms", request.method, request.url.path, response.status_code, duration_ms)
        return response
    except Exception as exc:
        duration_ms = (time.time() - start_time) * 1000
        logger.error("<-- %s %s failed in %.2fms with: %s", request.method, request.url.path, duration_ms, exc)
        raise exc


# Exception Handlers ensuring consistent format {"error": "...", "detail": ...}
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning("Validation failed for %s %s: %s", request.method, request.url.path, exc.errors())
    details = []
    for err in exc.errors():
        loc = " -> ".join(str(l) for l in err.get("loc", []))
        msg = err.get("msg", "")
        details.append(f"{loc}: {msg}" if loc else msg)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        content={"error": "Validation Error", "detail": details},
    )


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    logger.warning("ValueError encountered on %s %s: %s", request.method, request.url.path, exc)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        content={"error": "Validation Error", "detail": str(exc)},
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logger.warning("HTTPException on %s %s (%d): %s", request.method, request.url.path, exc.status_code, exc.detail)
    error_names = {
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        422: "Validation Error",
        500: "Internal Server Error",
    }
    error_title = error_names.get(exc.status_code, "HTTP Error")
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": error_title, "detail": exc.detail},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled server exception on %s %s: %s", request.method, request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "detail": "An internal server error occurred while processing your request.",
        },
    )


# Include Routers under /api
app.include_router(health_router, prefix="/api", tags=["System"])
app.include_router(options_router, prefix="/api", tags=["Options"])
app.include_router(model_card_router, prefix="/api", tags=["Model Card"])
app.include_router(market_router, prefix="/api", tags=["Market"])
app.include_router(advisory_router, prefix="/api", tags=["Advisory"])
app.include_router(feedback_router, prefix="/api", tags=["Harvest Feedback & Retraining"])


@app.get("/", tags=["Root"])
def root():
    return {
        "service": "Sangli Soybean Advisory API",
        "docs": "/docs",
        "health": "/api/health",
        "options": "/api/options",
    }
