import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SECURITY_TXT = `Contact: https://persiantoolbox.ir/support
Preferred-Languages: fa, en
Canonical: https://persiantoolbox.ir/.well-known/security.txt
Expires: 2027-06-21T00:00:00.000Z
Policy: https://persiantoolbox.ir/trust
`;

export function GET() {
  return new NextResponse(SECURITY_TXT, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
