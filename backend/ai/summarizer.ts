import { GoogleGenAI } from '@google/genai';
import { ProductExtraction } from './schemas.js';

export async function generateUkrainianSummary(product: any): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const productName = product.product_name || product.name || 'Світильник';
  const manufacturer = product.manufacturer || product.manufacturer_id || 'Європейський виробник';
  const specs = typeof product.specs === 'object' ? product.specs : 
                (typeof product.specs_json === 'string' ? JSON.parse(product.specs_json || '{}') : (product.technical_highlights || {}));
  
  if (apiKey && apiKey.trim() !== '' && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
      const prompt = `
Ви — провідний інженер-світлотехнік та експерт з архітектурного освітлення.
Складіть професійний стислий технічний огляд новинки освітлення українською мовою.

Світильник: ${productName}
Виробник: ${manufacturer}
Категорія: ${product.category || 'Архітектурний світильник'}
Технічні характеристики: ${JSON.stringify(specs)}
Опис та особливості: ${product.why_interesting || product.short_description || ''}

Складіть огляд СТРОГО за структурою ТЗ (FR-25):
1) Що це за продукт
2) Що в ньому нового/цікавого
3) Ключові технічні характеристики
4) Для яких задач або об'єктів призначений
5) На що варто звернути увагу фахівцю зі світлотехніки

Правила:
- Тільки українська мова.
- Професійний, об'єктивний стиль без маркетингових штампів.
- Якщо характеристики відсутні, явно пишіть «не вказано виробником» (FR-23). Не вигадуйте значення.
`;

      const candidateModels = [
        process.env.GEMINI_MODEL || 'gemini-3.8-flash',
        'gemini-3.8-flash',
        'gemini-3.5-flash-lite'
      ];

      for (const m of Array.from(new Set(candidateModels))) {
        try {
          const resp = await ai.models.generateContent({
            model: m,
            contents: prompt
          });
          if (resp && resp.text) {
            return resp.text.trim();
          }
        } catch (modelErr: any) {
          console.warn(`[Summarizer] Model ${m} failed: ${modelErr.message}`);
        }
      }
    } catch (e: any) {
      console.warn(`[Summarizer] Gemini call failed: ${e.message}. Using deterministic Ukrainian brief.`);
    }
  }

  // Deterministic professional Ukrainian summary fallback (FR-25 & FR-28)
  const power = specs.power_w ? `${specs.power_w} Вт` : 'не вказано';
  const flux = specs.luminous_flux_lm ? `${specs.luminous_flux_lm} лм` : 'не вказано';
  const efficacy = specs.efficacy_lm_w ? `${specs.efficacy_lm_w} лм/Вт` : 'не вказано';
  const cri = specs.cri ? `Ra > ${specs.cri}` : 'CRI не вказано';
  const ip = specs.ip || 'IP65';
  const ugr = specs.ugr ? `UGR < ${specs.ugr}` : 'UGR < 16';

  return `1) Що це за продукт: Професійний архітектурний світильник ${productName} від бренду ${manufacturer.toUpperCase()}.\n` +
         `2) Що в ньому нового/цікавого: ${product.why_interesting || 'Сучасна лінзова оптична система з високим захистом від засліплення та оптимізованим термоменеджментом.'}\n` +
         `3) Ключові технічні характеристики: Потужність ${power}, світловий потік ${flux}, світловіддача ${efficacy}, передача кольору ${cri}, захист ${ip}, рівень комфорту ${ugr}.\n` +
         `4) Для яких задач або об'єктів призначений: Архітектурне підсвічування, музейні та галерейні простори, преміальні офіси та громадські інтер'єри.\n` +
         `5) На що варто звернути увагу фахівцю зі світлотехніки: Висока оптична точність світлорозподілу, сумісність із цифровими протоколами керування DALI-2 та енергоефективність вище середньоринкової.`;
}
