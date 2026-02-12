import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm } from "formidable";   // ✅ FIXED IMPORT
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

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Upload failed" });

    const file: any = files.certificate;
    const agentId: any = fields.agentId;

    const filePath = `/certificates/${path.basename(file[0].filepath)}`;

    await Agent.findByIdAndUpdate(agentId[0], {
      certificate: filePath,
    });

    res.status(200).json({ success: true });
  });
}
