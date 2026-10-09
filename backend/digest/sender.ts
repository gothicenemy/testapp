import 'dotenv/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { load } from 'js-yaml';

export interface SendResult {
    success: boolean;
    messageId?: string;
    error?: string;
    timestamp: Date;
    isSimulation?: boolean;
}

export interface DigestLogEntry {
    subject: string;
    timestamp: string;
    recipients: string[];
    messageId: string;
}

export interface EmailSenderConfig {
    smtp_host: string;
    smtp_port: number;
    smtp_secure?: boolean;
    smtp_user?: string;
    sender: string;
    recipients: string[];
    cc?: string[];
    bcc?: string[];
    alert_recipients?: string[];
}

export class EmailSender {
    private transporter: nodemailer.Transporter | null = null;
    private config: EmailSenderConfig;
    private logFile = path.join(process.cwd(), 'data', 'sent_digests.json');

    constructor(configOrPath?: EmailSenderConfig | string) {
        if (!configOrPath || typeof configOrPath === 'string') {
            const configFilePath = typeof configOrPath === 'string' 
                ? configOrPath 
                : path.join(process.cwd(), 'backend', 'config', 'settings.yaml');
            
            try {
                const file = fs.readFileSync(configFilePath, 'utf8');
                const parsed = load(file) as any;
                this.config = {
                    smtp_host: process.env.SMTP_HOST || parsed.email?.smtp_host || 'smtp.gmail.com',
                    smtp_port: Number(process.env.SMTP_PORT) || parsed.email?.smtp_port || 587,
                    smtp_secure: process.env.SMTP_SECURE === 'true' || parsed.email?.smtp_secure || false,
                    smtp_user: process.env.SMTP_USER || parsed.email?.smtp_user || '',
                    sender: process.env.SMTP_SENDER || parsed.email?.sender || 'digest@lighting-monitor.com',
                    recipients: process.env.DIGEST_RECIPIENT ? [process.env.DIGEST_RECIPIENT] : (parsed.email?.recipients || ['client@company.ua']),
                    alert_recipients: parsed.email?.alert_recipients || []
                };
            } catch {
                this.config = {
                    smtp_host: process.env.SMTP_HOST || 'smtp.gmail.com',
                    smtp_port: Number(process.env.SMTP_PORT) || 587,
                    smtp_secure: false,
                    smtp_user: process.env.SMTP_USER || '',
                    sender: process.env.SMTP_SENDER || 'digest@lighting-monitor.com',
                    recipients: ['client@company.ua'],
                    alert_recipients: []
                };
            }
        } else {
            this.config = configOrPath;
        }

        this.initTransporter();
    }

    private initTransporter() {
        const rawPass = process.env.SMTP_PASSWORD || '';
        const smtpPass = rawPass.includes(' ') && rawPass.replace(/\s+/g, '').length === 16 
            ? rawPass.replace(/\s+/g, '') 
            : rawPass.trim();
        const smtpUser = process.env.SMTP_USER || this.config.smtp_user || this.config.sender;

        if (smtpPass && smtpPass !== '') {
            const isSecure = this.config.smtp_port === 465 || Boolean(this.config.smtp_secure);
            this.transporter = nodemailer.createTransport({
                host: this.config.smtp_host,
                port: this.config.smtp_port,
                secure: isSecure,
                auth: {
                    user: smtpUser,
                    pass: smtpPass
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
        } else {
            this.transporter = null;
        }
    }

    public async verifyConnection(): Promise<{ success: boolean; message: string }> {
        const rawPass = process.env.SMTP_PASSWORD || '';
        const smtpPass = rawPass.includes(' ') && rawPass.replace(/\s+/g, '').length === 16 
            ? rawPass.replace(/\s+/g, '') 
            : rawPass.trim();

        if (!smtpPass || smtpPass === '') {
            return {
                success: false,
                message: 'Пароль SMTP не налаштовано. Застосунок працює у безпечному режимі симуляції.'
            };
        }

        const smtpUser = process.env.SMTP_USER || this.config.smtp_user || this.config.sender;
        const isSecure = this.config.smtp_port === 465 || Boolean(this.config.smtp_secure);

        try {
            const testTransporter = nodemailer.createTransport({
                host: this.config.smtp_host,
                port: this.config.smtp_port,
                secure: isSecure,
                auth: {
                    user: smtpUser,
                    pass: smtpPass
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            await testTransporter.verify();
            this.transporter = testTransporter;
            return {
                success: true,
                message: `З'єднання з сервером ${this.config.smtp_host}:${this.config.smtp_port} (${smtpUser}) успішно перевірено та авторизовано!`
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Помилка перевірки SMTP: ${error.message || error}`
            };
        }
    }

    public updateConfig(newConfig: Partial<EmailSenderConfig>, password?: string) {
        this.config = { ...this.config, ...newConfig };
        if (password !== undefined) {
            process.env.SMTP_PASSWORD = password;
        }
        if (newConfig.smtp_user !== undefined) {
            process.env.SMTP_USER = newConfig.smtp_user;
            this.config.smtp_user = newConfig.smtp_user;
        }
        if (newConfig.sender) {
            process.env.SMTP_SENDER = newConfig.sender;
        }
        if (newConfig.smtp_host) {
            process.env.SMTP_HOST = newConfig.smtp_host;
        }
        if (newConfig.smtp_port) {
            process.env.SMTP_PORT = String(newConfig.smtp_port);
        }
        if (newConfig.smtp_secure !== undefined) {
            this.config.smtp_secure = newConfig.smtp_secure;
            process.env.SMTP_SECURE = String(newConfig.smtp_secure);
        }
        this.initTransporter();
    }

    public async send(
        html: string, 
        options: { 
            periodFrom: Date; 
            periodTo: Date; 
            productsCount: number; 
            recipient?: string;
            force?: boolean;
        }
    ): Promise<SendResult> {
        const d1 = options.periodFrom.toLocaleDateString('uk-UA');
        const d2 = options.periodTo.toLocaleDateString('uk-UA');
        const subject = `Новинки європейських виробників освітлення | ${d1}–${d2}`;
        const targetRecipients = options.recipient ? [options.recipient] : this.config.recipients;
        return this.sendDigest(html, subject, targetRecipients, [], [], options.force ?? false);
    }

    public async sendDigest(
        html: string, 
        subject: string, 
        recipients: string[], 
        cc: string[] = [], 
        bcc: string[] = [],
        force: boolean = false
    ): Promise<SendResult> {
        // Prevent duplicate digest sends unless forced (FR-51)
        if (!force && this.hasAlreadyBeenSent(subject)) {
            return {
                success: false,
                error: 'Дайджест за цей період уже було надіслано раніше (FR-51). Використайте примусову відправку.',
                timestamp: new Date()
            };
        }

        const validRecipients = recipients.filter(r => r && r.trim() !== '');
        if (validRecipients.length === 0) {
            return {
                success: false,
                error: 'Не вказано жодної дійсної адреси електронної пошти.',
                timestamp: new Date()
            };
        }

        const senderAddress = (process.env.SMTP_USER && process.env.SMTP_USER.includes('@')) 
            ? process.env.SMTP_USER 
            : this.config.sender;
        const mailOptions = {
            from: `LumenRadar AI <${senderAddress}>`,
            to: validRecipients.join(', '),
            cc: cc.join(', '),
            bcc: bcc.join(', '),
            subject: subject,
            html: html
        };

        // If no SMTP password, run in high-fidelity simulation mode
        if (!process.env.SMTP_PASSWORD || !this.transporter) {
            console.log(`[SMTP Simulation] Simulated email dispatch "${subject}" to ${validRecipients.join(', ')}`);
            const mockId = `<simulation-${Date.now()}@lumenradar.ai>`;
            this.logSendStatus(subject, validRecipients, mockId);
            return {
                success: true,
                messageId: mockId,
                timestamp: new Date(),
                isSimulation: true
            };
        }

        let retries = 3;
        while (retries > 0) {
            try {
                const info = await this.transporter.sendMail(mailOptions);
                this.logSendStatus(subject, validRecipients, info.messageId);
                return {
                    success: true,
                    messageId: info.messageId,
                    timestamp: new Date(),
                    isSimulation: false
                };
            } catch (error: any) {
                retries--;
                if (retries === 0) {
                    return {
                        success: false,
                        error: error.message || 'Помилка надсилання через SMTP сервер',
                        timestamp: new Date()
                    };
                }
                await new Promise(res => setTimeout(res, 1500));
            }
        }

        return { success: false, timestamp: new Date() };
    }

    public async sendTestEmail(recipient: string): Promise<SendResult> {
        const testSubject = `[Тест] LumenRadar AI — Перевірка зв'язку пошти`;
        const testHtml = `
            <div style="font-family: sans-serif; padding: 24px; background-color: #0f172a; color: #ffffff; border-radius: 12px;">
                <h2 style="color: #818cf8; margin-top: 0;">Тестове повідомлення LumenRadar AI</h2>
                <p>Цей лист підтверджує, що конфігурація електронної пошти налаштована правильно.</p>
                <p><strong>Отримувач:</strong> ${recipient}</p>
                <p><strong>Час відправки:</strong> ${new Date().toLocaleString('uk-UA')}</p>
                <hr style="border: 0; border-top: 1px solid #334155; margin: 16px 0;" />
                <small style="color: #94a3b8;">LumenRadar AI Market Intelligence • Europe/Kyiv</small>
            </div>
        `;
        return this.sendDigest(testHtml, testSubject, [recipient], [], [], true);
    }

    private hasAlreadyBeenSent(subject: string): boolean {
        try {
            if (!fs.existsSync(this.logFile)) return false;
            const logs: DigestLogEntry[] = JSON.parse(fs.readFileSync(this.logFile, 'utf8'));
            return logs.some(log => log.subject === subject);
        } catch (e) {
            return false;
        }
    }

    private logSendStatus(subject: string, recipients: string[], messageId: string) {
        try {
            const dir = path.dirname(this.logFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            let logs: DigestLogEntry[] = [];
            if (fs.existsSync(this.logFile)) {
                logs = JSON.parse(fs.readFileSync(this.logFile, 'utf8'));
            }

            logs.push({
                subject,
                timestamp: new Date().toISOString(),
                recipients,
                messageId
            });

            fs.writeFileSync(this.logFile, JSON.stringify(logs, null, 2));
        } catch (error) {
            console.error('Failed to log digest send status:', error);
        }
    }
}
