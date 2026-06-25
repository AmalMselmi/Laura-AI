/**
 * Credentials for Playwright / API helpers. Must match DB seed
 * (`backend/alembic/versions/20260430_0001_init_schema.py`).
 * Override with env vars in CI if needed.
 */
export const E2E_SEED_ACCOUNTS = {
  patient: {
    email: process.env.E2E_PATIENT_EMAIL ?? 'amira.bensalah@email.com',
    password: process.env.E2E_PATIENT_PASSWORD ?? 'Demo2026!',
  },
  radiologist: {
    email: process.env.E2E_RADIOLOGIST_EMAIL ?? 'k.mansour@radiology.com',
    password: process.env.E2E_RADIOLOGIST_PASSWORD ?? 'RadioDemo2026!',
  },
  admin: {
    email: process.env.E2E_ADMIN_EMAIL ?? 'admin@laura-ai.fr',
    password: process.env.E2E_ADMIN_PASSWORD ?? 'Admin2026!',
  },
} as const;
