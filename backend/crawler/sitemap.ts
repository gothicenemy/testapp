import { XMLParser } from 'fast-xml-parser';

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

/**
 * Parses a sitemap XML or sitemap index XML.
 * Automatically fetches nested sitemaps if an index is provided.
 */
export async function parseSitemap(url: string): Promise<SitemapEntry[]> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch sitemap: ${res.status}`);
    }
    
    const xmlData = await res.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      parseAttributeValue: true,
    });
    
    const parsed = parser.parse(xmlData);
    
    const entries: SitemapEntry[] = [];

    // Handle sitemap index
    if (parsed.sitemapindex && parsed.sitemapindex.sitemap) {
      const sitemaps = Array.isArray(parsed.sitemapindex.sitemap) 
        ? parsed.sitemapindex.sitemap 
        : [parsed.sitemapindex.sitemap];
        
      for (const sm of sitemaps) {
        if (sm.loc) {
          try {
            const nestedEntries = await parseSitemap(sm.loc);
            entries.push(...nestedEntries);
          } catch (nestedError) {
             console.warn(`Failed to parse nested sitemap ${sm.loc}:`, nestedError);
          }
        }
      }
      return entries;
    }

    // Handle regular sitemap
    if (parsed.urlset && parsed.urlset.url) {
      const urls = Array.isArray(parsed.urlset.url) ? parsed.urlset.url : [parsed.urlset.url];
      
      for (const u of urls) {
        if (u.loc) {
          entries.push({
            loc: u.loc,
            lastmod: u.lastmod,
            changefreq: u.changefreq,
            priority: u.priority
          });
        }
      }
    }

    return entries;
  } catch (error) {
    console.error(`Error parsing sitemap at ${url}:`, error);
    throw error;
  }
}

export class SitemapParser {
  async parse(url: string): Promise<SitemapEntry[]> {
    return parseSitemap(url);
  }
}

