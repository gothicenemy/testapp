/**
 * LumenRadar AI — Main Entry Point
 * 
 * AI-система моніторингу новинок європейських виробників освітлення
 * Per ТЗ v1.0 (31.08.2026)
 * 
 * Architecture: Scheduler → Crawl 20 sites → Detect changes → Extract candidate pages
 * → AI classify → Extract/normalize specs → Deduplicate → Save DB → Generate digest
 * → Send email → Save send status
 */

import 'dotenv/config';
import { initDatabase, getDatabase, ProductModel, DigestModel, DigestItemModel } from './db/models.js';

import { loadSettings, loadManufacturers } from './config/settings.js';
import { Crawler } from './crawler/crawler.js';
import { SitemapParser } from './crawler/sitemap.js';
import { ChangeDetector } from './crawler/detector.js';
import { AIClassifier } from './ai/classifier.js';
import { Deduplicator } from './dedup/deduplicator.js';
import { DigestGenerator } from './digest/generator.js';
import { EmailSender } from './digest/sender.js';
import { RelevanceRanker } from './digest/ranker.js';
import { Scheduler } from './scheduler/scheduler.js';
import { Monitor } from './monitoring/monitor.js';
import type { ManufacturerConfig, CrawlRunResult, ProductCandidate } from './types.js';

// ============================================================================
// Main Pipeline
// ============================================================================

export class LumenRadarPipeline {
  private settings: ReturnType<typeof loadSettings>;
  private manufacturers: ManufacturerConfig[];
  private crawler: Crawler;
  private sitemapParser: SitemapParser;
  private changeDetector: ChangeDetector;
  private classifier: AIClassifier;
  private deduplicator: Deduplicator;
  private digestGenerator: DigestGenerator;
  private emailSender: EmailSender;
  private ranker: RelevanceRanker;
  private monitor: Monitor;

  constructor() {
    this.settings = loadSettings();
    this.manufacturers = loadManufacturers();
    
    // Initialize all modules
    this.crawler = new Crawler(this.settings.crawler);
    this.sitemapParser = new SitemapParser();
    this.changeDetector = new ChangeDetector();
    this.classifier = new AIClassifier(this.settings.ai);
    this.deduplicator = new Deduplicator();
    this.digestGenerator = new DigestGenerator();
    this.emailSender = new EmailSender(this.settings.email);
    this.ranker = new RelevanceRanker();
    this.monitor = new Monitor(this.settings);
  }

  /**
   * Execute the full monitoring pipeline (FR-04 through FR-60)
   * Called every 14 days by scheduler, or manually for testing (FR-07)
   */
  async executePipeline(options?: { 
    manufacturerId?: string | number;  // NFR-07: Run for single manufacturer
    isBaseline?: boolean;              // FR-34: First run creates baseline
  }): Promise<void> {
    const runId = Date.now().toString(36);
    const startTime = new Date();
    
    console.log(`\n${'='.repeat(70)}`);
    console.log(`[PIPELINE] Starting crawl run ${runId} at ${startTime.toISOString()}`);
    console.log(`${'='.repeat(70)}\n`);

    const db = getDatabase();
    const runSummary: CrawlRunResult = {
      runId,
      periodFrom: new Date(startTime.getTime() - 14 * 24 * 60 * 60 * 1000),
      periodTo: startTime,
      totalManufacturers: 0,
      successfulManufacturers: 0,
      failedManufacturers: 0,
      failedManufacturerNames: [],
      pagesChecked: 0,
      candidatesFound: 0,
      newProducts: 0,
      majorUpdates: 0,
      duplicatesRemoved: 0,
      uncertainItems: 0,
      llmCalls: 0,
      emailStatus: 'pending',
      errors: [],
    };

    // Filter manufacturers if single-manufacturer run requested (NFR-07)
    const targetManufacturers = options?.manufacturerId
      ? this.manufacturers.filter(m => String(m.id).toLowerCase() === String(options.manufacturerId).toLowerCase())
      : this.manufacturers.filter(m => m.active);


    runSummary.totalManufacturers = targetManufacturers.length;
    const allNewProducts: ProductCandidate[] = [];
    const allMajorUpdates: ProductCandidate[] = [];

    // ========================================================================
    // STAGE 1: Crawl all manufacturer sites (FR-08 through FR-11)
    // Error isolation: one manufacturer's error doesn't stop others (FR-54)
    // ========================================================================
    for (const manufacturer of targetManufacturers) {
      console.log(`\n[CRAWL] Processing: ${manufacturer.name} (${manufacturer.domain})`);
      
      try {
        // Record crawl run start
        const crawlRunId = this.monitor.startCrawlRun(manufacturer.id);

        // Step 1a: Discover pages (sitemap, product listings, news)
        const discoveredUrls = await this.discoverUrls(manufacturer);
        runSummary.pagesChecked += discoveredUrls.length;
        
        console.log(`  → Discovered ${discoveredUrls.length} candidate URLs`);

        // Step 1b: Detect changes from previous crawl (FR-12)
        const changedUrls = await this.changeDetector.detectChanges(
          manufacturer.id,
          discoveredUrls
        );
        
        console.log(`  → ${changedUrls.length} new/changed URLs detected`);

        // Step 1c: For baseline run, limit to recent publications (FR-34-37)
        const urlsToProcess = options?.isBaseline
          ? changedUrls // In baseline, we index but don't send
          : changedUrls;

        // ====================================================================
        // STAGE 2: AI Classification & Extraction (FR-15 through FR-28)
        // ====================================================================
        for (const candidateUrl of urlsToProcess) {
          try {
            // Fetch page content
            const pageResult = await this.crawler.fetchPage(candidateUrl.url);
            if (!pageResult.ok) continue;

            runSummary.llmCalls++;
            runSummary.candidatesFound++;

            // AI classify and extract (FR-15, FR-21, FR-22)
            const extraction = await this.classifier.classifyAndExtract(
              pageResult.html,
              manufacturer.name,
              candidateUrl.url
            );

            if (!extraction) continue;

            // Filter by confidence threshold (FR-20)
            const threshold = this.settings.ai.confidence_threshold ?? 0.75;
            if (extraction.confidence < threshold) {
              console.log(`  → Skipped (low confidence: ${extraction.confidence})`);
              continue;
            }


            // Handle by classification (FR-16, FR-17, FR-18, FR-19)
            const cls = String(extraction.classification);
            switch (cls) {
              case 'NEW_PRODUCT':
              case 'NEW_SERIES':
              case 'NEW_GENERATION':

                allNewProducts.push({ ...extraction, manufacturerConfig: manufacturer });
                break;
              case 'MAJOR_UPDATE':
                allMajorUpdates.push({ ...extraction, manufacturerConfig: manufacturer });
                break;
              case 'NOT_RELEVANT':
                // FR-18: Skip silently
                break;
              case 'UNCERTAIN':
                // FR-19: Log for review
                runSummary.uncertainItems++;
                console.log(`  → UNCERTAIN: ${extraction.product_name} (logged)`);
                break;
            }
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            console.error(`  → Error processing ${candidateUrl.url}: ${errorMsg}`);
            runSummary.errors.push(`${manufacturer.name}: ${errorMsg}`);
          }
        }

        // ====================================================================
        // STAGE 3: Deduplication (FR-29 through FR-33)
        // ====================================================================
        const deduplicatedProducts = this.deduplicator.deduplicate(
          allNewProducts.filter(p => p.manufacturerConfig.id === manufacturer.id)
        );
        const deduplicatedUpdates = this.deduplicator.deduplicate(
          allMajorUpdates.filter(p => p.manufacturerConfig.id === manufacturer.id)
        );

        const removedDuplicates = 
          (allNewProducts.filter(p => p.manufacturerConfig.id === manufacturer.id).length - deduplicatedProducts.length) +
          (allMajorUpdates.filter(p => p.manufacturerConfig.id === manufacturer.id).length - deduplicatedUpdates.length);
        
        runSummary.duplicatesRemoved += removedDuplicates;
        runSummary.newProducts += deduplicatedProducts.length;
        runSummary.majorUpdates += deduplicatedUpdates.length;

        // Anomaly detection (FR-55, FR-56)
        await this.monitor.checkAnomaly(manufacturer.id, discoveredUrls.length);

        // Update crawl run status
        this.monitor.completeCrawlRun(crawlRunId, 'success', {
          pagesChecked: discoveredUrls.length,
          candidatesFound: urlsToProcess.length,
          productsConfirmed: deduplicatedProducts.length + deduplicatedUpdates.length,
        });

        runSummary.successfulManufacturers++;
        console.log(`  ✓ ${manufacturer.name}: ${deduplicatedProducts.length} new, ${deduplicatedUpdates.length} updates`);

      } catch (err) {
        // FR-54: Error isolation — continue with other manufacturers
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`  ✗ ${manufacturer.name} FAILED: ${errorMsg}`);
        runSummary.failedManufacturers++;
        runSummary.failedManufacturerNames.push(manufacturer.name);
        runSummary.errors.push(`${manufacturer.name}: ${errorMsg}`);
      }
    }

    // ========================================================================
    // STAGE 4: Save to Database (FR-39, FR-40)
    // ========================================================================
    console.log(`\n[DB] Saving ${runSummary.newProducts} products and ${runSummary.majorUpdates} updates to SQLite...`);
    for (const p of [...allNewProducts, ...allMajorUpdates]) {
      try {
        const prodId = `prod_${p.manufacturerConfig.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        ProductModel.upsert({
          id: prodId,
          manufacturer_id: String(p.manufacturerConfig.id),
          product_name: p.product_name,
          series_name: p.series_name || null,
          category: p.category || null,
          classification: p.classification,
          source_url: p.source_url,
          canonical_url: p.canonical_url || null,
          source_publication_date: p.source_publication_date || null,
          specs_json: JSON.stringify(p.technical_highlights || {}),
          summary_uk: p.summary_uk || p.short_description || null,
          key_features: JSON.stringify(p.key_features || []),
          applications: JSON.stringify(p.applications || []),
          why_interesting: p.why_interesting || null,
          image_url: p.image_url || null,
          confidence: p.confidence || 0.8,
          canonical_hash: p.canonical_hash || null,
          status: 'active',
          relevance_score: p.relevance_score || p.relevanceScore || 50
        });
      } catch (err) {
        console.warn(`[DB] Error saving product ${p.product_name}:`, err);
      }
    }

    // ========================================================================
    // STAGE 5: Generate & Send Digest (FR-41 through FR-51)
    // ========================================================================
    if (!options?.isBaseline) {
      // Rank products by relevance (FR-59)
      const rankedProducts = this.ranker.rankProducts(allNewProducts);
      const rankedUpdates = this.ranker.rankProducts(allMajorUpdates);

      // Generate HTML digest (FR-41-47)
      const digestHtml = this.digestGenerator.generate({
        periodFrom: runSummary.periodFrom,
        periodTo: runSummary.periodTo,
        newProducts: rankedProducts,
        majorUpdates: rankedUpdates,
        totalManufacturers: runSummary.totalManufacturers,
        failedManufacturers: runSummary.failedManufacturerNames,
        successfulManufacturers: runSummary.successfulManufacturers,
        maxItems: 20
      });

      // Send email (FR-48-51)
      try {
        await this.emailSender.send(digestHtml, {
          periodFrom: runSummary.periodFrom,
          periodTo: runSummary.periodTo,
          productsCount: rankedProducts.length + rankedUpdates.length,
        });
        runSummary.emailStatus = 'sent';
        console.log(`[EMAIL] ✓ Digest sent successfully`);
      } catch (err) {
        runSummary.emailStatus = 'failed';
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`[EMAIL] ✗ Failed to send digest: ${errorMsg}`);
        // FR-57: Critical alert
        await this.monitor.sendAlert(`Digest email failed: ${errorMsg}`);
      }

      // Persist digest record in DB (FR-39)
      try {
        const digestId = `digest_${Date.now()}`;
        DigestModel.insert({
          id: digestId,
          period_from: runSummary.periodFrom.toISOString(),
          period_to: runSummary.periodTo.toISOString(),
          sent_at: runSummary.emailStatus === 'sent' ? new Date().toISOString() : null,
          recipient: this.settings.email.recipients.join(', '),
          subject: `Новинки європейських виробників освітлення | ${runSummary.periodFrom.toLocaleDateString('uk-UA')}–${runSummary.periodTo.toLocaleDateString('uk-UA')}`,
          status: runSummary.emailStatus === 'sent' ? 'sent' : 'failed',
          products_count: rankedProducts.length + rankedUpdates.length,
          html_content: digestHtml
        });

      } catch (err) {
        console.warn('[DB] Failed saving digest record to SQLite:', err);
      }
    } else {

      console.log(`[BASELINE] Baseline mode — no digest sent (FR-34)`);
      runSummary.emailStatus = 'skipped_baseline';
    }

    // ========================================================================
    // Run Summary (Section 26 of ТЗ)
    // ========================================================================
    const endTime = new Date();
    console.log(`\n${'='.repeat(70)}`);
    console.log(`[SUMMARY] Run ${runId} completed at ${endTime.toISOString()}`);
    console.log(`  Duration: ${Math.round((endTime.getTime() - startTime.getTime()) / 1000)}s`);
    console.log(`  Manufacturers: ${runSummary.successfulManufacturers}/${runSummary.totalManufacturers} successful`);
    console.log(`  Pages checked: ${runSummary.pagesChecked}`);
    console.log(`  Candidates: ${runSummary.candidatesFound}`);
    console.log(`  New products: ${runSummary.newProducts}`);
    console.log(`  Major updates: ${runSummary.majorUpdates}`);
    console.log(`  Duplicates removed: ${runSummary.duplicatesRemoved}`);
    console.log(`  Uncertain: ${runSummary.uncertainItems}`);
    console.log(`  LLM calls: ${runSummary.llmCalls}`);
    console.log(`  Email: ${runSummary.emailStatus}`);
    if (runSummary.errors.length > 0) {
      console.log(`  Errors (${runSummary.errors.length}):`);
      runSummary.errors.forEach(e => console.log(`    - ${e}`));
    }
    console.log(`${'='.repeat(70)}\n`);

    // Save run summary to DB
    this.monitor.saveRunSummary(runSummary);

    // FR-57: Alert if critical failure
    if (runSummary.failedManufacturers > 0 && runSummary.emailStatus === 'failed') {
      await this.monitor.sendAlert(
        `Critical: ${runSummary.failedManufacturers} manufacturers failed AND digest not sent`
      );
    }
  }

  /**
   * Discover all relevant URLs for a manufacturer (FR-08)
   */
  private async discoverUrls(manufacturer: ManufacturerConfig) {
    const urls: Array<{ url: string; source: string }> = [];

    // 1. Sitemap (FR-08)
    if (manufacturer.sitemap_url) {
      try {
        const sitemapUrls = await this.sitemapParser.parse(manufacturer.sitemap_url);
        sitemapUrls.forEach((u: { loc: string }) => urls.push({ url: u.loc, source: 'sitemap' }));
      } catch (err) {
        console.log(`  → Sitemap unavailable for ${manufacturer.name}`);
      }
    }

    // 2. Product listing page
    if (manufacturer.products_url) {
      try {
        const productLinks = await this.crawler.extractLinks(
          manufacturer.products_url,
          manufacturer.domain
        );
        productLinks.forEach((u: string) => urls.push({ url: u, source: 'product_listing' }));
      } catch (err) {
        console.log(`  → Product listing failed for ${manufacturer.name}`);
      }
    }

    // 3. News/New Products page
    if (manufacturer.news_url) {
      try {
        const newsLinks = await this.crawler.extractLinks(
          manufacturer.news_url,
          manufacturer.domain
        );
        newsLinks.forEach((u: string) => urls.push({ url: u, source: 'news' }));
      } catch (err) {
        console.log(`  → News page failed for ${manufacturer.name}`);
      }

    }

    // Deduplicate URLs
    const seen = new Set<string>();
    return urls.filter(u => {
      const normalized = this.deduplicator.normalizeUrl(u.url);
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
  }
}

// ============================================================================
// CLI Entry Point
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  // Initialize database
  initDatabase();
  
  const pipeline = new LumenRadarPipeline();

  switch (command) {
    case 'run':
      // Manual run (FR-07)
      await pipeline.executePipeline();
      break;

    case 'baseline':
      // First run — create baseline (FR-34)
      console.log('[INIT] Creating baseline for all manufacturers...');
      await pipeline.executePipeline({ isBaseline: true });
      break;

    case 'run-one': {
      // Single manufacturer run (NFR-07)
      const id = args[1];
      if (!id) {
        console.error('Usage: run-one <manufacturer_id> (e.g. erco, targetti, zumtobel)');
        process.exit(1);
      }
      await pipeline.executePipeline({ manufacturerId: id });
      break;
    }


    case 'schedule':
      // Start scheduler (FR-04)
      console.log('[SCHEDULER] Starting 14-day schedule...');
      const scheduler = new Scheduler(loadSettings().schedule);
      scheduler.start(() => pipeline.executePipeline());
      break;

    case 'help':
    default:
      console.log(`
LumenRadar AI — Lighting Market Intelligence System
====================================================

Commands:
  baseline      Create initial baseline for all 20 manufacturers (first run)
  run           Execute one full crawl cycle manually
  run-one <id>  Run for a single manufacturer by ID
  schedule      Start the 14-day automated scheduler

Environment:
  GEMINI_API_KEY    Google Gemini API key (required)
  SMTP_PASSWORD     SMTP password for email sending
`);
  }
}

main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
