import { NextApiRequest, NextApiResponse } from "next";
import { authMiddleware } from "@/middleware/auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  authMiddleware(req, res, () => {
    return res.status(200).json({
      message: "You are authorized",
      user: (req as any).user,
    });
  });
}