
import { NextRequest, NextResponse } from 'next/server'

// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (!code) {
    if (errorParam || errorDescription) {
      const reason = encodeURIComponent(errorDescription || errorParam || 'recovery_expired');
      return NextResponse.redirect(new URL(`/auth?error=${reason}`, request.url));
    }

    return NextResponse.redirect(new URL('/auth', request.url));
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const reason = encodeURIComponent(error.message || errorDescription || 'recovery_expired');
    return NextResponse.redirect(new URL(`/auth?error=${reason}`, request.url));
  }

  const response = NextResponse.redirect(new URL('/auth/password/reset', request.url));
  response.cookies.set('password_recovery', 'true', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 300,
  });

  return response;
}