import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import TrainingProgress from "@/models/TrainingProgress";
import { agentAuth } from "@/middleware/agentAuth";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const token = req.cookies.agentToken;
  if (!token) return res.status(401).end();

  const isAuth = await agentAuth(req, res);
  if (!isAuth) return;

  const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

  let progress = await TrainingProgress.findOne({ agentId: decoded.id });

  if (!progress) {
    progress = await TrainingProgress.create({
      agentId: decoded.id,
    });
  }

  res.status(200).json(progress);
}
