import { NextApiRequest, NextApiResponse } from "next";
import { runMiddleware } from "./runMiddleware";
import { authMiddleware } from "../middleware/auth"; // ✅ fixed

export function withAuth(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    await runMiddleware(req, res, authMiddleware);
    return handler(req, res);
  };
}