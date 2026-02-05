import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import Agent from "@/models/Agent";
import dbConnect from "@/lib/dbConnect";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") return res.status(405).end();

  await dbConnect();

  const token = req.cookies.agentToken;
  if (!token) return res.status(401).json({ passed: false });

  const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

  const agent = await Agent.findById(decoded.id).select(
    "firstName lastName trainingCompleted trainingScore trainingTotal trainingCompletedAt"
  );

  if (!agent || !agent.trainingCompleted) {
    return res.json({ passed: false });
  }

  res.json({
    passed: true,
    agentName: `${agent.firstName} ${agent.lastName}`,
    score: agent.trainingScore,
    total: agent.trainingTotal,
    completedAt: agent.trainingCompletedAt,
  });
}
