import { type Request, type Response, type NextFunction } from "express";

declare module "express-session" {
  interface SessionData {
    adminId: number;
    adminEmail: string;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.session?.adminId) {
    res.status(401).json({ error: "Unauthorized", message: "Admin authentication required" });
    return;
  }
  next();
}
