import { Router, type IRouter } from "express";
import { db, testimonialsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";
import { CreateTestimonialBody, UpdateTestimonialBody, UpdateTestimonialParams, DeleteTestimonialParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/testimonials", async (_req, res): Promise<void> => {
  const testimonials = await db.select().from(testimonialsTable).orderBy(desc(testimonialsTable.createdAt));
  res.json(testimonials);
});

router.post("/testimonials", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateTestimonialBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", message: parsed.error.message });
    return;
  }

  const [testimonial] = await db.insert(testimonialsTable).values({ ...parsed.data, isActive: parsed.data.isActive ?? true, rating: parsed.data.rating ?? 5 }).returning();
  res.status(201).json(testimonial);
});

router.put("/testimonials/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateTestimonialParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params", message: params.error.message });
    return;
  }

  const parsed = UpdateTestimonialBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", message: parsed.error.message });
    return;
  }

  const [testimonial] = await db
    .update(testimonialsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(testimonialsTable.id, params.data.id))
    .returning();

  if (!testimonial) {
    res.status(404).json({ error: "Not found", message: "Testimonial not found" });
    return;
  }

  res.json(testimonial);
});

router.delete("/testimonials/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteTestimonialParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params", message: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(testimonialsTable)
    .where(eq(testimonialsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Not found", message: "Testimonial not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
