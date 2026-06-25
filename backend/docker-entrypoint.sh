#!/bin/sh
set -e
h="${POSTGRES_HOST:-db}"
p="${POSTGRES_PORT:-5432}"
u="${POSTGRES_USER:-laura}"
export PGPASSWORD="${POSTGRES_PASSWORD:-laura}"
until pg_isready -h "$h" -p "$p" -U "$u" >/dev/null 2>&1; do
  echo "waiting for postgres ($h:$p)..."
  sleep 1
done
echo "running migrations..."
alembic upgrade head
exec "$@"
