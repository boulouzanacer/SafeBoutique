import { 
  products, 
  customers, 
  orders, 
  orderItems, 
  users,
  siteSettings,
  sliderImages,
  productReviews,
  families,
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
  type SignupUser,
  type SiteSettings,
  type InsertSiteSettings,
  type SliderImage,
  type InsertSliderImage,
  type ProductReview,
  type InsertProductReview,
  type Family,
  type InsertFamily
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, and, isNull, or, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

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
  getProductByCodeBarre(codeBarre: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  upsertProduct(product: InsertProduct): Promise<Product>;
  processProductPhoto(base64Data: string): Promise<string>;
  deleteProduct(id: number): Promise<void>;
  getFamilies(): Promise<string[]>;
  getAllFamilies(): Promise<Family[]>;
  getFamilyById(id: number): Promise<Family | undefined>;
  createFamily(data: InsertFamily): Promise<Family>;
  updateFamily(id: number, data: Partial<InsertFamily>): Promise<Family | undefined>;
  deleteFamily(id: number): Promise<boolean>;
  getFamilyProductsCount(id: number): Promise<number>;

  // Customers
  getCustomers(): Promise<(Customer & { totalOrders: number })[]>;
  getCustomer(id: number): Promise<(Customer & { orders: (Order & { items: (OrderItem & { product: Product })[] })[] }) | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer>;

  // Orders
  getOrders(): Promise<(Order & { customer: Customer | null; items: (OrderItem & { product: Product })[] })[]>;
  getOrder(id: number): Promise<(Order & { customer: Customer | null; items: (OrderItem & { product: Product })[] }) | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;

  // Users (Email/Password Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: SignupUser): Promise<User>;
  updateUser(id: string, userData: Partial<User>): Promise<User>;
  updateUserPassword(id: string, newPassword: string): Promise<void>;
  deleteUser(id: string): Promise<void>;
  verifyUserPassword(email: string, password: string): Promise<User | null>;

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

  // Product Reviews
  getProductReviews(productId: number): Promise<ProductReview[]>;
  createProductReview(review: InsertProductReview): Promise<ProductReview>;
  updateProductRating(productId: number): Promise<void>;
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
      // Enhanced intelligent search: case-insensitive, multiple fields, partial matching
      const searchTerm = filters.search.toLowerCase().trim();
      
      // Create individual search conditions for better database performance
      const searchConditions = [
        // Product name - case insensitive
        sql`LOWER(${products.produit}) LIKE '%' || ${searchTerm} || '%'`,
        // Product reference - case insensitive  
        sql`LOWER(${products.refProduit}) LIKE '%' || ${searchTerm} || '%'`,
        // Product details/description - case insensitive
        sql`LOWER(COALESCE(${products.detaille}, '')) LIKE '%' || ${searchTerm} || '%'`,
        // Product family - case insensitive
        sql`LOWER(COALESCE(${products.famille}, '')) LIKE '%' || ${searchTerm} || '%'`,
        // Product subfamily - case insensitive
        sql`LOWER(COALESCE(${products.sousFamille}, '')) LIKE '%' || ${searchTerm} || '%'`,
        // Product brand/marque - case insensitive
        sql`LOWER(COALESCE(${products.marque}, '')) LIKE '%' || ${searchTerm} || '%'`,
        // Barcode search - for exact product codes
        sql`${products.codeBarre} LIKE '%' || ${searchTerm} || '%'`,
      ];

      // Add word-by-word search for multi-word queries
      if (searchTerm.includes(' ')) {
        const words = searchTerm.split(' ').filter(word => word.length > 0);
        for (const word of words) {
          searchConditions.push(
            sql`LOWER(${products.produit}) LIKE '%' || ${word} || '%'`
          );
        }
      }
      
      conditions.push(or(...searchConditions));
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
      conditions.push(sql`${products.pp1Ht} > 0`);
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

  async getProductByCodeBarre(codeBarre: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.codeBarre, codeBarre));
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    // Ensure family exists in families table
    await this.ensureFamilyExists(product.famille);
    
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    console.log(`Updating product ${id} with data:`, JSON.stringify(product));
    
    // Ensure family exists in families table if family is being updated
    if (product.famille !== undefined) {
      await this.ensureFamilyExists(product.famille);
    }
    
    // Ensure we have clean data without undefined values
    const cleanProduct = Object.keys(product).reduce((acc, key) => {
      if (product[key as keyof typeof product] !== undefined) {
        acc[key as keyof typeof product] = product[key as keyof typeof product];
      }
      return acc;
    }, {} as Record<string, any>);
    
    console.log(`Clean data for product ${id}:`, JSON.stringify(cleanProduct));
    
    const [updated] = await db
      .update(products)
      .set({ ...cleanProduct, updatedAt: new Date() })
      .where(eq(products.recordid, id))
      .returning();
      
    console.log(`Product ${id} updated result:`, updated ? 'SUCCESS' : 'FAILED');
    
    if (!updated) {
      console.error(`ERROR: Product ${id} update returned null/undefined!`);
      throw new Error(`Failed to update product ${id}`);
    }
    
    if (product.photo) {
      console.log(`Product ${id} photo field after update:`, updated.photo);
      console.log(`Expected photo:`, product.photo);
      console.log(`Photo update success:`, updated.photo === product.photo);
    }
    
    return updated;
  }

  async processProductPhoto(base64Data: string): Promise<string> {
    if (!base64Data || !base64Data.startsWith('data:image/')) {
      throw new Error('Invalid base64 image data');
    }

    try {
      // Extract image data and format
      const matches = base64Data.match(/^data:image\/([a-zA-Z]*);base64,(.*)$/);
      if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 format');
      }

      const imageFormat = matches[1]; // jpeg, png, etc.
      const imageData = matches[2];
      
      // Generate unique filename
      const fileName = `${randomUUID()}.${imageFormat}`;
      const publicPath = `/replit-objstore-3b59a6d1-5dc4-47d7-9e4e-c36889216e29/public/products/${fileName}`;
      
      // Import object storage dynamically
      const { objectStorageClient } = await import("./objectStorage");
      const bucketName = 'replit-objstore-3b59a6d1-5dc4-47d7-9e4e-c36889216e29';
      const objectName = `public/products/${fileName}`;
      
      // Convert base64 to buffer
      const imageBuffer = Buffer.from(imageData, 'base64');
      
      // Upload to object storage
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);
      
      await file.save(imageBuffer, {
        metadata: {
          contentType: `image/${imageFormat}`,
        }
      });
      
      console.log(`Photo uploaded successfully to: ${publicPath}`);
      
      // Return the public URL path that the frontend can use
      return `/public-objects/products/${fileName}`;
      
    } catch (error) {
      console.error('Error processing photo:', error);
      throw new Error('Failed to process and upload photo');
    }
  }

  async upsertProduct(product: InsertProduct): Promise<Product> {
    // Ensure family exists in families table early in the process
    await this.ensureFamilyExists(product.famille);
    
    // Process photo if provided
    let processedProduct = { ...product };
    
    if (product.photo && product.photo.startsWith('data:image/')) {
      console.log('Storing base64 photo for product:', product.codeBarre);
      processedProduct.photo = product.photo; // Store base64 directly in database
      console.log('Photo stored successfully');
    }
    
    // Check if product exists by codeBarre
    const existingProduct = await this.getProductByCodeBarre(processedProduct.codeBarre);
    
    if (existingProduct) {
      // Update existing product
      console.log(`Product with codeBarre ${processedProduct.codeBarre} exists, updating...`);
      return this.updateProduct(existingProduct.recordid, processedProduct);
    } else {
      // Create new product
      console.log(`Product with codeBarre ${processedProduct.codeBarre} doesn't exist, creating...`);
      return this.createProduct(processedProduct);
    }
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.recordid, id));
  }

  async getFamilies(): Promise<string[]> {
    const familiesFromTable = await db.select({ name: families.name }).from(families).orderBy(families.name);
    return familiesFromTable.map(f => f.name);
  }

  // New Families CRUD methods
  async getAllFamilies(): Promise<Family[]> {
    return await db.select().from(families).orderBy(families.name);
  }

  async getFamilyById(id: number): Promise<Family | undefined> {
    const result = await db.select().from(families).where(eq(families.id, id));
    return result[0];
  }

  async createFamily(data: InsertFamily): Promise<Family> {
    const result = await db.insert(families).values(data).returning();
    return result[0];
  }

  async updateFamily(id: number, data: Partial<InsertFamily>): Promise<Family | undefined> {
    // Get the current family to check for name changes
    const currentFamily = await this.getFamilyById(id);
    if (!currentFamily) {
      return undefined;
    }

    // Update the family
    const result = await db.update(families)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(families.id, id))
      .returning();
    
    const updatedFamily = result[0];
    
    // If family name changed, update all products that use this family
    if (data.name && data.name !== currentFamily.name) {
      console.log(`Updating all products from family "${currentFamily.name}" to "${data.name}"`);
      
      const updateResult = await db.update(products)
        .set({ famille: data.name, updatedAt: new Date() })
        .where(eq(products.famille, currentFamily.name));
      
      console.log(`Updated ${updateResult.rowCount || 0} products with new family name`);
    }
    
    return updatedFamily;
  }

  async deleteFamily(id: number): Promise<boolean> {
    // Check if family is being used by products
    const productsUsingFamily = await db.select()
      .from(products)
      .where(eq(products.famille, 
        sql`(SELECT name FROM ${families} WHERE ${families.id} = ${id})`
      ))
      .limit(1);
    
    if (productsUsingFamily.length > 0) {
      throw new Error("Cannot delete family: it is being used by products");
    }

    const result = await db.delete(families).where(eq(families.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getFamilyProductsCount(id: number): Promise<number> {
    const family = await this.getFamilyById(id);
    if (!family) return 0;
    
    const result = await db.select({ count: sql`count(*)` })
      .from(products)
      .where(eq(products.famille, family.name));
    
    return Number(result[0].count);
  }

  // Helper function to ensure family exists
  async ensureFamilyExists(familyName: string | null): Promise<void> {
    if (!familyName || familyName.trim() === '') {
      return;
    }

    const trimmedName = familyName.trim();
    
    // Check if family already exists
    const existingFamily = await db.select()
      .from(families)
      .where(eq(families.name, trimmedName))
      .limit(1);
    
    if (existingFamily.length === 0) {
      // Family doesn't exist, create it
      try {
        await db.insert(families).values({ name: trimmedName });
        console.log(`Auto-created family: ${trimmedName}`);
      } catch (error: any) {
        // Ignore duplicate key errors (race condition)
        if (error.code !== '23505') {
          console.error('Error creating family:', error);
        }
      }
    }
  }

  // Admin function to populate families table from existing products
  async populateFamiliesFromProducts(): Promise<{ familiesAdded: number, families: string[] }> {
    console.log('Starting to populate families from products...');
    
    // Get all distinct families from products
    const distinctFamilies = await db.selectDistinct({ famille: products.famille })
      .from(products)
      .where(sql`famille IS NOT NULL AND famille != ''`);
    
    const familyNames = distinctFamilies.map(f => f.famille).filter(Boolean) as string[];
    console.log(`Found ${familyNames.length} distinct families in products:`, familyNames);
    
    let familiesAdded = 0;
    const addedFamilies: string[] = [];
    
    for (const familyName of familyNames) {
      const trimmedName = familyName.trim();
      
      // Check if family already exists in families table
      const existingFamily = await db.select()
        .from(families)
        .where(eq(families.name, trimmedName))
        .limit(1);
      
      if (existingFamily.length === 0) {
        try {
          await db.insert(families).values({ name: trimmedName });
          familiesAdded++;
          addedFamilies.push(trimmedName);
          console.log(`Added family to families table: ${trimmedName}`);
        } catch (error: any) {
          // Ignore duplicate key errors (race condition)
          if (error.code !== '23505') {
            console.error(`Error adding family ${trimmedName}:`, error);
          }
        }
      } else {
        console.log(`Family already exists: ${trimmedName}`);
      }
    }
    
    console.log(`Population complete. Added ${familiesAdded} new families.`);
    return { familiesAdded, families: addedFamilies };
  }

  async getCustomers(): Promise<(Customer & { totalOrders: number })[]> {
    const result = await db
      .select({
        id: customers.id,
        firstName: customers.firstName,
        lastName: customers.lastName,
        email: customers.email,
        phone: customers.phone,
        address: customers.address,
        city: customers.city,
        state: customers.state,
        zipCode: customers.zipCode,
        isRegistered: customers.isRegistered,
        createdAt: customers.createdAt,
        updatedAt: customers.updatedAt,
        totalOrders: sql<number>`COUNT(${orders.id})::int`
      })
      .from(customers)
      .leftJoin(orders, eq(customers.id, orders.customerId))
      .groupBy(
        customers.id,
        customers.firstName,
        customers.lastName,
        customers.email,
        customers.phone,
        customers.address,
        customers.city,
        customers.state,
        customers.zipCode,
        customers.isRegistered,
        customers.createdAt,
        customers.updatedAt
      )
      .orderBy(desc(customers.createdAt));
    
    return result as (Customer & { totalOrders: number })[];
  }

  async getCustomer(id: number): Promise<(Customer & { orders: (Order & { items: (OrderItem & { product: Product })[] })[] }) | undefined> {
    const customer = await db.query.customers.findFirst({
      where: eq(customers.id, id),
      with: {
        orders: {
          with: {
            items: {
              with: {
                product: true
              }
            }
          },
          orderBy: [desc(orders.createdAt)]
        }
      }
    });
    return customer;
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

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: SignupUser): Promise<User> {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .returning();
    return user;
  }

  async verifyUserPassword(email: string, password: string): Promise<User | null> {
    try {
      console.log('Attempting to verify password for email:', email);
      const user = await this.getUserByEmail(email);
      
      if (!user) {
        console.log('User not found for email:', email);
        return null;
      }
      
      console.log('User found, verifying password for:', email, 'isAdmin:', user.isAdmin);
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        console.log('Password mismatch for:', email);
        return null;
      }
      
      console.log('Password verification successful for:', email);
      return user;
    } catch (error) {
      console.error('Database error during password verification:', error);
      return null;
    }
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    // Don't allow password changes through this method - use updateUserPassword instead
    const { password, ...updateData } = userData as any;
    
    const [updated] = await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    
    if (!updated) {
      throw new Error('User not found');
    }
    
    return updated;
  }

  async updateUserPassword(id: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    const result = await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, id));
    
    // Check if user was found and updated
    if (result.rowCount === 0) {
      throw new Error('User not found');
    }
  }

  async deleteUser(id: string): Promise<void> {
    const result = await db.delete(users).where(eq(users.id, id));
    
    if (result.rowCount === 0) {
      throw new Error('User not found');
    }
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
    return await db.select().from(sliderImages)
      .where(eq(sliderImages.isActive, true))
      .orderBy(sliderImages.sortOrder, sliderImages.createdAt);
  }

  async getAllSliderImages(): Promise<SliderImage[]> {
    return await db.select().from(sliderImages)
      .orderBy(sliderImages.sortOrder, sliderImages.createdAt);
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

  // Product Reviews
  async getProductReviews(productId: number): Promise<ProductReview[]> {
    return await db.select()
      .from(productReviews)
      .where(eq(productReviews.productId, productId))
      .orderBy(desc(productReviews.createdAt));
  }

  async createProductReview(review: InsertProductReview): Promise<ProductReview> {
    // Check if user already reviewed this product (if email provided)
    if (review.customerEmail) {
      const existingReview = await db.select()
        .from(productReviews)
        .where(
          and(
            eq(productReviews.productId, review.productId),
            eq(productReviews.customerEmail, review.customerEmail)
          )
        )
        .limit(1);

      if (existingReview.length > 0) {
        throw new Error("You have already reviewed this product");
      }
    }

    const [newReview] = await db.insert(productReviews)
      .values(review)
      .returning();
    
    // Update product rating after adding review
    await this.updateProductRating(review.productId);
    
    return newReview;
  }

  async updateProductRating(productId: number): Promise<void> {
    // Calculate average rating and count
    const reviews = await db.select()
      .from(productReviews)
      .where(eq(productReviews.productId, productId));
    
    if (reviews.length === 0) {
      // No reviews, set rating to null
      await db.update(products)
        .set({
          rating: null,
          ratingCount: 0
        })
        .where(eq(products.recordid, productId));
    } else {
      // Calculate average rating
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = Math.round((totalRating / reviews.length) * 10) / 10; // Round to 1 decimal
      
      await db.update(products)
        .set({
          rating: averageRating,
          ratingCount: reviews.length
        })
        .where(eq(products.recordid, productId));
    }
  }
}

export const storage = new DatabaseStorage();
