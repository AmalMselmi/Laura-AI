# IMPLEMENTATION STATUS - Phase 0 Audit

## Phase 1 update (frontend normalization, no UI behavior change)

- [x] Kept `src/app/App.tsx`, `src/app/routes.tsx`, all listed contexts, and all listed layouts as active source-of-truth files.
- [x] Updated provider order in `src/app/App.tsx` to exact required order:
  - `AuthProvider` -> `PlansProvider` -> `SharedLinksProvider` -> `PatientDocumentsProvider` -> `LabProvider` -> `PacsProvider` -> `RouterProvider`
- [x] Aligned routed paths in `src/app/routes.tsx` to requested documented set (removed extra `/docs` route).
- [x] Marked unimported duplicate legacy components as deprecated (no deletion):
  - `src/app/components/DoctorDashboard.tsx`
  - `src/app/components/PatientDashboard.tsx`
  - `src/app/components/RadiologistDashboard.tsx`
  - `src/app/components/HealthCarnet.tsx`
  - `src/app/components/MedicalRecords.tsx`
- [x] Normalized `package.json` invalid dependency aliases so install/build can run.
- [x] Build passes: `npm run build` successful.
- [ ] Lint not available yet (`npm run lint` script is missing).

## Phase 2 update (real backend scaffold + service migration)

- [x] Created real backend tree under `backend/` with:
  - `backend/app/main.py`
  - `backend/app/core/config.py`
  - `backend/app/core/security.py`
  - `backend/app/core/database.py`
  - `backend/app/core/deps.py`
  - `backend/app/models/`
  - `backend/app/schemas/`
  - `backend/app/api/routes/`
  - `backend/app/services/`
  - `backend/app/workers/`
  - `backend/alembic/`
  - `backend/tests/`
  - `backend/requirements.txt`
  - `backend/Dockerfile`
- [x] Moved/adapted backend services:
  - `src/app/backend/services/ai_agent_service.py` -> `backend/app/services/ai_agent_service.py`
  - `src/app/backend/services/nlp_service.py` -> `backend/app/services/nlp_service.py`
  - `src/app/backend/services/ocr_service.py` -> `backend/app/services/ocr_service.py`
  - `src/app/backend/services/report_generator.py` -> `backend/app/services/report_generator.py`
- [x] Removed frontend copies from `src/app/backend/services/` to enforce backend separation.
- [x] Implemented FastAPI endpoints:
  - `/health`
  - `/api/auth/*`
  - `/api/scan/*`
  - `/api/patient/*`
  - `/api/radiologist/*`
  - `/api/admin/*`
  - `/api/shared/{token}`
  - `/api/jobs/{jobId}`
- [x] Added CORS from env-backed settings (`ALLOWED_ORIGINS`) in `backend/app/main.py`.
- [x] Added `.env.example` (root) including backend and frontend env keys.
- [x] Added requested runtime dependencies in `backend/requirements.txt`.
- [x] Ran backend tests: `python3 -m pytest backend/tests -q` -> **3 passed**.

## Phase 3 update (SQLAlchemy models + Alembic schema)

- [x] Implemented SQLAlchemy models for:
  - `User`
  - `RefreshToken`
  - `Plan`
  - `StorageUsage`
  - `ScanUsage`
  - `MedicalDocument`
  - `DocumentFolder`
  - `SharedLink`
  - `LabInfo`
  - `DicomFolder`
  - `DicomFile`
  - `PacsServer`
  - `AsyncJob`
  - `GdprRequest`
- [x] Implemented enums:
  - role enum (`patient`, `radiologist`, `admin`)
  - document type enum
  - report status enum
  - additional status enums for user/job/gdpr/shared/pacs protocol
- [x] Added documented indexes with named indices (`idx_users_email`, `idx_docs_user`, `idx_jobs_status`, etc.).
- [x] Added Alembic configuration and initial migration:
  - `backend/alembic.ini`
  - `backend/alembic/env.py`
  - `backend/alembic/versions/20260430_0001_init_schema.py`
- [x] Seeded initial plans: `free`, `starter`, `pro`, `radpro`, `enterprise`.
- [x] Seeded demo users:
  - `amira.bensalah@email.com`
  - `k.mansour@radiology.com`
  - `admin@laura-ai.fr` (Admin2026! account)
- [x] Ran migration:
  - `DATABASE_URL=sqlite:///./dev.db PYTHONPATH=. python3 -m alembic -c alembic.ini upgrade head`
- [x] Ran tests:
  - `PYTHONPATH=. python3 -m pytest tests -q` -> **3 passed**

## Phase 4 update (real authentication + role guards)

- [x] Implemented backend auth endpoints:
  - `POST /api/auth/login`
  - `POST /api/auth/admin/login`
  - `POST /api/auth/register`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
  - `POST /api/auth/refresh`
  - `POST /api/auth/forgot-password` (stub)
- [x] Security implementation:
  - bcrypt hashing/check with cost 12
  - JWT HS256 access token
  - Access token lifetime default set to 24h (`ACCESS_TOKEN_EXPIRE_MINUTES=1440`)
  - Refresh token rotation with DB persistence (`refresh_tokens` table)
  - Refresh token stored in HttpOnly cookie (`SameSite=Strict`, secure configurable via `REFRESH_COOKIE_SECURE`)
  - No token persistence in browser storage from frontend side
- [x] Frontend `AuthContext` refactor:
  - in-memory `token`
  - API-backed `login(email,password,role)`, `adminLogin`, `register`, `logout`, `refreshSession`
  - startup session restoration via `/api/auth/refresh` (cookie-based)
  - `getDashboardPath(role)` used for role redirects
- [x] Route-guard behavior updated:
  - patient-only `/patient/*`
  - radiologist-only `/radiologist/*`
  - admin-only `/admin/*`
  - wrong role redirected to that user’s correct dashboard
  - unauthenticated protected routes redirected to login screens
- [x] Validation runs:
  - Backend tests: `PYTHONPATH=. python3 -m pytest tests -q` -> **4 passed**
  - Frontend build: `npm run build` -> **success**

## Phase 5 update (typed frontend API layer)

- [x] Created typed API files:
  - `src/app/lib/api/client.ts`
  - `src/app/lib/api/auth.ts`
  - `src/app/lib/api/patient.ts`
  - `src/app/lib/api/radiologist.ts`
  - `src/app/lib/api/admin.ts`
  - `src/app/lib/api/shared.ts`
  - `src/app/lib/api/jobs.ts`
  - `src/app/types/api.ts`
- [x] `client.ts` now centralizes:
  - base URL from `VITE_API_URL`
  - bearer token attachment when available
  - `credentials: include`
  - centralized error normalization (`ApiError`)
  - one-time refresh-on-401 flow, then request retry
- [x] Refactored `AuthContext` to consume API modules and client token store.
- [x] Removed scattered direct fetch usage from app code (only `lib/api/client.ts` performs HTTP).
- [x] Updated env example frontend variable to `VITE_API_URL`.
- [x] Validation runs:
  - Frontend build: `npm run build` -> **success**
  - Backend tests: `PYTHONPATH=. python3 -m pytest tests -q` -> **4 passed**

## Phase 6 update (dynamic patient area: scan + documents + sharing)

- [x] Backend: patient document/folder CRUD + sharing + public share fetch/revoke:
  - `POST /api/scan/analyze`, `GET /api/scan/quota`
  - `GET/POST /api/patient/documents`, `GET/DELETE /api/patient/documents/:id`
  - `GET/POST /api/patient/folders`, `PUT /api/patient/folders/:id/documents`, `DELETE /api/patient/folders/:id`
  - `POST /api/patient/documents/:id/share`, `POST /api/patient/folders/:id/share` (7-day expiry; regenerating a link revokes the previous DB share row)
  - `GET /api/shared/:token`, `DELETE /api/shared/:token`
- [x] Scan pipeline:
  - validates 50MB max payload
  - deterministic mock when `OPENAI_API_KEY` is unset
  - always returns the required French disclaimer string
  - applies monthly scan quota for authenticated patients; increments `ai_used` only when OpenAI path is used
- [x] Auth hardening: refresh tokens now include a `jti` so repeated logins cannot collide on `refresh_tokens.token_hash`.
- [x] Frontend wiring:
  - `ScanDocument.tsx` calls `/api/scan/analyze`, shows structured results + error states, saves via `/api/patient/documents` only for logged-in patients
  - `PatientDocumentsContext.tsx` loads from API; list view uses server query params with debounced refresh
  - `ShareModal.tsx` uses share APIs + clipboard copy
  - `SharedDocumentPage.tsx` loads patient shares via API (keeps in-memory fallback for radiologist demo report shares)
- [x] Validation runs:
  - Backend tests: `python3 -m pytest -q` -> **6 passed** (isolated sqlite db file per test run)
  - Frontend build: `npm run build` -> **success**

## 1) Project discovery run log

### Command results

- `tree -I node_modules`: failed (`tree` is not installed on this machine).
- `package.json`: inspected.
- `src/app/App.tsx`: inspected.
- `src/app/routes.tsx`: inspected.
- all context files in `src/app/context/`: inspected.
- all route-linked page/component files: inspected.
- duplicate/unused component search: executed via import/reference scans.

### Install/build/lint results

- Lockfile discovery:
  - `pnpm-lock.yaml`: not found
  - `package-lock.json`: not found
  - `yarn.lock`: not found
- package manager used: `npm` (fallback by absence of lockfile).
- `npm install`: failed with invalid package names in `package.json` (alias-style dependency keys such as `@emotion/react@11.14.0` are invalid for npm).
- `npm run build`: blocked because install failed.
- `npm run lint`: script missing (`lint` is not defined).

---

## 2) Current routes found

Source: `src/app/routes.tsx`

### Public

- `/` -> `LandingRoute` -> `components/LandingPage.tsx`
- `/login` -> `LoginRoute` -> `components/auth/Login.tsx`
- `/signup` -> `SignUpRoute` -> `components/auth/SignUp.tsx`
- `/about` -> `AboutRoute` -> `components/AboutPage.tsx`
- `/pricing` -> `PricingRoute` -> `components/PricingPage.tsx`
- `/admin-login` -> `pages/admin/AdminLogin.tsx`
- `/shared/:token` -> `pages/SharedDocumentPage.tsx`
- `/api-docs` -> `pages/ApiDocumentation.tsx`
- `/docs` -> `pages/DocsPage.tsx`
- `*` -> `pages/NotFound.tsx`

### Patient (guarded by `PatientLayout`)

- `/patient/home` -> `pages/patient/PatientHome.tsx`
- `/patient/scan` -> `components/patient/ScanDocument.tsx`
- `/patient/documents` -> `components/patient/PatientDocuments.tsx`
- `/patient/documents/folder/:folderId` -> `pages/patient/FolderView.tsx`
- `/patient/documents/:id` -> `pages/patient/DocumentViewer.tsx`
- `/patient/account` -> `pages/patient/PatientAccountPage.tsx`

### Radiologist (guarded by `RadiologistLayout`)

- `/radiologist/home` -> `pages/radiologist/RadiologistHome.tsx`
- `/radiologist/folders` -> `components/radiologist/DicomFolderManager.tsx`
- `/radiologist/account` -> `pages/radiologist/RadiologistAccountPage.tsx`

### Admin (guarded by `AdminLayout`)

- `/admin/overview` -> `pages/admin/AdminOverview.tsx`
- `/admin/users` -> `pages/admin/AdminUsers.tsx`
- `/admin/plans` -> `pages/admin/AdminPlans.tsx`
- `/admin/storage` -> `pages/admin/AdminStorage.tsx`
- `/admin/gdpr` -> `pages/admin/AdminGdpr.tsx`

---

## 3) Current contexts found

Source folder: `src/app/context/`

- `AuthContext.tsx`
  - in-memory `user` state
  - login via hardcoded `DEMO_USERS`
  - no token, no API, no persistence
- `PatientDocumentsContext.tsx`
  - in-memory `documents` + `folders`
  - hardcoded `INITIAL_DOCS` and `INITIAL_FOLDERS`
  - local share-token generation
- `SharedLinksContext.tsx`
  - in-memory `links` map
- `LabContext.tsx`
  - in-memory default radiology center and profile
- `PacsContext.tsx`
  - in-memory PACS servers list with mock test statuses
- `PlansContext.tsx`
  - in-memory plan catalog via `INITIAL_PLANS`

Provider composition in `src/app/App.tsx`:
- `SharedLinksProvider` -> `PatientDocumentsProvider` -> `LabProvider` -> `PacsProvider` -> `PlansProvider` -> `AuthProvider` -> `RouterProvider`.

---

## 4) Static/mock data locations

### Core state mocks

- `src/app/context/AuthContext.tsx`
  - `DEMO_USERS`
- `src/app/context/PatientDocumentsContext.tsx`
  - `INITIAL_DOCS`, `INITIAL_FOLDERS`
- `src/app/context/PlansContext.tsx`
  - `INITIAL_PLANS`
- `src/app/context/PacsContext.tsx`
  - default PACS server array in `useState`
- `src/app/context/LabContext.tsx`
  - `DEFAULT_LAB`, `DEFAULT_PROFILE`
- `src/app/layouts/AdminLayout.tsx`
  - `INITIAL_USERS`

### Mock/simulated feature logic inside route components

- `src/app/components/LandingPage.tsx`
  - fake free scan analysis (`setTimeout`, hardcoded result)
- `src/app/components/patient/ScanDocument.tsx`
  - fake AI analysis and progress; local save into context
- `src/app/components/radiologist/DicomFolderManager.tsx`
  - `MOCK_FOLDERS`, generated report templates, mock share logic
- `src/app/pages/admin/*`
  - admin stats/users/storage/GDPR mostly computed from static in-memory data

---

## 5) Backend service files currently inside frontend

Current location (to be moved later):

- `src/app/backend/services/ocr_service.py`
- `src/app/backend/services/nlp_service.py`
- `src/app/backend/services/ai_agent_service.py`
- `src/app/backend/services/report_generator.py`

These are not wired as a runnable FastAPI backend in current project structure.

---

## 6) Duplicate components and likely unused files

Search method: import/reference scans across `src/`.

### Likely unused (no runtime imports found; do not delete yet)

- `src/app/components/DoctorDashboard.tsx`
- `src/app/components/PatientDashboard.tsx`
- `src/app/components/RadiologistDashboard.tsx`
- `src/app/components/admin/SuperAdminDashboard.tsx`
- `src/app/components/DICOMViewer.tsx`
- `src/app/components/patient/DicomViewer.tsx`
- `src/app/components/radiologist/DicomViewer.tsx`

### Special case

- `src/app/components/doctor/DicomViewer.tsx`
  - referenced only by `src/app/components/DoctorDashboard.tsx` (itself likely unused).

Conclusion: duplicates are present; none deleted in Phase 0.

---

## 7) Missing features vs documentation (technical + functional)

Compared against:
- `src/app/DOCUMENTATION_TECHNIQUE.md`
- `src/app/DOCUMENTATION_FONCTIONNELLE_COMPLETE.md`

### Architecture/backend gaps

- No real backend app root (`/backend`) with FastAPI entrypoint.
- No PostgreSQL integration, SQLAlchemy models, or Alembic migrations.
- No Redis integration.
- No Celery worker/queue.
- No S3/MinIO storage integration.
- No Orthanc/PACS service integration at infrastructure level.
- No Docker/production compose setup.
- No backend test suite execution pipeline.

### Auth/security gaps

- No JWT HS256 access/refresh implementation.
- No HttpOnly Secure SameSite=Strict cookie refresh flow.
- No persisted session lifecycle (`/auth/me`, refresh rotation, logout invalidation).

### Frontend-data flow gaps

- Contexts are memory-only, not API-backed.
- React Router Data Mode is used only for route declaration; loaders/actions are not implemented.
- `ApiDocumentation` is static content, not synchronized with live backend OpenAPI.

### Functional gaps from complete functional doc (v2)

- No real appointment system (bidirectional patient/doctor workflow).
- No real payment system integration.
- No mobile-native app layer (doc mentions iOS/Android native scope).
- No autonomous AI agent orchestration tied to persistent backend workflows.
- No operational CNAM/insurance/payment backend flows (doc includes broader platform scope).
- Several patient advanced modules exist as files but are not wired into current route graph.

---

## 8) Exact files planned to change in Phase 1

Phase 1 scope: tooling + installability + baseline quality gates (no product behavior change).

### Must update

- `package.json`
  - fix invalid dependency entries
  - add scripts (`lint`, `test`, `typecheck` at minimum)

### Likely create/update (as needed after installability check)

- `eslint.config.js` (or `.eslintrc.*`)
- `tsconfig.json` and/or `tsconfig.app.json`
- `vitest.config.ts`
- `src/test/setup.ts`
- `.env.example`
- `README.md` (setup commands section only, if scripts change)

No feature functionality changes are planned in Phase 1.

---

## 9) Phase 0 completion status

- [x] Discovery commands run (with noted `tree` command availability issue)
- [x] `package.json` inspected
- [x] `App.tsx` inspected
- [x] `routes.tsx` inspected
- [x] all contexts inspected
- [x] route-mapped components inspected
- [x] duplicate/unused scan performed
- [x] `IMPLEMENTATION_STATUS.md` created/updated with requested sections
- [x] install/build/lint commands attempted and outcomes recorded

---

## Final hardening checklist (2026-04-30)

### Done

- [x] Route parity: `/radiologist/dicom` → `/radiologist/folders`, `/admin/login` → `/admin-login` (see `src/app/routes.tsx`).
- [x] Anonymous landing scan calls `POST /api/scan/analyze` (no mock delay); patient scan prefers multipart in production or when `VITE_USE_MULTIPART_SCAN=true`, with `documentId` skipping duplicate `addDocument`.
- [x] Backend: `POST /api/scan/analyze-multipart`, GDPR portability export + erase, `purge_user_dependencies`, auth JWT role claim safe when `User.role` is stored as string.
- [x] Security middleware: CSP only on `/docs` and `/redoc` (avoids h11 `Illegal header value` on API/401 refresh responses).
- [x] Backend tests: multipart (anonymous + patient + oversize), GDPR request lifecycle, portability + erase throwaway user.
- [x] E2E: open landing free-scan section before upload; Playwright webServer uses `npx vite` (no `pnpm` required).
- [x] Responsive: `min-w-0` / `overflow-x-hidden` on admin/patient/radiologist shells and shared public page.
- [x] **DB schema drift (`password_hash`)**: `User.password_hash` mapped explicitly to column `password_hash`; Alembic `20260430_0003` renames legacy PostgreSQL `"passwordHash"` → `password_hash` (idempotent, no data drop). Seeds in `20260430_0001` already use `password_hash`.

### Verified by command (local run, this workspace)

```text
# Frontend
npm run build   → OK (Vite)
npm run test    → 9 tests passed (Vitest)

# Backend
cd backend && python3 -m pytest tests/ -v --cov=app --cov-report=term-missing -q
→ 28 passed, TOTAL coverage ~76%

# E2E (API on SQLite: DATABASE_URL=sqlite:////tmp/laura_e2e.sqlite3, alembic upgrade head, uvicorn :8000)
npm run e2e     → 6 passed (~17s)

# Docker
docker compose build → may fail without Docker Hub network; `docker compose config -q` validates compose file.
```

### `password_hash` inspection (repo canonical = snake_case)

```bash
grep -R "passwordHash\|password_hash" backend/app backend/alembic -n
```

- Application code and initial migration use **`password_hash`** only.
- **`passwordHash`** appears only in migration `20260430_0003` as the legacy column name being renamed away on PostgreSQL.

### Migration / reset commands

**Apply rename on existing PostgreSQL (preserves rows):**

```bash
cd backend
export DATABASE_URL="postgresql+psycopg2://USER:PASS@HOST:5432/DBNAME"
PYTHONPATH=. python3 -m alembic -c alembic.ini upgrade head
```

Revision `20260430_0003` runs only on PostgreSQL; if `users.password_hash` already exists, it no-ops. Docker `docker-entrypoint.sh` already runs `alembic upgrade head` before uvicorn.

**Dev-only full reset (destroys volume data — not for production):**

```bash
docker compose down -v
docker compose up --build -d
# wait for api healthy; entrypoint runs migrations on fresh Postgres
```

### Remaining manual checks

- [ ] `docker compose up --build` with registry access; confirm browser → `VITE_API_URL` and login on real Postgres after `0003`.
- [ ] Visual QA at 390 / 768 / 1024 / 1440 px on modals and DICOM manager.

### Known caveats

- **E2E + SameSite cookie**: Full `page.goto` to another `/patient/*` path can remount the SPA before the refresh cookie is usable cross-port in some browsers; tests use **in-app navigation** (sidebar links) where needed. Playwright `request` API: use explicit `Content-Type: application/json` + `data: JSON.stringify(...)` for reliable bodies.
- **pnpm**: Scripts may say `pnpm e2e`; `npm run e2e` works equivalently.
- **Docker**: Image pulls require outbound access to Docker Hub.

### Production deployment notes

- Set `VITE_API_URL` to the public API origin; enable multipart scans in prod via `import.meta.env.PROD` (already) or explicit `VITE_USE_MULTIPART_SCAN=true` in staging.
- Run Alembic `upgrade head` before traffic (includes `20260430_0003` for legacy `passwordHash`); ensure CORS `ALLOWED_ORIGINS` includes the SPA origin.
- Omit browser CSP on JSON routes is intentional; lock down **browser** security via headers on the static SPA host (e.g. nginx) for HTML assets.

---

## FINAL STATUS — LAURA AI

### Automated verification

- [x] `npm run build`
- [x] `npm run test`
- [x] Backend pytest: **28 passed**
- [x] `npm run e2e`: **6 passed**
- [x] DB migration **0003** fixes `passwordHash` → `password_hash` (PostgreSQL)
- [x] Migration is **idempotent** and does **not** drop data
- [x] Auth / seeds use **`password_hash`** consistently
- [x] `IMPLEMENTATION_STATUS.md` updated (this file)

### Remaining local / production verification

- [ ] Run Alembic `upgrade head` against **real Postgres** (not only SQLite / CI)
- [ ] **Rebuild** Docker images (`docker compose build` or `build` as part of `up`)
- [ ] Run `docker compose up --build` where **Docker Hub** (or your registry mirror) is reachable
- [ ] Confirm **demo users** can log in on the Docker stack (patient / radiologist / admin)
- [ ] Quick **visual responsive** pass: mobile / tablet / desktop breakpoints
