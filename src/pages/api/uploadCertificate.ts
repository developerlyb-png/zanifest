import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm } from "formidable";
import path from "path";
import dbConnect from "@/lib/dbConnect";
import Agent from "@/models/Agent";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  await dbConnect();

  const form = new IncomingForm({
    uploadDir: "./public/certificates",
    keepExtensions: true,
  });

  form.parse(req, async (err, fields: any, files: any) => {

    if (err) {
      console.log("UPLOAD ERROR:", err);
      return res.status(500).json({ error: "Upload failed" });
    }

    console.log("FIELDS:", fields);
    console.log("FILES:", files);

    // normalize agentId
    const agentId = Array.isArray(fields.agentId)
      ? fields.agentId[0]
      : fields.agentId;

    // normalize file
    let uploadedFile: any = null;

    if (files.file) {
      uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
    } else if (files.certificate) {
      uploadedFile = Array.isArray(files.certificate)
        ? files.certificate[0]
        : files.certificate;
    }

    if (!uploadedFile) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = `/certificates/${path.basename(uploadedFile.filepath)}`;

    console.log("SAVE PATH:", filePath);
    console.log("AGENT ID:", agentId);

    // save certificate path
    await Agent.findByIdAndUpdate(agentId, {
      $set: {
        certificate1: filePath,
        certificate: filePath
      }
    });

    // ⭐⭐⭐ AGENT CODE GENERATION (ONLY ADDED LOGIC)

    const agent = await Agent.findById(agentId);

    if (agent && !agent.agentCode) {

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

      const newCode = `AG-${nextNumber}`;

      await Agent.findByIdAndUpdate(agentId, {
        $set: { agentCode: newCode }
      });

      console.log("✅ Agent Code Generated:", newCode);
    }

    return res.status(200).json({
      success: true,
      url: filePath
    });

  });
}
