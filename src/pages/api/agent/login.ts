// /pages/api/agent/login.ts

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
console.log("Login request body:", req.body);
  try {
    await dbConnect();

 const agent = await Agent.findOne({ email });
if (!agent) {
  return res.status(401).json({ message: "Invalid credentials" });
}

const isValid =
  agent.password === password ||
  bcrypt.compareSync(password, agent.password);

if (!isValid) {
  return res.status(401).json({ message: "Invalid credentials" });
}

// 🚫 pending
if (agent.status === "pending") {
  return res.status(403).json({
    message: "Your application is under review",
  });
}

// 🔁 rejected → redirect
if (agent.status === "rejected") {
  return res.status(200).json({
    redirect: `/createagent?loginId=${agent.loginId}&mode=edit`,
  });
}


    // ✔ Password validation (plain text OR encrypted support)
    const isPasswordValid =
      agent.password === password || bcrypt.compareSync(password, agent.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
console.log("Password valid");


    // ⭐ Token must include role + accountStatus (middleware requirement)
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
      { expiresIn: "1d" }
    );

    // ⭐ Set HttpOnly cookie for middleware
    res.setHeader(
      "Set-Cookie",
      serialize("agentToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 1 day
      })
    );

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
    return res.status(500).json({ message: "Server error" });
  }
  
}
