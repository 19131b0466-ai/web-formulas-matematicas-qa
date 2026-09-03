import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';

const HASH_HEX_LENGTH = 20;

export function getAnalyticsIpHashSecret(): string | null {
  const secret = process.env.ANALYTICS_IP_HASH_SECRET?.trim();
  return secret ? secret : null;
}

export function normalizeIpForPrivacy(ip: string): string {
  const trimmed = ip.trim();
  if (trimmed.startsWith('::ffff:')) return trimmed.slice(7);
  return trimmed;
}

export function hashIp(ip: string, secret = getAnalyticsIpHashSecret()): string | null {
  if (!secret) return null;
  const normalized = normalizeIpForPrivacy(ip);
  if (!normalized) return null;
  return createHmac('sha256', secret).update(normalized).digest('hex').slice(0, HASH_HEX_LENGTH);
}

function expandIPv6Hextets(ip: string): string[] {
  const main = ip.split('%')[0] ?? ip;
  const parts = main.split('::');
  const head = parts[0] && parts[0].length > 0 ? parts[0].split(':') : [];
  const tail = parts[1] && parts[1].length > 0 ? parts[1].split(':') : [];
  const missing = Math.max(0, 8 - head.length - tail.length);
  const filled = parts.length > 1 ? [...head, ...Array.from({ length: missing }, () => '0'), ...tail] : main.split(':');
  while (filled.length < 8) filled.push('0');
  return filled.slice(0, 8).map((h) => h.padStart(4, '0').toLowerCase());
}

function formatHextet(value: string): string {
  return value.replace(/^0+/, '') || '0';
}

export function anonymizeIpNetwork(ip: string): string | null {
  const normalized = normalizeIpForPrivacy(ip);
  const version = isIP(normalized);
  if (version === 4) {
    const octets = normalized.split('.');
    if (octets.length !== 4) return null;
    return `${octets[0]}.${octets[1]}.${octets[2]}.0/24`;
  }
  if (version === 6) {
    const hextets = expandIPv6Hextets(normalized);
    const prefix = `${formatHextet(hextets[0] ?? '0')}:${formatHextet(hextets[1] ?? '0')}:${formatHextet(hextets[2] ?? '0')}`;
    return `${prefix}::/48`;
  }
  return null;
}
