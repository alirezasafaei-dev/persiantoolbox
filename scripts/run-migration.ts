#!/usr/bin/env tsx
/**
 * Migration Runner
 */

import { up } from '../lib/server/migrations/add-usage-tracking';

async function main() {
  try {
    await up();
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
