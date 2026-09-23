import { describe, expect, it } from 'vitest';
import { withTimeout } from './with-timeout.js';

describe('withTimeout', () => {
  it('resolves when the work finishes in time', async () => {
    await expect(withTimeout(Promise.resolve(7), 50, 'fast')).resolves.toBe(7);
  });

  it('rejects when the work exceeds the budget', async () => {
    const slow = new Promise<number>((resolve) => {
      setTimeout(() => resolve(1), 200);
    });
    await expect(withTimeout(slow, 20, 'section fisica-electronica/conversion-ad-da')).rejects.toThrow(
      'section fisica-electronica/conversion-ad-da timed out after 20ms',
    );
  });
});
