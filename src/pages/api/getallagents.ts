import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Agent from "@/models/Agent";

// 🔥 VERY IMPORTANT FOR LIVE SERVER
export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {

    await dbConnect();

    // ✅ ONLY REQUIRED FIELDS SEND
    const agents = await Agent.find({})
      .select("agentCode firstName lastName email status certificate")
      .limit(50)        // 👈 live proxy safe
      .lean();          // 👈 remove mongoose heavy object

    if (!agents.length) {
      return res.status(200).json([]); // 🔥 don't send 404
    }

    return res.status(200).json(agents);

  } catch (error) {
    console.error("Error fetching agents:", error);
    return res.status(500).json({ message: "Server Error" });
  }
}
