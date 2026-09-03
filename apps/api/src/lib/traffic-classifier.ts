export const CLASSIFICATION_VERSION = 'v1';

export type TrafficClass = 'human' | 'bot' | 'unknown';
export type BotConfidence = 'high' | 'medium' | 'low';
export type EventSource = 'web_client' | 'server' | 'api' | 'internal' | 'unknown';

export type BotCategory =
  | 'search_engine'
  | 'ai_crawler'
  | 'social_preview'
  | 'seo_crawler'
  | 'advertising'
  | 'browser_automation'
  | 'monitoring'
  | 'generic_crawler'
  | 'unknown_bot';

export type TrafficClassification = {
  isBot: boolean;
  trafficClass: TrafficClass;
  botId: string | null;
  botCategory: BotCategory | null;
  reason: string;
  confidence: BotConfidence;
  classificationVersion: string;
};

type BotRule = {
  token: string;
  botId: string;
  category: BotCategory;
  confidence: BotConfidence;
};

/**
 * Specific tokens first. Longer tokens are matched before shorter prefixes
 * (e.g. GoogleOther-Image before GoogleOther).
 */
const BOT_RULES: BotRule[] = [
  { token: 'GoogleOther-Image', botId: 'GoogleOther-Image', category: 'generic_crawler', confidence: 'high' },
  { token: 'GoogleOther-Video', botId: 'GoogleOther-Video', category: 'generic_crawler', confidence: 'high' },
  { token: 'Mediapartners-Google', botId: 'Mediapartners-Google', category: 'advertising', confidence: 'high' },
  { token: 'meta-externalfetcher', botId: 'meta-externalfetcher', category: 'ai_crawler', confidence: 'high' },
  { token: 'meta-externalagent', botId: 'meta-externalagent', category: 'ai_crawler', confidence: 'high' },
  { token: 'facebookexternalhit', botId: 'facebookexternalhit', category: 'social_preview', confidence: 'high' },
  { token: 'Claude-SearchBot', botId: 'Claude-SearchBot', category: 'ai_crawler', confidence: 'high' },
  { token: 'AdsBot-Google', botId: 'AdsBot-Google', category: 'advertising', confidence: 'high' },
  { token: 'Meta-WebIndexer', botId: 'Meta-WebIndexer', category: 'ai_crawler', confidence: 'high' },
  { token: 'ChatGPT-User', botId: 'ChatGPT-User', category: 'ai_crawler', confidence: 'high' },
  { token: 'OAI-SearchBot', botId: 'OAI-SearchBot', category: 'ai_crawler', confidence: 'high' },
  { token: 'HeadlessChrome', botId: 'HeadlessChrome', category: 'browser_automation', confidence: 'high' },
  { token: 'python-requests', botId: 'python-requests', category: 'monitoring', confidence: 'high' },
  { token: 'Go-http-client', botId: 'Go-http-client', category: 'monitoring', confidence: 'high' },
  { token: 'GoogleOther', botId: 'GoogleOther', category: 'generic_crawler', confidence: 'high' },
  { token: 'Googlebot', botId: 'Googlebot', category: 'search_engine', confidence: 'high' },
  { token: 'BingPreview', botId: 'BingPreview', category: 'search_engine', confidence: 'high' },
  { token: 'PerplexityBot', botId: 'PerplexityBot', category: 'ai_crawler', confidence: 'high' },
  { token: 'Bytespider', botId: 'Bytespider', category: 'ai_crawler', confidence: 'high' },
  { token: 'SemrushBot', botId: 'SemrushBot', category: 'seo_crawler', confidence: 'high' },
  { token: 'AhrefsBot', botId: 'AhrefsBot', category: 'seo_crawler', confidence: 'high' },
  { token: 'ClaudeBot', botId: 'ClaudeBot', category: 'ai_crawler', confidence: 'high' },
  { token: 'Applebot', botId: 'Applebot', category: 'search_engine', confidence: 'high' },
  { token: 'PetalBot', botId: 'PetalBot', category: 'seo_crawler', confidence: 'high' },
  { token: 'YandexBot', botId: 'YandexBot', category: 'search_engine', confidence: 'high' },
  { token: 'DuckDuckBot', botId: 'DuckDuckBot', category: 'search_engine', confidence: 'high' },
  { token: 'Baiduspider', botId: 'Baiduspider', category: 'search_engine', confidence: 'high' },
  { token: 'Amazonbot', botId: 'Amazonbot', category: 'generic_crawler', confidence: 'high' },
  { token: 'bingbot', botId: 'bingbot', category: 'search_engine', confidence: 'high' },
  { token: 'GPTBot', botId: 'GPTBot', category: 'ai_crawler', confidence: 'high' },
  { token: 'MJ12bot', botId: 'MJ12bot', category: 'seo_crawler', confidence: 'high' },
  { token: 'PhantomJS', botId: 'PhantomJS', category: 'browser_automation', confidence: 'high' },
  { token: 'Playwright', botId: 'Playwright', category: 'browser_automation', confidence: 'high' },
  { token: 'Puppeteer', botId: 'Puppeteer', category: 'browser_automation', confidence: 'high' },
  { token: 'Selenium', botId: 'Selenium', category: 'browser_automation', confidence: 'high' },
  { token: 'curl', botId: 'curl', category: 'monitoring', confidence: 'high' },
  { token: 'wget', botId: 'wget', category: 'monitoring', confidence: 'high' },
];

const GENERIC_CRAWLER_RE = /\b[\w.-]*(bot|crawler|spider|slurp)[\w.-]*/i;
const MAINSTREAM_BROWSER_RE =
  /\b(Chrome|Firefox|Safari|Edg(?:e)?|OPR|Opera|SamsungBrowser|CriOS|FxiOS)\b/i;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchSnippet(userAgent: string, token: string): string | null {
  const re = new RegExp(`${escapeRegExp(token)}(?:/[\\w.-]+)?`, 'i');
  const match = userAgent.match(re);
  return match?.[0] ?? null;
}

function claimedBot(
  botId: string,
  category: BotCategory,
  snippet: string,
  confidence: BotConfidence,
): TrafficClassification {
  return {
    isBot: true,
    trafficClass: 'bot',
    botId,
    botCategory: category,
    reason: `User-Agent contains ${snippet} (claimed bot; not IP-verified)`,
    confidence,
    classificationVersion: CLASSIFICATION_VERSION,
  };
}

export function classifyTraffic(userAgent: string | null | undefined): TrafficClassification {
  const raw = userAgent?.trim() ?? '';
  if (!raw) {
    return {
      isBot: false,
      trafficClass: 'unknown',
      botId: null,
      botCategory: null,
      reason: 'Missing or empty User-Agent',
      confidence: 'low',
      classificationVersion: CLASSIFICATION_VERSION,
    };
  }

  if (raw.length < 3 || raw === '-' || raw === 'unknown') {
    return {
      isBot: false,
      trafficClass: 'unknown',
      botId: null,
      botCategory: null,
      reason: 'Invalid or non-classifiable User-Agent',
      confidence: 'low',
      classificationVersion: CLASSIFICATION_VERSION,
    };
  }

  for (const rule of BOT_RULES) {
    const snippet = matchSnippet(raw, rule.token);
    if (snippet) {
      return claimedBot(rule.botId, rule.category, snippet, rule.confidence);
    }
  }

  const generic = raw.match(GENERIC_CRAWLER_RE);
  if (generic?.[0]) {
    return claimedBot(generic[0], 'unknown_bot', generic[0], 'medium');
  }

  if (MAINSTREAM_BROWSER_RE.test(raw)) {
    return {
      isBot: false,
      trafficClass: 'human',
      botId: null,
      botCategory: null,
      reason:
        'User-Agent resembles a mainstream browser without known crawler tokens (probable human; User-Agent can be spoofed)',
      confidence: 'medium',
      classificationVersion: CLASSIFICATION_VERSION,
    };
  }

  return {
    isBot: false,
    trafficClass: 'unknown',
    botId: null,
    botCategory: null,
    reason: 'User-Agent did not match known browsers or crawler tokens',
    confidence: 'low',
    classificationVersion: CLASSIFICATION_VERSION,
  };
}

export function displayBotLabel(botId: string | null): string {
  if (!botId) return 'Bot';
  const labels: Record<string, string> = {
    'meta-externalagent': 'Meta External Agent',
    'meta-externalfetcher': 'Meta External Fetcher',
    facebookexternalhit: 'Facebook External Hit',
    'Meta-WebIndexer': 'Meta Web Indexer',
    HeadlessChrome: 'Headless Chrome',
    'AdsBot-Google': 'AdsBot Google',
    Googlebot: 'Googlebot',
    GoogleOther: 'GoogleOther',
  };
  return labels[botId] ?? botId;
}
