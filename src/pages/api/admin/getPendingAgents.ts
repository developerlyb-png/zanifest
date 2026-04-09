import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Agent from "@/models/Agent";
import { withAuth } from "@/utils/withAuth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = (req as any).user;

  try {
    await dbConnect();

    // 🔐 Only admin allowed
    if (user.role !== "admin" && user.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const agents = await Agent.find({ status: "pending" })
      .select("firstName lastName email agentCode createdAt")
      .lean();

    return res.status(200).json(agents);

  } catch (err) {
    console.error("Error fetching pending agents:", err);
    return res.status(500).json({ error: "Failed to fetch agents" });
  }
}

// ✅ Protect API
export default withAuth(handler);