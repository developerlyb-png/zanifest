"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import styles from "@/styles/pages/agent.module.css";

const DownloadCertificate = () => {
  const [data, setData] = useState<{
    name: string;
    score: number;
    total: number;
    date: string;
  } | null>(null);

  /* ===============================
     FETCH FROM BACKEND
  =============================== */
  useEffect(() => {
    axios
      .get("/api/agent/training-status", { withCredentials: true })
      .then((res) => {
        if (res.data.passed) {
          setData({
            name: res.data.agentName,
            score: res.data.score,
            total: res.data.total,
            date: res.data.completedAt,
          });
        }
      })
      .catch((err) => {
        console.error("Certificate fetch error", err);
      });
  }, []);

  /* ===============================
     DOWNLOAD PDF
  =============================== */
  const downloadPDF = async () => {
    const cert = document.getElementById("certificate-box");
    if (!cert) return;

    const canvas = await html2canvas(cert, { scale: 2 });
    const img = canvas.toDataURL("image/png");

    const pdf = new jsPDF("landscape", "px", "a4");
    pdf.addImage(img, "PNG", 20, 20, 800, 560);
    pdf.save("Agent_Certificate.pdf");
  };

  if (!data) return null;

  return (
    <div className={styles.certificateWrapper}>
      {/* ===== CERTIFICATE PREVIEW ===== */}
      <div
        id="certificate-box"
        style={{
          width: 800,
          padding: 50,
          background: "#fff",
          color: "#000",
          border: "8px solid #16a34a",
          fontFamily: "Georgia, serif",
        }}
      >
        <h1 style={{ textAlign: "center", fontSize: 36 }}>
          Certificate of Achievement
        </h1>

        <p style={{ textAlign: "center", marginTop: 30 }}>
          This is proudly presented to
        </p>

        <h2 style={{ textAlign: "center", margin: "20px 0" }}>
          {data.name}
        </h2>

        <p style={{ textAlign: "center" }}>
          for successfully passing the
        </p>

        <h3 style={{ textAlign: "center" }}>
          Agent Certification Test
        </h3>

      

      

        <p style={{ textAlign: "right", marginTop: 60 }}>
          Authorized Signature
        </p>
      </div>

      {/* ===== DOWNLOAD BUTTON ===== */}
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <button
          onClick={downloadPDF}
          className={styles.downloadBtn}
        >
          🎓 Download Certificate
        </button>
      </div>
    </div>
  );
};

export default DownloadCertificate;
