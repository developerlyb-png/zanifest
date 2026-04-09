import { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "@/utils/withAuth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // ✅ user from middleware (already verified)
    const user = (req as any).user;

    // 🔐 Optional: only admin allowed
    if (user.role !== "admin" && user.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { userFirstName, userLastName, email, role } = user;

    return res.status(200).json({
      user: { userFirstName, userLastName, email, role },
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}

// ✅ Protect API
export default withAuth(handler);