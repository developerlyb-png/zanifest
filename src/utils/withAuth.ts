import jwt from "jsonwebtoken";

// 🔥 middleware
export const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.cookies.adminToken;

  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    // ✅ ABSOLUTE EXPIRY CHECK
    const absExp = req.cookies.abs_exp;

    if (!absExp || Date.now() > Number(absExp)) {
      return res.status(401).json({ message: "Session expired" });
    }

    req.user = decoded;
    next();

  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// 🔥 THIS WAS MISSING (IMPORTANT)
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