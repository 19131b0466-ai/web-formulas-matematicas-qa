import { UAParser } from 'ua-parser-js';

export type RequestGeo = {
  countryCode: string | null;
  countryName: string | null;
  region: string | null;
  city: string | null;
  latitude: string | null;
  longitude: string | null;
  timezone: string | null;
};

export type ParsedClient = {
  browser: string | null;
  os: string | null;
  deviceType: 'mobile' | 'tablet' | 'desktop';
};

const COUNTRY_NAMES: Record<string, string> = {
  PE: 'Perú',
  MX: 'México',
  ES: 'España',
  AR: 'Argentina',
  CL: 'Chile',
  CO: 'Colombia',
  US: 'United States',
  BR: 'Brasil',
  EC: 'Ecuador',
  BO: 'Bolivia',
};

/** Extract client IP from proxy/serverless headers. Never trust body. */
export function extractIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return normalizeIp(first);
  }

  const realIp = headers.get('x-real-ip')?.trim();
  if (realIp) return normalizeIp(realIp);

  const vercelForwarded = headers.get('x-vercel-forwarded-for')?.trim();
  if (vercelForwarded) {
    const first = vercelForwarded.split(',')[0]?.trim();
    if (first) return normalizeIp(first);
  }

  return '127.0.0.1';
}

function normalizeIp(ip: string): string {
  // Strip IPv6-mapped IPv4 prefix
  if (ip.startsWith('::ffff:')) return ip.slice(7);
  return ip;
}

/** Geo fields from Vercel edge headers (or empty in local dev). */
export function extractGeo(headers: Headers): RequestGeo {
  const countryCode = headers.get('x-vercel-ip-country')?.trim().toUpperCase() || null;
  const region = headers.get('x-vercel-ip-country-region')?.trim() || null;
  const city = headers.get('x-vercel-ip-city')?.trim() || null;
  const latitude = headers.get('x-vercel-ip-latitude')?.trim() || null;
  const longitude = headers.get('x-vercel-ip-longitude')?.trim() || null;
  const timezone = headers.get('x-vercel-ip-timezone')?.trim() || null;

  return {
    countryCode: countryCode && countryCode.length === 2 ? countryCode : null,
    countryName: countryCode ? (COUNTRY_NAMES[countryCode] ?? countryCode) : null,
    region,
    city,
    latitude,
    longitude,
    timezone,
  };
}

export function parseUserAgent(userAgent: string | null | undefined): ParsedClient {
  if (!userAgent) {
    return { browser: null, os: null, deviceType: 'desktop' };
  }

  const result = new UAParser(userAgent).getResult();
  const browserName = result.browser.name ?? null;
  const browserVersion = result.browser.version?.split('.')[0];
  const browser = browserName && browserVersion ? `${browserName} ${browserVersion}` : browserName;

  const osName = result.os.name ?? null;
  const osVersion = result.os.version;
  const os = osName && osVersion ? `${osName} ${osVersion}` : osName;

  const type = result.device.type;
  const deviceType: ParsedClient['deviceType'] =
    type === 'mobile' ? 'mobile' : type === 'tablet' ? 'tablet' : 'desktop';

  return { browser, os, deviceType };
}

export function primaryLanguageFromAccept(
  acceptLanguage: string | null | undefined,
): string | null {
  if (!acceptLanguage) return null;
  const first = acceptLanguage.split(',')[0]?.trim();
  if (!first) return null;
  // CHAR(5): keep es, en, es-PE, etc.
  return first.slice(0, 5);
}
