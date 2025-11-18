
import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin.server';

export const withAuth = (handler: (request: Request, { user }: { user: { uid: string } }) => Promise<NextResponse>) =>
  async (request: Request): Promise<NextResponse> => {
    const cookieHeader = request.headers.get('cookie');
    const sessionCookie = cookieHeader?.split(';').find(c => c.trim().startsWith('session='))?.split('=')[1];

    if (!sessionCookie) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }

    try {
      const decodedToken = await getAdminAuth().verifySessionCookie(sessionCookie);
      const user = { uid: decodedToken.uid };
      return handler(request, { user });
    } catch (error) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Invalid session cookie' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }
};
