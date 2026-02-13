import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Exclude LINE Webhook from auth (it has its own signature validation)
  if (request.nextUrl.pathname.startsWith('/api/webhook')) {
    return NextResponse.next();
  }

  // Only protect /api routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    // NOTE: Hardcoded auth is out of scope for this POC. This mimics a JWT login 
    // to streamline development and is expected to be replaced by actual auth.
    const authHeader = request.headers.get('authorization');
    const expectedAuth = process.env.API_SECRET_KEY || process.env.NEXT_PUBLIC_KEY || 'hardcoded_secret_key_12345';

    if (!authHeader || authHeader !== `Bearer ${expectedAuth}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
