import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@/lib/firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send({ message: 'Only POST requests allowed' });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).send({ message: 'Token is required' });
  }

  try {
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await auth.createSessionCookie(token, { expiresIn });
    
    const options = { maxAge: expiresIn, httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' };
    res.setHeader('Set-Cookie', `session=${sessionCookie}; ${Object.entries(options).map(([key, value]) => `${key}=${value}`).join('; ')}`);
    
    res.status(200).json({ status: 'success' });
  } catch (error) {    
    res.status(401).send({ message: 'Invalid token' });
  }
}
