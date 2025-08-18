import session from "express-session";
import type { Express, RequestHandler } from "express";
import MemoryStore from "memorystore";

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
      secure: false,
      maxAge: sessionTtl,
      sameSite: 'lax',
      path: '/',
    },
    rolling: true,
    name: 'sessionid'
  });
}

export function setupAuth(app: Express) {
  // Add CORS middleware specifically for session handling
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Cookie');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    
    next();
  });
  
  app.use(getSession());
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  console.log('Auth check - cookies received:', req.headers.cookie);
  
  // First try session authentication
  if (req.session?.userId) {
    console.log('Auth check - session valid:', req.session.userId);
    return next();
  }
  
  // Fallback to token authentication
  const authToken = req.cookies?.auth_token;
  if (authToken) {
    try {
      const decoded = JSON.parse(Buffer.from(authToken, 'base64').toString());
      if (decoded.expires > Date.now()) {
        console.log('Auth check - token valid:', decoded.userId);
        // Set session data for consistency
        req.session.userId = decoded.userId;
        req.session.isAdmin = decoded.isAdmin;
        return next();
      }
    } catch (e) {
      console.log('Auth check - invalid token');
    }
  }
  
  console.log('Auth check - unauthorized');
  return res.status(401).json({ message: "Unauthorized" });
};

export const isAdmin: RequestHandler = async (req, res, next) => {
  // Check session first
  if (req.session?.userId && req.session?.isAdmin) {
    return next();
  }
  
  // Fallback to token
  const authToken = req.cookies?.auth_token;
  if (authToken) {
    try {
      const decoded = JSON.parse(Buffer.from(authToken, 'base64').toString());
      if (decoded.expires > Date.now() && decoded.isAdmin) {
        return next();
      }
    } catch (e) {
      // Invalid token
    }
  }
  
  return res.status(403).json({ message: "Admin access required" });
};

// Extend session interface
declare module "express-session" {
  interface SessionData {
    userId: string;
    isAdmin: boolean;
  }
}