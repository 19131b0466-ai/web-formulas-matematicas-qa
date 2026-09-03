import { describe, expect, it } from 'vitest';
import { classifyTraffic, displayBotLabel } from './traffic-classifier.js';

const REAL_GOOGLE_OTHER =
  'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.7922.173 Mobile Safari/537.36 (compatible; GoogleOther)';
const REAL_GOOGLEBOT =
  'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.7922.173 Mobile Safari/537.36 (compatible; Googlebot/2.1)';
const REAL_META =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 (compatible; meta-externalagent/1.1)';
const REAL_HEADLESS = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.7390.0 Safari/537.36';
const REAL_ADS = 'AdsBot-Google (+http://www.google.com/adsbot.html)';
const CHROME =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const FIREFOX = 'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0';
const SAFARI =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';

describe('classifyTraffic', () => {
  it('classifies mainstream Chrome as probable human', () => {
    const result = classifyTraffic(CHROME);
    expect(result.trafficClass).toBe('human');
    expect(result.isBot).toBe(false);
    expect(result.botId).toBeNull();
  });

  it('classifies Firefox as probable human', () => {
    expect(classifyTraffic(FIREFOX).trafficClass).toBe('human');
  });

  it('classifies Safari as probable human', () => {
    expect(classifyTraffic(SAFARI).trafficClass).toBe('human');
  });

  it('classifies empty User-Agent as unknown', () => {
    const result = classifyTraffic('');
    expect(result.trafficClass).toBe('unknown');
    expect(result.isBot).toBe(false);
    expect(result.confidence).toBe('low');
  });

  it('identifies GoogleOther even when Chrome is present', () => {
    const result = classifyTraffic(REAL_GOOGLE_OTHER);
    expect(result.trafficClass).toBe('bot');
    expect(result.botId).toBe('GoogleOther');
    expect(result.botCategory).toBe('generic_crawler');
    expect(result.reason).toMatch(/GoogleOther/);
  });

  it('identifies Googlebot even when Chrome is present', () => {
    const result = classifyTraffic(REAL_GOOGLEBOT);
    expect(result.trafficClass).toBe('bot');
    expect(result.botId).toBe('Googlebot');
    expect(result.botCategory).toBe('search_engine');
  });

  it('identifies meta-externalagent as Meta AI crawler, not Chrome', () => {
    const result = classifyTraffic(REAL_META);
    expect(result.trafficClass).toBe('bot');
    expect(result.botId).toBe('meta-externalagent');
    expect(result.botCategory).toBe('ai_crawler');
    expect(result.reason).toMatch(/meta-externalagent\/1\.1/i);
    expect(displayBotLabel(result.botId)).toBe('Meta External Agent');
  });

  it('identifies HeadlessChrome as browser automation', () => {
    const result = classifyTraffic(REAL_HEADLESS);
    expect(result.botId).toBe('HeadlessChrome');
    expect(result.botCategory).toBe('browser_automation');
  });

  it('identifies AdsBot-Google', () => {
    const result = classifyTraffic(REAL_ADS);
    expect(result.botId).toBe('AdsBot-Google');
    expect(result.botCategory).toBe('advertising');
  });

  it('classifies curl as automated monitoring traffic', () => {
    const result = classifyTraffic('curl/8.5.0');
    expect(result.trafficClass).toBe('bot');
    expect(result.botId).toBe('curl');
    expect(result.botCategory).toBe('monitoring');
  });

  it('does not claim official IP verification', () => {
    const result = classifyTraffic(REAL_GOOGLEBOT);
    expect(result.reason.toLowerCase()).not.toMatch(/verificado|verified official/);
    expect(result.reason).toMatch(/claimed bot/i);
  });
});
