import { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

export default function handler(req: NextApiRequest, res: NextApiResponse) {

  const isProd = process.env.NODE_ENV === "production";

  res.setHeader("Set-Cookie", [
    // ❌ delete agentToken
    serialize("agentToken", "", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "strict" : "lax",
      path: "/",
      expires: new Date(0),
    }),

    // ❌ delete abs_exp
    serialize("abs_exp", "", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "strict" : "lax",
      path: "/",
      expires: new Date(0),
    }),
  ]);

  console.log("Agent logged out successfully");

  return res.status(200).json({
    message: "Logged out successfully",
  });
}