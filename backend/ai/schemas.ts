import { z } from 'zod';

export enum Classification {
  NEW_PRODUCT = 'NEW_PRODUCT',
  NEW_SERIES = 'NEW_SERIES',
  NEW_GENERATION = 'NEW_GENERATION',
  MAJOR_UPDATE = 'MAJOR_UPDATE',
  NOT_RELEVANT = 'NOT_RELEVANT',
  UNCERTAIN = 'UNCERTAIN',
}

export const TechnicalHighlightsSchema = z.object({
  luminaire_type: z.string().nullable().describe('Type of luminaire (e.g., downlight, linear, high bay)'),
  mounting: z.string().nullable().describe('Mounting type (e.g., recessed, surface, suspended)'),
  power_w: z.string().nullable().describe('Power consumption in Watts'),
  luminous_flux_lm: z.string().nullable().describe('Luminous flux in Lumens'),
  efficacy_lm_w: z.string().nullable().describe('Efficacy in Lumens per Watt'),
  cct: z.string().nullable().describe('Correlated Color Temperature (e.g., 3000K, 4000K, Tunable White)'),
  cri: z.string().nullable().describe('Color Rendering Index (e.g., 80, 90)'),
  macadam_sdcm: z.string().nullable().describe('MacAdam ellipse steps (SDCM)'),
  ugr: z.string().nullable().describe('Unified Glare Rating'),
  optics: z.string().nullable().describe('Optics or beam angle details'),
  ip: z.string().nullable().describe('IP rating (e.g., IP20, IP65)'),
  ik: z.string().nullable().describe('IK rating (e.g., IK08)'),
  electrical_class: z.string().nullable().describe('Electrical class (e.g., Class I, Class II)'),
  lifetime: z.string().nullable().describe('Lifetime (e.g., L80B10 50,000h)'),
  dimming_control: z.string().nullable().describe('Dimming/Control protocol (e.g., DALI, DALI-2, Casambi, ON/OFF)'),
  sensors: z.string().nullable().describe('Integrated sensors (e.g., PIR, Microwave, Daylight)'),
  emergency_option: z.string().nullable().describe('Emergency lighting options'),
  dimensions: z.string().nullable().describe('Dimensions of the product'),
  materials: z.string().nullable().describe('Materials used in construction'),
  colors_finishes: z.string().nullable().describe('Available colors and finishes'),
  sustainability: z.string().nullable().describe('Sustainability features (e.g., replaceable components)'),
  certifications: z.string().nullable().describe('Certifications (e.g., CE, ENEC)'),
  other_key_specs: z.string().nullable().describe('Any other key technical specifications'),
});

export type TechnicalHighlights = z.infer<typeof TechnicalHighlightsSchema>;

export const ProductExtractionSchema = z.object({
  classification: z.nativeEnum(Classification).describe('Classification of the product announcement'),
  confidence: z.number().min(0).max(1).describe('Confidence score from 0 to 1'),
  manufacturer: z.string().describe('Name of the manufacturer'),
  product_name: z.string().describe('Name of the product'),
  series_name: z.string().nullable().describe('Name of the series, if applicable'),
  category: z.string().describe('Category of the product'),
  source_publication_date: z.string().nullable().describe('Date of publication on the source, if available'),
  short_description: z.string().describe('Short description of the product'),
  key_features: z.array(z.string()).describe('List of key features'),
  technical_highlights: TechnicalHighlightsSchema,
  applications: z.array(z.string()).describe('List of intended applications or environments'),
  why_interesting: z.string().describe('Why this product is interesting from a lighting professional perspective'),
  source_url: z.string().describe('Source URL'),
  image_url: z.string().nullable().describe('Main image URL, if found'),
});

export type ProductExtraction = z.infer<typeof ProductExtractionSchema>;
