import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Agent from "@/models/Agent";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method !== "POST") {
    return res.status(405).json({ success: false });
  }

  try {

    console.log("✅ API HIT");

    await dbConnect();
    console.log("✅ DB CONNECTED");

    const { id, status } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Agent ID missing"
      });
    }

    const agent = await Agent.findById(id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found"
      });
    }

    // ✅ Prevent double approval
    if (agent.status === "approved" && status === "approved") {
      return res.status(400).json({
        success: false,
        message: "Already approved"
      });
    }

    let updateData: any = {};

    /* ---------------- REVIEWED ---------------- */
    if (status === "reviewed") {
      updateData.status = "reviewed";
    }

    /* ---------------- APPROVED ---------------- */
    if (status === "approved") {

      if (!agent.certificate2) {
        return res.status(400).json({
          success: false,
          message: "Generate certificate before approval"
        });
      }

      updateData.status = "approved";

      const freshAgent = await Agent.findById(id).select("agentCode");

      // 🔥 Generate only if missing
      if (!freshAgent?.agentCode) {

        let newCode = "";
        let attempts = 0;
        let isUnique = false;

        while (attempts < 5 && !isUnique) {

          console.log("🔁 Attempt:", attempts + 1);

          const lastAgent = await Agent.findOne({
            agentCode: { $regex: /^ZIP\d+$/ }
          })
            .sort({ createdAt: -1 })
            .select("agentCode");

          let nextNumber = 1309;

          if (lastAgent?.agentCode) {
            const num = parseInt(
              lastAgent.agentCode.replace("ZIP", ""),
              10
            );
            if (!isNaN(num)) {
              nextNumber = num + 1 + attempts; // 🔥 avoid duplicate
            }
          }

          newCode = `ZIP${nextNumber}`;
          console.log("Generated Code:", newCode);

          const exists = await Agent.findOne({ agentCode: newCode });

          if (!exists) {
            isUnique = true;
            console.log("✅ Unique Code Found");
          }

          attempts++;
        }

        if (!isUnique) {
          return res.status(500).json({
            success: false,
            message: "Failed to generate unique agent code"
          });
        }

        updateData.agentCode = newCode;

      } else {
        updateData.agentCode = freshAgent.agentCode;
      }
    }

    /* ---------------- REJECTED ---------------- */
    if (status === "rejected") {
      updateData.status = "rejected";
    }

    /* ---------------- UPDATE ---------------- */
    const updated = await Agent.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    console.log("✅ UPDATED SUCCESS");

    return res.status(200).json({
      success: true,
      data: updated
    });

  } catch (error: any) {

    console.log("❌ STATUS UPDATE ERROR:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate agent code, please retry"
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}