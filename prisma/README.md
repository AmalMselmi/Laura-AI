# Prisma (optional DB tooling)

Laura AI’s **authoritative** schema and migrations are **SQLAlchemy + Alembic** under `backend/`.  
Prisma here is for **Prisma Studio** and **introspection** (`db pull`) only — not for replacing the API layer.

## 1. Connection string

Prisma needs a **native** Postgres URL (no SQLAlchemy drivers).

**Use the same database as the Python API** (`backend` `DATABASE_URL`), only swap the scheme:

| Backend (`DATABASE_URL`) | Prisma (`PRISMA_DATABASE_URL`) |
|--------------------------|--------------------------------|
| `postgresql+psycopg2://laura:laura@127.0.0.1:5433/laura_ai` | `postgresql://laura:laura@127.0.0.1:5433/laura_ai` |

Examples:

```bash
# Laura AI `db` service publishes to host port 5433 by default (see POSTGRES_PUBLISH_PORT in docker-compose.yml).
export PRISMA_DATABASE_URL="postgresql://laura:laura@127.0.0.1:5433/laura_ai"

# If you changed POSTGRES_PUBLISH_PORT in .env, use that port instead of 5433.
```

Use a host your machine can reach (`127.0.0.1` when port-forwarding, `db` only from inside the Docker network).

Quick check that Prisma sees the seed patient (same row the API uses for login):

```bash
export PRISMA_DATABASE_URL="postgresql://laura:laura@127.0.0.1:5433/laura_ai"
npm run verify:db
```

The UI also calls **`GET /api/health`** (same SQLAlchemy DB as `/api/auth/login`) to warn if migrations were not applied.

## 2. Introspect tables from the live DB

```bash
cd "/Users/yasinmokni/Desktop/Laura AI "
npm install
npm run prisma:pull
npm run prisma:generate
```

This overwrites model blocks in `schema.prisma` from the current database (after Alembic migrations have been applied).

## 3. Open Prisma Studio

```bash
export PRISMA_DATABASE_URL="postgresql://laura:laura@127.0.0.1:5433/laura_ai"
npm run prisma:studio
```

Then open the URL shown in the terminal (default **http://localhost:5555**).

## Do not

- Run **`prisma migrate`** for production schema changes — use **`alembic revision` / `upgrade`** in `backend/` instead.
- Import `@prisma/client` from the Vite app for normal features without a deliberate architecture decision (duplicates the Python API).
