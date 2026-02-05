import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Agent from "@/models/Agent";
import AgentLogin from "@/models/AgentLogin";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb", 
    },
  },
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await dbConnect();
    const data = req.body;
    console.log("Create Agent Data:", data);  

    /* =================================================
       🔍 CHECK IF AGENT ALREADY EXISTS (EDIT MODE)
       ================================================= */
    const existingAgent = await Agent.findOne({
      loginId: data.loginId,
    });

    /* =================================================
       🔁 EDIT MODE (REJECTED AGENT RESUBMIT)
       ================================================= */
    if (existingAgent) {
      // ✅ update ONLY fields sent by frontend
      Object.keys(data).forEach((key) => {
  if (
    key !== "loginId" &&
    data[key] !== undefined &&
    data[key] !== ""
  ) {
    existingAgent[key] = data[key];
  }
});


      // 🔄 reset review state
      existingAgent.status = "pending";
      existingAgent.rejectedFields = [];
      existingAgent.rejectionRemark = "";

      await existingAgent.save();

      // ✅ MARK LOGIN AS COMPLETED
     await AgentLogin.findOneAndUpdate(
  { loginId: data.loginId, accountStatus: { $ne: "COMPLETED" } },
  { accountStatus: "COMPLETED" }
);


      return res.status(200).json({
        message: "Application re-submitted successfully",
      });
    }

    /* =================================================
       🆕 FIRST-TIME AGENT CREATION
       ================================================= */

    const requiredFields = [
      // Personal
      "firstName",
      "lastName",
      "email",
      "password",
      "phone",

      // Address
      "city",
      "district",
      "state",
      "pinCode",

      // Nominee
      "nomineeName",
      "nomineeRelation",
      "nomineeAadharNumber",
      "nomineePanNumber",

      // Bank
      "accountHolderName",
      "bankName",
      "accountNumber",
      "ifscCode",
      "branchLocation",

      // System
      "loginId",

    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return res.status(400).json({ error: `Missing: ${field}` });
      }
    }

    /* =================================================
       📎 REQUIRED ATTACHMENTS (FIRST TIME ONLY)
       ================================================= */
    if (!data.nomineePanAttachment) {
      return res.status(400).json({
        error: "Missing: nomineePanAttachment",
      });
    }

    if (!data.nomineeAadhaarAttachment) {
      return res.status(400).json({
        error: "Missing: nomineeAadhaarAttachment",
      });
    }

    if (!data.cancelledChequeAttachment) {
      return res.status(400).json({
        error: "Missing: cancelledChequeAttachment",
      });
    }

    /* =================================================
       🔐 VALIDATE LOGIN ID
       ================================================= */
    const loginRecord = await AgentLogin.findOne({
      loginId: data.loginId,
    });

    if (!loginRecord) {
      return res.status(400).json({ error: "Invalid loginId" });
    }

    /* =================================================
       🚫 PREVENT DUPLICATE EMAIL
       ================================================= */
    const emailExists = await Agent.findOne({ email: data.email });
    if (emailExists) {
      return res.status(400).json({ error: "Email already exists" });
    }

    /* =================================================
       ✅ CREATE NEW AGENT
       ================================================= */
    const newAgent = new Agent({
      ...data,
      status: "pending",
    });

    await newAgent.save();

    // ✅ MARK LOGIN AS COMPLETED
    await AgentLogin.findOneAndUpdate(
      { loginId: data.loginId },
      { accountStatus: "COMPLETED" }
    );

    return res.status(201).json({
      message: "Agent created successfully",
    });
  } catch (err) {
    console.error("Create Agent Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
