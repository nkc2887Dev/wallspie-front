import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SECURITY_CONFIG, isOriginAllowed, getCORSHeaders, getCSPHeader } from '@/config/security';

// Rate limiting storage (in-memory for development, use Redis for production)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimit.entries()) {
    if (now > value.resetTime) {
      rateLimit.delete(key);
    }
  }
}, 5 * 60 * 1000);

function getRateLimitKey(request: NextRequest): string {
  // Use IP address as key (with X-Forwarded-For support for proxies)
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] :
             request.headers.get('x-real-ip') ||
             'unknown';

  // Include path for more granular control
  const path = new URL(request.url).pathname;
  return `${ip}:${path}`;
}

function checkRateLimit(key: string, maxRequests: number = SECURITY_CONFIG.rateLimit.maxRequests): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimit.get(key);
  const windowMs = SECURITY_CONFIG.rateLimit.windowMs;

  if (!record || now > record.resetTime) {
    // Create new rate limit window
    const resetTime = now + windowMs;
    rateLimit.set(key, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }

  if (record.count >= maxRequests) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  // Increment count
  record.count++;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime
  };
}

export function middleware(request: NextRequest) {
  // Skip rate limiting for static files
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/static') ||
    request.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // CORS - Check origin (NO WILDCARDS)
  const origin = request.headers.get('origin');
  const originAllowed = isOriginAllowed(origin);

  // Handle preflight requests first
  if (request.method === 'OPTIONS') {
    const corsHeaders = getCORSHeaders(origin);
    if (corsHeaders) {
      return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
      });
    } else {
      return new NextResponse('Origin not allowed', { status: 403 });
    }
  }

  // Determine rate limit based on path
  const path = request.nextUrl.pathname;
  let maxRequests: number = SECURITY_CONFIG.rateLimit.maxRequests;

  if (path.startsWith('/api')) {
    maxRequests = SECURITY_CONFIG.rateLimit.maxRequestsApi;
  } else if (path === '/login') {
    maxRequests = SECURITY_CONFIG.rateLimit.maxRequestsLogin;
  } else if (path === '/register') {
    maxRequests = SECURITY_CONFIG.rateLimit.maxRequestsRegister;
  }

  // Rate limiting
  const rateLimitKey = getRateLimitKey(request);
  const { allowed, remaining, resetTime } = checkRateLimit(rateLimitKey, maxRequests);

  // Create response
  const response = allowed ? NextResponse.next() : new NextResponse(
    JSON.stringify({
      error: 'Too many requests',
      retryAfter: new Date(resetTime).toISOString()
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  // CORS headers - Only for allowed origins (NO WILDCARDS)
  if (originAllowed) {
    const corsHeaders = getCORSHeaders(origin);
    if (corsHeaders) {
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }
  }

  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString());

  // Security headers - NO WILDCARDS
  Object.entries(SECURITY_CONFIG.headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // HSTS (HTTP Strict Transport Security) - force HTTPS
  if (process.env.NODE_ENV === 'production') {
    const { maxAge, includeSubDomains, preload } = SECURITY_CONFIG.hsts;
    let hstsValue = `max-age=${maxAge}`;
    if (includeSubDomains) hstsValue += '; includeSubDomains';
    if (preload) hstsValue += '; preload';
    response.headers.set('Strict-Transport-Security', hstsValue);
  }

  // Content Security Policy - NO WILDCARDS
  response.headers.set('Content-Security-Policy', getCSPHeader());

  return response;
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
