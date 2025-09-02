import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@/lib/firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).send({ message: 'Only GET requests allowed' });
  }

  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).send({ message: 'Unauthorized' });
  }

  const token = authorization.split(' ')[1];
  if (!token) {
    return res.status(401).send({ message: 'Unauthorized' });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    if (decodedToken.role !== 'admin') {
      return res.status(403).send({ message: 'Forbidden' });
    }

    const users = await auth.listUsers();
    res.status(200).json({ users: users.users });
  } catch (error) {
    console.error(error);
    return res.status(401).send({ message: 'Unauthorized' });
  }
}
