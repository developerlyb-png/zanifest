import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

export const authMiddleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: Function
) => {
  try {
    // 🍪 cookies read
    const token =
  req.cookies.adminToken ||
  req.cookies.agentToken ||
  req.cookies.userToken ||
  req.cookies.managerToken;
    const absExp = req.cookies.abs_exp;

    // ❌ token nahi hai
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ✅ JWT verify (30 min expiry check)
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    // ✅ Absolute expiry check (1 hour)
    if (absExp && Date.now() > Number(absExp)) {
      return res.status(401).json({ message: "Session expired" });
    }

    // ✅ user attach
    (req as any).user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};