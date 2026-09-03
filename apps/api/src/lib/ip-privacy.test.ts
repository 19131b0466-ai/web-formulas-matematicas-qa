import { describe, expect, it } from 'vitest';
import { anonymizeIpNetwork, hashIp } from './ip-privacy.js';

describe('ip privacy', () => {
  it('anonymizes IPv4 to /24', () => {
    expect(anonymizeIpNetwork('66.249.72.173')).toBe('66.249.72.0/24');
    expect(anonymizeIpNetwork('::ffff:66.249.72.173')).toBe('66.249.72.0/24');
  });

  it('anonymizes IPv6 to /48', () => {
    expect(anonymizeIpNetwork('2001:db8:abcd:0012:0000:0000:0000:0001')).toBe('2001:db8:abcd::/48');
  });

  it('creates a stable HMAC hash truncated to 20 hex chars', () => {
    const secret = 'test-analytics-secret';
    const a = hashIp('200.1.2.3', secret);
    const b = hashIp('200.1.2.3', secret);
    const c = hashIp('200.1.2.4', secret);
    expect(a).toBe(b);
    expect(a).toHaveLength(20);
    expect(a).not.toBe(c);
    expect(a).not.toContain('200.1.2.3');
  });

  it('returns null hash without a secret', () => {
    expect(hashIp('1.2.3.4', '')).toBeNull();
  });
});
