import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import Admin from "@/models/Admin";
import { authMiddleware } from "@/middleware/auth";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const isAuth = await authMiddleware(req, res);
    if (!isAuth) return;
  try {
    await dbConnect();

    // ✅ 1. CSRF CHECK
    const csrfCookie = req.cookies.csrfToken;
    const csrfHeader = req.headers["x-csrf-token"];

    if (!csrfCookie || csrfCookie !== csrfHeader) {
      return res.status(403).json({ message: "Invalid CSRF token" });
    }

    // ✅ 2. AUTH CHECK (JWT)
    const token = req.cookies.adminToken;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    } catch {
      return res.status(401).json({ message: "Invalid or expired session" });
    }

    if (!decoded?.id) {
      return res.status(401).json({ message: "Invalid session" });
    }

    // ✅ 3. CLEAN INPUTS (VERY IMPORTANT 🔥)
    const clean = (val: string) =>
      val?.trim().replace(/[\n\r\t]/g, "").replace(/\s+/g, "");

    const currentPassword = clean(req.body.currentPassword);
    const newPassword = clean(req.body.newPassword);

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/.test(newPassword)) {
  return res.status(400).json({
    message:
      "Password must contain uppercase, lowercase, number and special character",
  });
}
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword.length < 6 || newPassword.length > 50) {
      return res.status(400).json({ message: "Password must be 6-50 characters" });
    }

    // ✅ 4. GET USER
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔍 DEBUG (optional but useful)
    console.log("Entered current:", JSON.stringify(currentPassword));
    console.log("DB hash:", admin.password);

    // ✅ 5. VERIFY CURRENT PASSWORD
    const isMatch = await bcrypt.compare(currentPassword, admin.password);

    console.log("Current match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // ✅ 6. PREVENT SAME PASSWORD
    const isSame = await bcrypt.compare(newPassword, admin.password);
    if (isSame) {
      return res.status(400).json({ message: "New password must be different" });
    }

    // ✅ 7. HASH NEW PASSWORD
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log("New hash:", hashedPassword);

    // 🔥🔥🔥 FINAL FIX (FORCE UPDATE)
    await Admin.updateOne(
      { _id: admin._id },
      { $set: { password: hashedPassword } }
    );

    // 🔍 VERIFY UPDATE
    const updated = await Admin.findById(admin._id);
    console.log("UPDATED HASH:", updated?.password);

    // ✅ 8. LOGOUT USER
    res.setHeader("Set-Cookie", [
      "adminToken=; HttpOnly; Path=/; Max-Age=0",
    ]);

    return res.status(200).json({
      message: "Password updated successfully. Please login again.",
    });

  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}