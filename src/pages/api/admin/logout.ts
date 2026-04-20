import BlacklistToken from "@/models/BlacklistToken";
import dbConnect from "@/lib/dbConnect";
import { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const isProd = process.env.NODE_ENV === "production";

  try {
    // ✅ DB connect
    await dbConnect();

    // ✅ token get karo
    const token = req.cookies.adminToken;

    // 🔥 BLACKLIST TOKEN (IMPORTANT)
    if (token) {
      await BlacklistToken.create({
        token,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      });
    }

    // ✅ cookies clear karo
    res.setHeader("Set-Cookie", [
      serialize("adminToken", "", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "strict" : "lax",
        path: "/",
        expires: new Date(0),
      }),

      serialize("abs_exp", "", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "strict" : "lax",
        path: "/",
        expires: new Date(0),
      }),

      serialize("csrfToken", "", {
        secure: isProd,
        sameSite: isProd ? "strict" : "lax",
        path: "/",
        expires: new Date(0),
      }),

      serialize("agentToken", "", {
        httpOnly: true,
        path: "/",
        expires: new Date(0),
      }),

      serialize("userToken", "", {
        httpOnly: true,
        path: "/",
        expires: new Date(0),
      }),
    ]);

    console.log("Admin logged out successfully");

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}