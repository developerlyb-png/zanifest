import { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const isProd = process.env.NODE_ENV === "production";

  res.setHeader("Set-Cookie", [
    serialize("userToken", "", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "strict" : "lax",
      path: "/",
      expires: new Date(0),
      maxAge: 0,
    }),

    serialize("abs_exp", "", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "strict" : "lax",
      path: "/",
      expires: new Date(0),
      maxAge: 0,
    }),
  ]);

  // ❌ REMOVE THIS
  // res.writeHead(302, { Location: "/login" });

  // ✅ RETURN JSON ONLY
  return res.status(200).json({ message: "Logged out successfully" });
}