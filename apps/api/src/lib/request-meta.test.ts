import { describe, expect, it } from 'vitest';
import {
  extractGeo,
  extractIp,
  parseUserAgent,
  primaryLanguageFromAccept,
} from './request-meta.js';

describe('request-meta', () => {
  it('extracts IP from x-forwarded-for first hop', () => {
    const headers = new Headers({
      'x-forwarded-for': '203.0.113.10, 10.0.0.1',
    });
    expect(extractIp(headers)).toBe('203.0.113.10');
  });

  it('reads Vercel geo headers', () => {
    const headers = new Headers({
      'x-vercel-ip-country': 'pe',
      'x-vercel-ip-city': 'Arequipa',
      'x-vercel-ip-country-region': 'ARE',
      'x-vercel-ip-timezone': 'America/Lima',
    });
    const geo = extractGeo(headers);
    expect(geo.countryCode).toBe('PE');
    expect(geo.countryName).toBe('Perú');
    expect(geo.city).toBe('Arequipa');
    expect(geo.region).toBe('ARE');
  });

  it('parses user agent device and browser', () => {
    const parsed = parseUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    );
    expect(parsed.deviceType).toBe('mobile');
    expect(parsed.os).toMatch(/iOS/i);
  });

  it('derives primary language', () => {
    expect(primaryLanguageFromAccept('es-PE,es;q=0.9,en;q=0.8')).toBe('es-PE');
    expect(primaryLanguageFromAccept(null)).toBeNull();
  });
});
