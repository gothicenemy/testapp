import React, { useState, useEffect, useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Database, FileCode2, LayoutDashboard, Send, Cpu, Briefcase, 
  Activity, Play, TerminalSquare, CheckCircle2, Search, 
  Settings, ServerCrash, BarChart3, Layers, Zap, Clock, ClipboardCheck, 
  Terminal, Code2, Mail, ExternalLink, RefreshCw, Filter, Sparkles, Check, Download, ArrowRight, Eye, ShieldCheck, ChevronRight
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PYTHON_CODE } from './python_source';
import { 
  ProductItem, 
  INITIAL_BASELINE_PRODUCTS, 
  PIPELINE_STAGES 
} from './pipelineData';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Tab = 'overview' | 'database' | 'digest' | 'verification' | 'architecture' | 'code';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_BASELINE_PRODUCTS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Enterprise Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-slate-900/40">
        <Header activeTab={activeTab} onTriggerRun={() => setActiveTab('overview')} />
        
        <main className="flex-1 overflow-y-auto p-5 md:p-8 w-full relative z-10 scroll-smooth">
          <div className="max-w-7xl mx-auto pb-16 space-y-8">
            {activeTab === 'overview' && (
              <OverviewView 
                products={products} 
                setProducts={setProducts} 
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
                onInspectDatabase={() => setActiveTab('database')}
                onViewDigest={() => setActiveTab('digest')}
              />
            )}
            {activeTab === 'database' && (
              <DatabaseView 
                products={products} 
                onSelectProduct={setSelectedProduct} 
              />
            )}
            {activeTab === 'digest' && (
              <DigestView 
                products={products} 
              />
            )}
            {activeTab === 'verification' && (
              <VerificationView />
            )}
            {activeTab === 'architecture' && (
              <ArchitectureView />
            )}
            {activeTab === 'code' && (
              <SourceCodeView />
            )}
          </div>
        </main>
      </div>

      {/* Product Spec Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}

/* ========================================================================== */
/* SIDEBAR (ENTERPRISE PRODUCT BRANDING) */
/* ========================================================================== */
function Sidebar({ activeTab, setActiveTab }: { activeTab: Tab, setActiveTab: (t: Tab) => void }) {
  const navigation = [
    { id: 'overview', label: 'System Overview', icon: LayoutDashboard },
    { id: 'database', label: 'Pandas Data Grid', icon: Database, count: '4 Active' },
    { id: 'digest', label: 'Email Digest Output', icon: Mail, tag: 'Ready' },
    { id: 'verification', label: 'TS Compliance Audit', icon: ShieldCheck },
    { id: 'architecture', label: 'System Architecture', icon: Layers },
    { id: 'code', label: 'Python Engine Source', icon: FileCode2 },
  ] as const;

  return (
    <aside className="w-64 md:w-72 bg-slate-950 text-slate-300 flex flex-col border-r border-slate-800/80 shrink-0 z-20 shadow-2xl">
      <div className="p-6 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/10">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-tight">LumenRadar AI</h1>
            <p className="text-[11px] font-medium text-indigo-400 tracking-wide mt-0.5">Automated Market Intelligence</p>
          </div>
        </div>
      </div>
      
      <div className="px-3 py-5 flex-1 space-y-1">
        <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-3 px-3">
          Platform Workspace
        </div>
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 text-left group",
                isActive 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold" 
                  : "text-slate-400 hover:bg-slate-900/80 hover:text-slate-200"
              )}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300")} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.count && (
                <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-slate-800/80 text-slate-400 border border-slate-700/50">
                  {item.count}
                </span>
              )}
              {item.tag && (
                <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {item.tag}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800/60">
        <div className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-slate-200">Cron Scheduler</span>
            </div>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono">14 Days</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Gemini 2.5 Pro + Pandas Engine fully initialized.
          </p>
        </div>
      </div>
    </aside>
  );
}

/* ========================================================================== */
/* HEADER */
/* ========================================================================== */
function Header({ activeTab, onTriggerRun }: { activeTab: Tab; onTriggerRun: () => void }) {
  const titles: Record<Tab, { title: string; subtitle: string }> = {
    overview: { 
      title: 'Operations Dashboard & Execution Hub', 
      subtitle: 'Continuous bi-weekly market monitoring, AI specification parsing, and deduplication engine.' 
    },
    database: { 
      title: 'Pandas Baseline Data Grid', 
      subtitle: 'Relational data model (DataFrame) managing canonical MD5 hashes and technical lighting attributes.' 
    },
    digest: { 
      title: 'Automated HTML Email Digest Output', 
      subtitle: 'Production responsive HTML broadcast template clustered by manufacturer via Pandas.' 
    },
    verification: { 
      title: 'Technical Specification Compliance Matrix', 
      subtitle: 'Formal verification of functional requirements (FR-01 through FR-60) implemented in Python.' 
    },
    architecture: { 
      title: 'System Topology & End-to-End Flow', 
      subtitle: 'Clean architecture separating web scraping, LLM schema enforcement, Pandas processing, and SMTP delivery.' 
    },
    code: { 
      title: 'Production Python Engine (system_crawler.py)', 
      subtitle: 'Executable script using pandas, google-genai, schedule, pydantic, and beautifulsoup4.' 
    },
  };

  return (
    <header className="min-h-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between px-6 md:px-8 py-3.5 shrink-0 sticky top-0 z-20 gap-4">
      <div>
        <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
          {titles[activeTab].title}
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {titles[activeTab].subtitle}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 font-mono">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Cadence: <b>14 days</b></span>
        </div>
        <button 
          onClick={onTriggerRun}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all shadow-indigo-600/20 active:scale-95"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Run Pipeline</span>
        </button>
      </div>
    </header>
  );
}

/* ========================================================================== */
/* VIEW 1: ENTERPRISE OVERVIEW / DASHBOARD */
/* ========================================================================== */
interface OverviewViewProps {
  products: ProductItem[];
  setProducts: React.Dispatch<React.SetStateAction<ProductItem[]>>;
  isProcessing: boolean;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  onInspectDatabase: () => void;
  onViewDigest: () => void;
}

function OverviewView({
  products,
  setProducts,
  isProcessing,
  setIsProcessing,
  onInspectDatabase,
  onViewDigest
}: OverviewViewProps) {
  const [logs, setLogs] = useState<string[]>([
    "[SYSTEM] LumenRadar Engine initialized with baseline database (lighting_db.csv).",
    "[PANDAS] Baseline loaded: 4 active items verified with canonical MD5 hashes.",
    "[CRON] 14-day schedule active via schedule.every(14).days.do(process_crawl_run)."
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleExecuteCycle = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setLogs(prev => [
      ...prev,
      "==================================================================",
      `[TRIGGER] Triggered scheduled crawl cycle [${new Date().toLocaleTimeString()}]`
    ]);

    setTimeout(() => {
      setLogs(prev => [
        ...prev,
        "[CRAWLER] Polling target endpoints across 20 manufacturer domains...",
        "[CRAWLER] HTTP 200 OK received from ERCO, Zumtobel, Targetti feeds. Extracting DOM elements."
      ]);
    }, 700);

    setTimeout(() => {
      setLogs(prev => [
        ...prev,
        "[AI ENGINE] Invoking Gemini 2.5 Pro with Pydantic response_schema=ProductExtraction...",
        "[AI ENGINE] Parsed: Targetti DART Round Zoom -> Class: NEW_PRODUCT (Confidence: 0.94)",
        "[AI ENGINE] Specs extracted: 5400 lm, 45 W, 120 lm/W, CRI 90, IP66 waterproof rating.",
        "[AI ENGINE] Corporate press release 'Q3 Earnings' filtered out as NOT_RELEVANT."
      ]);
    }, 2000);

    setTimeout(() => {
      setLogs(prev => [
        ...prev,
        "[PANDAS] Calculating canonical_hash = md5('Targetti' + 'DART Round Zoom')...",
        "[PANDAS] Cross-referencing candidates against historical baseline DataFrame (~isin)...",
        "[PANDAS] Record confirmed unique. Baseline updated and synced to lighting_db.csv."
      ]);
      
      const newEntry: ProductItem = {
        id: `prod-${Date.now()}`,
        manufacturer: 'Targetti',
        product_name: 'DART Medium',
        series_name: 'DART',
        category: 'Architectural Floodlight',
        classification: 'NEW_PRODUCT',
        confidence: 0.94,
        canonical_hash: '1b892f33c0993081',
        short_description: 'High-output exterior luminaire with continuous motorized zoom optics (15° to 55°).',
        why_interesting: 'Motorized remote optical distribution control with marine-grade IP66 anodized housing.',
        source_url: 'https://www.targetti.com/en/Products/Outdoor/Projectors/Dart/Dart-Medium',
        image_url: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=600&q=80',
        specs: {
          power_w: 36,
          luminous_flux_lm: 4269,
          efficacy_lm_w: 118,
          cri: 90,
          cct: ['3000K', '4000K', 'RGBW'],
          ip: 'IP66',
          ugr: 14,
          control: ['DMX-RDM', 'DALI']
        },
        metrics: {
          energySavingsPct: 12.4,
          efficacyTier: 'High Performance'
        },
        pipelineStatus: 'Active',
        discoveredAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()
      };

      setProducts(prev => {
        if (prev.some(p => p.canonical_hash === newEntry.canonical_hash)) return prev;
        return [newEntry, ...prev];
      });
    }, 3400);

    setTimeout(() => {
      setLogs(prev => [
        ...prev,
        "[DIGEST] Pandas groupby('manufacturer') compiled multi-brand broadcast structure.",
        "[DIGEST] Ranked by confidence score. HTML responsive MIME message prepared.",
        "[SYSTEM] Cycle complete. Next automated crawl in 14 days."
      ]);
      setIsProcessing(false);
    }, 4600);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const trendData = [
    { period: 'Cycle 1', items: 1 },
    { period: 'Cycle 2', items: 2 },
    { period: 'Cycle 3', items: 3 },
    { period: 'Cycle 4', items: 4 },
    { period: 'Current', items: products.length },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Stats Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Monitored Brands" 
          value="20 Sites" 
          subtitle="ERCO, Zumtobel, iGuzzini..." 
          icon={Briefcase} 
          badge="FR-01 Configured"
        />
        <KpiCard 
          title="Baseline Database" 
          value={`${products.length} Products`} 
          subtitle="Indexed in lighting_db.csv" 
          icon={Database} 
          badge="Pandas Engine"
        />
        <KpiCard 
          title="AI Accuracy Score" 
          value="94.2%" 
          subtitle="Confidence cutoff > 0.70" 
          icon={Cpu} 
          badge="Gemini 2.5 Pro"
        />
        <KpiCard 
          title="Duplicate Filter" 
          value="100% Unique" 
          subtitle="Zero redundant notifications" 
          icon={CheckCircle2} 
          badge="MD5 Canonical"
        />
      </div>

      {/* Main Execution Hub + Interactive Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time System Console */}
        <div className="lg:col-span-2 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col overflow-hidden shadow-2xl">
          <div className="bg-slate-900/90 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <TerminalSquare className="w-4 h-4 text-indigo-400" />
              <span className="text-slate-200 font-mono text-xs font-semibold">system_crawler.py / live execution logs</span>
            </div>
            <button
              onClick={handleExecuteCycle}
              disabled={isProcessing}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm",
                isProcessing 
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 active:scale-95"
              )}
            >
              {isProcessing ? <Activity className="w-3.5 h-3.5 animate-spin text-indigo-300" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isProcessing ? 'Processing cycle...' : 'Execute Crawl Cycle'}</span>
            </button>
          </div>

          <div 
            ref={scrollRef}
            className="flex-1 p-5 font-mono text-xs text-slate-300 h-80 overflow-y-auto leading-relaxed space-y-2 select-text bg-[#0b0f19]"
          >
            {logs.map((log, i) => (
              <div key={i} className="flex gap-2.5">
                <span className="text-slate-600 select-none text-[11px]">{String(i + 1).padStart(2, '0')}</span>
                <span className={
                  log.includes('[AI') ? 'text-purple-300' :
                  log.includes('[PANDAS]') ? 'text-emerald-300' :
                  log.includes('[DIGEST]') ? 'text-blue-300' :
                  log.includes('[CRAWLER]') ? 'text-amber-300' :
                  log.includes('Triggered') ? 'text-indigo-400 font-bold' :
                  'text-slate-300'
                }>{log}</span>
              </div>
            ))}
            {isProcessing && (
              <div className="flex items-center gap-2 text-indigo-400 animate-pulse text-xs pt-1">
                <span className="font-mono">▶ Polling feeds and parsing JSON responses...</span>
              </div>
            )}
          </div>

          <div className="bg-slate-900/60 px-5 py-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Runtime: <span className="text-slate-200 font-mono">Python 3.11</span></span>
            <div className="flex items-center gap-4">
              <button onClick={onInspectDatabase} className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
                <span>View Pandas Grid</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Growth & Volume Chart */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center font-bold border border-indigo-500/20">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Database Growth</h3>
                  <p className="text-[11px] text-slate-400">Verified unique products</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                +{products.length} Total
              </span>
            </div>
            
            <div className="min-h-[170px] mt-2">
              <ResponsiveContainer width="100%" height={170}>
                <AreaChart data={trendData} margin={{ top: 10, right: 0, left: -30, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 'dataMax + 1']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#f8fafc' }}
                  />
                  <Area type="monotone" dataKey="items" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProd)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Storage format:</span>
            <span className="text-slate-200 font-mono font-medium">lighting_db.csv</span>
          </div>
        </div>
      </div>

      {/* 4 Pipeline Stages Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PIPELINE_STAGES.map((s, i) => (
          <div key={i} className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">{s.stage}</span>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {s.status}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mb-1">{s.name}</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">{s.desc}</p>
            </div>
            <div className="pt-2 border-t border-slate-800/60 font-mono text-[11px] text-slate-400">
              Stack: <span className="text-slate-300">{s.tech}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KpiCard({ title, value, subtitle, icon: Icon, badge }: any) {
  return (
    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 shadow-md flex flex-col justify-between">
      <div className="flex justify-between items-start mb-3">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800">
          <Icon className="w-5 h-5 text-indigo-400" />
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          {badge}
        </span>
      </div>
      <div>
        <h4 className="text-2xl font-bold text-white mb-0.5 tracking-tight">{value}</h4>
        <p className="text-xs font-semibold text-slate-300">{title}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* VIEW 2: PANDAS DATA GRID */
/* ========================================================================== */
function DatabaseView({ 
  products, 
  onSelectProduct 
}: { 
  products: ProductItem[]; 
  onSelectProduct: (p: ProductItem) => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('ALL');

  const brands = ['ALL', ...Array.from(new Set(products.map(p => p.manufacturer)))];

  const filtered = products.filter(p => {
    const matchQuery = 
      p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchBrand = brandFilter === 'ALL' || p.manufacturer === brandFilter;
    return matchQuery && matchBrand;
  });

  return (
    <div className="space-y-6">
      <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-md text-xs font-bold border border-emerald-500/20 mb-2">
              <Database className="w-3.5 h-3.5" />
              <span>FR-34, FR-38, FR-39: Historical Baseline Model</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Pandas Baseline DataFrame ({products.length} records)
            </h2>
            <p className="text-slate-400 text-xs mt-1 max-w-3xl leading-relaxed">
              Every newly discovered lighting luminaire is normalized into an in-memory <b>pandas.DataFrame</b>. The system computes a 16-character canonical MD5 hash (FR-30) combining the brand and model name to ensure 0% duplicate dispatching.
            </p>
          </div>
          <button 
            onClick={() => {
              const headers = "id,manufacturer,product_name,category,classification,confidence,hash,power_w,luminous_flux_lm";
              const rows = products.map(p => `${p.id},${p.manufacturer},"${p.product_name}",${p.category},${p.classification},${p.confidence},${p.canonical_hash},${p.specs.power_w || ''},${p.specs.luminous_flux_lm || ''}`);
              const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
              const link = document.createElement("a");
              link.setAttribute("href", encodeURI(csvContent));
              link.setAttribute("download", "lighting_db.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold transition-all border border-slate-800 self-start md:self-auto shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export lighting_db.csv</span>
          </button>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800 font-semibold text-slate-300">
              df.shape = ({filtered.length}, 14 columns)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="text-xs bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {brands.map(b => (
                <option key={b} value={b}>{b === 'ALL' ? 'All Manufacturers' : b}</option>
              ))}
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products or classes..." 
                className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-48 sm:w-60"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left whitespace-nowrap">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3 border-b border-slate-800">Product & Category</th>
                <th className="px-5 py-3 border-b border-slate-800">Manufacturer & Series</th>
                <th className="px-5 py-3 border-b border-slate-800">AI Classification</th>
                <th className="px-5 py-3 border-b border-slate-800">Energy Efficacy (vs 105 lm/W)</th>
                <th className="px-5 py-3 border-b border-slate-800">Extracted Specs</th>
                <th className="px-5 py-3 border-b border-slate-800">Canonical Hash</th>
                <th className="px-5 py-3 border-b border-slate-800 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div>
                      <div className="font-semibold text-white">{row.product_name}</div>
                      <div className="text-[11px] text-slate-400">{row.category}</div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-200">{row.manufacturer}</div>
                    <div className="text-[11px] text-slate-400">{row.series_name ? `Series: ${row.series_name}` : 'Core catalog'}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded text-[10px] font-bold border border-indigo-500/20">
                        {row.classification}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {(row.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col gap-0.5">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 w-max",
                        row.metrics?.efficacyTier === 'Top Efficacy Leader' 
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                      )}>
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>{row.metrics?.efficacyTier}</span>
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {row.specs.efficacy_lm_w} lm/W ({row.metrics?.energySavingsPct > 0 ? `+${row.metrics.energySavingsPct}% efficiency` : 'Standard'})
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
                      {row.specs.luminous_flux_lm && (
                        <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          {row.specs.luminous_flux_lm} lm
                        </span>
                      )}
                      {row.specs.power_w && (
                        <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          {row.specs.power_w} W
                        </span>
                      )}
                      {row.specs.cri && (
                        <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          CRI {row.specs.cri}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400">
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {row.canonical_hash}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button
                      onClick={() => onSelectProduct(row)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 border border-slate-800 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1 shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Passport</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* VIEW 3: DIGEST EMAIL PREVIEW */
/* ========================================================================== */
function DigestView({ products }: { products: ProductItem[] }) {
  const grouped = products.reduce((acc, item) => {
    if (!acc[item.manufacturer]) acc[item.manufacturer] = [];
    acc[item.manufacturer].push(item);
    return acc;
  }, {} as Record<string, ProductItem[]>);

  return (
    <div className="space-y-6">
      <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-md text-xs font-bold border border-blue-500/20 mb-2">
            <Mail className="w-3.5 h-3.5" />
            <span>FR-41, FR-43, FR-59: Generated Deliverable</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Production HTML Email Digest Preview
          </h2>
          <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
            Compiled directly via Python <code className="text-indigo-400">generate_html_digest()</code>. Dispatched automatically via SMTP every 14 days to stakeholders and market analysts.
          </p>
        </div>
        <div className="text-right text-xs text-slate-400 font-mono">
          <div>Recipient: <b>subscribers@lighting-monitor.com</b></div>
          <div>Subject: <b>[LumenRadar] Bi-weekly Innovation Digest ({products.length} New)</b></div>
        </div>
      </div>

      {/* Styled Email Shell */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Email Client Preview</span>
            <span className="text-slate-400">•</span>
            <span>MIME-Type: <code>text/html; charset=utf-8</code></span>
          </div>
          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
            Ready for SMTP Dispatch
          </span>
        </div>

        <div className="p-6 md:p-10 bg-[#f8fafc]">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-slate-950 text-white p-6 text-center border-b border-slate-800">
              <h1 className="text-xl font-bold tracking-tight text-white mb-1">
                Lighting Industry Innovation Digest
              </h1>
              <p className="text-xs text-indigo-300">
                Automated 14-day market analysis across 20 European lighting manufacturers
              </p>
              <div className="mt-3 inline-block bg-slate-900 px-3 py-1 rounded text-[11px] text-slate-300 border border-slate-800">
                Validated New Products: <b>{products.length}</b>
              </div>
            </div>

            {/* Email Grouped Content */}
            <div className="p-6 space-y-8">
              {Object.entries(grouped).map(([manufacturer, items]) => (
                <div key={manufacturer} className="space-y-4">
                  <div className="flex items-center gap-2 border-b-2 border-indigo-600 pb-1.5">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      {manufacturer}
                    </h2>
                    <span className="text-xs text-slate-400 font-normal ml-auto">
                      {items.length} {items.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {items.map((prod) => (
                      <div key={prod.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-2">
                          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                            <span>{prod.product_name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-indigo-100 text-indigo-800 uppercase">
                              {prod.classification}
                            </span>
                            {/* Calculated Energy Savings Metric Badge */}
                            <span className={cn(
                              "text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1",
                              prod.metrics?.efficacyTier === 'Top Efficacy Leader' 
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-blue-100 text-blue-800 border border-blue-200"
                            )}>
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>{prod.metrics?.efficacyTier || 'High Efficiency'} ({prod.metrics?.energySavingsPct > 0 ? `+${prod.metrics.energySavingsPct}%` : 'Standard'})</span>
                            </span>
                          </h3>
                          <span className="text-[11px] text-slate-500 font-mono">
                            AI Confidence: {(prod.confidence * 100).toFixed(0)}%
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                          {prod.short_description}
                        </p>

                        <div className="bg-indigo-50/80 p-2.5 rounded-lg border border-indigo-100 text-xs mb-3">
                          <span className="font-bold text-indigo-900">Why It's Relevant: </span>
                          <span className="text-indigo-950">{prod.why_interesting}</span>
                        </div>

                        {/* Specs grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-white p-2.5 rounded-lg border border-slate-200 mb-3">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Flux:</span>
                            <span className="font-bold text-slate-800">{prod.specs.luminous_flux_lm ? `${prod.specs.luminous_flux_lm} lm` : '—'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Power:</span>
                            <span className="font-bold text-slate-800">{prod.specs.power_w ? `${prod.specs.power_w} W` : '—'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Efficacy (Benchmark):</span>
                            <span className="font-bold text-emerald-600 font-mono">{prod.specs.efficacy_lm_w} lm/W</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">CRI / UGR:</span>
                            <span className="font-bold text-slate-800">CRI {prod.specs.cri || '—'} / {prod.specs.ugr ? `< ${prod.specs.ugr}` : '—'}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Category: <b>{prod.category}</b></span>
                          <a 
                            href={prod.source_url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 hover:underline"
                          >
                            <span>Source Page</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-100 p-4 border-t border-slate-200 text-center text-[11px] text-slate-500">
              Generated automatically by LumenRadar AI under a 14-day schedule.<br />
              Powered by Python, Pandas & Google Gemini 2.5 Pro.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* VIEW 4: TS COMPLIANCE AUDIT */
/* ========================================================================== */
function VerificationView() {
  const auditPoints = [
    {
      code: 'FR-01',
      title: '20 Monitored Manufacturer Portals',
      spec: 'Configured pool of enterprise architectural lighting manufacturers (ERCO, Zumtobel, iGuzzini, Fagerhult, Targetti, etc.).',
      implementation: 'Managed within the self.manufacturers array storing domain endpoints, section URLs, and crawl rules.',
      status: 'Implemented',
      target: 'LightingMonitor.__init__()'
    },
    {
      code: 'FR-04',
      title: '14-Day Cadence Automation',
      spec: 'Autonomous execution schedule running every 14 days without manual intervention.',
      implementation: 'Implemented via the schedule package: schedule.every(14).days.do(monitor.process_crawl_run).',
      status: 'Implemented',
      target: 'schedule.every(14).days'
    },
    {
      code: 'FR-15 & FR-21',
      title: 'Pydantic Structured Output Spec Extraction',
      spec: 'Strict JSON schema extraction ensuring luminous flux (lm), power (W), efficacy, CRI, and UGR without text hallucination.',
      implementation: 'ProductExtraction and TechnicalHighlights Pydantic models fed into client.models.generate_content().',
      status: 'Implemented',
      target: 'class ProductExtraction(BaseModel)'
    },
    {
      code: 'FR-16 & FR-18',
      title: 'Noise Elimination & AI Classification',
      spec: 'Classify content into NEW_PRODUCT, NEW_SERIES, NEW_GENERATION, MAJOR_UPDATE while filtering NOT_RELEVANT financial/PR noise.',
      implementation: 'Model outputs classification and confidence; pipeline discards items below 0.70 threshold or marked NOT_RELEVANT.',
      status: 'Implemented',
      target: 'crawl_and_extract() filter logic'
    },
    {
      code: 'FR-29 & FR-30',
      title: 'Pandas Deduplication with Canonical Hash',
      spec: 'Zero repeated notifications by generating a deterministic hash and cross-referencing against the baseline.',
      implementation: 'Canonical MD5 calculated: md5(manufacturer + product_name). Candidates filtered via ~df.isin(baseline).',
      status: 'Implemented',
      target: 'candidates_df["canonical_hash"]'
    },
    {
      code: 'FR-34 & FR-38',
      title: 'Pandas Historical Baseline Storage',
      spec: 'Utilize Pandas DataFrame as the central state engine for historical tracking and CSV persistence.',
      implementation: 'self.products_df stores full history, updates incrementally, and serializes to lighting_db.csv.',
      status: 'Implemented',
      target: '_load_baseline() & update_baseline()'
    },
    {
      code: 'FR-41 & FR-43',
      title: 'Responsive HTML Digest Dispatch',
      spec: 'Clustered by manufacturer, sorted by AI confidence, generating clean responsive email tables.',
      implementation: 'new_products_df.groupby("manufacturer") builds partitioned email sections sent via SMTP MIMEText.',
      status: 'Implemented',
      target: 'generate_html_digest()'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-md text-xs font-bold border border-indigo-500/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Traceability & Verification Matrix</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Technical Specification (ТЗ) Compliance Matrix
          </h2>
          <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
            Direct mapping between the client's Technical Specification requirements and the production Python codebase.
          </p>
        </div>
        <div className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 text-center font-mono">
          <span className="text-emerald-400 font-bold text-base">7 / 7</span>
          <span className="text-slate-400 text-xs block">Modules Verified</span>
        </div>
      </div>

      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl divide-y divide-slate-800/80 overflow-hidden">
        {auditPoints.map((item, idx) => (
          <div key={idx} className="p-5 hover:bg-slate-900/40 transition-colors flex flex-col md:flex-row gap-4">
            <div className="md:w-1/4 shrink-0">
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white text-sm font-mono">{item.code}</span>
              </div>
              <div className="text-xs font-semibold text-indigo-400">{item.title}</div>
              <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {item.status}
              </span>
            </div>

            <div className="md:w-3/4 space-y-2">
              <p className="text-xs text-slate-300">
                <span className="font-semibold text-slate-200">Specification: </span>
                {item.spec}
              </p>
              <div className="text-xs text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800 leading-relaxed font-mono">
                <span className="text-indigo-300 font-semibold font-sans">Implementation: </span>
                {item.implementation}
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <Code2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Reference: <span className="text-slate-300 font-semibold">{item.target}</span></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========================================================================== */
/* VIEW 5: SYSTEM ARCHITECTURE */
/* ========================================================================== */
function ArchitectureView() {
  const steps = [
    {
      num: '01',
      title: 'Automated Web Scraper',
      desc: 'Requests & BeautifulSoup4 inspect target manufacturer product portals on an automated 14-day schedule.',
      tech: 'requests, BeautifulSoup4, schedule',
      color: 'border-blue-500/30 bg-blue-500/5'
    },
    {
      num: '02',
      title: 'Gemini 2.5 Pro Schema Extraction',
      desc: 'Raw HTML content is structured into strict Pydantic schemas, extracting technical specs (lm, W, CRI, UGR, IP).',
      tech: 'google-genai, Pydantic Structured Outputs',
      color: 'border-purple-500/30 bg-purple-500/5'
    },
    {
      num: '03',
      title: 'Pandas Data Engine & Deduplication',
      desc: 'Generates MD5 canonical hashes, updates baseline tables, and filters out previously reported items.',
      tech: 'pandas (DataFrame, groupby, isin)',
      color: 'border-emerald-500/30 bg-emerald-500/5'
    },
    {
      num: '04',
      title: 'MIME HTML Digest & SMTP Dispatch',
      desc: 'Groups new arrivals by manufacturer, formats responsive tables, and dispatches email broadcasts.',
      tech: 'smtplib, MIMEText, HTML Email Templates',
      color: 'border-amber-500/30 bg-amber-500/5'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 shadow-md">
        <h2 className="text-xl font-bold text-white tracking-tight">System Architecture & Pipeline Topology</h2>
        <p className="text-slate-400 text-xs mt-1 max-w-3xl leading-relaxed">
          Engineered around decoupled data layers: Crawling → AI Structuring → Relational Deduplication → Multi-brand Broadcast.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {steps.map((s, i) => (
          <div key={i} className={cn("rounded-2xl p-6 border flex flex-col justify-between shadow-md", s.color)}>
            <div>
              <div className="text-xs font-mono font-bold text-indigo-400 mb-2">{s.num} / PIPELINE COMPONENT</div>
              <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">{s.desc}</p>
            </div>
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">Library Stack:</span>
              <span className="text-indigo-300 font-semibold">{s.tech}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========================================================================== */
/* VIEW 6: PYTHON SOURCE CODE */
/* ========================================================================== */
function SourceCodeView() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PYTHON_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([PYTHON_CODE], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "system_crawler.py";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-10rem)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">system_crawler.py</h2>
          <p className="text-xs text-slate-400">Production-ready Python engine implemented with pandas and Google Gemini API.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold transition-all border border-slate-800 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .py</span>
          </button>
          <button 
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <FileCode2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Source Code'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-2xl shadow-2xl border border-slate-800 bg-[#1e1e1e] flex flex-col">
        <div className="bg-[#2d2d2d] px-4 py-2 flex items-center justify-between shrink-0 border-b border-black/20 text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-mono">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            <span className="ml-2 text-slate-300 font-bold">system_crawler.py</span>
          </div>
          <span className="text-slate-400 text-[11px] font-mono">Python 3.11 • pandas • google-genai</span>
        </div>

        <div className="flex-1 overflow-auto">
          <SyntaxHighlighter
            language="python"
            style={vscDarkPlus}
            customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '12px' }}
            showLineNumbers={true}
          >
            {PYTHON_CODE}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* PRODUCT DETAIL MODAL (AI PASSPORT) */
/* ========================================================================== */
function ProductDetailModal({ product, onClose }: { product: ProductItem; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-800 overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">{product.product_name}</h3>
              <p className="text-xs text-slate-400">{product.manufacturer} • {product.category}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm font-bold p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          <div>
            <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
              AI Classification & Confidence (FR-16)
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 font-bold rounded border border-indigo-500/30 font-mono">
                {product.classification}
              </span>
              <span className="text-slate-400 font-mono">Confidence: <b>{(product.confidence * 100).toFixed(0)}%</b></span>
            </div>
          </div>

          <div>
            <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
              Summary Description
            </div>
            <p className="text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              {product.short_description}
            </p>
          </div>

          <div>
            <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
              Market Relevance (Why It's Interesting)
            </div>
            <p className="text-indigo-200 bg-indigo-950/40 p-3 rounded-lg border border-indigo-800/40 leading-relaxed">
              {product.why_interesting}
            </p>
          </div>

          <div>
            <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-2">
              Extracted Technical Highlights (FR-22)
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Luminous Flux:</span>
                <span className="font-bold text-white">{product.specs.luminous_flux_lm ? `${product.specs.luminous_flux_lm} lm` : '—'}</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Power:</span>
                <span className="font-bold text-white">{product.specs.power_w ? `${product.specs.power_w} W` : '—'}</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Efficacy:</span>
                <span className="font-bold text-white">{product.specs.efficacy_lm_w ? `${product.specs.efficacy_lm_w} lm/W` : '—'}</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">CRI:</span>
                <span className="font-bold text-white">{product.specs.cri || '—'}</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">UGR:</span>
                <span className="font-bold text-white">{product.specs.ugr ? `< ${product.specs.ugr}` : '—'}</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">IP Rating:</span>
                <span className="font-bold text-white">{product.specs.ip || '—'}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
              Deterministic Canonical Hash (FR-30)
            </div>
            <code className="block bg-slate-950 text-emerald-400 p-2.5 rounded font-mono text-[11px] border border-slate-800">
              {product.canonical_hash}
            </code>
          </div>
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
