import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "@/utils/withAuth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = (req as any).user;

  return res.status(200).json({
    message: "Session valid",
    user,
  });
}

export default withAuth(handler);