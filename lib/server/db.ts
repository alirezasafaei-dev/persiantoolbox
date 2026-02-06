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
  params: Array<string | number | null> = [],
): Promise<QueryResult<T>> {
  const client = getPool();
  return client.query<T>(text, params);
}

export async function withTransaction<T>(
  fn: (queryFn: typeof query<QueryResultRow>) => Promise<T>,
): Promise<T> {
  const client = getPool();
  const connection = await client.connect();
  try {
    await connection.query('BEGIN');
    const result = await fn((text, params) => connection.query(text, params));
    await connection.query('COMMIT');
    return result;
  } catch (error) {
    await connection.query('ROLLBACK');
    throw error;
  } finally {
    connection.release();
  }
}

// Lightweight prisma-like stub for typechecking; replace with real Prisma client in production.
export const prisma = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $transaction: async <T>(fn: (tx: any) => Promise<T>): Promise<T> => fn(prisma as any),
  historyShareLink: {
    async create(args: {
      data: {
        token?: string;
        entryId?: string;
        userId?: string;
        createdAt?: number | bigint;
        expiresAt?: number | bigint;
        entry?: unknown;
        outputUrl?: string | null;
      };
    }) {
      const data = args.data ?? {};
      return {
        token: data.token ?? '',
        entryId: data.entryId ?? '',
        userId: data.userId ?? '',
        createdAt: BigInt(data.createdAt ?? Date.now()),
        expiresAt: BigInt(data.expiresAt ?? Date.now()),
        entry: data.entry ?? null,
        outputUrl: data.outputUrl ?? null,
      };
    },
    async findUnique(args?: unknown) {
      void args;
      return null as never;
    },
  },
  rateLimitMetric: {
    async upsert(args?: unknown) {
      void args;
      return null as never;
    },
  },
  rateLimit: {
    async findUnique(args?: unknown) {
      void args;
      return null as never;
    },
    async upsert(args?: unknown) {
      void args;
      return null as never;
    },
    async update(args?: unknown) {
      void args;
      return null as never;
    },
  },
};
