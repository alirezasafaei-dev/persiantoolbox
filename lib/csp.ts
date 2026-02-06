'use server';

import { headers } from 'next/headers';

export async function getCspNonce(): Promise<string | null> {
  const requestHeaders = await headers();
  return requestHeaders.get('x-csp-nonce');
}
