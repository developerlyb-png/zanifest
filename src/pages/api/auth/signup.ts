import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// 🔥 ADD
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    console.log("Invalid method:", req.method);
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { userName, email, password } = req.body;
  console.log(req.body);

  if (!userName || !email || !password) {
    console.log("Missing fields:", { userName, email, password });
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    console.log("Connecting to database...");
    await dbConnect();
    console.log("Database connected - in signup.ts");

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      userName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    /* =================================================
       🔥 SESSION + COOKIE ADD (NO FLOW CHANGE)
    ================================================= */

    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        role: "user",
      },
      process.env.JWT_SECRET!,
      { expiresIn: "30m" }
    );

    const absoluteExpiry = Date.now() + 60 * 60 * 1000;

    const isProd = process.env.NODE_ENV === "production";

    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? ("strict" as const) : ("lax" as const),
      path: "/",
    };

    res.setHeader("Set-Cookie", [
      serialize("userToken", token, {
        ...cookieOptions,
        maxAge: 60 * 30,
      }),

      serialize("abs_exp", absoluteExpiry.toString(), {
        ...cookieOptions,
        maxAge: 60 * 60,
      }),
    ]);

    /* ================================================= */

    return res.status(201).json({
      message: "User created",
      user: {
        email: newUser.email,
        userName: newUser.userName,
      },
    });

  } catch (err) {
    console.log("Signup error:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}