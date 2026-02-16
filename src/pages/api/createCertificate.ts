import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Agent from "@/models/Agent";

import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    await dbConnect();

    const { agentId } = req.body;
    if (!agentId) {
      return res.status(400).json({ message: "Agent ID required" });
    }

    const agent = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    // =========================
    // CREATE FOLDER
    // =========================
    const dir = path.join(process.cwd(), "public", "certificates");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const fileName = `${agent.agentCode}.pdf`;
    const filePath = path.join(dir, fileName);

    const doc = new PDFDocument({
      size: "A4",
      margin: 30,
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // =========================
    // BORDER
    // =========================
    // doc
    //   .lineWidth(2)
    //   .strokeColor("#2c6fb7")
    //   .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
    //   .stroke();

    // =========================
    // LOGO (TOP LEFT)
    // =========================
    const logoPath = path.join(process.cwd(), "public/logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 40, 30, { width: 120 });
    }

    // =========================
    // WATERMARK (RIGHT TOP – wa.png)
    // =========================
    const watermarkPath = path.join(process.cwd(), "public/wa.png");
    if (fs.existsSync(watermarkPath)) {
      doc.save();
      doc.opacity(0.12);
      doc.image(watermarkPath, doc.page.width - 200, -75, {
        width: 240,
      });
      doc.opacity(1);
      doc.restore();
    }

    // =========================
    // TITLE
    // =========================
    -
    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .fillColor("#2c6fb7")
      .text("Appointment Letter", 0, 90, { align: "center" });

    // =========================
    // BODY CONTENT (AUTO Y)
    // =========================
    doc.font("Helvetica").fontSize(11).fillColor("black");

    let y = 135;

    const write = (text: string, gap = 18) => {
      doc.text(text, 60, y, { width: 480 });
      y += gap;
    };

    write(`Mr./Ms. ${agent.firstName} ${agent.lastName}`, 16);
    write(`S/O __________________`, 26);

    write(
      "We welcome you to Zanifest Insurance Broker Pvt. Ltd. We are an IRDAI registered Direct (General) insurance broking company, with registration No. 1119.",
      30
    );

    write(
      "This is in reference to application made by you to enroll as Point of Sale Person (POSP) with us.",
      26
    );

    write(
      "This is to confirm that you have successfully completed 15 hrs of mandatory training as per prescribed IRDAI guidelines and also passed the examination. Your Personal Details are as Under:",
      34
    );

    write(`POS Code: ${agent.agentCode}`, 16);
    write(`Pan No: __________________`, 26);

    write(
      "With this letter, we authorize you to work as Point of Sale Person of Zanifest Insurance Broker to market insurance products that are allowed under prescribed guidelines for Non-Life and Health business.",
      38
    );

    write(
      "You agree that you will always solicit insurance business with integrity and honesty ensuring to work within POS prescribed business guidelines only.",
      36
    );

    write(
      "As per guidelines, you shall not work as POS person for any other insurer/Broker/insurance intermediary in any manner whatsoever. In case you wish to work for another company, you are required to obtain a fresh letter from the new Insurer/Broker in order to work as POS person of that entity.",
      36
    );

    // =========================
    // SIGNATURE POSITION (AUTO FIXED)
    // =========================
  // =========================
// SIGNATURE + STAMP PERFECT ALIGN
// =========================

// 🔥 line position (reference point)
const lineY = doc.page.height - 210;

// ---- 1️⃣ STAMP IMAGE (LINE SE UPAR)
const signPath = path.join(process.cwd(), "public/Ca.jpeg");

if (fs.existsSync(signPath)) {
  doc.image(signPath, 70, lineY - 130, {
    width: 140,
  });
}

// ---- 2️⃣ SIGNATURE LINE
doc
  .lineWidth(1)
  .strokeColor("#2c6fb7")
  .moveTo(60, lineY)
  .lineTo(250, lineY)
  .stroke();

// ---- 3️⃣ SIGNATURE TEXT (LINE KE NICHE)
doc
  .fillColor("black")
  .fontSize(11)
  .text(
    "Authorised Signatory\nZanifest Insurance Broker Pvt. Ltd",
    60,
    lineY + 5
  );

// ---- 4️⃣ DATE RIGHT SIDE
const today = new Date().toLocaleDateString();
doc.text(`Date: ${today}`, 420, lineY + 5);


    // =========================
    // FOOTER (FIXED)
    // =========================
    doc
      .fontSize(8)
      .fillColor("gray")
      .text(
        "Registered Office Address: SCF 08, Lower Ground Floor, Old Ambala Road, Zirakpur, SAS Nagar, Punjab-140603 | Telephone No: 01762496934 | E-mail: support@zanifestinsurance.com | Website: www.zanifestinsurance.com | IRDAI Reg No: 1119 | Registration Code: IRDAI/INT/BRK/DB 1242/2025 valid from 28/11/2025 to 27/11/2028 | CIN No: U66220PB2025PTC063559",
        50,
        doc.page.height - 65,
        { width: doc.page.width - 100, align: "center" }
      );

    doc.end();

    await new Promise<void>((resolve) => stream.on("finish", resolve));

 await Agent.findByIdAndUpdate(agentId, {
  $set: {
    certificate: `/certificates/${fileName}`,
    certificate2: `/certificates/${fileName}`
  }
});



    return res.status(200).json({
      success: true,
      url: `/certificates/${fileName}`,
    });
  } catch (error) {
    console.error("CREATE CERTIFICATE ERROR:", error);
    return res.status(500).json({ message: "Server Error" });
  }
}
