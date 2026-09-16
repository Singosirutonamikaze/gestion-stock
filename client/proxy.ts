import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy() {
  return NextResponse.next();
}
