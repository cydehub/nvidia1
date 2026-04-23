import { Router, type IRouter } from "express";
import { db, faqsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";
import { CreateFaqBody, UpdateFaqBody, UpdateFaqParams, DeleteFaqParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/faqs", async (_req, res): Promise<void> => {
  const faqs = await db.select().from(faqsTable).orderBy(asc(faqsTable.sortOrder));
  res.json(faqs);
});

router.post("/faqs", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateFaqBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", message: parsed.error.message });
    return;
  }

  const [faq] = await db.insert(faqsTable).values({ ...parsed.data, isActive: parsed.data.isActive ?? true, sortOrder: parsed.data.sortOrder ?? 0 }).returning();
  res.status(201).json(faq);
});

router.put("/faqs/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateFaqParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params", message: params.error.message });
    return;
  }

  const parsed = UpdateFaqBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", message: parsed.error.message });
    return;
  }

  const [faq] = await db
    .update(faqsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(faqsTable.id, params.data.id))
    .returning();

  if (!faq) {
    res.status(404).json({ error: "Not found", message: "FAQ not found" });
    return;
  }

  res.json(faq);
});

router.delete("/faqs/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteFaqParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params", message: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(faqsTable)
    .where(eq(faqsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Not found", message: "FAQ not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
