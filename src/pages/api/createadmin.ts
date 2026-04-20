import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Admin from '@/models/Admin';

// ✅ Validation function
function validateInput(data: any) {
  const errors: string[] = [];

  // First Name
  if (!data.userFirstName || !/^[A-Za-z\s]+$/.test(data.userFirstName)) {
    errors.push("Invalid first name");
  }

  // Last Name (optional)
  if (data.userLastName && !/^[A-Za-z\s]+$/.test(data.userLastName)) {
    errors.push("Invalid last name");
  }

  // Email
  if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
    errors.push("Invalid email");
  }

  // 🔥 Strong Password (UPDATED)
  if (
    !data.password ||
    !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/.test(data.password)
  ) {
    errors.push(
      "Password must contain letter, number, symbol and be at least 6 characters"
    );
  }

  // Role
  if (!["admin", "superadmin"].includes(data.role)) {
    errors.push("Invalid role");
  }

  return errors;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userFirstName, userLastName, email, password, role } = req.body;

  // ✅ Validation check
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
      password, // ⚠️ hashing next step
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