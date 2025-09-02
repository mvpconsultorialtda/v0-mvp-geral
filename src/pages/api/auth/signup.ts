import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@/lib/firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send({ message: 'Only POST requests allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ message: 'Email and password are required' });
  }

  try {
    const users = await auth.listUsers();
    const role = users.users.length === 0 ? 'admin' : 'user_default';

    const userRecord = await auth.createUser({ email, password });
    await auth.setCustomUserClaims(userRecord.uid, { role });

    res.status(200).json({ status: 'success', uid: userRecord.uid });
  } catch (error: any) {
    res.status(400).send({ message: error.message });
  }
}
