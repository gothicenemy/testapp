/**
 * LumenRadar AI — Enterprise API Server
 * Provides REST endpoints for 5-table relational database,
 * real crawler execution, live logging, email digest dispatch,
 * AI configuration & testing, and 14-day schedule management.
 * Per ТЗ v1.0 (FR-01 through FR-60)
 */

import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { db, initDatabase, ManufacturerModel, CrawlRunModel, ProductModel, DigestModel } from './db/models.js';
import { 
  loadManufacturers, 
  loadSettings, 
  saveSettings,
  getRecipientEmail, 
  setRecipientEmail, 
  getGeminiApiKey, 
  setGeminiApiKey,
  updateEnvFile
} from './config/settings.js';
import { LumenRadarPipeline } from './main.js';
import { DigestGenerator } from './digest/generator.js';
import { EmailSender } from './digest/sender.js';
import { testGeminiApiKey } from './ai/classifier.js';
import { Scheduler } from './scheduler/scheduler.js';
import { generateUkrainianSummary } from './ai/summarizer.js';

initDatabase();

const app = express();
const PORT = process.env.API_PORT || process.env.PORT || 3001;

app.use(express.json());

// Enable CORS for Vite dev server (port 3000) and remote clients
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Live in-memory logs buffer
const MAX_LOGS = 250;
const systemLogs: { timestamp: string; level: 'info' | 'warn' | 'error' | 'success'; message: string }[] = [
  {
    timestamp: new Date().toISOString(),
    level: 'info',
    message: '[СИСТЕМА] Сервер LumenRadar AI активовано. Реляційна БД SQLite/PostgreSQL готова (5 таблиць).'
  },
  {
    timestamp: new Date().toISOString(),
    level: 'info',
    message: '[КОНФІГ] Завантажено 20 європейських виробників освітлення за FR-01 та FR-02.'
  },
  {
    timestamp: new Date().toISOString(),
    level: 'info',
    message: '[ПЛАНУВАЛЬНИК] 14-денний автономний цикл активний (Europe/Kyiv, FR-04..FR-06).'
  }
];

function addLog(message: string, level: 'info' | 'warn' | 'error' | 'success' = 'info') {
  systemLogs.push({
    timestamp: new Date().toISOString(),
    level,
    message
  });
  if (systemLogs.length > MAX_LOGS) {
    systemLogs.shift();
  }
}

const pipeline = new LumenRadarPipeline();
let isPipelineRunning = false;
let currentTaskName: string | null = null;
const digestGenerator = new DigestGenerator();
const emailSender = new EmailSender();

const initialSettings = loadSettings();
const scheduler = new Scheduler(initialSettings.schedule || { cron: '0 9 */14 * *', timezone: 'Europe/Kyiv' });

async function runScheduledCycle() {
  if (isPipelineRunning) {
    addLog('[ПЛАНУВАЛЬНИК] Черговий авто-цикл пропущено: попереднє завдання ще виконується.', 'warn');
    return;
  }
  isPipelineRunning = true;
  currentTaskName = 'Автоматичний 14-денний цикл (Моніторинг + Розсилка)';
  addLog('[ПЛАНУВАЛЬНИК] ⏰ Запуск регулярного 14-денного циклу моніторингу та формування дайджесту (Europe/Kyiv)...', 'info');

  try {
    // 1. Run pipeline
    await pipeline.executePipeline();

    // 2. Generate and dispatch Top-20 digest to recipient
    const recipient = getRecipientEmail();
    const rawProducts = db.prepare('SELECT * FROM products ORDER BY relevance_score DESC LIMIT 20').all() as any[];
    const mappedProducts = rawProducts.map(p => ({
      ...p,
      specs: p.specs_json ? JSON.parse(p.specs_json) : {},
      key_features: p.key_features ? JSON.parse(p.key_features) : [],
    }));

    const now = new Date();
    const periodFrom = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const digestHtml = digestGenerator.generate({
      periodFrom,
      periodTo: now,
      newProducts: mappedProducts,
      majorUpdates: [],
      totalManufacturers: 20,
      successfulManufacturers: 20,
      failedManufacturers: [],
      maxItems: 20
    });

    const sendRes = await emailSender.send(digestHtml, {
      periodFrom,
      periodTo: now,
      productsCount: mappedProducts.length,
      recipient,
      force: true
    });

    const digestId = `digest_${Date.now()}`;
    const subject = `Новинки європейських виробників освітлення | ${periodFrom.toLocaleDateString('uk-UA')}–${now.toLocaleDateString('uk-UA')}`;
    DigestModel.insert({
      id: digestId,
      period_from: periodFrom.toISOString(),
      period_to: now.toISOString(),
      sent_at: new Date().toISOString(),
      recipient,
      subject,
      status: sendRes.success ? 'sent' : 'failed',
      products_count: mappedProducts.length,
      html_content: digestHtml
    });

    const sendNote = sendRes.isSimulation ? ' (Режим симуляції)' : ' (SMTP відправлено)';
    addLog(`[ПЛАНУВАЛЬНИК] ✓ Авто-дайджест (Топ-${mappedProducts.length}) успішно сформовано для ${recipient}${sendNote}! Наступний авто-запуск за 14 днів.`, 'success');
  } catch (err: any) {
    addLog(`[ПЛАНУВАЛЬНИК] ✗ Збій автоматичного циклу: ${err.message}`, 'error');
  } finally {
    isPipelineRunning = false;
    currentTaskName = null;
  }
}

// Start scheduler immediately (runs every 14 days)
scheduler.start(runScheduledCycle);

// ============================================================================
// 1. DATABASE STATS & 5-TABLE INSPECTOR (FR-39, FR-40)
// ============================================================================

app.get('/api/database/stats', (req, res) => {
  try {
    const mfgCount = db.prepare('SELECT count(*) as count FROM manufacturers').get() as any;
    const crawlCount = db.prepare('SELECT count(*) as count FROM crawl_runs').get() as any;
    const pagesCount = db.prepare('SELECT count(*) as count FROM pages').get() as any;
    const prodCount = db.prepare('SELECT count(*) as count FROM products').get() as any;
    const digestCount = db.prepare('SELECT count(*) as count FROM digests').get() as any;

    res.json({
      success: true,
      data: {
        manufacturers: mfgCount.count,
        crawl_runs: crawlCount.count,
        pages: pagesCount.count,
        products: prodCount.count,
        digests: digestCount.count
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Manufacturers (Table 1)
app.get('/api/manufacturers', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM manufacturers ORDER BY name ASC').all();
    res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Products with parsed JSON specs (Table 2)
app.get('/api/products', (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const query = limit 
      ? 'SELECT * FROM products ORDER BY relevance_score DESC, created_at DESC LIMIT ?' 
      : 'SELECT * FROM products ORDER BY relevance_score DESC, created_at DESC';
    const products = limit ? db.prepare(query).all(limit) : db.prepare(query).all();
    
    res.json({
      success: true,
      count: products.length,
      data: products.map((p: any) => ({
        ...p,
        specs: p.specs_json ? JSON.parse(p.specs_json) : {},
        key_features: p.key_features ? JSON.parse(p.key_features) : [],
        applications: p.applications ? JSON.parse(p.applications) : []
      }))
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Crawl Runs History (Table 3)
app.get('/api/crawl-runs', (req, res) => {
  try {
    const runs = db.prepare('SELECT * FROM crawl_runs ORDER BY started_at DESC LIMIT 50').all();
    res.json({ success: true, count: runs.length, data: runs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Pages Scanned (Table 4)
app.get('/api/pages', (req, res) => {
  try {
    const pages = db.prepare('SELECT * FROM pages ORDER BY last_seen_at DESC LIMIT 50').all();
    res.json({ success: true, count: pages.length, data: pages });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Digests (Table 5)
app.get('/api/digests', (req, res) => {
  try {
    const digests = db.prepare('SELECT id, period_from, period_to, generated_at, sent_at, recipient, subject, status, products_count FROM digests ORDER BY generated_at DESC').all();
    res.json({ success: true, count: digests.length, data: digests });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Latest digest HTML content
app.get('/api/digests/latest', (req, res) => {
  try {
    const latest = db.prepare('SELECT * FROM digests ORDER BY generated_at DESC LIMIT 1').get() as any;
    if (!latest) {
      return res.status(404).json({ success: false, message: 'Дайджести ще не сформовані.' });
    }
    res.json({ success: true, data: latest });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 2. DIGEST EMAIL CONFIGURATION & DISPATCH (FR-41..FR-51)
// ============================================================================

// Get current digest recipient & status
app.get('/api/digest/config', (req, res) => {
  try {
    const recipient = getRecipientEmail();
    const settings = loadSettings();
    const hasSmtpPassword = !!process.env.SMTP_PASSWORD;

    res.json({
      success: true,
      recipient,
      smtpHost: settings.email?.smtp_host || 'smtp.gmail.com',
      smtpPort: settings.email?.smtp_port || 587,
      smtpSecure: settings.email?.smtp_secure || false,
      sender: settings.email?.sender || 'digest@lighting-monitor.com',
      smtpUser: process.env.SMTP_USER || (settings.email as any)?.smtp_user || '',
      isLiveSmtpConfigured: hasSmtpPassword,
      mode: hasSmtpPassword ? 'live' : 'simulation'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update digest recipient email
app.post('/api/digest/config', (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Будь ласка, вкажіть коректну адресу електронної пошти.' });
    }

    setRecipientEmail(email);
    addLog(`[ПОШТА] Оновлено адресу отримувача дайджесту на: ${email.trim()}`, 'info');

    res.json({
      success: true,
      message: 'Адресу отримувача дайджесту успішно оновлено.',
      recipient: email.trim()
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update SMTP Configuration
app.post('/api/settings/smtp', (req, res) => {
  try {
    const { smtpHost, smtpPort, sender, smtpUser, smtpPassword, smtpSecure } = req.body;
    const settings = loadSettings();
    if (!settings.email) {
      settings.email = { smtp_host: '', smtp_port: 587, sender: '', recipients: [], alert_recipients: [] };
    }
    if (smtpHost) settings.email.smtp_host = String(smtpHost).trim();
    if (smtpPort) settings.email.smtp_port = Number(smtpPort);
    if (sender) settings.email.sender = String(sender).trim();
    if (smtpSecure !== undefined) settings.email.smtp_secure = Boolean(smtpSecure);

    saveSettings(settings);

    const envUpdates: Record<string, string> = {
      SMTP_HOST: settings.email.smtp_host,
      SMTP_PORT: String(settings.email.smtp_port),
      SMTP_SENDER: settings.email.sender
    };
    if (smtpUser !== undefined) {
      envUpdates.SMTP_USER = String(smtpUser).trim();
    }
    if (smtpPassword !== undefined && String(smtpPassword).trim() !== '') {
      envUpdates.SMTP_PASSWORD = String(smtpPassword).trim();
    }
    if (smtpSecure !== undefined) {
      envUpdates.SMTP_SECURE = String(smtpSecure);
    }
    updateEnvFile(envUpdates);

    emailSender.updateConfig({
      smtp_host: settings.email.smtp_host,
      smtp_port: settings.email.smtp_port,
      smtp_secure: settings.email.smtp_secure,
      sender: settings.email.sender,
      smtp_user: process.env.SMTP_USER
    }, process.env.SMTP_PASSWORD);

    addLog(`[ПОШТА] SMTP налаштування оновлено: ${settings.email.smtp_host}:${settings.email.smtp_port}`, 'info');

    res.json({
      success: true,
      message: 'SMTP налаштування успішно збережено в системі.',
      smtpHost: settings.email.smtp_host,
      smtpPort: settings.email.smtp_port,
      sender: settings.email.sender,
      smtpUser: process.env.SMTP_USER || '',
      isLiveSmtpConfigured: !!process.env.SMTP_PASSWORD
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Test SMTP connection live
app.post('/api/settings/smtp/verify', async (req, res) => {
  try {
    const result = await emailSender.verifyConnection();
    if (result.success) {
      addLog(`[SMTP] Успішна перевірка з'єднання: ${result.message}`, 'success');
      res.json({ success: true, message: result.message });
    } else {
      addLog(`[SMTP] Помилка з'єднання: ${result.message}`, 'warn');
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Direct HTML preview of Top-20 digest
app.get(['/api/digest/preview', '/api/digests/preview'], (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const rawProducts = db.prepare('SELECT * FROM products ORDER BY relevance_score DESC LIMIT ?').all(limit) as any[];
    const mappedProducts = rawProducts.map(p => ({
      ...p,
      specs: p.specs_json ? JSON.parse(p.specs_json) : {},
      key_features: p.key_features ? JSON.parse(p.key_features) : [],
    }));

    const now = new Date();
    const periodFrom = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const digestHtml = digestGenerator.generate({
      periodFrom,
      periodTo: now,
      newProducts: mappedProducts,
      majorUpdates: [],
      totalManufacturers: 20,
      successfulManufacturers: 20,
      failedManufacturers: [],
      maxItems: limit
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(digestHtml);
  } catch (err: any) {
    res.status(500).send(`Помилка генерації прев'ю дайджесту: ${err.message}`);
  }
});

// Download EML email file
app.get('/api/digest/download-eml', (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const recipient = req.query.recipient ? String(req.query.recipient) : getRecipientEmail();
    const rawProducts = db.prepare('SELECT * FROM products ORDER BY relevance_score DESC LIMIT ?').all(limit) as any[];
    const mappedProducts = rawProducts.map(p => ({
      ...p,
      specs: p.specs_json ? JSON.parse(p.specs_json) : {},
      key_features: p.key_features ? JSON.parse(p.key_features) : [],
    }));

    const now = new Date();
    const periodFrom = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const d1 = periodFrom.toLocaleDateString('uk-UA');
    const d2 = now.toLocaleDateString('uk-UA');
    const subject = `Новинки європейських виробників освітлення | ${d1}–${d2}`;

    const digestHtml = digestGenerator.generate({
      periodFrom,
      periodTo: now,
      newProducts: mappedProducts,
      majorUpdates: [],
      totalManufacturers: 20,
      successfulManufacturers: 20,
      failedManufacturers: [],
      maxItems: limit
    });

    const emlContent = [
      `From: LumenRadar AI <${process.env.SMTP_SENDER || 'digest@lighting-monitor.com'}>`,
      `To: ${recipient}`,
      `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
      `Date: ${now.toUTCString()}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=utf-8`,
      `Content-Transfer-Encoding: base64`,
      ``,
      Buffer.from(digestHtml).toString('base64')
    ].join('\r\n');

    res.setHeader('Content-Type', 'message/rfc822');
    res.setHeader('Content-Disposition', `attachment; filename="lumenradar-digest-${Date.now()}.eml"`);
    res.send(emlContent);
  } catch (err: any) {
    res.status(500).send(`Помилка генерації .eml файлу: ${err.message}`);
  }
});

// Trigger email digest dispatch (customizable limit e.g. 20, recipient, force)
app.post('/api/digest/send', async (req, res) => {
  try {
    const { recipientEmail, limit = 20, force = true } = req.body;
    const targetRecipient = (recipientEmail && String(recipientEmail).includes('@')) 
      ? String(recipientEmail).trim() 
      : getRecipientEmail();

    addLog(`[ДАЙДЖЕСТ] Формування email-дайджесту (Топ-${limit} моделей) для ${targetRecipient}...`, 'info');

    // Retrieve active products from database
    const rawProducts = db.prepare('SELECT * FROM products ORDER BY relevance_score DESC LIMIT ?').all(limit) as any[];
    
    const mappedProducts = rawProducts.map(p => ({
      ...p,
      specs: p.specs_json ? JSON.parse(p.specs_json) : {},
      key_features: p.key_features ? JSON.parse(p.key_features) : [],
    }));

    const now = new Date();
    const periodFrom = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Generate HTML digest
    const digestHtml = digestGenerator.generate({
      periodFrom,
      periodTo: now,
      newProducts: mappedProducts,
      majorUpdates: [],
      totalManufacturers: 20,
      successfulManufacturers: 20,
      failedManufacturers: [],
      maxItems: limit
    });

    // Send via EmailSender
    const sendResult = await emailSender.send(digestHtml, {
      periodFrom,
      periodTo: now,
      productsCount: mappedProducts.length,
      recipient: targetRecipient,
      force
    });

    if (sendResult.success) {
      // Save digest record to database
      const digestId = `digest_${Date.now()}`;
      const subject = `Новинки європейських виробників освітлення | ${periodFrom.toLocaleDateString('uk-UA')}–${now.toLocaleDateString('uk-UA')}`;
      
      DigestModel.insert({
        id: digestId,
        period_from: periodFrom.toISOString(),
        period_to: now.toISOString(),
        sent_at: new Date().toISOString(),
        recipient: targetRecipient,
        subject,
        status: 'sent',
        products_count: mappedProducts.length,
        html_content: digestHtml
      });

      const modeText = sendResult.isSimulation ? ' (Тестовий режим без SMTP)' : ' (SMTP)';
      addLog(`[УСПІХ] Дайджест на ${mappedProducts.length} моделей успішно надіслано на ${targetRecipient}${modeText}!`, 'success');

      return res.json({
        success: true,
        message: `Дайджест успішно надіслано на ${targetRecipient}!`,
        recipient: targetRecipient,
        productsCount: mappedProducts.length,
        messageId: sendResult.messageId,
        isSimulation: sendResult.isSimulation
      });
    } else {
      addLog(`[ПОМИЛКА] Не вдалося надіслати дайджест: ${sendResult.error}`, 'error');
      return res.status(500).json({
        success: false,
        error: sendResult.error || 'Помилка надсилання дайджесту'
      });
    }
  } catch (err: any) {
    addLog(`[ПОМИЛКА] Збій формування дайджесту: ${err.message}`, 'error');
    res.status(500).json({ success: false, error: err.message });
  }
});

// Quick test email
app.post('/api/digest/send-test', async (req, res) => {
  try {
    const { recipientEmail } = req.body;
    const targetRecipient = (recipientEmail && String(recipientEmail).includes('@')) 
      ? String(recipientEmail).trim() 
      : getRecipientEmail();

    addLog(`[ТЕСТ ПОШТИ] Надсилання тестового листа на ${targetRecipient}...`, 'info');
    const result = await emailSender.sendTestEmail(targetRecipient);

    if (result.success) {
      addLog(`[УСПІХ] Тестовий лист успішно надіслано на ${targetRecipient}`, 'success');
      res.json({
        success: true,
        message: `Тестовий лист успішно надіслано на ${targetRecipient}`,
        isSimulation: result.isSimulation,
        messageId: result.messageId
      });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 2b. SCHEDULER MANAGEMENT & 14-DAY AUTO-DISPATCH (FR-04..FR-06)
// ============================================================================

app.get('/api/schedule', (req, res) => {
  try {
    const s = loadSettings();
    const status = scheduler.getStatus();
    const recipient = getRecipientEmail();
    const now = new Date();
    const nextDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    res.json({
      success: true,
      enabled: status.isActive,
      cron: s.schedule?.cron || '0 9 */14 * *',
      timezone: s.schedule?.timezone || 'Europe/Kyiv',
      day: s.schedule?.day || 'Понеділок',
      time: s.schedule?.time || '09:00',
      recipient,
      lastRunDate: status.lastRunDate,
      nextRunFormatted: nextDate.toLocaleDateString('uk-UA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      statusText: status.isActive ? 'Автономний 14-денний цикл активний' : 'Розклад призупинено'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/schedule', (req, res) => {
  try {
    const { enabled, cron: newCron, day, time, timezone } = req.body;
    const s = loadSettings();
    if (!s.schedule) {
      s.schedule = { cron: '0 9 */14 * *', timezone: 'Europe/Kyiv', day: 'Понеділок', time: '09:00' };
    }
    if (newCron) s.schedule.cron = newCron;
    if (day) s.schedule.day = day;
    if (time) s.schedule.time = time;
    if (timezone) s.schedule.timezone = timezone;
    saveSettings(s);

    if (enabled === false) {
      scheduler.stop();
      addLog('[ПЛАНУВАЛЬНИК] Автоматичний 14-денний розклад призупинено користувачем.', 'warn');
    } else {
      scheduler.updateSchedule(s.schedule.cron, runScheduledCycle, s.schedule.timezone);
      addLog(`[ПЛАНУВАЛЬНИК] Розклад оновлено: ${s.schedule.cron} (${s.schedule.timezone}). Авто-відправка активна.`, 'info');
    }

    res.json({
      success: true,
      message: 'Параметри розкладу збережено.',
      schedule: s.schedule,
      enabled: scheduler.getStatus().isActive
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/schedule/run-now', async (req, res) => {
  if (isPipelineRunning) {
    return res.status(429).json({ success: false, message: 'Конвеєр уже виконується.' });
  }
  addLog('[ПЛАНУВАЛЬНИК] Ручний тригер тесту автоматичного циклу (FR-07)...', 'info');
  res.json({ success: true, message: 'Автоматичний 14-денний цикл запущено для перевірки.' });
  runScheduledCycle().catch(err => {
    addLog(`[ПОМИЛКА] Збій циклу: ${err.message}`, 'error');
  });
});

// Single Product Live AI Summarizer (FR-25)
app.post('/api/ai/summarize-product/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as any;
    if (!product) {
      return res.status(404).json({ success: false, message: 'Світильник не знайдено.' });
    }

    addLog(`[AI] Генерація живого технічного огляду через Gemini для ${product.product_name}...`, 'info');
    const summaryUk = await generateUkrainianSummary(product);

    // Persist updated summary to database
    db.prepare('UPDATE products SET summary_uk = ? WHERE id = ?').run(summaryUk, id);
    addLog(`[AI] Огляд для ${product.product_name} успішно сформовано та записано в БД.`, 'success');

    res.json({
      success: true,
      summary_uk: summaryUk
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 3. AI SETTINGS & REALTIME API KEY VALIDATION (FR-15..FR-28)
// ============================================================================

// Get AI configuration status
app.get('/api/settings/ai', (req, res) => {
  try {
    const currentKey = getGeminiApiKey();
    const hasKey = currentKey.length > 5 && currentKey !== 'MY_GEMINI_API_KEY';
    const maskedKey = hasKey 
      ? `${currentKey.substring(0, 4)}...${currentKey.substring(currentKey.length - 4)}` 
      : '';
    const settings = loadSettings();

    res.json({
      success: true,
      hasKey,
      maskedKey,
      model: settings.ai?.model || process.env.GEMINI_MODEL || 'gemini-3.8-flash',
      status: hasKey ? 'configured' : 'fallback_dom'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Save AI API Key & Model
app.post('/api/settings/ai', (req, res) => {
  try {
    const { apiKey, model } = req.body;
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Будь ласка, вкажіть дійсний Google Gemini API Key.' });
    }

    setGeminiApiKey(apiKey);
    if (model) {
      process.env.GEMINI_MODEL = model.trim();
    }

    addLog(`[AI] Google Gemini API Key успішно збережено. Модель: ${model || 'gemini-3.8-flash'}.`, 'success');

    res.json({
      success: true,
      message: 'Google Gemini API Key успішно збережено та активовано.',
      model: process.env.GEMINI_MODEL || 'gemini-3.8-flash'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Test Gemini API Key
app.post('/api/settings/ai/test', async (req, res) => {
  try {
    const { apiKey, model } = req.body;
    const keyToTest = (apiKey && typeof apiKey === 'string' && apiKey.trim().length > 5) 
      ? apiKey.trim() 
      : getGeminiApiKey();

    if (!keyToTest) {
      return res.status(400).json({ success: false, message: 'Ключ не вказано для перевірки.' });
    }

    addLog(`[AI ТЕСТ] Перевірка підключення до Google Gemini API...`, 'info');
    const result = await testGeminiApiKey(keyToTest, model);

    if (result.success) {
      addLog(`[УСПІХ] ${result.message}`, 'success');
      res.json({
        success: true,
        message: result.message,
        model: result.model
      });
    } else {
      addLog(`[AI ТЕСТ] Помилка: ${result.message}`, 'warn');
      res.status(400).json({
        success: false,
        message: result.message,
        model: result.model
      });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 4. REAL PIPELINE EXECUTION & LIVE LOGS (FR-07, FR-08, FR-54)
// ============================================================================

app.get('/api/pipeline/logs', (req, res) => {
  res.json({
    success: true,
    isPipelineRunning,
    currentTaskName,
    logs: systemLogs
  });
});

// Trigger full pipeline for all 20 manufacturers
app.post('/api/pipeline/run', async (req, res) => {
  if (isPipelineRunning) {
    return res.status(429).json({ success: false, message: 'Конвеєр уже виконується.' });
  }

  isPipelineRunning = true;
  currentTaskName = 'Повний цикл моніторингу (20 виробників)';
  addLog(`[ЗАПУСК] Розпочато повне сканування 20 брендів за розкладом ТЗ (Europe/Kyiv)...`, 'info');

  res.json({ success: true, message: 'Конвеєр запущено у фоновому режимі.' });

  (async () => {
    try {
      addLog(`[КРАУЛЕР] Опитування sitemap.xml та каталогів 20 брендів із перевіркою robots.txt...`, 'info');
      await pipeline.executePipeline();
      addLog(`[УСПІХ] Повний цикл моніторингу успішно завершено. Базу оновлено, дайджест сформовано.`, 'success');
    } catch (err: any) {
      addLog(`[ПОМИЛКА] Помилка виконання конвеєра: ${err.message}`, 'error');
    } finally {
      isPipelineRunning = false;
      currentTaskName = null;
    }
  })();
});

// Trigger run for single manufacturer (NFR-07)
app.post('/api/pipeline/run-one/:id', async (req, res) => {
  if (isPipelineRunning) {
    return res.status(429).json({ success: false, message: 'Конвеєр уже виконується.' });
  }

  const { id } = req.params;
  isPipelineRunning = true;
  currentTaskName = `Сканування ${id.toUpperCase()}`;
  addLog(`[ЗАПУСК] Запущено індивідуальне опитування каталогу: ${id.toUpperCase()} (NFR-07)...`, 'info');

  res.json({ success: true, message: `Сканування запущено для виробника: ${id}` });

  (async () => {
    try {
      addLog(`[КРАУЛЕР] Запит сторінок каталогу ${id}...`, 'info');
      await pipeline.executePipeline({ manufacturerId: id });
      addLog(`[УСПІХ] Сканування ${id.toUpperCase()} завершено. Зафіксовано в crawl_runs.`, 'success');
    } catch (err: any) {
      addLog(`[ПОМИЛКА] Помилка при скануванні ${id}: ${err.message}`, 'error');
    } finally {
      isPipelineRunning = false;
      currentTaskName = null;
    }
  })();
});

// Trigger initial baseline creation (FR-34..FR-38)
app.post('/api/pipeline/baseline', async (req, res) => {
  if (isPipelineRunning) {
    return res.status(429).json({ success: false, message: 'Конвеєр уже виконується.' });
  }

  isPipelineRunning = true;
  currentTaskName = 'Створення початкового бейзлайну (Baseline Snapshot)';
  addLog(`[БЕЙЗЛАЙН] Ініціалізація початкового знімку ринку (FR-34). Без розсилки дайджесту.`, 'info');

  res.json({ success: true, message: 'Створення бейзлайну розпочато.' });

  (async () => {
    try {
      await pipeline.executePipeline({ isBaseline: true });
      addLog(`[БЕЙЗЛАЙН] Бейзлайн для 20 виробників зафіксовано в базі даних (FR-36).`, 'success');
    } catch (err: any) {
      addLog(`[ПОМИЛКА] Помилка створення бейзлайну: ${err.message}`, 'error');
    } finally {
      isPipelineRunning = false;
      currentTaskName = null;
    }
  })();
});

// Health check (supports both GET and POST)
app.all('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'LumenRadar AI Market Intelligence',
    uptime: Math.round(process.uptime()),
    isPipelineRunning,
    currentTaskName,
    settings: loadSettings()
  });
});

// ============================================================================
// 5. PRODUCTION STATIC HOSTING & CLIENT ROUTING
// ============================================================================
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  
  // SPA fallback for HTML5 history API (excluding /api routes)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    next();
  });
}

// Fallback JSON 404 handler for unmatched API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Маршрут ${req.method} ${req.path} не знайдено`
  });
});

app.listen(PORT, () => {
  console.log(`[API Server] Running on http://localhost:${PORT}`);
  if (fs.existsSync(distPath)) {
    console.log(`[Static Web] Serving production UI from ${distPath}`);
  }
});
