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

  const {
    currentVideo,
    videoTime,
    completedVideos,
    testStarted,
  } = req.body;

  await TrainingProgress.findOneAndUpdate(
    { agentId: decoded.id },
    {
      currentVideo,
      videoTime,
      completedVideos,
      testStarted,
    },
    { upsert: true }
  );

  res.status(200).json({ success: true });
}
