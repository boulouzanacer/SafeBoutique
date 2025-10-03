import jwt from 'jsonwebtoken';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = '7d'; // 7 days

export interface JWTPayload {
  userId: string;
  isAdmin: boolean;
  role: string;
  email: string;
}

/**
 * Generate a secure signed JWT token
 */
export function generateJWTToken(payload: JWTPayload): string {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      algorithm: 'HS256',
      issuer: 'safesoft-app',
      audience: 'safesoft-users'
    });
  } catch (error) {
    console.error('Error generating JWT token:', error);
    throw new Error('Failed to generate authentication token');
  }
}

/**
 * Verify and decode a JWT token
 */
export function verifyJWTToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'safesoft-app',
      audience: 'safesoft-users'
    }) as jwt.JwtPayload;

    // Ensure required fields are present
    if (!decoded.userId || typeof decoded.isAdmin !== 'boolean' || !decoded.role || !decoded.email) {
      throw new Error('Invalid token payload structure');
    }

    return {
      userId: decoded.userId,
      isAdmin: decoded.isAdmin,
      role: decoded.role,
      email: decoded.email
    };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid authentication token');
    } else if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Authentication token has expired');
    } else if (error instanceof jwt.NotBeforeError) {
      throw new Error('Authentication token not yet valid');
    } else {
      console.error('JWT verification error:', error);
      throw new Error('Authentication failed');
    }
  }
}

/**
 * Extract token from Authorization header
 */
export function extractBearerToken(authHeader: string | undefined): string {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }
  return authHeader.substring(7);
}

/**
 * Verify if token is valid and not expired (without full decode)
 */
export function isValidJWTToken(token: string): boolean {
  try {
    verifyJWTToken(token);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a token for user login response
 */
export function generateUserToken(user: { id: string; email: string; isAdmin?: boolean | null; role?: string | null }): string {
  const payload: JWTPayload = {
    userId: user.id,
    isAdmin: Boolean(user.isAdmin),
    role: user.role || 'user',
    email: user.email
  };
  
  return generateJWTToken(payload);
}