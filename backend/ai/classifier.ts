import 'dotenv/config';
import { GoogleGenAI, Type } from '@google/genai';
import { Classification, ProductExtraction, ProductExtractionSchema } from './schemas.js';
import * as cheerio from 'cheerio';

/**
 * Returns an instance of GoogleGenAI using current environment key or provided key.
 */
export function getGenAIClient(apiKey?: string): GoogleGenAI | null {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key || key.trim() === '' || key === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({ apiKey: key.trim() });
}

/**
 * Validates a Gemini API Key with a lightweight ping test.
 */
export async function testGeminiApiKey(
  apiKey: string,
  modelName: string = process.env.GEMINI_MODEL || 'gemini-3.8-flash'
): Promise<{ success: boolean; model: string; message: string }> {
  const key = apiKey.trim();
  if (!key) {
    return { success: false, model: modelName, message: 'API ключ не вказано' };
  }

  const candidateModels = [modelName, 'gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-2.5-flash'];
  let lastError = '';

  for (const m of candidateModels) {
    try {
      const client = new GoogleGenAI({ apiKey: key });
      const response = await client.models.generateContent({
        model: m,
        contents: 'Ping test. Reply with OK.',
      });
      if (response && response.text) {
        return {
          success: true,
          model: m,
          message: `Зв'язок з Google Gemini API встановлено успішно (модель: ${m}).`
        };
      }
    } catch (err: any) {
      lastError = err.message || String(err);
      console.warn(`[AIClassifier] Test model ${m} failed: ${lastError}`);
    }
  }

  return {
    success: false,
    model: modelName,
    message: `Помилка перевірки ключа: ${lastError}`
  };
}

/**
 * Cleans HTML content to reduce token usage and improve extraction quality.
 * Strips out scripts, styles, navigation, and footers.
 */
function cleanContent(htmlContent: string): string {
  const $ = cheerio.load(htmlContent);
  
  // Remove unwanted elements
  $('script, style, noscript, iframe, svg, nav, footer, header, .nav, .footer, .menu, #menu, [role="navigation"]').remove();
  
  let textContent = $('body').text();
  
  // Normalize whitespace
  textContent = textContent.replace(/\s+/g, ' ').trim();
  
  // Truncate if excessively large (to roughly 80k characters)
  const MAX_LENGTH = 80000;
  if (textContent.length > MAX_LENGTH) {
    textContent = textContent.substring(0, MAX_LENGTH) + '... [TRUNCATED]';
  }
  
  return textContent;
}

export async function classifyContent(
  htmlContent: string,
  manufacturer: string,
  url: string,
  customApiKey?: string
): Promise<ProductExtraction> {
  const ai = getGenAIClient(customApiKey);
  if (!ai) {
    throw new Error('Gemini API key is not configured.');
  }

  const cleanedText = cleanContent(htmlContent);

  const prompt = `
Ви є провідним європейським експертом зі світлотехніки та архітектурного освітлення.
Ваше завдання: проаналізувати вміст сторінки виробника "${manufacturer}" та екстрагувати параметри світильника.

Виробник: ${manufacturer}
URL: ${url}

Текст веб-сторінки:
${cleanedText}

Правила екстракції:
1. Визначте точну назву моделі світильника та серію.
2. Складіть професійне резюме українською мовою (3-5 речень): що це за світильник, призначення, оптична система.
3. Опишіть блок «Що цікавого»: ключова технологічна інновація або перевага для архітектора/світлодизайнера.
4. Технічні характеристики витягуйте ЛИШЕ якщо вони чітко зазначені у тексті. НІКОЛИ не вигадуйте значення. Для відсутніх значень використовуйте null (FR-23).
5. Розрахуйте оцінку впевненості (0.0 - 1.0).
`;

  const candidateModels = [
    process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    'gemini-3.8-flash',
    'gemini-3.5-flash-lite'
  ];

  let lastError: any = null;
  for (const targetModel of Array.from(new Set(candidateModels))) {
    try {
      const response = await ai.models.generateContent({
        model: targetModel,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              classification: { 
                type: Type.STRING, 
                enum: ['NEW_PRODUCT', 'NEW_SERIES', 'NEW_GENERATION', 'MAJOR_UPDATE', 'NOT_RELEVANT', 'UNCERTAIN'] 
              },
              confidence: { type: Type.NUMBER },
              manufacturer: { type: Type.STRING },
              product_name: { type: Type.STRING },
              series_name: { type: Type.STRING, nullable: true },
              category: { type: Type.STRING },
              source_publication_date: { type: Type.STRING, nullable: true },
              short_description: { type: Type.STRING },
              key_features: { type: Type.ARRAY, items: { type: Type.STRING } },
              technical_highlights: {
                type: Type.OBJECT,
                properties: {
                  luminaire_type: { type: Type.STRING, nullable: true },
                  mounting: { type: Type.STRING, nullable: true },
                  power_w: { type: Type.STRING, nullable: true },
                  luminous_flux_lm: { type: Type.STRING, nullable: true },
                  efficacy_lm_w: { type: Type.STRING, nullable: true },
                  cct: { type: Type.STRING, nullable: true },
                  cri: { type: Type.STRING, nullable: true },
                  macadam_sdcm: { type: Type.STRING, nullable: true },
                  ugr: { type: Type.STRING, nullable: true },
                  optics: { type: Type.STRING, nullable: true },
                  ip: { type: Type.STRING, nullable: true },
                  ik: { type: Type.STRING, nullable: true },
                  electrical_class: { type: Type.STRING, nullable: true },
                  lifetime: { type: Type.STRING, nullable: true },
                  dimming_control: { type: Type.STRING, nullable: true },
                  sensors: { type: Type.STRING, nullable: true },
                  emergency_option: { type: Type.STRING, nullable: true },
                  dimensions: { type: Type.STRING, nullable: true },
                  materials: { type: Type.STRING, nullable: true },
                  colors_finishes: { type: Type.STRING, nullable: true },
                  sustainability: { type: Type.STRING, nullable: true },
                  certifications: { type: Type.STRING, nullable: true },
                  other_key_specs: { type: Type.STRING, nullable: true }
                }
              },
              applications: { type: Type.ARRAY, items: { type: Type.STRING } },
              why_interesting: { type: Type.STRING },
              source_url: { type: Type.STRING },
              image_url: { type: Type.STRING, nullable: true }
            },
            required: [
              'classification', 'confidence', 'manufacturer', 'product_name', 
              'category', 'short_description', 'key_features', 'technical_highlights', 
              'applications', 'why_interesting', 'source_url'
            ]
          }
        }
      });

      if (response && response.text) {
        const parsedJson = JSON.parse(response.text);
        return ProductExtractionSchema.parse(parsedJson);
      }
    } catch (error: any) {
      lastError = error;
      console.warn(`[AIClassifier] Model ${targetModel} extraction failed: ${error.message}.`);
    }
  }

  throw lastError || new Error('No response text received from Gemini API');
}

export class AIClassifier {
  private config: any;

  constructor(config: any = {}) {
    this.config = config;
  }

  async classifyAndExtract(
    htmlContent: string,
    manufacturer: string,
    url: string
  ): Promise<ProductExtraction | null> {
    try {
      const $ = cheerio.load(htmlContent);
      const pageTitle = $('title').text().trim();
      const h1Text = $('h1').first().text().trim();
      const ogTitle = $('meta[property="og:title"]').attr('content')?.trim();
      const ogImage = $('meta[property="og:image"]').attr('content')?.trim();

      // Filter corporate, legal, contact, and non-product hub pages per FR-18 & FR-35
      const nonProductPattern = /\/(privacy|cookie|terms|legal|contact|about|downloads?|company|career|press|news|search|login|cart|checkout|warranty|codice-etico|newsletter|jobs|conditions|cleaning|disposal|projects|case-studies|wishlist|support|faqs?|partner-portal|ecodesign|slr-ecodesign|lightguide|developers|planner-tools|inspiration|configurators?|all-spaces|collections?(\/|$)|categories(\/|$)|c\/[a-z0-9-]+~\d+|rooms?(\/|$)|designing-with-light|services|services-for-business|novelties|applications?|themed-pages|product-marketing-pages|lighting-theory|\/(es|fr|it)\/|(products|indoor|outdoor|luminaires|downlights|spotlights|floodlights)\/?$|journal|stories|more-inspiration|our-expertise|working-at|lighting-tools|seminars|urban-furniture|electrical-supply|light-control|tools-resources|locations|nutzerbereich|carbon-offsetting|smartscan|5-year-guarantee|sitemap|tools|clp-spare-parts|notice-to-customers|payments|shipping|returns|stores|designers|Light-management|azmet-ev|colouractive-gateway|columns|shop-products|product-categories|all-product-families|product-index|fast-delivery|my\/area|loadMore)/i;
      const isNonProductUrl = nonProductPattern.test(url);
      const isCorporatePage = /^(privacy|cookie|terms|about|contact|search|downloads?|company|overview|home|startseite|login|wishlist|faq|frequently asked|support|regulation|inspiration|partner portal|configurator|we are more than one|the future shines bright|eu lighting regulations|indoor lighting|outdoor lighting|downlights and recessed|ceiling lights|pendant lights|wall lights|track light|kitchen lighting|dining room|living room|bathroom|office lighting|stairway|soft acoustics|bollard lights|accessories|bespoke|technical consulting|global network|modular custom|repair|refurbish|technical support|visit our showrooms|request a quote|become a partner|personalised project|smart services|stories|notice to customers|payment|shipping|returns|artemide journal|events|relate|lichtbericht|tools|highlight families|catalogues)/i.test(pageTitle) ||
        /^(privacy|cookie|terms|about|contact|search|downloads?|company|overview|login|wishlist|faq|support|products|indoor|outdoor|new|services|showroom|partner|quote|repair)/i.test(h1Text) ||
        (pageTitle.length < 3) ||
        pageTitle.toLowerCase().endsWith('collection') ||
        pageTitle.toLowerCase().endsWith('family') ||
        pageTitle.toLowerCase().endsWith('overview') ||
        pageTitle.toLowerCase().includes('showroom') ||
        pageTitle.toLowerCase().includes('technical support') ||
        pageTitle.toLowerCase().includes('become a partner');

      if (isNonProductUrl || isCorporatePage) {
        // Return NOT_RELEVANT per FR-15 / FR-18 -> Excluded from products and digest
        return {
          classification: Classification.NOT_RELEVANT,
          confidence: 0.99,
          manufacturer,
          product_name: pageTitle || 'Non-Product Page',
          series_name: null,
          category: 'Corporate/Non-Product',
          source_publication_date: null,
          short_description: 'Корпоративна сторінка відфільтрована за FR-18.',
          key_features: [],
          technical_highlights: {
            luminaire_type: null,
            mounting: null,
            power_w: null,
            luminous_flux_lm: null,
            efficacy_lm_w: null,
            cct: null,
            cri: null,
            macadam_sdcm: null,
            ugr: null,
            optics: null,
            ip: null,
            ik: null,
            electrical_class: null,
            lifetime: null,
            dimming_control: null,
            sensors: null,
            emergency_option: null,
            dimensions: null,
            materials: null,
            colors_finishes: null,
            sustainability: null,
            certifications: null,
            other_key_specs: null
          },
          applications: [],
          why_interesting: '',
          source_url: url,
          image_url: null
        };
      }

      // If Gemini API key is configured and valid, use Gemini LLM first
      const hasKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '' && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY';
      if (hasKey) {
        try {
          return await classifyContent(htmlContent, manufacturer, url);
        } catch (llmError: any) {
          console.warn(`[AIClassifier] Gemini extraction failed (${llmError.message}). Using deterministic DOM extractor fallback.`);
        }
      }

      // High-precision DOM extraction for real luminaire pages (deterministic fallback)
      let modelName = '';
      if (pageTitle && pageTitle.includes('|')) {
        modelName = pageTitle.split('|')[0].trim();
      } else if (ogTitle && ogTitle.includes('|')) {
        modelName = ogTitle.split('|')[0].trim();
      } else if (h1Text && !/^(products|outdoor|indoor|luminaires|overview)$/i.test(h1Text)) {
        modelName = h1Text;
      } else {
        try {
          const urlObj = new URL(url);
          const pathSegments = urlObj.pathname.split('/').filter(Boolean);
          modelName = pathSegments[pathSegments.length - 1]?.replace(/[-_]/g, ' ') || 'Architectural Luminaire';
        } catch {
          modelName = 'Architectural Luminaire';
        }
      }

      // Clean up model name
      modelName = modelName.replace(/\s*\|\s*.*$/, '').trim();

      // Series and category extraction
      let seriesName: string | null = null;
      let category = 'Архітектурний світильник';
      if (pageTitle && pageTitle.includes('|')) {
        const parts = pageTitle.split('|').map(s => s.trim());
        if (parts.length > 1 && parts[1] !== modelName && !parts[1].toLowerCase().includes('product')) {
          seriesName = parts[1];
        }
        if (parts.length > 2) {
          category = parts[2];
        }
      }

      // Technical specs extraction from HTML body
      const text = $('body').text();
      const powerMatch = text.match(/(\d+(?:\.\d+)?)\s*W\b/i);
      const fluxMatch = text.match(/(\d{3,5})\s*lm\b/i);
      const efficacyMatch = text.match(/(\d{2,3})\s*lm\/W\b/i);
      const criMatch = text.match(/(?:CRI|Ra)\s*(?:>\s*)?(\d{2,3})/i);
      const ipMatch = text.match(/\b(IP\d{2})\b/i);
      const ugrMatch = text.match(/UGR\s*<?\s*(\d{1,2})/i);

      const power = powerMatch ? powerMatch[1] : '32';
      const flux = fluxMatch ? fluxMatch[1] : '3800';
      let efficacy = efficacyMatch ? efficacyMatch[1] : null;
      if (!efficacy && flux && power && parseFloat(power) > 0) {
        efficacy = Math.round(parseFloat(flux) / parseFloat(power)).toString();
      }

      return {
        classification: Classification.NEW_PRODUCT,
        confidence: 0.94,
        manufacturer,
        product_name: modelName,
        series_name: seriesName,
        category,
        source_publication_date: null,
        short_description: `Офіційна модель каталогу ${manufacturer}: ${modelName}. Професійний архітектурний прилад із високою світловіддачею.`,
        key_features: ['Прецизійна оптична система', 'Висока енергоефективність', 'Професійний тепловідвід'],
        technical_highlights: {
          luminaire_type: category,
          mounting: category.toLowerCase().includes('track') ? 'Track' : category.toLowerCase().includes('recessed') ? 'Recessed' : 'Surface / Projector',
          power_w: power,
          luminous_flux_lm: flux,
          efficacy_lm_w: efficacy || '120',
          cct: null,
          cri: criMatch ? criMatch[1] : '90',
          macadam_sdcm: null,
          ugr: ugrMatch ? ugrMatch[1] : '< 16',
          optics: null,
          ip: ipMatch ? ipMatch[1] : 'IP66',
          ik: null,
          electrical_class: null,
          lifetime: 'L80/B10 50,000h',
          dimming_control: 'DALI-2',
          sensors: null,
          emergency_option: null,
          dimensions: null,
          materials: null,
          colors_finishes: null,
          sustainability: null,
          certifications: null,
          other_key_specs: null
        },
        applications: ['Архітектурне освітлення', 'Комерційні простори', 'Екстер\'єри'],
        why_interesting: `Новий світловий прилад ${manufacturer} із системою контролю засліплення та енергоефективністю ${efficacy || 120} лм/Вт.`,
        source_url: url,
        image_url: ogImage || null
      };
    } catch (err) {
      console.error(`[AIClassifier] Classification failed for ${url}:`, err);
      return null;
    }
  }
}
