import session from "express-session";
import type { Express, RequestHandler } from "express";
import MemoryStore from "memorystore";
import { verifyJWTToken } from "./jwt-utils";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const MemStore = MemoryStore(session);
  const sessionStore = new MemStore({
    checkPeriod: 86400000, // Prune expired entries every 24h
  });

  // Handle session store errors
  sessionStore.on('error', (error) => {
    console.error('Session store error:', error);
  });

  return session({
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Enable secure cookies in production
      maxAge: sessionTtl,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // SameSite none for cross-origin in production
      path: '/',
    },
    rolling: true,
    name: 'sessionid'
  });
}

export function setupAuth(app: Express) {
  // Add CORS middleware with production-compatible settings
  app.use((req, res, next) => {
    // Handle production domains (.replit.app domains and custom domains)
    const origin = req.headers.origin;
    const allowedOrigins = [
      'http://localhost:5000',
      'https://localhost:5000',
      /https:\/\/.*\.replit\.app$/,
      /https:\/\/.*\.replit\.dev$/,
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    // Check if origin is allowed
    const isAllowedOrigin = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin || '');
      }
      return false;
    });
    
    if (isAllowedOrigin || !origin) {
      res.header('Access-Control-Allow-Origin', origin || '*');
    }
    
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    
    next();
  });
  
  app.use(getSession());
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyJWTToken(token);
    
    // Store user info in request for use in routes
    (req as any).user = {
      userId: decoded.userId,
      isAdmin: decoded.isAdmin,
      role: decoded.role,
      email: decoded.email
    };
    return next();
  } catch (error: any) {
    return res.status(401).json({ message: error.message || "Unauthorized" });
  }
};

export const isAdmin: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyJWTToken(token);
    
    if (!decoded.isAdmin && decoded.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    (req as any).user = {
      userId: decoded.userId,
      isAdmin: decoded.isAdmin,
      role: decoded.role,
      email: decoded.email
    };
    return next();
  } catch (error: any) {
    return res.status(403).json({ message: "Admin access required" });
  }
};

// Extend session interface
declare module "express-session" {
  interface SessionData {
    userId: string;
    isAdmin: boolean;
  }
}