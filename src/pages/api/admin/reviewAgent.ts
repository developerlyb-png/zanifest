import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Agent from "@/models/Agent";
import { sendEmail } from "@/utils/mailSender";
import { authMiddleware } from "@/middleware/auth";

export default async function handler(   // ✅ FIX 1: async added
  req: NextApiRequest,
  res: NextApiResponse
) {
  const isAuth = await authMiddleware(req, res); // ✅ now valid
  if (!isAuth) return;

  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { agentId, action, assignManager, verification, remark } = req.body;

    const agent = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });  
    }

    /* =================================================
       APPROVE APPLICATION
    ================================================= */
    if (action === "accept") {
      agent.status = "reviewed";
      agent.assignedTo = assignManager;

      // 🔥 clear rejection metadata
      agent.rejectedFields = [];
      agent.rejectionRemark = "";

      await agent.save();

      const htmlMessage = `
        <h2>🎉 Your Application is Approved</h2>
        <p>Dear <b>${agent.firstName}</b>,</p>
        <p>Your agent application has been <b style="color:green">APPROVED</b>.</p>
        <p><b>Admin Remark:</b><br>${remark || "No remark provided"}</p>
        <p>You can now login using your email and password.</p>
      `;

      await sendEmail({
        to: agent.email,
        subject: "Your Application is Approved",
        html: htmlMessage,
      });

      return res.json({
        success: true,
        message: "Agent approved & email sent",
      });
    }

    /* =================================================
       REJECT APPLICATION
    ================================================= */
    if (action === "reject") {
      agent.status = "rejected";

      const rejectedFields: string[] = [];

      if (verification?.panStatus === "rejected") {
        rejectedFields.push("panNumber", "panAttachment");
      }

      if (verification?.aadhaarStatus === "rejected") {
        rejectedFields.push("adhaarNumber", "adhaarAttachment");
      }
      if (verification?.tenthStatus === "rejected") {
        rejectedFields.push("yearofpassing10th", "tenthMarksheetAttachment");
      }   
      if (verification?.twelfthStatus === "rejected") {
        rejectedFields.push("yearofpassing12th", "twelfthMarksheetAttachment");
      }

      agent.rejectedFields = rejectedFields;
      agent.rejectionRemark = remark || "";

      await agent.save();

      const htmlMessage = `
        <h2 style="color:red">❌ Application Rejected</h2>
        <p>Dear <b>${agent.firstName}</b>,</p>
        <p>Some of your documents need correction.</p>

        <p><b>Rejected Fields:</b> ${rejectedFields.join(", ")}</p>
        <p><b>Remark:</b><br>${remark}</p>

        <p>Please login again and update the requested fields.</p>
      `;

      await sendEmail({
        to: agent.email,
        subject: "Action Required – Update Your Application",
        html: htmlMessage,
      });

      return res.json({
        success: true,
        message: "Agent rejected & email sent",
        rejectedFields,
      });
    }

    return res.status(400).json({ message: "Invalid action" });

  } catch (err) {
    console.error("Review error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}