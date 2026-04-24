import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

export const userAuth = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const token = req.cookies.userToken;
    const absExp = req.cookies.abs_exp;

    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return false;
    }

    // 🔥 expiry check
    if (!absExp || Date.now() > Number(absExp)) {
      res.status(401).json({ message: "Session expired" });
      return false;
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    // ✅ ensure user role
    if (decoded.role !== "user") {
      res.status(403).json({ message: "Access denied" });
      return false;
    }

    (req as any).user = decoded;

    return true;
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
    return false;
  }
};