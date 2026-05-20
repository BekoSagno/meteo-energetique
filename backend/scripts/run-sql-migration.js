/**
 * Exécute un fichier SQL via Prisma (développement local).
 * Usage : node scripts/run-sql-migration.js sql/migrate-add-communes.sql
 */
import 'dotenv/config';
import { readFileSync } from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const file = process.argv[2] ?? 'sql/migrate-add-communes.sql';

async function main() {
  const sql = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  const statements = sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }

  console.info(`✓ Migration appliquée : ${file}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
