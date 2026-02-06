import { Pool, type QueryResult, type QueryResultRow } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env['DATABASE_URL'];
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set');
    }
    pool = new Pool({ connectionString });
  }
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: Array<unknown> = [],
): Promise<QueryResult<T>> {
  const client = getPool();
  return client.query<T>(text, params as Array<unknown>);
}

export async function withTransaction<T>(
  fn: (
    queryFn: <R extends QueryResultRow = QueryResultRow>(
      text: string,
      params?: Array<unknown>,
    ) => Promise<QueryResult<R>>,
  ) => Promise<T>,
): Promise<T> {
  const client = getPool();
  const connection = await client.connect();
  try {
    await connection.query('BEGIN');
    const result = await fn(
      <R extends QueryResultRow = QueryResultRow>(text: string, params: Array<unknown> = []) =>
        connection.query<R>(text, params as Array<unknown>),
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
