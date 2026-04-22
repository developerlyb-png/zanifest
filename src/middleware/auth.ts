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

    // ✅ Universal token
    const token =
      req.cookies.authToken ||
      req.cookies.adminToken ||
      req.cookies.agentToken ||
      req.cookies.userToken;

    const absExp = req.cookies.abs_exp;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 🔥 BLACKLIST CHECK
    const blacklisted = await BlacklistToken.findOne({ token });
    if (blacklisted) {
      return res.status(401).json({ message: "Session revoked" });
    }

    // 🔥 ABSOLUTE EXPIRY
    if (!absExp || Date.now() > Number(absExp)) {
      return res.status(401).json({ message: "Session expired" });
    }

    // ✅ VERIFY TOKEN
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    // 🔥 attach user
    (req as any).user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};