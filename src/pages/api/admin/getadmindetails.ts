import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Admin from "@/models/Admin";
import { withAuth } from "@/utils/withAuth"; // ✅ use common auth
import { authMiddleware } from "@/middleware/auth"; // ✅ use common auth
async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();
const isAuth = await authMiddleware(req, res);
  if (!isAuth) return;
    // ✅ user from middleware
    const user = (req as any).user;

    // 🔐 Only admin allowed (optional but recommended)
    if (user.role !== "admin" && user.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const admin = await Admin.findById(user.id).lean();

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // 🔐 Remove password
    delete (admin as any).password;

    return res.status(200).json(admin);

  } catch (err) {
    console.error("GET /api/admin/me Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// ✅ Protect API
export default withAuth(handler);