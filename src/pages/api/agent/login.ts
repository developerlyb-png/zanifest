import dbConnect from "@/lib/dbConnect";
import Agent from "@/models/Agent";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password } = req.body;

  try {

    await dbConnect();

    const agent = await Agent.findOne({ email });

    if (!agent) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ 🔒 LOCK CHECK
    if (agent.lockUntil && agent.lockUntil > Date.now()) {
      return res.status(403).json({
        message: "Account locked. Try again after 15 minutes",
      });
    }

    // ✅ PASSWORD CHECK
    const isValid =
      agent.password === password ||
      bcrypt.compareSync(password, agent.password);

    // ❌ WRONG PASSWORD
    if (!isValid) {
      agent.loginAttempts = (agent.loginAttempts || 0) + 1;

      if (agent.loginAttempts >= 5) {
        agent.lockUntil = Date.now() + 15 * 60 * 1000; // 15 min
      }

      await agent.save();

      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ RESET ON SUCCESS
    agent.loginAttempts = 0;
    agent.lockUntil = undefined;
    await agent.save();

    /* =================================================
       STATUS BASED LOGIN CONTROL
    ================================================= */

    if (agent.status === "pending") {
      return res.status(403).json({
        message: "Your application is under review",
      });
    }

    if (agent.status === "reviewed") {
      return res.status(403).json({
        message: "Your certificate is not generated yet",
      });
    }

    if (agent.status === "approved" && !agent.certificate2) {
      return res.status(403).json({
        message: "Certificate not generated yet. Please contact admin.",
      });
    }

    if (agent.status === "rejected") {
      return res.status(200).json({
        redirect: `/createagent?loginId=${agent.loginId}&mode=edit`,
      });
    }

    /* =================================================
       LOGIN SUCCESS
    ================================================= */

    const token = jwt.sign(
      {
        id: agent._id,
        email: agent.email,
        fullName: `${agent.firstName} ${agent.lastName}`,
        role: "agent",
        accountStatus: agent.accountStatus,
        trainingCompleted: agent.trainingCompleted,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "30m" } // 🔥 match admin
    );

    // 🔥 Absolute expiry (1 hour)
    const absoluteExpiry = Date.now() + 60 * 60 * 1000;

    // ⭐ Set cookies
    const isProd = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "strict" as const : "lax" as const,
  path: "/",
};

res.setHeader("Set-Cookie", [
  serialize("agentToken", token, {
    ...cookieOptions,
    maxAge: 60 * 30,
  }),

  serialize("abs_exp", absoluteExpiry.toString(), {
    ...cookieOptions,
    maxAge: 60 * 60,
  }),
]);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      agent: {
        name: `${agent.firstName} ${agent.lastName}`,
        email: agent.email,
      },
    });

  } catch (err) {

    console.error("Login error:", err);

    return res.status(500).json({
      message: "Server error",
    });
  }
}