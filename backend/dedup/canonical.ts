import { URL } from 'url';

export function normalizeUrl(urlString: string): string {
    try {
        const url = new URL(urlString);
        
        // Remove tracking and language query parameters (FR-13)
        const paramsToRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'lang', 'language', 'locale', '_ga', 'ref'];
        for (const param of paramsToRemove) {
            url.searchParams.delete(param);
        }

        // Normalize language path prefixes (e.g. /en/, /de/) to avoid multi-language duplicate pages (FR-13)
        url.pathname = url.pathname.replace(/^\/(?:en|de|fr|it|es|nl|com-en|en-us|en-gb)(?=\/|$)/i, '');
        if (!url.pathname.startsWith('/')) {
            url.pathname = '/' + url.pathname;
        }

        let normalized = url.toString();

        // Normalize trailing slash
        if (normalized.endsWith('/') && url.pathname !== '/') {
            normalized = normalized.slice(0, -1);
        }

        return normalized;

    } catch (e) {
        return urlString; // return original if invalid URL
    }
}

export function extractCanonicalFromHtml(html: string): string | null {
    // Basic regex to find <link rel="canonical" href="...">
    const match = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i) || 
                  html.match(/<link\s+href=["']([^"']+)["']\s+rel=["']canonical["']/i);
    
    if (match && match[1]) {
        return normalizeUrl(match[1]);
    }
    
    return null;
}

export const canonicalizeUrl = normalizeUrl;

