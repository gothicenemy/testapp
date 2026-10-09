import cron, { ScheduledTask } from 'node-cron';

export interface SchedulerConfig {
    cronExpression?: string;
    cron?: string;
    timezone: string;
    day?: string;
    time?: string;
}

export type JobFunction = () => Promise<void>;

export class Scheduler {
    private job: ScheduledTask | null = null;
    private config: SchedulerConfig;
    private isRunning: boolean = false;
    private lastRunDate: Date | null = null;
    private activeCronExpr: string = '0 9 */14 * *';

    constructor(config: SchedulerConfig) {
        this.config = config;
        this.activeCronExpr = config.cronExpression || config.cron || '0 9 */14 * *';
    }

    public start(task: JobFunction) {
        if (this.job) {
            this.job.stop();
        }

        const expr = this.activeCronExpr;
        this.job = cron.schedule(expr, async () => {
            console.log(`[Scheduler] Starting 14-day automated digest cycle at ${new Date().toISOString()}`);
            this.isRunning = true;
            try {
                await task();
                this.lastRunDate = new Date();
                console.log(`[Scheduler] 14-day cycle completed successfully`);
            } catch (error) {
                console.error(`[Scheduler] Task failed:`, error);
            } finally {
                this.isRunning = false;
            }
        }, {
            timezone: this.config.timezone || 'Europe/Kyiv'
        });
        
        console.log(`[Scheduler] Job scheduled with cron: ${expr} in ${this.config.timezone || 'Europe/Kyiv'}`);
    }

    public stop() {
        if (this.job) {
            this.job.stop();
            this.job = null;
            console.log('[Scheduler] Job stopped');
        }
    }

    public getStatus() {
        return {
            isActive: this.job !== null,
            isRunning: this.isRunning,
            cron: this.activeCronExpr,
            timezone: this.config.timezone || 'Europe/Kyiv',
            lastRunDate: this.lastRunDate ? this.lastRunDate.toISOString() : null,
            intervalDays: 14
        };
    }

    public updateSchedule(newCron: string, task: JobFunction, timezone?: string) {
        this.activeCronExpr = newCron;
        if (timezone) this.config.timezone = timezone;
        this.start(task);
    }
}

export const DigestScheduler = Scheduler;
