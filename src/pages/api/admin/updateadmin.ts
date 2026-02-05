import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const cookies = parse(req.headers.cookie || '');
    const token = cookies.adminToken;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (!decoded?.id) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Match your frontend fields
    const allowedFields = [
      'userFirstName',
      'userLastName',
      'email',
      'password'
    ];

    const updates: any = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined && req.body[field] !== '') {
        updates[field] = req.body[field];
      }
    }

    // If password is being updated, hash it
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updated = await Admin.findByIdAndUpdate(decoded.id, updates, {
      new: true,
    }).lean();

    if (!updated) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    delete (updated as any).password;
    return res.status(200).json({ message: 'Profile updated', manager: updated });
  } catch (err) {
    console.error('PATCH /api/manager/updateadmin Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
