export interface RunSummary {
    executionId: string;
    startTime: Date;
    endTime: Date;
    durationMs: number;
    totalPagesScanned: number;
    totalPagesPreviousRun: number;
    manufacturersChecked: number;
    newProductsFound: number;
    errorsByManufacturer: Record<string, string>;
    status: 'success' | 'partial_success' | 'failure';
}

export class SystemMonitor {
    private logger = console; // Basic structured logger

    public logInfo(message: string, context?: Record<string, any>) {
        this.logger.info(JSON.stringify({ level: 'INFO', timestamp: new Date().toISOString(), message, ...context }));
    }

    public logError(message: string, error: Error, context?: Record<string, any>) {
        // No secrets in logs (FR-58) - assume context is sanitized
        this.logger.error(JSON.stringify({ 
            level: 'ERROR', 
            timestamp: new Date().toISOString(), 
            message, 
            errorMessage: error.message,
            stack: error.stack,
            ...context 
        }));
    }

    // Technical alerts for critical failures (FR-57)
    public sendTechnicalAlert(subject: string, message: string) {
        // Here we would integrate with PagerDuty, Slack, or direct email
        this.logError('TECHNICAL ALERT', new Error(subject), { alertMessage: message });
    }

    // Anomaly detection: if pages count drops >70% from previous run -> alert (FR-56)
    public checkAnomalies(currentPages: number, previousPages: number) {
        if (previousPages === 0) return; // No baseline

        const dropPercentage = ((previousPages - currentPages) / previousPages) * 100;
        
        if (dropPercentage > 70) {
            this.sendTechnicalAlert(
                'Anomaly Detected: Massive drop in scanned pages',
                `Pages scanned dropped by ${dropPercentage.toFixed(2)}%. Previous: ${previousPages}, Current: ${currentPages}`
            );
        }
    }

    // Error isolation is handled by caller catching errors per manufacturer and recording them,
    // this generates the final run summary from section 26
    public generateRunSummary(summary: RunSummary) {
        this.logInfo('Run Summary Completed', summary);
        
        // Output structured summary
        return summary;
    }
}

import { CrawlRunModel } from '../db/models.js';

export class Monitor {
    private settings: any;
    private systemMonitor = new SystemMonitor();

    constructor(settings: any = {}) {
        this.settings = settings;
    }

    startCrawlRun(manufacturerId: number | string): string {
        const id = `crawl_${manufacturerId}_${Date.now()}`;
        try {
            CrawlRunModel.insert({
                id,
                manufacturer_id: String(manufacturerId),
                status: 'running',
                pages_checked: 0,
                candidates_found: 0,
                products_confirmed: 0,
                error_log: null
            });
        } catch (e) {
            console.warn('[Monitor] Failed inserting crawl run in DB:', e);
        }
        return id;
    }

    completeCrawlRun(runId: string, status: string, stats?: { pagesChecked?: number; candidatesFound?: number; productsConfirmed?: number; errorLog?: string }) {
        try {
            CrawlRunModel.updateStatus(runId, status, stats?.errorLog || null);
        } catch (e) {
            console.warn('[Monitor] Failed updating crawl run status:', e);
        }
    }

    async checkAnomaly(manufacturerId: number | string, currentPages: number) {
        this.systemMonitor.checkAnomalies(currentPages, 10);
    }

    async sendAlert(message: string) {
        this.systemMonitor.sendTechnicalAlert('Alert', message);
    }

    saveRunSummary(summary: any) {
        this.systemMonitor.logInfo('Run summary recorded', summary);
    }
}

