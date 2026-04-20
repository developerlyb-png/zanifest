import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import BlacklistToken from "@/models/BlacklistToken";

export const authMiddleware = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: Function
) => {
  try {
    await dbConnect();

    const token = req.cookies.adminToken;
    const absExp = req.cookies.abs_exp;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 🔥 BLACKLIST CHECK FIRST
    const blacklisted = await BlacklistToken.findOne({ token });

    if (blacklisted) {
      return res.status(401).json({ message: "Session revoked" });
    }

    // 🔥 ABSOLUTE EXPIRY
    if (!absExp || Date.now() > Number(absExp)) {
      return res.status(401).json({ message: "Session expired" });
    }

    // ✅ JWT verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    (req as any).user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};