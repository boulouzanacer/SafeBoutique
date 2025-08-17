import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertCustomerSchema, insertOrderSchema, insertSiteSettingsSchema, insertSliderImageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

      const products = await storage.getProducts(filters);
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

  const httpServer = createServer(app);
  return httpServer;
}
