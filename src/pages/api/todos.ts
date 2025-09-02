import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const filePath = path.resolve(process.cwd(), 'data/todos.json');

function readData() {
  try {
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(jsonData);
  } catch (error) {
    // If the file doesn't exist, return a default structure
    return { todos: [], categories: [], lastUpdated: new Date().toISOString() };
  }
}

function writeData(data: any) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const data = readData();
    res.status(200).json(data);
  } else if (req.method === 'POST') {
    const data = req.body;
    writeData(data);
    res.status(200).json({ message: 'Data saved successfully' });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
