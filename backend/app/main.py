from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse

from app.api.routes.system import health_payload
from app.core.deps import get_db
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.api.routes.auth import router as auth_router
from app.api.routes.scan import router as scan_router
from app.api.routes.patient import router as patient_router
from app.api.routes.radiologist import router as radiologist_router
from app.api.routes.admin import router as admin_router
from app.api.routes.shared import router as shared_router
from app.api.routes.jobs import router as jobs_router
from app.api.routes.radiologist_pacs import router as radiologist_pacs_router
from app.api.routes.gdpr import router as gdpr_router
from app.core.config import settings


app = FastAPI(title=settings.app_name, debug=settings.app_debug)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SecurityHeadersMiddleware)


@app.get("/health", tags=["system"])
def health(db: Session = Depends(get_db)) -> dict:
    """Liveness + DB/seed flags (Docker nginx maps edge ``/health`` → this path)."""
    return health_payload(db)


@app.get("/api/health", tags=["system"])
def api_health(db: Session = Depends(get_db)) -> dict:
    """Canonical path for the SPA / Vite proxy (not tied to ``API_PREFIX`` string formatting bugs)."""
    return health_payload(db)


if settings.api_prefix != "/api":
    @app.get(f"{settings.api_prefix}/health", tags=["system"])
    def api_health_under_prefix(db: Session = Depends(get_db)) -> dict:
        """When ``API_PREFIX`` is not ``/api``, mirror health on the configured prefix."""
        return health_payload(db)


@app.get(f"{settings.api_prefix}/openapi.json", include_in_schema=False)
async def openapi_json_under_api() -> JSONResponse:
    """Same schema as /openapi.json, exposed under /api for frontend tooling."""
    return JSONResponse(app.openapi())


app.include_router(auth_router, prefix=f"{settings.api_prefix}/auth", tags=["auth"])
app.include_router(scan_router, prefix=f"{settings.api_prefix}/scan", tags=["scan"])
app.include_router(patient_router, prefix=f"{settings.api_prefix}/patient", tags=["patient"])
app.include_router(
    radiologist_router, prefix=f"{settings.api_prefix}/radiologist", tags=["radiologist"]
)
app.include_router(
    radiologist_pacs_router,
    prefix=f"{settings.api_prefix}/radiologist/pacs",
    tags=["radiologist-pacs"],
)
app.include_router(admin_router, prefix=f"{settings.api_prefix}/admin", tags=["admin"])
app.include_router(shared_router, prefix=f"{settings.api_prefix}/shared", tags=["shared"])
app.include_router(jobs_router, prefix=f"{settings.api_prefix}/jobs", tags=["jobs"])
app.include_router(gdpr_router, prefix=f"{settings.api_prefix}/gdpr", tags=["gdpr"])
