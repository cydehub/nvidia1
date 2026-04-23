import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, adminUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";
import { AdminLoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", message: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;
  const [admin] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.email, email));

  if (!admin) {
    res.status(401).json({ error: "Unauthorized", message: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Unauthorized", message: "Invalid email or password" });
    return;
  }

  req.session.adminId = admin.id;
  req.session.adminEmail = admin.email;

  res.json({ id: admin.id, username: admin.username, email: admin.email });
});

router.post("/admin/logout", requireAdmin, async (req, res): Promise<void> => {
  req.session.destroy(() => {
    res.json({ success: true, message: "Logged out successfully" });
  });
});

router.get("/admin/me", requireAdmin, async (req, res): Promise<void> => {
  const [admin] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.id, req.session.adminId!));

  if (!admin) {
    res.status(404).json({ error: "Not found", message: "Admin user not found" });
    return;
  }

  res.json({ id: admin.id, username: admin.username, email: admin.email });
});

export default router;
