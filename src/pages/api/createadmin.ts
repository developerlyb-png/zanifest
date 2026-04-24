import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Admin from '@/models/Admin';
import { authMiddleware } from "@/middleware/auth";

function validateInput(data: any) {
  const errors: string[] = [];

  if (!data.userFirstName || !/^[A-Za-z\s]+$/.test(data.userFirstName)) {
    errors.push("Invalid first name");
  }

  if (data.userLastName && !/^[A-Za-z\s]+$/.test(data.userLastName)) {
    errors.push("Invalid last name");
  }

  if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
    errors.push("Invalid email");
  }

  if (
    !data.password ||
    !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/.test(data.password)
  ) {
    errors.push("Password must contain letter, number, symbol and be at least 6 characters");
  }

  if (!["admin", "superadmin"].includes(data.role)) {
    errors.push("Invalid role");
  }

  return errors;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  // 🔥 MIDDLEWARE ADD (MOST IMPORTANT)
  const isAuth = await authMiddleware(req, res);
  if (!isAuth) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userFirstName, userLastName, email, password, role } = req.body;

  const errors = validateInput(req.body);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  try {
    await dbConnect();

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const newAdmin = new Admin({
      userFirstName,
      userLastName: userLastName || "",
      email,
      password,
      role
    });

    await newAdmin.save();

    return res.status(201).json({
      success: true,
      message: 'Admin created successfully'
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}