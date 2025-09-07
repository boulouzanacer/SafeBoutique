import { sql } from "drizzle-orm";
import { pgTable, integer, varchar, doublePrecision, text, timestamp, boolean, serial, index, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Families table - must be defined before products since products references it
export const families = pgTable("families", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Products table matching the exact PRODUIT structure
export const products = pgTable("products", {
  recordid: serial("recordid").primaryKey(),
  codeBarre: varchar("code_barre", { length: 20 }).notNull().unique(),
  cbColis: varchar("cb_colis", { length: 20 }),
  refProduit: varchar("ref_produit", { length: 20 }).notNull(),
  produit: varchar("produit", { length: 100 }),
  paHt: doublePrecision("pa_ht").default(0),
  tva: doublePrecision("tva").default(0),
  pampHt: doublePrecision("pamp_ht").default(0),
  pv1Ht: doublePrecision("pv1_ht"),
  pv2Ht: doublePrecision("pv2_ht"),
  pv3Ht: doublePrecision("pv3_ht"),
  pv4Ht: doublePrecision("pv4_ht"),
  pv5Ht: doublePrecision("pv5_ht"),
  pv6Ht: doublePrecision("pv6_ht"),
  pvLimite: doublePrecision("pv_limite"),
  ppa: doublePrecision("ppa"),
  stock: doublePrecision("stock").default(0),
  colissage: doublePrecision("colissage"),
  stockIni: doublePrecision("stock_ini").default(0),
  prixIni: doublePrecision("prix_ini").default(0),
  blocage: integer("blocage"),
  gerPoids: integer("ger_poids"),
  sup: integer("sup"),
  famille: varchar("famille", { length: 50 }),
  sousFamille: varchar("sous_famille", { length: 50 }),
  photo: text("photo"), // Base64 encoded image
  detaille: varchar("detaille", { length: 1536 }),
  codeFrs: varchar("code_frs", { length: 20 }),
  promo: integer("promo"),
  d1: timestamp("d1"),
  d2: timestamp("d2"),
  pp1Ht: doublePrecision("pp1_ht"),
  qtePromo: integer("qte_promo"),
  fid: integer("fid"),
  marque: varchar("marque", { length: 50 }),
  um: varchar("um", { length: 5 }),
  poids: doublePrecision("poids"),
  utilisateur: varchar("utilisateur", { length: 25 }),
  rating: doublePrecision("rating").default(0),
  ratingCount: integer("rating_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).unique(),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  zipCode: varchar("zip_code", { length: 20 }),
  isRegistered: boolean("is_registered").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  status: varchar("status", { length: 50 }).default("pending"),
  subtotal: doublePrecision("subtotal").notNull(),
  delivery: doublePrecision("delivery").default(9.99),
  total: doublePrecision("total").notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).default("cod"),
  notes: text("notes"),
  deliveryAddress: text("delivery_address").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.recordid).notNull(),
  quantity: integer("quantity").notNull(),
  price: doublePrecision("price").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table with email/password authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  profileImageUrl: varchar("profile_image_url"),
  isEmailVerified: boolean("is_email_verified").default(false),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.recordid],
  }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

// Product Reviews Table
export const productReviews = pgTable("product_reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.recordid).notNull(),
  customerName: varchar("customer_name", { length: 100 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const productsRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems),
  reviews: many(productReviews),
}));

export const productReviewsRelations = relations(productReviews, ({ one }) => ({
  product: one(products, {
    fields: [productReviews.productId],
    references: [products.recordid],
  }),
}));

// Insert schemas
export const insertProductSchema = createInsertSchema(products).omit({
  recordid: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  // Required fields validation
  codeBarre: z.string().min(1, "Barcode is required"),
  refProduit: z.string().min(1, "Product Reference is required"),
  produit: z.string().min(1, "Product Name is required"),
  pv1Ht: z.number().min(0, "Price (PV1) is required and must be 0 or greater"),
  famille: z.string().min(1, "Family is required"),
  paHt: z.number().min(0, "Purchase price (PA HT) is required and must be 0 or greater"),
  tva: z.number().min(0, "VAT (TVA) is required and must be 0 or greater"),
  pampHt: z.number().min(0, "Average purchase price (PAMP HT) is required and must be 0 or greater"),
  stock: z.number().min(0, "Stock quantity is required and must be 0 or greater"),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const signupUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
});

export const loginUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
});


export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  siteName: varchar("site_name", { length: 200 }).notNull(),
  siteDescription: text("site_description").notNull(),
  logo: text("logo"),
  favicon: text("favicon"),
  contactEmail: varchar("contact_email", { length: 200 }).notNull(),
  contactPhone: varchar("contact_phone", { length: 50 }).notNull(),
  contactMobile1: varchar("contact_mobile1", { length: 50 }),
  contactMobile2: varchar("contact_mobile2", { length: 50 }),
  contactMobile3: varchar("contact_mobile3", { length: 50 }),
  contactMobile4: varchar("contact_mobile4", { length: 50 }),
  contactAddress: text("contact_address").notNull(),
  socialFacebook: text("social_facebook"),
  socialInstagram: text("social_instagram"),
  socialTwitter: text("social_twitter"),
  footerText: text("footer_text").notNull(),
  headerMessage: text("header_message"),
  deliveryInfo: text("delivery_info").notNull(),
  returnPolicy: text("return_policy").notNull(),
  privacyPolicy: text("privacy_policy").notNull(),
  termsOfService: text("terms_of_service").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const sliderImages = pgTable("slider_images", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  linkUrl: text("link_url"),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSliderImageSchema = createInsertSchema(sliderImages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFamilySchema = createInsertSchema(families).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SignupUser = z.infer<typeof signupUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type SliderImage = typeof sliderImages.$inferSelect;
export type InsertSliderImage = z.infer<typeof insertSliderImageSchema>;
export type Family = typeof families.$inferSelect;
export type InsertFamily = z.infer<typeof insertFamilySchema>;

export const insertProductReviewSchema = createInsertSchema(productReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type ProductReview = typeof productReviews.$inferSelect;
export type InsertProductReview = z.infer<typeof insertProductReviewSchema>;
