import * as crypto from 'crypto';

export interface ProductRecord {
    id: number;
    manufacturer: string;
    productName: string;
    seriesName?: string;
    canonicalUrl: string;
    contentHash: string;
    firstSeenAt: Date;
    lastSeenAt: Date;
    digestId?: number;
    dateSent?: Date;
}

export interface DuplicateCheckResult {
    isDuplicate: boolean;
    matchedProductId?: number;
    reason?: string;
}

export class DeduplicationEngine {
    private existingProducts: ProductRecord[];

    constructor(existingProducts: ProductRecord[]) {
        this.existingProducts = existingProducts;
    }

    public generateContentHash(htmlContent: string): string {
        return crypto.createHash('sha256').update(htmlContent).digest('hex');
    }

    public normalizeName(name: string): string {
        return name.toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    public isDuplicate(
        manufacturer: string, 
        productName: string, 
        seriesName: string | undefined, 
        canonicalUrl: string, 
        contentHash: string
    ): DuplicateCheckResult {
        
        for (const existing of this.existingProducts) {
            // 1. Canonical URL match (FR-29)
            if (existing.canonicalUrl === canonicalUrl) {
                return {
                    isDuplicate: true,
                    matchedProductId: existing.id,
                    reason: 'Canonical URL match'
                };
            }

            // 2. Content fingerprint/hash match
            if (existing.contentHash === contentHash) {
                return {
                    isDuplicate: true,
                    matchedProductId: existing.id,
                    reason: 'Content hash match'
                };
            }

            // 3. Manufacturer + normalized name match (FR-30)
            if (existing.manufacturer === manufacturer) {
                const existingNormalizedName = this.normalizeName(existing.productName);
                const currentNormalizedName = this.normalizeName(productName);
                
                if (existingNormalizedName === currentNormalizedName) {
                    return {
                        isDuplicate: true,
                        matchedProductId: existing.id,
                        reason: 'Manufacturer and product name match'
                    };
                }

                if (seriesName && existing.seriesName) {
                    const existingNormalizedSeries = this.normalizeName(existing.seriesName);
                    const currentNormalizedSeries = this.normalizeName(seriesName);
                    if (existingNormalizedSeries === currentNormalizedSeries) {
                         return {
                             isDuplicate: true,
                             matchedProductId: existing.id,
                             reason: 'Manufacturer and series name match'
                         };
                    }
                }
            }
        }

        return { isDuplicate: false };
    }
}

import { canonicalizeUrl } from './canonical.js';
import { ProductModel } from '../db/models.js';

export class Deduplicator {
    private seenHashes = new Set<string>();

    public normalizeUrl(url: string): string {
        return canonicalizeUrl(url);
    }

    public generateCanonicalHash(manufacturer: string, productName: string): string {
        return crypto.createHash('md5')
            .update(`${manufacturer.toLowerCase()}_${productName.toLowerCase()}`)
            .digest('hex')
            .substring(0, 16);
    }

    public deduplicate<T extends { manufacturer: string; product_name: string; source_url: string; canonical_hash?: string }>(candidates: T[]): T[] {
        const unique: T[] = [];
        for (const item of candidates) {
            const hash = item.canonical_hash || this.generateCanonicalHash(item.manufacturer, item.product_name);
            item.canonical_hash = hash;
            
            if (this.seenHashes.has(hash)) {
                continue;
            }
            this.seenHashes.add(hash);
            unique.push(item);
        }
        return unique;
    }
}

