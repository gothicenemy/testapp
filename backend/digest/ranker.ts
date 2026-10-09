export interface ProductFeatures {
    newTechnology: boolean;
    highEfficacy: boolean;
    novelFormFactor: boolean;
    newControlOptions: boolean;
    modularity: boolean;
    segmentRelevance: number; // 0-10
    sustainability: boolean;
    practicalValue: number; // 0-10
}

export function calculateRelevanceScore(features: ProductFeatures): number {
    let score = 0;

    // Weights configuration
    const weights = {
        newTechnology: 15,
        highEfficacy: 10,
        novelFormFactor: 15,
        newControlOptions: 10,
        modularity: 10,
        segmentRelevance: 2, // multiplier for 0-10 (max 20)
        sustainability: 10,
        practicalValue: 1 // multiplier for 0-10 (max 10)
    };

    if (features.newTechnology) score += weights.newTechnology;
    if (features.highEfficacy) score += weights.highEfficacy;
    if (features.novelFormFactor) score += weights.novelFormFactor;
    if (features.newControlOptions) score += weights.newControlOptions;
    if (features.modularity) score += weights.modularity;
    if (features.sustainability) score += weights.sustainability;

    score += features.segmentRelevance * weights.segmentRelevance;
    score += features.practicalValue * weights.practicalValue;

    // Normalize to 0-100
    return Math.min(100, Math.max(0, score));
}

export function rankProducts<T extends { relevanceScore?: number; relevance_score?: number }>(products: T[]): T[] {
    return [...products].sort((a, b) => {
        const scoreA = a.relevance_score ?? a.relevanceScore ?? 0;
        const scoreB = b.relevance_score ?? b.relevanceScore ?? 0;
        return scoreB - scoreA;
    });
}

export class RelevanceRanker {
    rankProducts<T extends { relevanceScore?: number; relevance_score?: number }>(products: T[]): T[] {
        return rankProducts(products);
    }
}


