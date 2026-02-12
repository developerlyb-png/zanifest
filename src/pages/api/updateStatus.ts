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

    const { id, status, certificate } = req.body;

    let updateData:any = {
      status,
      ...(certificate && { certificate })
    };

    // ================= NEW AGENT CODE GENERATE =================
    if(status === "approved"){

      // total approved agents count
      const count = await Agent.countDocuments({ status:"approved" });

      const newAgentCode = `AG-${1000 + count + 1}`;

      updateData.agentCode = newAgentCode;
    }

    await Agent.findByIdAndUpdate(id, updateData);

    return res.status(200).json({
      success:true,
      newCode:updateData.agentCode || null
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success:false });
  }
}
