// pages/api/admin/login.ts
import { NextApiRequest, NextApiResponse } from "next";
import Admin from "@/models/Admin";
import dbConnect from "@/lib/dbConnect";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  // ❌ Only POST allowed
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // ✅ SAFE Origin Check (non-breaking)
  const origin = req.headers.origin;

  if (origin && !origin.includes("localhost") && !origin.includes("yourdomain.com")) {
    return res.status(403).json({ message: "Invalid origin" });
  }

  // ✅ 🔥 CSRF VALIDATION (ADDED)
  const csrfCookie = req.cookies.csrfToken;
  const csrfHeader = req.headers["x-csrf-token"];

  if (!csrfCookie || csrfCookie !== csrfHeader) {
    return res.status(403).json({ message: "Invalid CSRF token" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    await dbConnect();

    const admin = await Admin.findOne({ email }).select(
      "userFirstName userLastName email role password accountStatus loginAttempts lockUntil"
    );

    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 🔒 Account lock check
    if (admin.lockUntil && admin.lockUntil > Date.now()) {
      return res.status(403).json({
        message: "Account locked. Try again after 15 minutes",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    // ❌ Wrong password
    if (!isMatch) {
      admin.loginAttempts += 1;

      if (admin.loginAttempts >= 5) {
        admin.lockUntil = Date.now() + 15 * 60 * 1000;
      }

      await admin.save();

      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ✅ Reset attempts
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;
    await admin.save();

    const status = admin.accountStatus ?? "active";

    if (admin.role === "admin" && status === "inactive") {
      return res.status(403).json({
        message: "Account is not active. Please contact support.",
      });
    }

    // ✅ JWT token
    const token = jwt.sign(
      {
        id: admin._id,
        userFirstName: admin.userFirstName,
        userLastName: admin.userLastName || "",
        email: admin.email,
        role: admin.role,
        accountStatus: status,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "30m" }
    );

    // ✅ Absolute expiry
    const absoluteExpiry = Date.now() + 60 * 60 * 1000;

    // ✅ Cookie options
    const isProd = process.env.NODE_ENV === "production";

    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "strict" as const : "lax" as const,
      path: "/",
    };

    // ✅ Set cookies
    res.setHeader("Set-Cookie", [
      serialize("adminToken", token, {
        ...cookieOptions,
        maxAge: 60 * 30,
      }),

      serialize("abs_exp", absoluteExpiry.toString(), {
        ...cookieOptions,
        maxAge: 60 * 60,
      }),

      // remove other tokens
      serialize("agentToken", "", {
        ...cookieOptions,
        maxAge: 0,
      }),

      serialize("userToken", "", {
        ...cookieOptions,
        maxAge: 0,
      }),
    ]);

    return res.status(200).json({
      message: "Login successful",
      role: admin.role,
    });

  } catch (err) {
    console.error("Login server error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}