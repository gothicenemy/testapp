import crypto from 'crypto';

export interface FetchOptions {
  headers?: Record<string, string>;
  timeoutMs?: number;
  retries?: number;
  delayBetweenRetriesMs?: number;
}

export interface FetchResult {
  html: string;
  statusCode: number;
  headers: Headers;
  contentHash: string;
}

const DEFAULT_USER_AGENT = 'LightingMonitorBot/1.0 (+https://lighting-monitor.example.com)';

/**
 * Calculates a SHA-256 hash of the content for change detection.
 */
export function calculateContentHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Canonicalizes a URL by removing common tracking parameters and normalizing trailing slashes.
 */
export function canonicalizeUrl(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    
    // Remove trailing slash from pathname if present (unless it's just '/')
    if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1);
    }

    // Remove tracking params
    const paramsToStrip = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];
    for (const param of paramsToStrip) {
      url.searchParams.delete(param);
    }

    // Sort params for consistency
    url.searchParams.sort();

    return url.toString();
  } catch (error) {
    console.warn(`Invalid URL provided for canonicalization: ${urlStr}`);
    return urlStr;
  }
}

/**
 * Basic robots.txt checker (naive implementation, for production consider robots-parser)
 */
export async function checkRobotsTxt(urlStr: string, userAgent: string): Promise<boolean> {
  try {
    const url = new URL(urlStr);
    const robotsUrl = `${url.protocol}//${url.host}/robots.txt`;
    
    const res = await fetch(robotsUrl, { headers: { 'User-Agent': userAgent } });
    if (!res.ok) {
      return true; // If no robots.txt, assume allowed
    }
    
    const text = await res.text();
    // Very simplified logic: just checking if Disallow: / is present for all or our bot
    // A robust implementation should parse fully.
    if (text.includes('Disallow: /') && (text.includes('User-agent: *') || text.includes(`User-agent: ${userAgent}`))) {
       // Need more specific parsing to be accurate. We'll allow by default in this naive stub.
       return false;
    }
    
    return true;
  } catch (e) {
    return true; // Allow on error
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchPage(url: string, options: FetchOptions = {}): Promise<FetchResult> {
  const retries = options.retries ?? 3;
  const delay = options.delayBetweenRetriesMs ?? 1000;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('User-Agent')) {
    headers.set('User-Agent', DEFAULT_USER_AGENT);
  }

  const canonicalUrl = canonicalizeUrl(url);

  let attempt = 0;
  while (attempt <= retries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs ?? 10000);

      const response = await fetch(canonicalUrl, {
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const contentHash = calculateContentHash(html);

      return {
        html,
        statusCode: response.status,
        headers: response.headers,
        contentHash
      };

    } catch (error) {
      attempt++;
      console.warn(`Attempt ${attempt} failed for ${canonicalUrl}: ${error instanceof Error ? error.message : String(error)}`);
      
      if (attempt > retries) {
        throw new Error(`Failed to fetch ${canonicalUrl} after ${retries} retries.`);
      }
      
      // Exponential backoff
      await sleep(delay * Math.pow(2, attempt - 1));
    }
  }
  
  throw new Error('Unreachable');
}

import * as cheerio from 'cheerio';

export class Crawler {
  private config: any;

  constructor(config: any = {}) {
    this.config = config;
  }

  async fetchPage(url: string): Promise<{ ok: boolean; html: string; statusCode: number; contentHash: string }> {
    try {
      const res = await fetchPage(url, {
        timeoutMs: this.config.timeout_ms || 15000,
        retries: this.config.max_retries || 3,
        headers: { 'User-Agent': this.config.user_agent || DEFAULT_USER_AGENT }
      });
      return { ok: res.statusCode >= 200 && res.statusCode < 300, html: res.html, statusCode: res.statusCode, contentHash: res.contentHash };
    } catch (err) {
      console.warn(`[Crawler] Failed fetching ${url}:`, err);
      return { ok: false, html: '', statusCode: 500, contentHash: '' };
    }
  }

  async extractLinks(pageUrl: string, domain: string): Promise<string[]> {
    try {
      const page = await this.fetchPage(pageUrl);
      if (!page.ok || !page.html) return [];

      const $ = cheerio.load(page.html);
      const links = new Set<string>();

      $('a[href]').each((_, el) => {
        const href = $(el).attr('href')?.trim();
        if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:') || href.startsWith('#')) return;

        try {
          const absoluteUrl = new URL(href, pageUrl).toString();
          const parsed = new URL(absoluteUrl);

          if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return;

          // Only keep same domain
          if (parsed.hostname.includes(domain) || domain.includes(parsed.hostname)) {
            // Skip binary downloads (.pdf, .zip, etc.)
            if (/\.(pdf|zip|rar|tar|gz|exe|dmg|iso|jpg|jpeg|png|svg|webp|gif|mp4|mp3|docx?|xlsx?)$/i.test(parsed.pathname)) {
              return;
            }

            // Skip corporate, legal, PR, contact, and non-product hub pages (FR-35)
            const nonProductPattern = /\/(privacy|cookie|terms|legal|contact|about|downloads?|company|career|press|news|search|login|cart|checkout|warranty|codice-etico|newsletter|jobs|conditions|cleaning|disposal|projects|case-studies|media\/download|wishlist|support|faqs?|partner-portal|ecodesign|slr-ecodesign|lightguide|developers|planner-tools|inspiration|configurators?|collections?(\/|$)|categories(\/|$)|c\/[a-z0-9-]+~\d+|rooms?(\/|$)|designing-with-light|services|novelties|applications?|themed-pages|product-marketing-pages|lighting-theory)/i;
            if (nonProductPattern.test(parsed.pathname)) {
              return;
            }

            // Skip non-English duplicates on multilingual sites (/es/, /fr/, /it/)
            if (/\/(es|fr|it)\//i.test(parsed.pathname)) {
              return;
            }

            // Skip shallow category endpoints (/products, /products/, /indoor, /outdoor)
            if (/\/(products|indoor|outdoor|luminaires|downlights|spotlights|floodlights)\/?$/i.test(parsed.pathname)) {
              return;
            }

            // Skip shallow language navigation links (/en, /it, /de, /en/Products, /products)
            const pathSegments = parsed.pathname.split('/').filter(Boolean);
            if (pathSegments.length <= 1) return;
            if (pathSegments.length === 2 && /^(en|it|fr|de|es|nl|com-en|en-us|en-gb)$/i.test(pathSegments[0])) {
              return;
            }

            // Strip hashes
            parsed.hash = '';
            links.add(canonicalizeUrl(parsed.toString()));
          }
        } catch {
          // invalid url ignored
        }
      });



      return Array.from(links).slice(0, 50); // limit to reasonable candidate set
    } catch (err) {
      console.warn(`[Crawler] Failed extracting links from ${pageUrl}:`, err);
      return [];
    }
  }
}

