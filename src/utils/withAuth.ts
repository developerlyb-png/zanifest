import jwt from "jsonwebtoken";
import cookie from "cookie";

// 🔥 middleware
export const authMiddleware = (req: any, res: any, next: any) => {
  // ✅ cookies parse
  const cookies = cookie.parse(req.headers.cookie || "");

  // ✅ dono tokens check karo
  const token =
  cookies.userToken ||   // 🔥 ADD THIS
  cookies.agentToken ||
  cookies.adminToken;

  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    // ✅ absolute expiry (common)
    const absExp = cookies.abs_exp;

    if (!absExp || Date.now() > Number(absExp)) {
      return res.status(401).json({ message: "Session expired" });
    }

    // ✅ attach user + role
    req.user = decoded;

    next();

  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// 🔥 wrapper
export function withAuth(handler: any) {
  return async (req: any, res: any) => {
    await new Promise((resolve, reject) => {
      authMiddleware(req, res, (result: any) => {
        if (result instanceof Error) return reject(result);
        return resolve(result);
      });
    });

    return handler(req, res);
  };
}