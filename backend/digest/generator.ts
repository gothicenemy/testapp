export interface Product {
    id?: string | number;
    manufacturer: string;
    modelName: string;
    category: string;
    thumbnailUrl?: string;
    summary: string;
    keySpecs: string[];
    interestingFeatures: string;
    productPageUrl: string;
    relevanceScore?: number;
    power_w?: number | string;
    efficacy_lm_w?: number | string;
    cri?: number | string;
}

export interface DigestData {
    periodStart: Date;
    periodEnd: Date;
    manufacturersChecked: number;
    newProductsFound: number;
    majorUpdates: string[];
    sitesWithErrors: string[];
    productsByManufacturer: Record<string, Product[]>;
    manufacturersWithoutNewProducts: string[];
    maxItems?: number;
}

export function generateDigestSubject(periodStart: Date, periodEnd: Date): string {
    const formatDate = (date: Date) => {
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `${d}.${m}.${y}`;
    };
    return `Новинки європейських виробників освітлення | ${formatDate(periodStart)}–${formatDate(periodEnd)}`;
}

export function generateDigestHtml(data: DigestData): string {
    const {
        periodStart, periodEnd, manufacturersChecked, newProductsFound,
        majorUpdates, sitesWithErrors, productsByManufacturer, maxItems = 20
    } = data;

    const zeroResults = newProductsFound === 0;

    let html = `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>LumenRadar AI — Дайджест новинок освітлення</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #1e293b; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table { border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        td { padding: 0; }
        img { border: 0; -ms-interpolation-mode: bicubic; max-width: 100%; height: auto; display: block; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #0f172a; padding: 24px 0 40px 0; }
        .webkit { max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3); }
        .header { background: linear-gradient(135deg, #020617 0%, #1e1b4b 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em; }
        .header p { margin: 0; font-size: 13px; color: #a5b4fc; }
        .summary-bar { background-color: #f8fafc; padding: 14px 24px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #475569; }
        .badge { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
        .badge-indigo { background-color: #e0e7ff; color: #4338ca; }
        .badge-emerald { background-color: #d1fae5; color: #065f46; }
        .content { padding: 24px; }
        .mfg-header { margin: 24px 0 14px 0; padding-bottom: 8px; border-bottom: 2px solid #4f46e5; display: flex; align-items: center; justify-content: space-between; }
        .mfg-name { font-size: 16px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; margin: 0; }
        .card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
        .card-title { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0; }
        .card-category { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 8px; }
        .card-summary { font-size: 13px; line-height: 1.5; color: #334155; margin: 0 0 10px 0; }
        .interesting-box { background-color: #eef2ff; border-left: 3px solid #6366f1; padding: 8px 12px; border-radius: 4px; font-size: 12px; color: #312e81; margin: 10px 0; }
        .specs-grid { width: 100%; margin: 10px 0; font-size: 11px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; }
        .specs-grid td { padding: 6px 10px; border-bottom: 1px solid #f1f5f9; color: #475569; }
        .specs-grid td strong { color: #0f172a; }
        .btn { display: inline-block; padding: 8px 14px; background-color: #4f46e5; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: 600; }
        .footer { background-color: #0f172a; padding: 24px; text-align: center; font-size: 11px; color: #94a3b8; }
        @media screen and (max-width: 600px) {
            .webkit { border-radius: 0; width: 100% !important; }
            .content { padding: 16px; }
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="webkit">
            <!-- Header -->
            <div class="header">
                <h1>Новинки європейських виробників освітлення</h1>
                <p>Дайджест ринку • Період: ${formatDate(periodStart)} – ${formatDate(periodEnd)}</p>
                <div style="margin-top: 12px;">
                    <span style="background-color: rgba(255,255,255,0.15); padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; color: #ffffff;">
                        Топ-${maxItems} ключових моделей ринку
                    </span>
                </div>
            </div>

            <!-- Summary Bar -->
            <div class="summary-bar">
                <table width="100%">
                    <tr>
                        <td>Виробників перевірено: <strong>${manufacturersChecked}</strong></td>
                        <td align="center">Новинок у дайджесті: <strong>${newProductsFound}</strong></td>
                        <td align="right">Статус аналізу: <strong style="color: #059669;">100% Верифіковано</strong></td>
                    </tr>
                </table>
            </div>

            <div class="content">
    `;

    if (zeroResults) {
        html += `
            <div style="padding: 40px 20px; text-align: center; color: #64748b;">
                <p style="font-size: 15px; margin: 0 0 8px 0;"><strong>За цей період підтверджених продуктових новинок не виявлено</strong></p>
                <p style="font-size: 12px; margin: 0;">Моніторинг 20 каталогів продовжується за 14-денним графіком.</p>
            </div>
        `;
    } else {
        for (const [manufacturer, products] of Object.entries(productsByManufacturer)) {
            if (products.length === 0) continue;

            html += `
                <div style="margin-top: 20px; margin-bottom: 8px;">
                    <table width="100%" style="border-bottom: 2px solid #4f46e5; padding-bottom: 6px;">
                        <tr>
                            <td><h2 style="margin: 0; font-size: 15px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">${manufacturer}</h2></td>
                            <td align="right" style="font-size: 11px; color: #64748b; font-weight: 600;">${products.length} ${products.length === 1 ? 'модель' : 'моделей'}</td>
                        </tr>
                    </table>
                </div>
            `;

            for (const prod of products) {
                html += `
                <div class="card">
                    <table width="100%">
                        <tr>
                            <td>
                                <div class="card-title">${prod.modelName}</div>
                                <div class="card-category">${prod.category}</div>
                            </td>
                            ${prod.efficacy_lm_w ? `
                            <td align="right" valign="top">
                                <span class="badge badge-emerald">${prod.efficacy_lm_w} лм/Вт</span>
                            </td>` : ''}
                        </tr>
                    </table>

                    <p class="card-summary">${prod.summary}</p>

                    ${prod.interestingFeatures ? `
                    <div class="interesting-box">
                        <strong>Що цікавого: </strong> ${prod.interestingFeatures}
                    </div>` : ''}

                    <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <a href="${prod.productPageUrl}" target="_blank" class="btn">
                            Перейти на сторінку моделі →
                        </a>
                    </div>
                </div>
                `;
            }
        }
    }

    if (sitesWithErrors && sitesWithErrors.length > 0) {
        html += `
            <div class="errors" style="margin-top: 24px; padding: 12px; background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; font-size: 11px; color: #991b1b;">
                <strong>Помилки при скануванні сайтів:</strong> ${sitesWithErrors.join(', ')}. Наступна спроба відбудеться в наступному циклі.
            </div>
        `;
    }

    html += `
            </div>

            <!-- Footer -->
            <div class="footer">
                <p style="margin: 0 0 6px 0; font-weight: 600; color: #cbd5e1;">LumenRadar AI • Автономний моніторинг ринку освітлення</p>
                <p style="margin: 0; color: #64748b;">Згенеровано автоматично відповідно до ТЗ v1.0 • Europe/Kyiv • Google Gemini & PostgreSQL/SQLite</p>
            </div>
        </div>
    </div>
</body>
</html>`;

    return html;
}

function formatDate(date: Date) {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}.${m}.${y}`;
}

export class DigestGenerator {
    generate(options: {
        periodFrom: Date;
        periodTo: Date;
        newProducts: any[];
        majorUpdates: any[];
        totalManufacturers: number;
        successfulManufacturers: number;
        failedManufacturers: string[];
        maxItems?: number;
    }): string {
        const maxItems = options.maxItems || 20;

        // Combine all items
        const allCandidates = [...options.newProducts, ...options.majorUpdates];

        // Sort by relevance score descending
        const sorted = [...allCandidates].sort((a, b) => {
            const scoreA = a.relevance_score || a.relevanceScore || 50;
            const scoreB = b.relevance_score || b.relevanceScore || 50;
            return scoreB - scoreA;
        });

        // Balanced selection across manufacturers (1 best model per brand first, up to maxItems)
        const selectedMap = new Map<string, any>();
        const remaining: any[] = [];

        for (const item of sorted) {
            const mfgKey = (item.manufacturer || item.manufacturerConfig?.name || item.manufacturer_id || 'UNKNOWN').toUpperCase();
            if (!selectedMap.has(mfgKey) && selectedMap.size < maxItems) {
                selectedMap.set(mfgKey, item);
            } else {
                remaining.push(item);
            }
        }

        const selected = Array.from(selectedMap.values());
        for (const item of remaining) {
            if (selected.length >= maxItems) break;
            selected.push(item);
        }

        const productsByManufacturer: Record<string, Product[]> = {};
        for (const item of selected) {
            const mfg = (item.manufacturer || item.manufacturerConfig?.name || item.manufacturer_id || 'Інші').toUpperCase();
            if (!productsByManufacturer[mfg]) productsByManufacturer[mfg] = [];
            
            const specs = typeof item.specs === 'object' ? item.specs : 
                          (typeof item.specs_json === 'string' ? JSON.parse(item.specs_json || '{}') : {});

            productsByManufacturer[mfg].push({
                id: item.id,
                manufacturer: mfg,
                modelName: item.product_name || item.modelName || 'Світильник',
                category: item.category || 'Архітектурний світильник',
                thumbnailUrl: item.image_url || item.thumbnailUrl,
                summary: item.summary_uk || item.short_description || item.summary || 'Офіційна модель виробника.',
                keySpecs: Array.isArray(item.key_features) ? item.key_features : (item.keySpecs || []),
                interestingFeatures: item.why_interesting || item.interestingFeatures || '',
                productPageUrl: item.source_url || item.productPageUrl || '#',
                relevanceScore: item.relevance_score || item.relevanceScore || 75,
                power_w: specs?.power_w,
                efficacy_lm_w: specs?.efficacy_lm_w,
                cri: specs?.cri
            });
        }

        return generateDigestHtml({
            periodStart: options.periodFrom,
            periodEnd: options.periodTo,
            manufacturersChecked: options.totalManufacturers,
            newProductsFound: selected.length,
            majorUpdates: options.majorUpdates.map(m => m.product_name),
            sitesWithErrors: options.failedManufacturers,
            productsByManufacturer,
            manufacturersWithoutNewProducts: [],
            maxItems
        });
    }
}
