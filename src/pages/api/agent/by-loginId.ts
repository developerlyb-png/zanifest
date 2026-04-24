import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Agent from "@/models/Agent";
import { agentAuth } from "@/middleware/agentAuth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const isAuth = await agentAuth(req, res);
  if (!isAuth) return;

  try {
    await dbConnect();

    const { loginId } = req.query;
    if (!loginId || typeof loginId !== "string") {
      return res.status(400).json({ error: "Missing loginId" });
    }

    // 🔐 OPTIONAL SECURITY (RECOMMENDED)
    const user = (req as any).user;
    if (user.loginId !== loginId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const agent = await Agent.findOne({ loginId }).lean();
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    return res.status(200).json({ agent });

  } catch (err) {
    console.error("Agent fetch error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}