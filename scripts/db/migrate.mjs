import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';
import pg from 'pg';

const { Client } = pg;

async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required for db migration');
  }

  const schemaPath = resolve(process.cwd(), 'scripts/db/schema.sql');
  const schemaSql = await readFile(schemaPath, 'utf8');

  const client = new Client({ connectionString });
  await client.connect();
  try {
    await client.query(schemaSql);
    // eslint-disable-next-line no-console
    console.log('Database schema applied:', schemaPath);
  } finally {
    await client.end();
  }
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('[db:migrate] failed:', error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
