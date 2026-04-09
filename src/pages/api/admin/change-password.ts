import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import Manager from "@/models/Manager";
import Agent from "@/models/Agent";
import { withAuth } from "@/utils/withAuth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { newPassword } = req.body;

  // ✅ Logged-in user from token
  const user = (req as any).user;

  if (!newPassword) {
    return res.status(400).json({ message: "New password is required." });
  }

  // 🔐 Password validation
  if (newPassword.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters long",
    });
  }

  try {
    await dbConnect();

    // ✅ Role restriction (only agent & manager allowed)
    if (!["agent", "manager"].includes(user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // ✅ Find logged-in user
    const person =
      (await Agent.findById(user.id)) ||
      (await Manager.findById(user.id));

    if (!person) {
      return res.status(404).json({ message: "User not found." });
    }

    // 🔐 Prevent same password reuse
    const isSame = await bcrypt.compare(newPassword, person.password);
    if (isSame) {
      return res.status(400).json({
        message: "New password cannot be same as old password",
      });
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    person.password = hashedPassword;

    await person.save();

    return res.status(200).json({
      message: "Password updated successfully.",
    });

  } catch (error) {
    console.error("Password change error:", error);
    return res.status(500).json({
      message: "Server error. Try again later.",
    });
  }
}

// ✅ Protect API
export default withAuth(handler);