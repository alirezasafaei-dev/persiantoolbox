import { NextResponse } from 'next/server';

const disabledResponse = {
  ok: false,
  error: 'HISTORY_DISABLED_IN_V2',
};

export async function GET(_request: Request) {
  void _request;
  return NextResponse.json(disabledResponse, { status: 410 });
}

export async function POST(_request: Request) {
  void _request;
  return NextResponse.json(disabledResponse, { status: 410 });
}

export async function DELETE(_request: Request) {
  void _request;
  return NextResponse.json(disabledResponse, { status: 410 });
}
