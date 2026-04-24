import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Admin from "@/models/Admin";
import { withAuth } from "@/utils/withAuth"; // ✅ ADD THIS
import { authMiddleware } from "@/middleware/auth"; // ✅ ADD THIS
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "This method is not allowed!" });
  }
  const isAuth = await authMiddleware(req, res);
    if (!isAuth) return;

  const { id } = req.query;

  // ✅ Logged-in user
  const user = (req as any).user;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    await dbConnect();

    // 🔐 ONLY ADMIN CAN DELETE
    if (user.role !== "admin" && user.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    // 🔥 Prevent self delete (optional but recommended)
    if (user.id === id) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    const admin = await Admin.findByIdAndDelete(id);

    if (!admin) {
      return res.status(404).json({
        message: "Admin with this id not found",
      });
    }

    return res.status(200).json({
      message: "Admin deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting admin:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

// ✅ PROTECT THIS API
export default withAuth(handler);