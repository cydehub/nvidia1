import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const storeSettingsTable = pgTable("store_settings", {
  id: serial("id").primaryKey(),
  storeName: text("store_name").notNull().default("TechZone"),
  storeTagline: text("store_tagline"),
  logoUrl: text("logo_url"),
  whatsappNumber: text("whatsapp_number").notNull().default("27116210895"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  address: text("address"),
  facebookUrl: text("facebook_url"),
  instagramUrl: text("instagram_url"),
  twitterUrl: text("twitter_url"),
  footerText: text("footer_text"),
  announcementText: text("announcement_text"),
  heroTitle: text("hero_title"),
  heroSubtitle: text("hero_subtitle"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertStoreSettingsSchema = createInsertSchema(storeSettingsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertStoreSettings = z.infer<typeof insertStoreSettingsSchema>;
export type StoreSettings = typeof storeSettingsTable.$inferSelect;
