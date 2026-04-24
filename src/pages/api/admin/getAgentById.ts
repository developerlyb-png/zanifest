import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Agent from "@/models/Agent";
import { withAuth } from "@/utils/withAuth";
import { authMiddleware } from "@/middleware/auth";
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const isAuth = await authMiddleware(req, res);
    if (!isAuth) return;
  const user = (req as any).user;
  const id = req.query.id as string;

  // ✅ ID validation
  if (!id) {
    return res.status(400).json({ message: "Agent ID is required" });
  }

  try {
    await dbConnect();

    // 🔐 Only admin allowed
    if (user.role !== "admin" && user.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const agent = await Agent.findById(id).lean();

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    // 🔐 Remove sensitive fields
    delete (agent as any).password;

    return res.status(200).json(agent);

  } catch (err) {
    console.error("Error fetching agent:", err);
    return res.status(500).json({ error: "Failed to load agent" });
  }
}

// ✅ Protect API
export default withAuth(handler);