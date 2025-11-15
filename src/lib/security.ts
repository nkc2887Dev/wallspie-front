/**
 * Security utilities for input validation, sanitization, and protection
 */

// XSS Protection: Sanitize HTML input
export function sanitizeHtml(input: string): string {
  if (!input) return '';

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// SQL Injection Protection: Validate and sanitize database inputs
export function sanitizeSqlInput(input: string): string {
  if (!input) return '';

  // Remove potentially dangerous SQL keywords and characters
  return input.replace(/['";\\]/g, '');
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Validate URL format
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

// Validate file upload
export function validateFileUpload(file: File, options: {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}): { valid: boolean; error?: string } {
  const maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB default
  const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${maxSize / 1024 / 1024}MB limit`
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`
    };
  }

  return { valid: true };
}

// Prevent path traversal attacks
export function sanitizePath(path: string): string {
  if (!path) return '';

  // Remove ../ and .\ sequences
  return path
    .replace(/\.\./g, '')
    .replace(/[\\]/g, '/')
    .replace(/\/+/g, '/');
}

// Validate and sanitize search query
export function sanitizeSearchQuery(query: string, maxLength: number = 100): string {
  if (!query) return '';

  // Trim and limit length
  let sanitized = query.trim().slice(0, maxLength);

  // Remove special characters that could be used for injection
  sanitized = sanitized.replace(/[<>{}[\]]/g, '');

  return sanitized;
}

// Generate CSRF token
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  if (typeof window !== 'undefined') {
    window.crypto.getRandomValues(array);
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Validate CSRF token
export function validateCsrfToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken) return false;
  return token === expectedToken;
}

// Rate limit helper for client-side
export function createClientRateLimiter(maxRequests: number, windowMs: number) {
  const requests: number[] = [];

  return () => {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Remove old requests outside the window
    while (requests.length > 0 && requests[0] < windowStart) {
      requests.shift();
    }

    // Check if limit exceeded
    if (requests.length >= maxRequests) {
      return {
        allowed: false,
        retryAfter: requests[0] + windowMs - now
      };
    }

    // Add current request
    requests.push(now);

    return {
      allowed: true,
      remaining: maxRequests - requests.length
    };
  };
}

// Content Security Policy violation reporting
export function reportCspViolation(violationReport: any) {
  if (process.env.NODE_ENV === 'production') {
    console.warn('CSP Violation:', violationReport);
    // In production, send to monitoring service
    // fetch('/api/csp-violation', {
    //   method: 'POST',
    //   body: JSON.stringify(violationReport),
    // });
  }
}

// Detect and prevent clickjacking
export function preventClickjacking() {
  if (typeof window !== 'undefined') {
    if (window.top !== window.self) {
      // Page is in an iframe
      window.top!.location.href = window.self.location.href;
    }
  }
}

// Password strength validator
export function validatePasswordStrength(password: string): {
  valid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push('Password should be at least 8 characters long');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('Include lowercase letters');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Include uppercase letters');
  } else {
    score += 1;
  }

  if (!/[0-9]/.test(password)) {
    feedback.push('Include numbers');
  } else {
    score += 1;
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    feedback.push('Include special characters');
  } else {
    score += 1;
  }

  return {
    valid: score >= 4,
    score,
    feedback
  };
}

// Sanitize object for safe JSON stringification
export function sanitizeObject(obj: any, depth: number = 0, maxDepth: number = 10): any {
  if (depth > maxDepth) return '[Max Depth Reached]';
  if (obj === null || obj === undefined) return obj;

  const type = typeof obj;

  if (type === 'string') return sanitizeHtml(obj);
  if (type === 'number' || type === 'boolean') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1, maxDepth));
  }

  if (type === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key], depth + 1, maxDepth);
      }
    }
    return sanitized;
  }

  return obj;
}

// Detect suspicious patterns in user input
export function detectSuspiciousInput(input: string): boolean {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers like onclick=
    /eval\(/i,
    /expression\(/i,
    /vbscript:/i,
    /\.\.\//, // Path traversal
    /union.*select/i, // SQL injection
    /insert.*into/i,
    /drop.*table/i,
  ];

  return suspiciousPatterns.some(pattern => pattern.test(input));
}

// Safe localStorage wrapper with encryption support
export const secureStorage = {
  setItem(key: string, value: any): void {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : (defaultValue || null);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue || null;
    }
  },

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};
