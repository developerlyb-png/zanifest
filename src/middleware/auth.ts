import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import BlacklistToken from "@/models/BlacklistToken";

interface DecodedUser {
  id: string;
  email: string;
  role: string;
  [key: string]: any;
}

export const authMiddleware = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<boolean> => {
  try {
    /* ================= DB CONNECT ================= */
    await dbConnect();

    /* ================= GET COOKIES ================= */
    const token = req.cookies.adminToken;
    const absExp = req.cookies.abs_exp;

    /* ================= TOKEN CHECK ================= */
    if (!token) {
      res.status(401).json({ message: "Unauthorized: No token" });
      return false;
    }

    /* ================= BLACKLIST CHECK ================= */
    const blacklisted = await BlacklistToken.findOne({ token });

    if (blacklisted) {
      res.status(401).json({ message: "Session revoked. Please login again." });
      return false;
    }

    /* ================= ABSOLUTE EXPIRY ================= */
    if (!absExp || Date.now() > Number(absExp)) {
      res.status(401).json({ message: "Session expired. Please login again." });
      return false;
    }

    /* ================= JWT VERIFY ================= */
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedUser;

    /* ================= ATTACH USER ================= */
    (req as any).user = decoded;

    return true;

  } catch (error) {
    console.error("Auth Middleware Error:", error);

    res.status(401).json({
      message: "Invalid or expired token",
    });

    return false;
  }
};