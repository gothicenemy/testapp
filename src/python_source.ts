export const PYTHON_CODE = `import os
import hashlib
import datetime
import time
import json
import re
from urllib.parse import urljoin, urlparse
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

import pandas as pd
import requests
from bs4 import BeautifulSoup
import schedule

# Official Gemini SDK
from google import genai
from pydantic import BaseModel, Field

# ==============================================================================
# Technical Specification Pydantic Schemas (Structured Output)
# ==============================================================================
class TechnicalHighlights(BaseModel):
    power_w: float | None = Field(default=None, description="System power consumption in Watts")
    luminous_flux_lm: float | None = Field(default=None, description="Luminous flux output in Lumens")
    efficacy_lm_w: float | None = Field(default=None, description="Luminous efficacy in lm/W")
    cct: list[str] | None = Field(default=None, description="Color temperatures e.g. ['3000K', '4000K']")
    cri: int | None = Field(default=None, description="Color rendering index Ra (e.g., 90)")
    ugr: float | None = Field(default=None, description="Unified Glare Rating threshold (e.g., 16)")
    ip: str | None = Field(default=None, description="Ingress protection rating (e.g., 'IP66')")
    ik: str | None = Field(default=None, description="Impact protection rating (e.g., 'IK10')")
    control: list[str] | None = Field(default=None, description="Control protocols e.g. ['DALI-2', 'Casambi']")
    optics: list[str] | None = Field(default=None, description="Optical distribution types e.g. ['Spot', 'Wallwash']")

class ProductExtraction(BaseModel):
    classification: str = Field(
        description="Classification: NEW_PRODUCT, NEW_SERIES, NEW_GENERATION, MAJOR_UPDATE, NOT_RELEVANT, UNCERTAIN"
    )
    confidence: float = Field(description="Confidence score from 0.0 to 1.0")
    manufacturer: str
    product_name: str
    series_name: str | None = None
    category: str = Field(description="Lighting category (e.g., Track Spotlight, Linear Recessed, Floodlight)")
    source_publication_date: str | None = None
    short_description: str
    key_features: list[str]
    technical_highlights: TechnicalHighlights
    applications: list[str]
    why_interesting: str = Field(description="Analytical summary of novelty (no promotional fluff)")
    source_url: str
    image_url: str | None = None


# ==============================================================================
# Autonomous Lighting Market Monitor with Intelligent URL Crawler
# ==============================================================================
class LightingMonitor:
    def __init__(self, db_path='lighting_db.csv'):
        self.gemini_api_key = os.environ.get("GEMINI_API_KEY")
        if not self.gemini_api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required.")
            
        self.client = genai.Client(api_key=self.gemini_api_key)
        self.db_path = db_path
        
        # Load or initialize Pandas baseline DataFrame
        self._load_baseline()
        
        # Manufacturer target configuration with catalog hubs & sitemaps
        self.manufacturers = [
            {
                "id": 1, 
                "name": "ERCO", 
                "domain": "erco.com", 
                "products_url": "https://www.erco.com/en/products/indoor/spotlights-for-track/",
                "url_pattern": r"parscan|optec|eclipse|skimm"
            },
            {
                "id": 2, 
                "name": "Zumtobel", 
                "domain": "zumtobel.us", 
                "products_url": "https://zumtobel.us/products/",
                "url_pattern": r"slotlight|panos|ondaria|lincor"
            },
            {
                "id": 3, 
                "name": "iGuzzini", 
                "domain": "iguzzini.com", 
                "products_url": "https://www.iguzzini.com/en/palco/",
                "url_pattern": r"palco|laser|blade|libera"
            },
            {
                "id": 4, 
                "name": "Targetti", 
                "domain": "targetti.com", 
                "products_url": "https://www.targetti.com/en/Products/Outdoor/Projectors/",
                "url_pattern": r"dart|keplero|jedi|cloud"
            }
        ]
        
    def _load_baseline(self):
        """Loads baseline products history into pandas DataFrame."""
        try:
            self.products_df = pd.read_csv(self.db_path)
            print(f"Loaded {len(self.products_df)} historical records from {self.db_path}.")
        except FileNotFoundError:
            print("Baseline not found. Creating fresh schema.")
            self.products_df = pd.DataFrame(columns=[
                'manufacturer', 'product_name', 'series_name', 'classification',
                'category', 'source_url', 'canonical_hash', 'first_seen_at',
                'last_seen_at', 'technical_highlights', 'why_interesting', 'confidence', 'status'
            ])

    def discover_live_product_links(self, mfg_config, max_links=5):
        """
        AUTONOMOUS LINK CRAWLER:
        Crawls the catalog/overview page, extracts genuine links, filters duplicates,
        and resolves relative paths to absolute HTTP URLs.
        """
        discovered_urls = []
        try:
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) LightingMarketMonitor/2.0'}
            resp = requests.get(mfg_config['products_url'], headers=headers, timeout=12)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, 'html.parser')
                base_domain = urlparse(mfg_config['products_url']).netloc
                
                for a_tag in soup.find_all('a', href=True):
                    href = a_tag['href'].strip()
                    full_url = urljoin(mfg_config['products_url'], href)
                    parsed = urlparse(full_url)
                    
                    # Ensure same domain and matches product pattern
                    if base_domain in parsed.netloc:
                        if re.search(mfg_config['url_pattern'], full_url, re.IGNORECASE):
                            if full_url not in discovered_urls:
                                discovered_urls.append(full_url)
                                if len(discovered_urls) >= max_links:
                                    break
        except Exception as e:
            print(f"Auto-discovery failed for {mfg_config['name']}: {e}")
            
        # Fallback to catalog root if no subpages match pattern
        if not discovered_urls:
            discovered_urls = [mfg_config['products_url']]
            
        return discovered_urls

    def crawl_and_extract(self, url, manufacturer_name):
        """Fetches target page HTML and invokes Gemini 2.5 Pro with Pydantic Structured Output."""
        try:
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) LightingMarketMonitor/2.0'}
            resp = requests.get(url, headers=headers, timeout=15)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, 'html.parser')
            
            # Clean non-informative tags (script, style, nav, footer)
            for tag in soup(['script', 'style', 'nav', 'footer', 'noscript']):
                tag.decompose()
                
            text_content = soup.get_text(separator=' ', strip=True)[:10000] 
            
            prompt = (
                f"Analyze this architectural lighting product page from {manufacturer_name} at URL: {url}. "
                "Extract true specifications (lm, W, lm/W, CRI, UGR, IP). If not found, leave as null. "
                "Classify whether it's a NEW_PRODUCT or NOT_RELEVANT corporate news."
            )
            
            response = self.client.models.generate_content(
                model='gemini-2.5-pro',
                contents=f"{prompt}\\n\\nPage Text Content:\\n{text_content}",
                config={
                    'response_mime_type': 'application/json', 
                    'response_schema': ProductExtraction,
                    'temperature': 0.1
                }
            )
            parsed: ProductExtraction = response.parsed
            parsed.source_url = url  # Retain verified target link
            return parsed
        except Exception as e:
            print(f"Error processing {url}: {e}")
            return None

    def process_crawl_run(self):
        """End-to-end 14-day pipeline run."""
        print(f"\\n--- Starting Crawl Run: {datetime.datetime.now(datetime.timezone.utc)} ---")
        candidates = []
        
        for mfg in self.manufacturers:
            print(f"Autonomous discovery on {mfg['name']}...")
            urls = self.discover_live_product_links(mfg)
            
            for url in urls:
                print(f"  → Analyzing: {url}")
                extracted = self.crawl_and_extract(url, mfg['name'])
                
                if extracted and extracted.classification in ['NEW_PRODUCT', 'NEW_SERIES', 'NEW_GENERATION', 'MAJOR_UPDATE']:
                    if extracted.confidence >= 0.75:
                        candidates.append(extracted)

        self._process_candidates_with_pandas(candidates)

    def _process_candidates_with_pandas(self, candidates):
        """Pandas deduplication via MD5 canonical hashing and CSV updating."""
        if not candidates:
            print("No new relevant candidates found in this cycle.")
            return

        candidates_df = pd.DataFrame([c.model_dump() for c in candidates])
        
        # Calculate canonical hash (manufacturer + product_name)
        candidates_df['canonical_hash'] = candidates_df.apply(
            lambda x: hashlib.md5(f"{x['manufacturer'].lower()}_{x['product_name'].lower()}".encode()).hexdigest()[:16], 
            axis=1
        )
        
        if not self.products_df.empty:
            new_df = candidates_df[~candidates_df['canonical_hash'].isin(self.products_df['canonical_hash'])]
        else:
            new_df = candidates_df
            
        if not new_df.empty:
            now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
            new_df['first_seen_at'] = now_iso
            new_df['last_seen_at'] = now_iso
            new_df['status'] = 'active'
            
            self.products_df = pd.concat([self.products_df, new_df], ignore_index=True)
            self.products_df.to_csv(self.db_path, index=False)
            print(f"Stored {len(new_df)} verified unique products to {self.db_path}.")
            self.generate_html_digest(new_df)
        else:
            print("All candidates are already in the historical baseline (0 duplicates added).")

    def generate_html_digest(self, new_products_df):
        """Generates responsive HTML digest clustered by manufacturer via Pandas groupby."""
        grouped = new_products_df.groupby('manufacturer')
        date_str = datetime.datetime.now().strftime('%d %B %Y')
        
        html = f"""
        <div style='font-family: Arial, sans-serif; max-width: 650px; margin: auto;'>
            <div style='background: #0f172a; color: white; padding: 20px; border-radius: 8px;'>
                <h2>Lighting Innovation Digest ({date_str})</h2>
                <p>New verified products: {len(new_products_df)}</p>
            </div>
        """
        for mfg, group in grouped:
            html += f"<h3 style='border-bottom: 2px solid #6366f1; padding-bottom: 5px; margin-top: 25px;'>{mfg}</h3>"
            for _, row in group.iterrows():
                html += f"""
                <div style='background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin-bottom: 12px;'>
                    <h4 style='margin: 0 0 8px 0;'>{row['product_name']} ({row['classification']})</h4>
                    <p style='font-size: 13px; color: #334155;'>{row['why_interesting']}</p>
                    <a href='{row['source_url']}' target='_blank' style='color: #4f46e5; font-size: 12px; font-weight: bold;'>Visit Product Page →</a>
                </div>
                """
        html += "</div>"
        return html


if __name__ == '__main__':
    monitor = LightingMonitor()
    # Runs immediately on start, then schedules every 14 days
    monitor.process_crawl_run()
    schedule.every(14).days.do(monitor.process_crawl_run)
    print("Scheduler active. Waiting for next cycle...")
`;
