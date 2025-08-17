import { 
  products, 
  customers, 
  orders, 
  orderItems, 
  users,
  siteSettings,
  sliderImages,
  type Product, 
  type InsertProduct,
  type Customer,
  type InsertCustomer,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type User,
  type InsertUser,
  type SiteSettings,
  type InsertSiteSettings,
  type SliderImage,
  type InsertSliderImage
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, and, isNull, or, sql } from "drizzle-orm";

export interface IStorage {
  // Products
  getProducts(filters?: {
    famille?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    promo?: boolean;
  }): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  getFamilies(): Promise<string[]>;

  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer>;

  // Orders
  getOrders(): Promise<(Order & { customer: Customer | null; items: (OrderItem & { product: Product })[] })[]>;
  getOrder(id: number): Promise<(Order & { customer: Customer | null; items: (OrderItem & { product: Product })[] }) | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;

  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Stats
  getStats(): Promise<{
    totalProducts: number;
    totalOrders: number;
    totalCustomers: number;
    revenue: number;
  }>;

  // Site Settings
  getSiteSettings(): Promise<SiteSettings | undefined>;
  updateSiteSettings(settings: InsertSiteSettings): Promise<SiteSettings>;

  // Slider Images
  getSliderImages(): Promise<SliderImage[]>;
  getSliderImage(id: number): Promise<SliderImage | undefined>;
  createSliderImage(image: InsertSliderImage): Promise<SliderImage>;
  updateSliderImage(id: number, image: Partial<InsertSliderImage>): Promise<SliderImage>;
  deleteSliderImage(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(filters?: {
    famille?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    promo?: boolean;
  }): Promise<Product[]> {
    let query = db.select().from(products);
    
    const conditions = [];
    
    if (filters?.famille) {
      conditions.push(eq(products.famille, filters.famille));
    }
    
    if (filters?.search) {
      conditions.push(
        or(
          like(products.produit, `%${filters.search}%`),
          like(products.refProduit, `%${filters.search}%`)
        )
      );
    }
    
    if (filters?.minPrice !== undefined) {
      conditions.push(sql`${products.pv1Ht} >= ${filters.minPrice}`);
    }
    
    if (filters?.maxPrice !== undefined) {
      conditions.push(sql`${products.pv1Ht} <= ${filters.maxPrice}`);
    }
    
    if (filters?.inStock) {
      conditions.push(sql`${products.stock} > 0`);
    }
    
    if (filters?.promo) {
      conditions.push(sql`${products.promo} = 1`);
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query.orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.recordid, id));
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const [updated] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.recordid, id))
      .returning();
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.recordid, id));
  }

  async getFamilies(): Promise<string[]> {
    const families = await db.selectDistinct({ famille: products.famille }).from(products);
    return families.map(f => f.famille).filter(Boolean) as string[];
  }

  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.email, email));
    return customer || undefined;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [created] = await db.insert(customers).values(customer).returning();
    return created;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer> {
    const [updated] = await db
      .update(customers)
      .set({ ...customer, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return updated;
  }

  async getOrders(): Promise<(Order & { customer: Customer | null; items: (OrderItem & { product: Product })[] })[]> {
    return await db.query.orders.findMany({
      with: {
        customer: true,
        items: {
          with: {
            product: true
          }
        }
      },
      orderBy: [desc(orders.createdAt)]
    });
  }

  async getOrder(id: number): Promise<(Order & { customer: Customer | null; items: (OrderItem & { product: Product })[] }) | undefined> {
    return await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        customer: true,
        items: {
          with: {
            product: true
          }
        }
      }
    });
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const orderNumber = `ORD${Date.now()}`;
    
    const [created] = await db.insert(orders).values({
      ...order,
      orderNumber
    }).returning();

    const orderItemsWithId = items.map(item => ({
      ...item,
      orderId: created.id
    }));

    await db.insert(orderItems).values(orderItemsWithId);

    // Update stock
    for (const item of items) {
      await db
        .update(products)
        .set({
          stock: sql`${products.stock} - ${item.quantity}`
        })
        .where(eq(products.recordid, item.productId));
    }

    return created;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updated] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async getStats(): Promise<{
    totalProducts: number;
    totalOrders: number;
    totalCustomers: number;
    revenue: number;
  }> {
    const [productCount] = await db.select({ count: sql<number>`count(*)` }).from(products);
    const [orderCount] = await db.select({ count: sql<number>`count(*)` }).from(orders);
    const [customerCount] = await db.select({ count: sql<number>`count(*)` }).from(customers);
    const [revenueSum] = await db.select({ sum: sql<number>`COALESCE(sum(${orders.total}), 0)` }).from(orders).where(eq(orders.status, 'delivered'));

    return {
      totalProducts: productCount.count,
      totalOrders: orderCount.count,
      totalCustomers: customerCount.count,
      revenue: revenueSum.sum
    };
  }

  async getSiteSettings(): Promise<SiteSettings | undefined> {
    const [settings] = await db.select().from(siteSettings).limit(1);
    return settings || undefined;
  }

  async updateSiteSettings(settingsData: InsertSiteSettings): Promise<SiteSettings> {
    // Check if settings exist
    const existing = await this.getSiteSettings();
    
    if (existing) {
      // Update existing settings
      const [updated] = await db
        .update(siteSettings)
        .set({ ...settingsData, updatedAt: new Date() })
        .where(eq(siteSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new settings
      const [created] = await db.insert(siteSettings).values(settingsData).returning();
      return created;
    }
  }

  async getSliderImages(): Promise<SliderImage[]> {
    return await db.select().from(sliderImages).orderBy(sliderImages.sortOrder, sliderImages.createdAt);
  }

  async getSliderImage(id: number): Promise<SliderImage | undefined> {
    const [image] = await db.select().from(sliderImages).where(eq(sliderImages.id, id));
    return image || undefined;
  }

  async createSliderImage(imageData: InsertSliderImage): Promise<SliderImage> {
    const [created] = await db.insert(sliderImages).values(imageData).returning();
    return created;
  }

  async updateSliderImage(id: number, imageData: Partial<InsertSliderImage>): Promise<SliderImage> {
    const [updated] = await db
      .update(sliderImages)
      .set({ ...imageData, updatedAt: new Date() })
      .where(eq(sliderImages.id, id))
      .returning();
    return updated;
  }

  async deleteSliderImage(id: number): Promise<void> {
    await db.delete(sliderImages).where(eq(sliderImages.id, id));
  }
}

export const storage = new DatabaseStorage();
