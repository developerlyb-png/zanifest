import { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const isProd = process.env.NODE_ENV === "production";

  res.setHeader("Set-Cookie", [
    // 🔥 Admin token
    serialize("adminToken", "", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "strict" : "lax",
      path: "/",
      expires: new Date(0),
    }),

    // 🔥 Absolute expiry
    serialize("abs_exp", "", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "strict" : "lax",
      path: "/",
      expires: new Date(0),
    }),

    // 🔥 CSRF token
    serialize("csrfToken", "", {
      secure: isProd,
      sameSite: isProd ? "strict" : "lax",
      path: "/",
      expires: new Date(0),
    }),

    // 🔥 Safety cleanup (multi-role system)
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
}