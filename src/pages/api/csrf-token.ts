import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { serialize } from "cookie";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const csrfToken = crypto.randomBytes(32).toString("hex");

  const isProd = process.env.NODE_ENV === "production";

  res.setHeader(
    "Set-Cookie",
    serialize("csrfToken", csrfToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "strict" : "lax",
      path: "/",
    })
  );

  return res.status(200).json({ csrfToken });
}