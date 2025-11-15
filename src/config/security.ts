/**
 * Security Configuration
 *
 * IMPORTANT: NO WILDCARDS ALLOWED
 * - Always specify exact origins, never use '*'
 * - Add specific domains only, no pattern matching
 * - Update this file when adding new trusted domains
 */

export const SECURITY_CONFIG = {
  // Allowed CORS origins - NO WILDCARDS
  allowedOrigins: [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000',
    // Production domains - update these with your actual domains
    'https://wallspie.com',
    'https://www.wallspie.com',
    process.env.NEXT_PUBLIC_SITE_URL,
  ].filter((origin): origin is string => typeof origin === 'string' && origin.length > 0),

  // Allowed API endpoints - NO WILDCARDS
  allowedApiEndpoints: [
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', ''),
  ].filter((endpoint): endpoint is string => typeof endpoint === 'string' && endpoint.length > 0),

  // Allowed image CDN domains - NO WILDCARDS
  allowedImageDomains: [
    // 'https://images.unsplash.com',
    'https://res.cloudinary.com',
    // 'https://cdn.pixabay.com',
    // 'https://images.pexels.com',
    // Add your image CDN domains here (specific domains only)
  ],

  // Allowed script sources - NO WILDCARDS
  allowedScriptSources: [
    "'self'",
    "'unsafe-inline'", // Required for Next.js
    "'unsafe-eval'",   // Required for Next.js development
    'https://pagead2.googlesyndication.com',
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
  ],

  // Allowed style sources - NO WILDCARDS
  allowedStyleSources: [
    "'self'",
    "'unsafe-inline'", // Required for styled-components/CSS-in-JS
    'https://fonts.googleapis.com',
  ],

  // Allowed font sources - NO WILDCARDS
  allowedFontSources: [
    "'self'",
    'https://fonts.gstatic.com',
  ],

  // Allowed frame sources - NO WILDCARDS
  allowedFrameSources: [
    "'self'",
    'https://www.google.com',
    'https://www.youtube.com',
    'https://pagead2.googlesyndication.com',
  ],

  // Rate limiting configuration
  rateLimit: {
    windowMs: 60 * 1000,        // 1 minute
    maxRequests: 100,            // Maximum requests per window
    maxRequestsPerIp: 100,       // Maximum requests per IP
    maxRequestsAuth: 200,        // Higher limit for authenticated users
    maxRequestsApi: 50,          // API endpoints limit
    maxRequestsLogin: 5,         // Login attempts limit
    maxRequestsRegister: 3,      // Registration attempts limit
  },

  // Security headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  },

  // HSTS configuration (production only)
  hsts: {
    maxAge: 31536000,           // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  },
} as const;

/**
 * Check if an origin is allowed
 * @param origin - The origin to check
 * @returns true if origin is in the allowed list
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return SECURITY_CONFIG.allowedOrigins.includes(origin);
}

/**
 * Get Content Security Policy header value
 * @returns CSP header string
 */
export function getCSPHeader(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
  const apiDomain = apiUrl.replace('/api/v1', '');

  return `
    default-src 'self';
    script-src ${SECURITY_CONFIG.allowedScriptSources.join(' ')};
    style-src ${SECURITY_CONFIG.allowedStyleSources.join(' ')};
    img-src 'self' data: blob: ${[...SECURITY_CONFIG.allowedImageDomains, apiDomain].join(' ')};
    font-src ${SECURITY_CONFIG.allowedFontSources.join(' ')};
    connect-src 'self' ${[apiUrl, ...SECURITY_CONFIG.allowedApiEndpoints].join(' ')} https://pagead2.googlesyndication.com https://www.google-analytics.com;
    frame-src ${SECURITY_CONFIG.allowedFrameSources.join(' ')};
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();
}

/**
 * Get CORS headers for allowed origin
 * @param origin - The request origin
 * @returns CORS headers object or null if origin not allowed
 */
export function getCORSHeaders(origin: string | null): Record<string, string> | null {
  if (!isOriginAllowed(origin)) {
    return null;
  }

  return {
    'Access-Control-Allow-Origin': origin!,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

// Export for use in middleware and API routes
export default SECURITY_CONFIG;
