import { Router, type IRouter } from "express";
import { db, brandsTable, productsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";
import { CreateBrandBody, UpdateBrandBody, UpdateBrandParams, DeleteBrandParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/brands", async (_req, res): Promise<void> => {
  const brands = await db.select().from(brandsTable).orderBy(brandsTable.name);

  const withCounts = await Promise.all(
    brands.map(async (brand) => {
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(productsTable)
        .where(eq(productsTable.brandId, brand.id));
      return { ...brand, productCount: Number(count) };
    })
  );

  res.json(withCounts);
});

router.post("/brands", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateBrandBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", message: parsed.error.message });
    return;
  }

  const [brand] = await db.insert(brandsTable).values(parsed.data).returning();
  res.status(201).json({ ...brand, productCount: 0 });
});

router.put("/brands/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateBrandParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params", message: params.error.message });
    return;
  }

  const parsed = UpdateBrandBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", message: parsed.error.message });
    return;
  }

  const [brand] = await db
    .update(brandsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(brandsTable.id, params.data.id))
    .returning();

  if (!brand) {
    res.status(404).json({ error: "Not found", message: "Brand not found" });
    return;
  }

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(productsTable)
    .where(eq(productsTable.brandId, brand.id));

  res.json({ ...brand, productCount: Number(count) });
});

router.delete("/brands/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteBrandParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params", message: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(brandsTable)
    .where(eq(brandsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Not found", message: "Brand not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
