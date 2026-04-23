import { Router, type IRouter } from "express";
import { db, storeSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";
import { UpdateSettingsBody } from "@workspace/api-zod";

const router: IRouter = Router();

async function ensureSettings() {
  const [existing] = await db.select().from(storeSettingsTable);
  if (existing) return existing;
  const [created] = await db.insert(storeSettingsTable).values({
    storeName: "TechZone",
    whatsappNumber: "27116210895",
    heroTitle: "Your Premier Electronics Destination",
    heroSubtitle: "Discover the latest laptops, smartphones, accessories and more at unbeatable prices.",
    storeTagline: "Premium Electronics at Your Fingertips",
    contactEmail: "info@techzone.co.za",
    contactPhone: "011 621 0895",
  }).returning();
  return created;
}

router.get("/settings", async (_req, res): Promise<void> => {
  const settings = await ensureSettings();
  res.json(settings);
});

router.put("/settings", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", message: parsed.error.message });
    return;
  }

  const existing = await ensureSettings();
  const [settings] = await db
    .update(storeSettingsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(storeSettingsTable.id, existing.id))
    .returning();

  res.json(settings);
});

export default router;
