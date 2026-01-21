import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'RorPartnership2024!';

    if (username === adminUsername && password === adminPassword) {
      // Create a simple token (in production, use JWT or sessions)
      const token = Buffer.from(`${username}:${Date.now()}:${adminPassword}`).toString('base64');

      const response = NextResponse.json({ success: true, token });
      response.cookies.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });
      return response;
    }

    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');

  if (token) {
    // Verify token contains valid credentials
    try {
      const decoded = Buffer.from(token.value, 'base64').toString('utf-8');
      const [username, timestamp, password] = decoded.split(':');

      const adminUsername = process.env.ADMIN_USERNAME || 'admin';
      const adminPassword = process.env.ADMIN_PASSWORD || 'RorPartnership2024!';

      if (username === adminUsername && password === adminPassword) {
        return NextResponse.json({ authenticated: true });
      }
    } catch (err) {
      // Invalid token
    }
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_token');
  return response;
}
