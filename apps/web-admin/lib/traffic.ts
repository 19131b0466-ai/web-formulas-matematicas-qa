import type { TrafficClass } from '@repo/shared-types';

export function displayBotLabel(botId: string | null | undefined): string {
  if (!botId) return 'Bot';
  const labels: Record<string, string> = {
    'meta-externalagent': 'Meta External Agent',
    'meta-externalfetcher': 'Meta External Fetcher',
    facebookexternalhit: 'Facebook External Hit',
    'Meta-WebIndexer': 'Meta Web Indexer',
    HeadlessChrome: 'Headless Chrome',
    'AdsBot-Google': 'AdsBot Google',
  };
  return labels[botId] ?? botId;
}

export function trafficClassLabel(trafficClass: TrafficClass): string {
  if (trafficClass === 'human') return 'Humano probable';
  if (trafficClass === 'bot') return 'Bot';
  return 'Desconocido';
}

export function shortenId(id: string, size = 8): string {
  return id.length <= size ? id : `${id.slice(0, size)}…`;
}
