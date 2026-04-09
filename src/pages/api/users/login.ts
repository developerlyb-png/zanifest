import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password } = req.body;

  try {
    await dbConnect();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ password check
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ JWT (match admin/agent)
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        userName: user.userName,
        role: "user",
      },
      process.env.JWT_SECRET!,
      { expiresIn: "30m" }
    );

    // ✅ Absolute expiry
    const absoluteExpiry = Date.now() + 60 * 60 * 1000;

    // ✅ Cookie options (same as others)
    const isProd = process.env.NODE_ENV === "production";

    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "strict" as const : "lax" as const,
      path: "/",
    };

    // ✅ Set cookies (FIXED)
    res.setHeader("Set-Cookie", [
      serialize("userToken", token, {
        ...cookieOptions,
        maxAge: 60 * 30,
      }),

      serialize("abs_exp", absoluteExpiry.toString(), {
        ...cookieOptions,
        maxAge: 60 * 60,
      }),

      // 🔥 clear other tokens
      serialize("adminToken", "", {
        ...cookieOptions,
        maxAge: 0,
      }),

      serialize("agentToken", "", {
        ...cookieOptions,
        maxAge: 0,
      }),
    ]);

    return res.status(200).json({
      email: user.email,
      name: user.userName || "",
      message: "Login successful",
    });

  } catch (err) {
    console.error("User login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}