import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm } from "formidable";
import path from "path";
import fs from "fs";
import dbConnect from "@/lib/dbConnect";
import Agent from "@/models/Agent";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  await dbConnect();

  const uploadDir = path.join(process.cwd(), "public", "certificates");

  // ensure folder exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
  });

  form.parse(req, async (err, fields: any, files: any) => {

    if (err) {
      console.log("UPLOAD ERROR:", err);
      return res.status(500).json({ error: "Upload failed" });
    }

    // 🔥 DEBUG (important)
    console.log("FIELDS:", fields);
    console.log("FILES:", files);

    // ✅ FIX AGENT ID
    const agentId = Array.isArray(fields.agentId)
      ? fields.agentId[0]
      : fields.agentId;

    console.log("AGENT ID:", agentId);

    if (!agentId || agentId === "undefined") {
      return res.status(400).json({ error: "Invalid Agent ID" });
    }

    // ✅ FIX FILE PARSING (Formidable safe)
    const uploadedFile =
      files?.file?.[0] ||
      files?.file ||
      files?.certificate?.[0] ||
      files?.certificate;

    console.log("UPLOADED FILE:", uploadedFile);

    if (!uploadedFile) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // ✅ FILE PATH
    const filePath = `/certificates/${path.basename(uploadedFile.filepath)}`;

    // ✅ SAVE TO DB (NO agentCode here)
    await Agent.findByIdAndUpdate(
      agentId,
      {
        $set: {
  certificate1: filePath,
  certificate2: filePath, // 🔥 ADD THIS
  certificate: filePath,
},
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      url: filePath,
    });

  });
}