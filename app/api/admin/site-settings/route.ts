import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request) {
  void _request;
  return NextResponse.json(
    { ok: false, errors: ['تنظیمات سایت در نسخه ۱.۱.۱ غیرفعال شده است.'] },
    { status: 410 },
  );
}

export async function PUT(_request: Request) {
  void _request;
  return NextResponse.json(
    { ok: false, errors: ['تنظیمات سایت در نسخه ۱.۱.۱ غیرفعال شده است.'] },
    { status: 410 },
  );
}
