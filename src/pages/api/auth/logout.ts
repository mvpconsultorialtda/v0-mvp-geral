import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send({ message: 'Only POST requests allowed' });
  }
  
  res.setHeader('Set-Cookie', 'session=; Max-Age=0; path=/');
  res.status(200).json({ status: 'success' });
}
