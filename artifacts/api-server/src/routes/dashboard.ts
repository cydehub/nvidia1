import { Router, type IRouter } from "express";
import { db, productsTable, categoriesTable, brandsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/dashboard/stats", requireAdmin, async (_req, res): Promise<void> => {
  const [totalProductsResult] = await db.select({ count: sql<number>`count(*)` }).from(productsTable);
  const [totalCategoriesResult] = await db.select({ count: sql<number>`count(*)` }).from(categoriesTable);
  const [totalBrandsResult] = await db.select({ count: sql<number>`count(*)` }).from(brandsTable);
  const [featuredResult] = await db.select({ count: sql<number>`count(*)` }).from(productsTable).where(eq(productsTable.featured, true));
  const [lowStockResult] = await db.select({ count: sql<number>`count(*)` }).from(productsTable).where(eq(productsTable.stockStatus, "low_stock"));
  const [outOfStockResult] = await db.select({ count: sql<number>`count(*)` }).from(productsTable).where(eq(productsTable.stockStatus, "out_of_stock"));
  const [publishedResult] = await db.select({ count: sql<number>`count(*)` }).from(productsTable).where(eq(productsTable.isPublished, true));

  res.json({
    totalProducts: Number(totalProductsResult.count),
    totalCategories: Number(totalCategoriesResult.count),
    totalBrands: Number(totalBrandsResult.count),
    featuredProducts: Number(featuredResult.count),
    lowStockItems: Number(lowStockResult.count),
    outOfStockItems: Number(outOfStockResult.count),
    publishedProducts: Number(publishedResult.count),
  });
});

export default router;
