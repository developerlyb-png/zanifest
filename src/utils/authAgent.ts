// utils/authAgent.ts

import jwt from "jsonwebtoken"; // ✅ ADD THIS

export const authAgent = (req, res, next) => {
  try {
    const token = req.cookies.agentToken;

    if (!token) {
      return res.status(401).json({ message: "Agent Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({ message: "Invalid Agent Token" });
  }
};