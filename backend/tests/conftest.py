"""Force isolated SQLite + migrations before any test module imports ``app`` (avoids env order issues)."""

from __future__ import annotations

import os
import subprocess
import sys
import uuid
from pathlib import Path

_BACKEND = Path(__file__).resolve().parents[1]
_test_db = _BACKEND / f"_pytest_laura_{uuid.uuid4().hex}.sqlite3"
os.environ["DATABASE_URL"] = f"sqlite:///{_test_db}"
os.environ.setdefault("PYTHONPATH", ".")
subprocess.run(
    [sys.executable, "-m", "alembic", "-c", "alembic.ini", "upgrade", "head"],
    cwd=_BACKEND,
    check=True,
    env={**os.environ},
)
