/**
 * Confirms Prisma sees the same Postgres as your backend (set PRISMA_DATABASE_URL).
 * Example (Docker Compose DB on host):
 *   export PRISMA_DATABASE_URL="postgresql://laura:laura@127.0.0.1:5433/laura_ai"
 *   npm run verify:db
 */
import { PrismaClient } from '@prisma/client';

const url = process.env.PRISMA_DATABASE_URL;
if (!url) {
  console.error(
    'Missing PRISMA_DATABASE_URL.\n' +
      'Use the same host/db/user as backend DATABASE_URL, but with postgresql:// (not postgresql+psycopg2://).\n' +
      'Example: postgresql://laura:laura@127.0.0.1:5433/laura_ai'
  );
  process.exit(1);
}

const prisma = new PrismaClient();
try {
  const total = await prisma.users.count();
  const amira = await prisma.users.findUnique({
    where: { email: 'amira.bensalah@email.com' },
    select: { email: true, role: true },
  });
  console.log(
    JSON.stringify(
      {
        userCount: total,
        seedPatientPresent: Boolean(amira),
        seedPatient: amira,
      },
      null,
      2
    )
  );
  if (!amira) {
    console.error('\n→ Run Alembic on this database: cd backend && alembic upgrade head');
    process.exit(1);
  }
} finally {
  await prisma.$disconnect();
}
