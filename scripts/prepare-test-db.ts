import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

const workspaceRoot = process.cwd();

function loadEnvFile(fileName: string): void {
  const filePath = path.join(workspaceRoot, fileName);
  if (fs.existsSync(filePath)) {
    dotenv.config({ path: filePath, override: false });
  }
}

function getTestDbUrl(): string {
  loadEnvFile('.env.test');
  loadEnvFile('.env');
  loadEnvFile('.env.test.example');

  const databaseUrl = process.env.DATABASE_URL_TEST;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL_TEST is required. Set it in .env.test or .env.test.example');
  }

  return databaseUrl;
}

function toAdminDbUrl(testDbUrl: string): { adminUrl: string; dbName: string } {
  const parsed = new URL(testDbUrl);
  const dbName = parsed.pathname.replace(/^\//, '');

  if (!dbName || !/^[A-Za-z0-9_]+$/.test(dbName)) {
    throw new Error(`Unsupported DATABASE_URL_TEST database name: "${dbName}"`);
  }

  parsed.pathname = '/postgres';
  return { adminUrl: parsed.toString(), dbName };
}

async function ensureDatabaseExists(adminUrl: string, dbName: string): Promise<void> {
  const adminClient = new PrismaClient({
    datasources: {
      db: {
        url: adminUrl,
      },
    },
  });

  try {
    const rows = (await adminClient.$queryRawUnsafe(
      `SELECT datname FROM pg_database WHERE datname = '${dbName}' LIMIT 1`,
    )) as Array<{ datname: string }>;

    if (rows.length === 0) {
      await adminClient.$executeRawUnsafe(`CREATE DATABASE "${dbName}"`);
      console.log(`Created test database: ${dbName}`);
    } else {
      console.log(`Test database already exists: ${dbName}`);
    }
  } finally {
    await adminClient.$disconnect();
  }
}

function runMigrations(testDbUrl: string): void {
  const migrate = spawnSync('pnpm exec prisma migrate deploy', [], {
    shell: true,
    stdio: 'inherit',
    cwd: workspaceRoot,
    env: {
      ...process.env,
      POSTGRES_PRISMA_URL: testDbUrl,
      POSTGRES_URL_NON_POOLING: testDbUrl,
    },
  });

  if (migrate.error) {
    throw migrate.error;
  }

  if (migrate.status !== 0) {
    throw new Error('Failed to apply migrations to test database');
  }
}

async function main(): Promise<void> {
  const testDbUrl = getTestDbUrl();
  const { adminUrl, dbName } = toAdminDbUrl(testDbUrl);

  await ensureDatabaseExists(adminUrl, dbName);
  runMigrations(testDbUrl);

  console.log(`Test DB is ready: ${dbName}`);
}

main().catch((error) => {
  console.error('test:db:prepare failed', error);
  process.exit(1);
});
