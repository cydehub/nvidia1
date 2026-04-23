import { Router, type IRouter } from "express";
import { db, productsTable, productImagesTable, categoriesTable, brandsTable } from "@workspace/db";
import { eq, ilike, and, gte, lte, desc, asc, sql, inArray } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";
import {
  CreateProductBody,
  UpdateProductBody,
  GetProductParams,
  UpdateProductParams,
  DeleteProductParams,
  GetRelatedProductsParams,
  GetProductBySlugParams,
  ListProductsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getProductWithRelations(productId: number) {
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
  if (!product) return null;

  const images = await db.select().from(productImagesTable).where(eq(productImagesTable.productId, productId));

  let category = null;
  if (product.categoryId) {
    const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, product.categoryId));
    if (cat) {
      const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(productsTable).where(eq(productsTable.categoryId, cat.id));
      category = { ...cat, productCount: Number(count) };
    }
  }

  let brand = null;
  if (product.brandId) {
    const [br] = await db.select().from(brandsTable).where(eq(brandsTable.id, product.brandId));
    if (br) {
      const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(productsTable).where(eq(productsTable.brandId, br.id));
      brand = { ...br, productCount: Number(count) };
    }
  }

  return {
    ...product,
    price: product.price.toString(),
    oldPrice: product.oldPrice?.toString() ?? null,
    images,
    category,
    brand,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

router.get("/products", async (req, res): Promise<void> => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params", message: parsed.error.message });
    return;
  }

  const { search, categoryId, brandId, minPrice, maxPrice, featured, bestSeller, newArrival, sortBy, page, limit } = parsed.data;

  const conditions: ReturnType<typeof eq>[] = [];
  conditions.push(eq(productsTable.isPublished, true));

  if (search) conditions.push(ilike(productsTable.name, `%${search}%`));
  if (categoryId) conditions.push(eq(productsTable.categoryId, categoryId));
  if (brandId) conditions.push(eq(productsTable.brandId, brandId));
  if (minPrice !== undefined) conditions.push(gte(sql`${productsTable.price}::numeric`, minPrice));
  if (maxPrice !== undefined) conditions.push(lte(sql`${productsTable.price}::numeric`, maxPrice));
  if (featured !== undefined) conditions.push(eq(productsTable.featured, featured));
  if (bestSeller !== undefined) conditions.push(eq(productsTable.bestSeller, bestSeller));
  if (newArrival !== undefined) conditions.push(eq(productsTable.newArrival, newArrival));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const pageNum = page ?? 1;
  const limitNum = limit ?? 12;
  const offset = (pageNum - 1) * limitNum;

  let orderBy;
  if (sortBy === "price_asc") orderBy = asc(sql`${productsTable.price}::numeric`);
  else if (sortBy === "price_desc") orderBy = desc(sql`${productsTable.price}::numeric`);
  else orderBy = desc(productsTable.createdAt);

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(productsTable)
    .where(whereClause);

  const total = Number(totalResult.count);

  const products = await db
    .select()
    .from(productsTable)
    .where(whereClause)
    .orderBy(orderBy)
    .limit(limitNum)
    .offset(offset);

  const productIds = products.map((p) => p.id);
  const images = productIds.length > 0
    ? await db.select().from(productImagesTable).where(inArray(productImagesTable.productId, productIds))
    : [];

  const categoryIds = [...new Set(products.filter((p) => p.categoryId).map((p) => p.categoryId!))];
  const brandIds = [...new Set(products.filter((p) => p.brandId).map((p) => p.brandId!))];

  const categories = categoryIds.length > 0
    ? await db.select().from(categoriesTable).where(inArray(categoriesTable.id, categoryIds))
    : [];

  const brands = brandIds.length > 0
    ? await db.select().from(brandsTable).where(inArray(brandsTable.id, brandIds))
    : [];

  const enrichedProducts = products.map((p) => ({
    ...p,
    price: p.price.toString(),
    oldPrice: p.oldPrice?.toString() ?? null,
    images: images.filter((img) => img.productId === p.id),
    category: categories.find((c) => c.id === p.categoryId)
      ? { ...categories.find((c) => c.id === p.categoryId)!, productCount: 0 }
      : null,
    brand: brands.find((b) => b.id === p.brandId)
      ? { ...brands.find((b) => b.id === p.brandId)!, productCount: 0 }
      : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  res.json({
    products: enrichedProducts,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

router.get("/products/slug/:slug", async (req, res): Promise<void> => {
  const params = GetProductBySlugParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params", message: params.error.message });
    return;
  }

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.slug, params.data.slug));

  if (!product) {
    res.status(404).json({ error: "Not found", message: "Product not found" });
    return;
  }

  const full = await getProductWithRelations(product.id);
  res.json(full);
});

router.get("/products/:id/related", async (req, res): Promise<void> => {
  const params = GetRelatedProductsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params", message: params.error.message });
    return;
  }

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, params.data.id));
  if (!product) {
    res.json([]);
    return;
  }

  const conditions = [eq(productsTable.isPublished, true)];
  if (product.categoryId) {
    conditions.push(eq(productsTable.categoryId, product.categoryId));
  }

  const related = await db
    .select()
    .from(productsTable)
    .where(and(...conditions, sql`${productsTable.id} != ${product.id}`))
    .limit(4);

  const productIds = related.map((p) => p.id);
  const images = productIds.length > 0
    ? await db.select().from(productImagesTable).where(inArray(productImagesTable.productId, productIds))
    : [];

  const enriched = related.map((p) => ({
    ...p,
    price: p.price.toString(),
    oldPrice: p.oldPrice?.toString() ?? null,
    images: images.filter((img) => img.productId === p.id),
    category: null,
    brand: null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  res.json(enriched);
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params", message: params.error.message });
    return;
  }

  const full = await getProductWithRelations(params.data.id);
  if (!full) {
    res.status(404).json({ error: "Not found", message: "Product not found" });
    return;
  }

  res.json(full);
});

router.post("/products", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", message: parsed.error.message });
    return;
  }

  const { images, ...productData } = parsed.data;

  const slug = productData.slug ?? productData.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const [product] = await db
    .insert(productsTable)
    .values({ ...productData, slug, price: productData.price, oldPrice: productData.oldPrice ?? null })
    .returning();

  if (images && images.length > 0) {
    await db.insert(productImagesTable).values(
      images.map((img) => ({ productId: product.id, imageUrl: img.imageUrl, isMain: img.isMain }))
    );
  }

  const full = await getProductWithRelations(product.id);
  res.status(201).json(full);
});

router.put("/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params", message: params.error.message });
    return;
  }

  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", message: parsed.error.message });
    return;
  }

  const { images, ...productData } = parsed.data;

  const [product] = await db
    .update(productsTable)
    .set({ ...productData, updatedAt: new Date() })
    .where(eq(productsTable.id, params.data.id))
    .returning();

  if (!product) {
    res.status(404).json({ error: "Not found", message: "Product not found" });
    return;
  }

  if (images !== undefined) {
    await db.delete(productImagesTable).where(eq(productImagesTable.productId, product.id));
    if (images.length > 0) {
      await db.insert(productImagesTable).values(
        images.map((img) => ({ productId: product.id, imageUrl: img.imageUrl, isMain: img.isMain }))
      );
    }
  }

  const full = await getProductWithRelations(product.id);
  res.json(full);
});

router.delete("/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params", message: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(productsTable)
    .where(eq(productsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Not found", message: "Product not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
