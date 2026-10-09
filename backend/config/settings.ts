import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { load, dump } from 'js-yaml';
import { fileURLToPath } from 'url';
import type { ManufacturerConfig } from '../types.js';

export interface AppSettings {
    schedule: {
        cron: string;
        timezone: string;
        day: string;
        time: string;
    };
    email: {
        smtp_host: string;
        smtp_port: number;
        smtp_secure?: boolean;
        sender: string;
        recipients: string[];
        alert_recipients: string[];
    };
    ai: {
        model: string;
        confidence_threshold: number;
        temperature: number;
    };
    crawler: {
        rate_limit_ms: number;
        max_retries: number;
        timeout_ms: number;
        user_agent: string;
        respect_robots_txt: boolean;
    };
}

let settings: AppSettings | null = null;
let manufacturers: ManufacturerConfig[] | null = null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, 'settings.yaml');

export function loadSettings(): AppSettings {
    if (settings) return settings;

    try {
        const fileContents = fs.readFileSync(configPath, 'utf8');
        settings = load(fileContents) as AppSettings;
    } catch (err) {
        // Fallback default settings
        settings = {
            schedule: { cron: "0 9 */14 * *", timezone: "Europe/Kyiv", day: "Monday", time: "09:00" },
            email: {
                smtp_host: process.env.SMTP_HOST || "smtp.example.com",
                smtp_port: Number(process.env.SMTP_PORT) || 587,
                smtp_secure: process.env.SMTP_SECURE === 'true',
                sender: process.env.SMTP_SENDER || "digest@lighting-monitor.com",
                recipients: [process.env.DIGEST_RECIPIENT || "client@company.ua"],
                alert_recipients: ["admin@company.ua"]
            },
            ai: {
                model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
                confidence_threshold: 0.75,
                temperature: 0.1
            },
            crawler: {
                rate_limit_ms: 1000,
                max_retries: 3,
                timeout_ms: 30000,
                user_agent: "LightingMonitorBot/1.0",
                respect_robots_txt: true
            }
        };
    }

    // Overlay environment variables if present
    if (process.env.DIGEST_RECIPIENT && settings.email) {
        settings.email.recipients = [process.env.DIGEST_RECIPIENT];
    }

    return settings;
}

export function saveSettings(newSettings: AppSettings): boolean {
    try {
        const yamlStr = dump(newSettings, { indent: 2 });
        fs.writeFileSync(configPath, yamlStr, 'utf8');
        settings = newSettings;
        return true;
    } catch (err) {
        console.error('[Settings] Failed to save settings.yaml:', err);
        return false;
    }
}

export function updateEnvFile(updates: Record<string, string>): void {
    try {
        const envPath = path.join(process.cwd(), '.env');
        let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
        for (const [key, val] of Object.entries(updates)) {
            process.env[key] = val;
            const regex = new RegExp(`^${key}=.*$`, 'm');
            if (regex.test(content)) {
                content = content.replace(regex, `${key}="${val}"`);
            } else {
                content += `\n${key}="${val}"\n`;
            }
        }
        fs.writeFileSync(envPath, content, 'utf8');
    } catch (err) {
        console.warn('[Settings] Notice: could not write to .env file:', err);
    }
}

export function getRecipientEmail(): string {
    const s = loadSettings();
    return s.email.recipients[0] || 'client@company.ua';
}

export function setRecipientEmail(email: string): boolean {
    const s = loadSettings();
    s.email.recipients = [email.trim()];
    updateEnvFile({ DIGEST_RECIPIENT: email.trim() });
    return saveSettings(s);
}

export function getGeminiApiKey(): string {
    return process.env.GEMINI_API_KEY || '';
}

export function setGeminiApiKey(key: string): void {
    updateEnvFile({ GEMINI_API_KEY: key.trim() });
}

export function loadManufacturers(): ManufacturerConfig[] {
    if (manufacturers) return manufacturers;

    const mfgPath = path.join(__dirname, 'manufacturers.yaml');
    const fileContents = fs.readFileSync(mfgPath, 'utf8');
    
    const parsed = load(fileContents) as any;
    manufacturers = Array.isArray(parsed) ? parsed : (parsed.manufacturers || []);
    return manufacturers;
}

export const config = loadSettings();
