import { SitemapEntry } from './sitemap.js';

export interface PageRecord {
  url: string;
  lastmod?: string;
  contentHash?: string;
  discoveredAt: Date;
  lastCheckedAt: Date;
}

export enum ChangeReason {
  NEW_URL = 'NEW_URL',
  LASTMOD_CHANGED = 'LASTMOD_CHANGED',
  CONTENT_HASH_CHANGED = 'CONTENT_HASH_CHANGED'
}

export interface ChangeResult {
  url: string;
  reason: ChangeReason;
  previousRecord?: PageRecord;
  newRecord?: Partial<PageRecord>;
}

/**
 * Detects changes between a previous set of pages and a current set (either from sitemap or crawl).
 */
export function detectChanges(
  manufacturer: string,
  currentPages: Partial<PageRecord>[],
  previousPages: PageRecord[]
): ChangeResult[] {
  const changes: ChangeResult[] = [];
  const prevMap = new Map(previousPages.map(p => [p.url, p]));

  for (const current of currentPages) {
    if (!current.url) continue;
    const url = current.url;
    const previous = prevMap.get(url);

    if (!previous) {
      changes.push({
        url,
        reason: ChangeReason.NEW_URL,
        newRecord: current
      });
      continue;
    }

    // Check lastmod
    if (current.lastmod && previous.lastmod && current.lastmod !== previous.lastmod) {
       changes.push({
         url,
         reason: ChangeReason.LASTMOD_CHANGED,
         previousRecord: previous,
         newRecord: current
       });
       continue;
    }

    // Check content hash
    if (current.contentHash && previous.contentHash && current.contentHash !== previous.contentHash) {
       changes.push({
         url,
         reason: ChangeReason.CONTENT_HASH_CHANGED,
         previousRecord: previous,
         newRecord: current
       });
    }
  }

  return changes;
}

export class ChangeDetector {
  async detectChanges(
    manufacturerId: number | string,
    discoveredUrls: Array<{ url: string; source: string; lastmod?: string }>
  ): Promise<Array<{ url: string; source: string }>> {
    // Return URLs that need processing (for new crawl runs)
    return discoveredUrls.map(u => ({ url: u.url, source: u.source }));
  }
}
