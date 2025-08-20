import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { insertProductSchema, insertCustomerSchema, insertOrderSchema, insertSiteSettingsSchema, insertSliderImageSchema, insertProductReviewSchema, signupUserSchema, loginUserSchema } from "@shared/schema";
import { z } from "zod";
import { bulkImportExportService } from "./bulk-import-export";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // Auth routes
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const validatedData = signupUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const user = await storage.createUser(validatedData);
      
      // Create session
      req.session.userId = user.id;
      req.session.isAdmin = user.isAdmin || false;
      
      // Save session explicitly
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Session creation failed" });
        }
        
        // Don't return password in response
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", details: error.errors });
      }
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      console.log('Login attempt for:', req.body.email);
      const validatedData = loginUserSchema.parse(req.body);
      
      const user = await storage.verifyUserPassword(validatedData.email, validatedData.password);
      if (!user) {
        console.log('Login failed - invalid credentials for:', validatedData.email);
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Create a simple auth token to return in response (for localStorage storage)
      const authToken = Buffer.from(JSON.stringify({ 
        userId: user.id, 
        isAdmin: user.isAdmin || false,
        expires: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
      })).toString('base64');
      
      console.log('Login success - token created for user:', user.id, 'isAdmin:', user.isAdmin, 'environment:', process.env.NODE_ENV || 'development');
      
      // Don't return password in response, but include auth token
      const { password, ...userWithoutPassword } = user;
      res.json({ ...userWithoutPassword, authToken });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log('Login validation error:', error.errors);
        return res.status(400).json({ message: "Invalid login data", details: error.errors });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.get('/api/auth/user', async (req: Request, res: Response) => {
    console.log('Auth check - headers:', req.headers.authorization);
    
    // Check for Authorization header with Bearer token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Auth check - no bearer token');
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      if (decoded.expires <= Date.now()) {
        console.log('Auth check - token expired');
        return res.status(401).json({ message: "Token expired" });
      }
      
      console.log('Auth check - token valid for user:', decoded.userId);
      
      const user = await storage.getUser(decoded.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Auth check error:", error);
      return res.status(401).json({ message: "Invalid token" });
    }
  });

  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    // No server-side session cleanup needed for localStorage tokens
    // Client will remove the token from localStorage
    res.json({ message: "Logged out successfully" });
  });

  // Debug endpoint for troubleshooting production auth issues
  app.get("/api/auth/debug", async (req: Request, res: Response) => {
    const debugInfo: any = {
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      origin: req.headers.origin,
      userAgent: req.headers['user-agent'],
      authHeader: req.headers.authorization ? 'Present' : 'Missing',
      tokenLength: req.headers.authorization ? req.headers.authorization.length : 0,
      database: {
        url: process.env.DATABASE_URL ? 'Connected' : 'Missing',
        ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? 'Required' : 'Not required'
      },
      session: {
        secret: process.env.SESSION_SECRET ? 'Set' : 'Missing'
      }
    };
    
    // Try to validate token if provided
    if (req.headers.authorization?.startsWith('Bearer ')) {
      const token = req.headers.authorization.substring(7);
      try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
        debugInfo.token = {
          valid: 'Parsed successfully',
          userId: decoded.userId ? 'Present' : 'Missing',
          isAdmin: decoded.isAdmin || false,
          expires: new Date(decoded.expires).toISOString(),
          expired: decoded.expires <= Date.now()
        };
      } catch (error: any) {
        debugInfo.token = {
          valid: 'Failed to parse',
          error: error?.message || 'Unknown error'
        };
      }
    }
    
    res.json(debugInfo);
  });

  // Admin creation endpoint for production setup
  app.post("/api/auth/create-admin", async (req: Request, res: Response) => {
    try {
      // Only allow this in development or if explicitly requested
      if (process.env.NODE_ENV === 'production' && req.body.confirmProduction !== 'yes') {
        return res.status(403).json({ 
          message: "Admin creation in production requires confirmation",
          instructions: "Add 'confirmProduction: yes' to request body"
        });
      }

      const adminEmail = 'boulouza.nacer@gmail.com';
      const adminPassword = '123456';

      // Check if admin already exists
      const existingUser = await storage.getUserByEmail(adminEmail);
      if (existingUser) {
        return res.status(400).json({ 
          message: "Admin user already exists",
          email: existingUser.email,
          isAdmin: existingUser.isAdmin
        });
      }

      // Create admin user
      const adminUser = await storage.createUser({
        email: adminEmail,
        password: adminPassword,
        firstName: 'Nacer',
        lastName: 'Boulouza'
      });

      // Update user to have admin privileges using direct SQL
      const { neon } = await import('@neondatabase/serverless');
      const sql = neon(process.env.DATABASE_URL!);
      await sql`
        UPDATE users 
        SET is_admin = true, updated_at = NOW()
        WHERE email = ${adminEmail}
      `;

      console.log('Admin user created via API:', adminUser.email);

      res.status(201).json({ 
        message: "Admin user created successfully",
        email: adminUser.email,
        isAdmin: true
      });
    } catch (error) {
      console.error("Error creating admin user:", error);
      res.status(500).json({ message: "Failed to create admin user" });
    }
  });

  // Admin privilege update endpoint 
  app.get("/api/auth/fix-admin-production", async (req: Request, res: Response) => {
    try {
      const adminEmail = 'boulouza.nacer@gmail.com';
      
      // Check current status
      const existingUser = await storage.getUserByEmail(adminEmail);
      if (!existingUser) {
        return res.status(404).json({ message: "Admin user not found" });
      }
      
      // Update using storage interface first
      const { neon } = await import('@neondatabase/serverless');
      const sql = neon(process.env.DATABASE_URL!);
      
      console.log('Production admin fix - before update:', {
        email: existingUser.email,
        isAdmin: existingUser.isAdmin,
        environment: process.env.NODE_ENV
      });
      
      // Direct SQL update
      const result = await sql`
        UPDATE users 
        SET is_admin = true, updated_at = NOW()
        WHERE email = ${adminEmail}
        RETURNING id, email, first_name, last_name, is_admin, updated_at
      `;
      
      console.log('Production admin fix - SQL result:', result[0]);
      
      // Verify the update worked
      const verifyUser = await storage.getUserByEmail(adminEmail);
      console.log('Production admin fix - verification:', {
        email: verifyUser?.email,
        isAdmin: verifyUser?.isAdmin
      });
      
      res.json({ 
        message: "Production admin fix completed",
        before: { isAdmin: existingUser.isAdmin },
        sqlUpdate: result[0],
        after: { isAdmin: verifyUser?.isAdmin },
        environment: process.env.NODE_ENV
      });
      
    } catch (error) {
      console.error("Production admin fix error:", error);
      res.status(500).json({ 
        message: "Failed to fix admin",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Admin-only routes
  app.get("/api/admin/*", isAdmin);
  app.post("/api/admin/*", isAdmin);
  app.put("/api/admin/*", isAdmin);
  app.delete("/api/admin/*", isAdmin);

  // Products API
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      const filters = {
        famille: req.query.famille as string,
        search: req.query.search as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        inStock: req.query.inStock === 'true',
        promo: req.query.promo === 'true'
      };

      let products = await storage.getProducts(filters);
      
      // Limit results if specified
      if (req.query.limit) {
        const limitNum = parseInt(req.query.limit as string);
        products = products.slice(0, limitNum);
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req: Request, res: Response) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid product data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, validatedData);
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid product data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  app.get("/api/families", async (req: Request, res: Response) => {
    try {
      const families = await storage.getFamilies();
      res.json(families);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch families" });
    }
  });

  // Object storage routes for product image uploads
  app.post("/api/objects/upload", isAuthenticated, async (req, res) => {
    try {
      const bucketName = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
      if (!bucketName) {
        return res.status(500).json({ error: "Object storage not configured" });
      }

      // Use public directory for product photos instead of private uploads
      const photoId = require("crypto").randomUUID();
      const publicPath = `public/products/${photoId}`;
      
      // Create a signed URL for uploading to the public directory
      const request = {
        bucket_name: bucketName,
        object_name: publicPath,
        method: "PUT",
        expires_at: new Date(Date.now() + 900 * 1000).toISOString(), // 15 minutes
      };
      
      const response = await fetch("http://127.0.0.1:1106/object-storage/signed-object-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get signed URL: ${response.status}`);
      }
      
      const { signed_url: uploadURL } = await response.json();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.put("/api/products/:id/photo", isAuthenticated, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { photoURL } = req.body;

      if (!photoURL) {
        return res.status(400).json({ error: "Photo URL is required" });
      }

      console.log("Updating product photo for product", productId, "with URL:", photoURL);

      // Extract the object path from the GCS URL for the database storage
      // photoURL format: https://storage.googleapis.com/bucket-name/public/products/file-id
      let normalizedPath;
      
      try {
        const url = new URL(photoURL);
        const bucketName = url.pathname.split('/')[1]; // Extract bucket name
        const objectPath = url.pathname.substring(bucketName.length + 2); // Remove /bucket-name/ prefix
        
        // For public photos, store direct GCS URL for easier access
        if (objectPath.startsWith('public/products/')) {
          normalizedPath = photoURL; // Store the full GCS URL directly
          console.log("Using direct GCS URL for public photo:", normalizedPath);
        } else {
          // Fallback for private uploads
          normalizedPath = `/objects/${objectPath}`;
          console.log("Extracted object path:", normalizedPath);
        }
      } catch (urlError) {
        console.error("Error parsing photo URL:", urlError);
        return res.status(400).json({ error: "Invalid photo URL format" });
      }
      
      // No ACL policy needed for public photos - they're directly accessible
      
      // Update the product with the new photo path
      const products = await storage.getProducts();
      const product = products.find(p => p.recordid === productId);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      console.log("Updating product in database with photo path:", normalizedPath);
      const updatedProduct = await storage.updateProduct(productId, {
        ...product,
        photo: normalizedPath,
      });
      
      console.log("Product updated successfully:", updatedProduct?.recordid);

      res.json({ 
        success: true, 
        objectPath: normalizedPath,
        message: "Product photo updated successfully"
      });
    } catch (error) {
      console.error("Error updating product photo:", error);
      res.status(500).json({ error: "Failed to update product photo" });
    }
  });

  // Serve uploaded objects - use object storage service
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectPath = req.params.objectPath;
      console.log("Serving object with path:", objectPath);
      
      // Use the ObjectStorageService to handle the file serving
      const { ObjectStorageService } = await import("./objectStorage");
      const { ObjectPermission } = await import("./objectAcl");
      const objectStorageService = new ObjectStorageService();
      
      // Try to get the object file and serve it
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      
      // Check if the object is publicly accessible
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        requestedPermission: ObjectPermission.READ,
      });
      
      if (!canAccess) {
        // If not accessible via ACL, try direct GCS URL as fallback
        const bucketName = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
        if (bucketName && objectPath.startsWith('.private/uploads/')) {
          const directUrl = `https://storage.googleapis.com/${bucketName}/${objectPath}`;
          console.log("Fallback: Redirecting to direct GCS URL:", directUrl);
          
          res.set({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
          });
          
          return res.redirect(302, directUrl);
        }
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Serve the file through object storage service
      await objectStorageService.downloadObject(objectFile, res);
      
    } catch (error) {
      console.error("Error serving object:", error);
      
      // Fallback for .private/uploads/ files
      if (req.params.objectPath.startsWith('.private/uploads/')) {
        const bucketName = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
        if (bucketName) {
          const directUrl = `https://storage.googleapis.com/${bucketName}/${req.params.objectPath}`;
          console.log("Error fallback: Redirecting to direct GCS URL:", directUrl);
          
          res.set({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
          });
          
          return res.redirect(302, directUrl);
        }
      }
      
      res.status(404).json({ error: "Object not found" });
    }
  });

  // Orders API
  app.get("/api/orders", async (req: Request, res: Response) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      const { customer, items, ...orderData } = req.body;

      // Create or find customer
      let customerId = null;
      if (customer) {
        const validatedCustomer = insertCustomerSchema.parse(customer);
        
        if (customer.email) {
          const existingCustomer = await storage.getCustomerByEmail(customer.email);
          if (existingCustomer) {
            customerId = existingCustomer.id;
          } else {
            const newCustomer = await storage.createCustomer(validatedCustomer);
            customerId = newCustomer.id;
          }
        } else {
          const newCustomer = await storage.createCustomer(validatedCustomer);
          customerId = newCustomer.id;
        }
      }

      const validatedOrder = insertOrderSchema.parse({
        ...orderData,
        customerId
      });

      const order = await storage.createOrder(validatedOrder, items);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid order data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.put("/api/orders/:id/status", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      
      const order = await storage.updateOrderStatus(id, status);
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  // Customers API
  app.get("/api/customers", async (req: Request, res: Response) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer" });
    }
  });

  // Stats API
  app.get("/api/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Site Settings API
  app.get("/api/settings", async (req: Request, res: Response) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.post("/api/settings", async (req: Request, res: Response) => {
    try {
      const validatedData = insertSiteSettingsSchema.parse(req.body);
      const settings = await storage.updateSiteSettings(validatedData);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Slider Images API
  app.get("/api/slider-images", async (req: Request, res: Response) => {
    try {
      const images = await storage.getSliderImages();
      res.json(images);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch slider images" });
    }
  });

  app.get("/api/admin/slider-images", async (req: Request, res: Response) => {
    try {
      const images = await storage.getAllSliderImages();
      res.json(images);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch all slider images" });
    }
  });

  app.get("/api/slider-images/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const image = await storage.getSliderImage(id);
      
      if (!image) {
        return res.status(404).json({ error: "Slider image not found" });
      }
      
      res.json(image);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch slider image" });
    }
  });

  app.post("/api/slider-images", async (req: Request, res: Response) => {
    try {
      const validatedData = insertSliderImageSchema.parse(req.body);
      const image = await storage.createSliderImage(validatedData);
      res.status(201).json(image);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create slider image" });
    }
  });

  app.put("/api/slider-images/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSliderImageSchema.partial().parse(req.body);
      const image = await storage.updateSliderImage(id, validatedData);
      res.json(image);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update slider image" });
    }
  });

  app.delete("/api/slider-images/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSliderImage(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete slider image" });
    }
  });

  // Configure multer for file uploads - support both CSV and Excel files
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel.sheet.macroEnabled.12'
      ];
      
      const allowedExtensions = ['.csv', '.xls', '.xlsx'];
      const hasValidExtension = allowedExtensions.some(ext => 
        file.originalname.toLowerCase().endsWith(ext)
      );
      
      if (allowedTypes.includes(file.mimetype) || hasValidExtension) {
        cb(null, true);
      } else {
        cb(new Error('Only CSV and Excel files (.csv, .xls, .xlsx) are allowed'));
      }
    }
  });

  // Bulk Import/Export API
  app.post("/api/products/export", async (req: Request, res: Response) => {
    try {
      const result = await bulkImportExportService.exportProductsToCSV();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to export products" });
    }
  });

  app.post("/api/products/import", upload.single('csvFile'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No CSV file uploaded" });
      }

      const result = await bulkImportExportService.importProductsFromCSV(req.file.buffer);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to import products" });
    }
  });

  app.get("/api/products/export/:filename", async (req: Request, res: Response) => {
    try {
      const filename = req.params.filename;
      const filepath = await bulkImportExportService.getExportFilePath(filename);
      
      if (!filepath) {
        return res.status(404).json({ error: "File not found or expired" });
      }

      res.download(filepath, filename, (error) => {
        if (error) {
          console.error("Download error:", error);
          if (!res.headersSent) {
            res.status(500).json({ error: "Failed to download file" });
          }
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to download export file" });
    }
  });

  app.post("/api/products/template", async (req: Request, res: Response) => {
    try {
      const result = await bulkImportExportService.generateCSVTemplate();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate template" });
    }
  });

  // Product Reviews API
  app.get("/api/reviews/:productId", async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.productId);
      const reviews = await storage.getProductReviews(productId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", async (req: Request, res: Response) => {
    try {
      const validatedData = insertProductReviewSchema.parse(req.body);
      const review = await storage.createProductReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid review data", details: error.errors });
      }
      if (error instanceof Error && error.message === "You have already reviewed this product") {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
