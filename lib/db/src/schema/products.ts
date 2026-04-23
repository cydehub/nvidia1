import { pgTable, serial, text, timestamp, integer, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriesTable } from "./categories";
import { brandsTable } from "./brands";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  shortDescription: text("short_description"),
  fullDescription: text("full_description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  oldPrice: numeric("old_price", { precision: 10, scale: 2 }),
  sku: text("sku"),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  stockStatus: text("stock_status").notNull().default("in_stock"),
  featured: boolean("featured").notNull().default(false),
  bestSeller: boolean("best_seller").notNull().default(false),
  newArrival: boolean("new_arrival").notNull().default(false),
  isPublished: boolean("is_published").notNull().default(true),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  specifications: text("specifications"),
  brandId: integer("brand_id").references(() => brandsTable.id),
  categoryId: integer("category_id").references(() => categoriesTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const productImagesTable = pgTable("product_images", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => productsTable.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  isMain: boolean("is_main").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
export type ProductImage = typeof productImagesTable.$inferSelect;
