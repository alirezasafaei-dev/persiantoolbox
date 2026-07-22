import { Pool, type QueryResult, type QueryResultRow } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env['DATABASE_URL'];
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set');
    }
    const isProd = process.env['NODE_ENV'] === 'production';
    pool = new Pool({
      connectionString,
      max: isProd ? 20 : 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
      statement_timeout: 30_000,
    });
    pool.on('error', (error) => {
      console.error('[DB] Idle client error:', error.message);
    });
  }
  return pool;
}

export function getPoolStats(): {
  totalCount: number;
  idleCount: number;
  waitingCount: number;
} | null {
  if (!pool) {
    return null;
  }
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: Array<unknown> = [],
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, params);
}

export async function withTransaction<T>(
  fn: (
    queryFn: <R extends QueryResultRow = QueryResultRow>(
      text: string,
      params?: Array<unknown>,
    ) => Promise<QueryResult<R>>,
  ) => Promise<T>,
): Promise<T> {
  const connection = await getPool().connect();
  try {
    await connection.query('BEGIN');
    const result = await fn(
      <R extends QueryResultRow = QueryResultRow>(text: string, params: Array<unknown> = []) =>
        connection.query<R>(text, params),
    );
    await connection.query('COMMIT');
    return result;
  } catch (error) {
    await connection.query('ROLLBACK');
    throw error;
  } finally {
    connection.release();
  }
}
