import { randomUUID } from 'node:crypto';
import { prisma } from './db';
import { listHistoryEntries, type HistoryEntry } from './history';
import { normalizeShareExpiryHours } from '@/shared/history/share';
import type { HistoryShareLink as PrismaHistoryShareLink } from '@prisma/client';

export type HistoryShareLink = {
  token: string;
  entryId: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
  outputUrl: string | null;
};

function mapShareLink(link: PrismaHistoryShareLink, outputUrl: string | null): HistoryShareLink {
  return {
    token: link.token,
    entryId: link.entryId,
    userId: link.userId,
    createdAt: Number(link.createdAt),
    expiresAt: Number(link.expiresAt),
    outputUrl,
  };
}

export async function createHistoryShareLink(
  userId: string,
  entryId: string,
  expiresInHours?: number,
): Promise<{ link: HistoryShareLink; entry: HistoryEntry } | null> {
  const entries = await listHistoryEntries(userId, 1000);
  const entry = entries.find((item) => item.id === entryId);
  if (!entry?.outputUrl || entry.outputUrl === '') {
    return null;
  }

  const token = randomUUID();
  const createdAt = Date.now();
  const hours = normalizeShareExpiryHours(expiresInHours);
  const expiresAt = createdAt + hours * 60 * 60 * 1000;

  const historyClient = prisma.historyShareLink;
  const link = (await historyClient.create({
    data: {
      token,
      entryId: entry.id,
      userId,
      createdAt: BigInt(createdAt),
      expiresAt: BigInt(expiresAt),
    },
  })) as PrismaHistoryShareLink;

  return {
    link: mapShareLink(link, entry.outputUrl ?? null),
    entry,
  };
}

export async function getHistoryShareLink(token: string): Promise<HistoryShareLink | null> {
  const historyClient = prisma.historyShareLink;
  const link = (await historyClient.findUnique({
    where: { token },
    include: { entry: true },
  })) as (PrismaHistoryShareLink & { entry?: { outputUrl?: string | null } | null }) | null;

  if (!link) {
    return null;
  }

  const entryOutput = link.entry?.outputUrl ?? null;
  return mapShareLink(link, entryOutput);
}
