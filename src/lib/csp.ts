
import config from '@/config/environment';

export interface CSPDirectives {
  'default-src': string[];
  'script-src': string[];
  'style-src': string[];
  'img-src': string[];
  'font-src': string[];
  'connect-src': string[];
  'frame-src': string[];
  'object-src': string[];
  'base-uri': string[];
  'form-action': string[];
  'frame-ancestors': string[];
  'upgrade-insecure-requests': boolean;
}

export const getCSPDirectives = (): CSPDirectives => {
  const isDev = config.isDevelopment;
  const domain = config.app.domain;
  const supabaseUrl = config.supabase.url;
  
  return {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      ...(isDev ? ["'unsafe-eval'", "'unsafe-inline'"] : ["'unsafe-inline'"]),
      'https://unpkg.com',
      'https://cdn.jsdelivr.net'
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'",
      'https://fonts.googleapis.com'
    ],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https:',
      supabaseUrl
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
      'data:'
    ],
    'connect-src': [
      "'self'",
      supabaseUrl,
      'https://api.openai.com',
      ...(isDev ? ['ws://localhost:*', 'http://localhost:*'] : [])
    ],
    'frame-src': [
      "'self'"
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': config.isProduction
  };
};

export const generateCSPHeader = (): string => {
  const directives = getCSPDirectives();
  
  return Object.entries(directives)
    .map(([key, value]) => {
      if (key === 'upgrade-insecure-requests') {
        return value ? 'upgrade-insecure-requests' : '';
      }
      return `${key} ${Array.isArray(value) ? value.join(' ') : value}`;
    })
    .filter(Boolean)
    .join('; ');
};

export const setSecurityHeaders = () => {
  if (!config.security.enableCSP) return;
  
  const cspHeader = generateCSPHeader();
  
  // Set CSP header via meta tag (for client-side applications)
  const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (existingCSP) {
    existingCSP.setAttribute('content', cspHeader);
  } else {
    const meta = document.createElement('meta');
    meta.setAttribute('http-equiv', 'Content-Security-Policy');
    meta.setAttribute('content', cspHeader);
    document.head.appendChild(meta);
  }
  
  // Set additional security headers via meta tags
  if (config.security.enableXSSProtection) {
    const xssProtection = document.createElement('meta');
    xssProtection.setAttribute('http-equiv', 'X-XSS-Protection');
    xssProtection.setAttribute('content', '1; mode=block');
    document.head.appendChild(xssProtection);
  }
  
  if (config.security.enableFrameOptions) {
    const frameOptions = document.createElement('meta');
    frameOptions.setAttribute('http-equiv', 'X-Frame-Options');
    frameOptions.setAttribute('content', 'DENY');
    document.head.appendChild(frameOptions);
  }
  
  console.log('🔒 Security headers applied:', {
    csp: config.security.enableCSP,
    xssProtection: config.security.enableXSSProtection,
    frameOptions: config.security.enableFrameOptions
  });
};
