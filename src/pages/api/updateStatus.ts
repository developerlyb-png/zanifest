import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Agent from "@/models/Agent";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method !== "POST") {
    return res.status(405).json({ success:false });
  }

  try {

    await dbConnect();

    const { id, status } = req.body;

    if (!id) {
      return res.status(400).json({
        success:false,
        message:"Agent ID missing"
      });
    }

    const agent = await Agent.findById(id);

    if (!agent) {
      return res.status(404).json({
        success:false,
        message:"Agent not found"
      });
    }

    let updateData:any = {};

    // ⭐ REVIEWED STATUS
    if (status === "reviewed") {
      updateData.status = "reviewed";
    }

    // ⭐ APPROVED ONLY IF CERTIFICATE EXISTS
    if (status === "approved") {

      if (!agent.certificate2) {
        return res.status(400).json({
          success:false,
          message:"Generate certificate before approval"
        });
      }

      updateData.status = "approved";

      // generate agent code if missing
      if (!agent.agentCode) {

        const lastAgent = await Agent.findOne({
          agentCode: { $regex: /^AG-/ }
        })
        .sort({ agentCode: -1 })
        .select("agentCode");

        let nextNumber = 1001;

        if (lastAgent?.agentCode) {
          const parts = lastAgent.agentCode.split("-");
          const num = parseInt(parts[1]);
          if (!isNaN(num)) nextNumber = num + 1;
        }

        updateData.agentCode = `AG-${nextNumber}`;
      }
    }

    // ⭐ REJECT
    if (status === "rejected") {
      updateData.status = "rejected";
    }

    const updated = await Agent.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new:true }
    );

    return res.status(200).json({
      success:true,
      data: updated
    });

  } catch (error:any) {

    console.log("❌ STATUS UPDATE ERROR:", error);

    return res.status(500).json({
      success:false,
      message:error.message
    });
  }
}
