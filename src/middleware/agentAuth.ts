import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

export const agentAuth = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const token = req.cookies.agentToken;

    if (!token) {
      res.status(401).json({ message: "Unauthorized (Agent)" });
      return false;
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    if (decoded.role !== "agent") {
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