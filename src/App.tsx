import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  ShieldAlert, 
  TrendingUp, 
  Package, 
  ChevronRight, 
  Search, 
  Activity,
  AlertTriangle,
  CheckCircle2,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import Markdown from 'react-markdown';
import { Product, OverviewStats, ProductStats, TrendStats, RecentRMA } from './types';
import { getProductAIInsights, getGlobalAIInsights } from './services/geminiService';

const RAZER_GREEN = "#00ff00";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-razer-dark border border-razer-border p-3 rounded-lg shadow-2xl razer-glow">
        <p className="text-[10px] text-gray-500 font-mono mb-1 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-bold text-razer-green flex items-center gap-2">
          <span className="text-gray-300 font-medium">RMAs:</span>
          <span className="font-mono text-lg">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function App() {
  const [view, setView] = useState<'dashboard' | 'products' | 'product-detail' | 'trends' | 'live'>('dashboard');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [productStats, setProductStats] = useState<ProductStats | null>(null);
  const [trendStats, setTrendStats] = useState<TrendStats | null>(null);
  const [recentRMAs, setRecentRMAs] = useState<RecentRMA[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // AI States
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [globalAIInsights, setGlobalAIInsights] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchOverview();
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      fetchProductStats(selectedProductId);
      setAiInsights(null); // Reset AI insights when switching products
    }
  }, [selectedProductId]);

  useEffect(() => {
    if (view === 'trends') {
      fetchTrendStats();
    } else if (view === 'live') {
      fetchRecentRMAs();
      const interval = setInterval(fetchRecentRMAs, 10000); // Poll every 10s
      return () => clearInterval(interval);
    } else if (view === 'dashboard' && overview && !globalAIInsights) {
      generateGlobalAI();
    }
  }, [view, overview]);

  const generateGlobalAI = async () => {
    if (!overview) return;
    const insights = await getGlobalAIInsights(overview);
    setGlobalAIInsights(insights);
  };

  const generateProductAI = async () => {
    if (!productStats) return;
    setIsGeneratingAI(true);
    const insights = await getProductAIInsights(productStats);
    setAiInsights(insights);
    setIsGeneratingAI(false);
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  const fetchOverview = async () => {
    try {
      const res = await fetch('/api/stats/overview');
      const data = await res.json();
      setOverview(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch overview", err);
    }
  };

  const fetchProductStats = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}/stats`);
      const data = await res.json();
      setProductStats(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch product stats", err);
    }
  };

  const fetchTrendStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stats/trends');
      const data = await res.json();
      setTrendStats(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch trend stats", err);
    }
  };

  const fetchRecentRMAs = async () => {
    try {
      const res = await fetch('/api/rma/recent');
      const data = await res.json();
      setRecentRMAs(data);
    } catch (err) {
      console.error("Failed to fetch recent RMAs", err);
    }
  };

  const handleExportReport = () => {
    if (!overview) return;

    let csv = "RMA Overview Report\n";
    csv += `Total RMAs,${overview.totalRMAs}\n\n`;

    csv += "Monthly Trend\nMonth,Count\n";
    overview.monthlyTrend.forEach(row => {
      csv += `${row.month},${row.count}\n`;
    });
    csv += "\n";

    csv += "Top Defects\nDefect Type,Count\n";
    overview.topDefects.forEach(row => {
      csv += `${row.defect_type},${row.count}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `razer_rma_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-razer-black text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-razer-border bg-razer-dark flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-razer-green rounded-sm flex items-center justify-center">
            <ShieldAlert className="text-black w-5 h-5" />
          </div>
          <h1 className="font-bold tracking-tighter text-xl italic">SENTINEL</h1>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          <button 
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${view === 'dashboard' ? 'bg-razer-green/10 text-razer-green border border-razer-green/30' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <BarChart3 size={20} />
            <span className="font-medium">Overview</span>
          </button>
          <button 
            onClick={() => setView('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${view === 'products' || view === 'product-detail' ? 'bg-razer-green/10 text-razer-green border border-razer-green/30' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <Package size={20} />
            <span className="font-medium">Products</span>
          </button>
          <button 
            onClick={() => setView('trends')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${view === 'trends' ? 'bg-razer-green/10 text-razer-green border border-razer-green/30' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <TrendingUp size={20} />
            <span className="font-medium">Trends</span>
          </button>
          <button 
            onClick={() => setView('live')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${view === 'live' ? 'bg-razer-green/10 text-razer-green border border-razer-green/30' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <Activity size={20} />
            <span className="font-medium">Live Feed</span>
          </button>
        </nav>

        <div className="p-4 border-t border-razer-border">
          <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 rounded-lg cursor-pointer transition-all">
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-20 border-b border-razer-border bg-razer-dark/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4 bg-razer-black/50 border border-razer-border px-4 py-2 rounded-full w-96">
            <Search size={18} className="text-gray-500" />
            <input 
              type="text" 
              placeholder="Search products, categories, or defects..." 
              className="bg-transparent border-none outline-none text-sm w-full"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (view === 'dashboard' && e.target.value.length > 0) {
                  setView('products');
                }
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-gray-500 hover:text-razer-green transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-500 font-mono">SYSTEM STATUS</span>
              <span className="text-xs text-razer-green flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-razer-green rounded-full animate-pulse" />
                OPERATIONAL
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-razer-border border border-razer-green/20 flex items-center justify-center">
              <span className="text-razer-green font-bold">R</span>
            </div>
          </div>
        </header>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {view === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">Global RMA Overview</h2>
                    <p className="text-gray-500 mt-1">Monitoring defect patterns across all product lines.</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-razer-dark border border-razer-border rounded-md text-sm hover:border-razer-green/50 transition-all">Last 30 Days</button>
                    <button 
                      onClick={handleExportReport}
                      className="px-4 py-2 bg-razer-green text-black font-bold rounded-md text-sm hover:bg-razer-green/90 transition-all"
                    >
                      Export Report
                    </button>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard 
                    title="Total RMA Requests" 
                    value={overview?.totalRMAs.toString() || "0"} 
                    trend="+12.5%" 
                    trendUp={true} 
                    icon={<AlertTriangle className="text-yellow-500" />} 
                  />
                  <StatCard 
                    title="Avg. Resolution Time" 
                    value="4.2 Days" 
                    trend="-0.8 Days" 
                    trendUp={false} 
                    icon={<Activity className="text-razer-green" />} 
                  />
                  <StatCard 
                    title="Quality Score" 
                    value="94.2%" 
                    trend="+1.2%" 
                    trendUp={true} 
                    icon={<CheckCircle2 className="text-razer-green" />} 
                  />
                  <StatCard 
                    title="Active Recalls" 
                    value="0" 
                    trend="Stable" 
                    trendUp={true} 
                    icon={<ShieldAlert className="text-razer-green" />} 
                  />
                </div>

                {/* AI Executive Summary */}
                {globalAIInsights && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-razer-dark border border-razer-green/20 rounded-xl p-6 razer-glow relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <ShieldAlert size={120} className="text-razer-green" />
                    </div>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-razer-green">
                      <Activity size={18} />
                      SENTINEL AI: EXECUTIVE SUMMARY
                    </h3>
                    <div className="prose prose-invert max-w-none text-sm text-gray-300">
                      <Markdown>{globalAIInsights}</Markdown>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Trend Chart */}
                  <div className="lg:col-span-2 bg-razer-dark border border-razer-border rounded-xl p-6 razer-border-glow">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <TrendingUp size={18} className="text-razer-green" />
                      RMA Volume Trend
                    </h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={overview?.monthlyTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#252525" vertical={false} />
                          <XAxis 
                            dataKey="month" 
                            stroke="#555" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                          />
                          <YAxis 
                            stroke="#555" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Line 
                            type="monotone" 
                            dataKey="count" 
                            stroke={RAZER_GREEN} 
                            strokeWidth={3} 
                            dot={{ fill: RAZER_GREEN, r: 4 }} 
                            activeDot={{ r: 6, strokeWidth: 0 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Top Defects */}
                  <div className="bg-razer-dark border border-razer-border rounded-xl p-6">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <AlertTriangle size={18} className="text-yellow-500" />
                      Top Defect Types
                    </h3>
                    <div className="space-y-6">
                      {overview?.topDefects.map((defect, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">{defect.defect_type}</span>
                            <span className="font-mono text-razer-green">{defect.count}</span>
                          </div>
                          <div className="h-1.5 bg-razer-black rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(defect.count / (overview?.topDefects[0].count || 1)) * 100}%` }}
                              className="h-full bg-razer-green"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'products' && (
              <motion.div 
                key="products"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">Product Catalog</h2>
                    <p className="text-gray-500 mt-1">Select a product to view detailed RMA and improvement analytics.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <div 
                        key={product.id}
                        onClick={() => {
                          setSelectedProductId(product.id);
                          setView('product-detail');
                        }}
                        className="group bg-razer-dark border border-razer-border rounded-xl p-6 cursor-pointer hover:border-razer-green/50 transition-all razer-glow"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-2 bg-razer-black rounded-lg border border-razer-border group-hover:border-razer-green/30 transition-all">
                            <Package className="text-razer-green" size={24} />
                          </div>
                          <span className="text-[10px] font-mono bg-razer-green/10 text-razer-green px-2 py-1 rounded border border-razer-green/20 uppercase tracking-widest">
                            {product.category}
                          </span>
                        </div>
                        <h4 className="text-lg font-bold group-hover:text-razer-green transition-all">{product.name}</h4>
                        <div className="mt-4 flex items-center justify-between text-xs text-gray-500 font-mono">
                          <span>RELEASED: {product.release_date}</span>
                          {product.v2_release_date && (
                            <span className="text-razer-green">V2 ACTIVE</span>
                          )}
                        </div>
                        <div className="mt-6 flex items-center gap-2 text-razer-green text-sm font-bold opacity-0 group-hover:opacity-100 transition-all">
                          ANALYZE TRENDS <ChevronRight size={16} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center bg-razer-dark border border-dashed border-razer-border rounded-xl">
                      <div className="w-16 h-16 bg-razer-black rounded-full flex items-center justify-center mx-auto mb-4 border border-razer-border">
                        <Search size={24} className="text-gray-500" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">No products found</h3>
                      <p className="text-gray-500">We couldn't find any products matching "{searchQuery}"</p>
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="mt-6 text-razer-green font-bold hover:underline"
                      >
                        Clear search filters
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {view === 'product-detail' && productStats && (
              <motion.div 
                key="product-detail"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="space-y-8"
              >
                <button 
                  onClick={() => setView('products')}
                  className="flex items-center gap-2 text-gray-400 hover:text-razer-green transition-all text-sm font-medium"
                >
                  <ChevronRight size={16} className="rotate-180" />
                  BACK TO PRODUCTS
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-razer-dark border border-razer-green/30 rounded-2xl flex items-center justify-center razer-glow">
                      <Package size={40} className="text-razer-green" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-4xl font-bold tracking-tight">{productStats.product.name}</h2>
                        <span className="px-3 py-1 bg-razer-green/10 text-razer-green border border-razer-green/30 rounded-full text-xs font-bold uppercase tracking-widest">
                          {productStats.product.category}
                        </span>
                      </div>
                      <p className="text-gray-500 mt-2 font-mono text-sm">ID: RZ-{productStats.product.id.toString().padStart(4, '0')} | RELEASE: {productStats.product.release_date}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={generateProductAI}
                      disabled={isGeneratingAI}
                      className="flex items-center gap-2 px-4 py-2 bg-razer-green text-black font-bold rounded-lg hover:bg-razer-green/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingAI ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          ANALYZING...
                        </>
                      ) : (
                        <>
                          <ShieldAlert size={18} />
                          SENTINEL AI ANALYSIS
                        </>
                      )}
                    </button>
                    <div className="bg-razer-dark border border-razer-border p-4 rounded-xl text-center min-w-[120px]">
                      <div className="text-xs text-gray-500 font-mono mb-1 uppercase">Total RMAs</div>
                      <div className="text-2xl font-bold text-razer-green">
                        {productStats.rmas.reduce((acc, curr) => acc + curr.count, 0)}
                      </div>
                    </div>
                    <div className="bg-razer-dark border border-razer-border p-4 rounded-xl text-center min-w-[120px]">
                      <div className="text-xs text-gray-500 font-mono mb-1 uppercase">Improvements</div>
                      <div className="text-2xl font-bold text-razer-green">{productStats.improvements.length}</div>
                    </div>
                  </div>
                </div>

                {/* AI Insights Panel */}
                <AnimatePresence>
                  {aiInsights && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-razer-dark border border-razer-green/30 rounded-2xl p-8 razer-glow relative">
                        <div className="absolute top-0 right-0 p-6 opacity-5">
                          <ShieldAlert size={160} className="text-razer-green" />
                        </div>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-razer-green">
                          <ShieldAlert />
                          SENTINEL AI: ROOT CAUSE & STRATEGIC ANALYSIS
                        </h3>
                        <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-razer-green prose-strong:text-white">
                          <Markdown>{aiInsights}</Markdown>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Improvement Effectiveness Chart */}
                  <div className="lg:col-span-2 bg-razer-dark border border-razer-border rounded-2xl p-8 razer-border-glow">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl font-bold flex items-center gap-3">
                        <TrendingUp className="text-razer-green" />
                        Improvement Effectiveness
                      </h3>
                      <div className="flex items-center gap-4 text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-razer-green rounded-full" />
                          <span>RMA VOLUME</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                          <span>IMPROVEMENT LOG</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="h-96 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={productStats.rmas}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#252525" vertical={false} />
                          <XAxis dataKey="month" stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip 
                            content={<CustomTooltip />}
                            cursor={{ fill: 'rgba(0, 255, 0, 0.05)' }}
                          />
                          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {productStats.rmas.map((entry, index) => {
                              // Highlight months where improvements were made
                              const hasImprovement = productStats.improvements.some(imp => imp.implementation_date.startsWith(entry.month));
                              return <Cell key={`cell-${index}`} fill={hasImprovement ? "#eab308" : RAZER_GREEN} fillOpacity={0.8} />;
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="mt-8 p-4 bg-razer-black/50 border border-razer-border rounded-xl">
                      <p className="text-sm text-gray-400 italic">
                        Note: Yellow bars indicate months where product improvements or firmware updates were deployed. 
                        Observe the subsequent trend to evaluate effectiveness.
                      </p>
                    </div>
                  </div>

                  {/* Defect Distribution & Improvements List */}
                  <div className="space-y-8">
                    <div className="bg-razer-dark border border-razer-border rounded-2xl p-6">
                      <h3 className="text-lg font-bold mb-6">Defect Distribution</h3>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={productStats.defectDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="count"
                            >
                              {productStats.defectDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={[RAZER_GREEN, "#00cc00", "#009900", "#006600", "#003300"][index % 5]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 space-y-2">
                        {productStats.defectDistribution.map((defect, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="text-gray-400">{defect.defect_type}</span>
                            <span className="text-razer-green font-mono">{defect.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-razer-dark border border-razer-border rounded-2xl p-6">
                      <h3 className="text-lg font-bold mb-6">Improvement Log</h3>
                      <div className="space-y-4">
                        {productStats.improvements.length > 0 ? (
                          productStats.improvements.map((imp) => (
                            <div key={imp.id} className="p-3 bg-razer-black/50 border-l-2 border-razer-green rounded-r-lg">
                              <div className="text-xs text-razer-green font-mono mb-1">{imp.implementation_date}</div>
                              <div className="text-sm font-medium">{imp.description}</div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500 text-sm italic">
                            No improvements logged for this product.
                          </div>
                        )}
                      </div>
                      <button className="w-full mt-6 py-2 bg-razer-black border border-razer-border rounded-lg text-xs font-bold hover:border-razer-green/50 transition-all">
                        LOG NEW IMPROVEMENT
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            {view === 'trends' && trendStats && (
              <motion.div 
                key="trends"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Market Quality Trends</h2>
                  <p className="text-gray-500 mt-1">Comparative analysis of product categories and defect velocity.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-razer-dark border border-razer-border rounded-2xl p-8">
                    <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                      <Package className="text-razer-green" />
                      RMA Share by Category
                    </h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trendStats.categoryStats} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#252525" horizontal={true} vertical={false} />
                          <XAxis type="number" stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis dataKey="category" type="category" stroke="#555" fontSize={12} tickLine={false} axisLine={false} width={100} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 255, 0, 0.05)' }} />
                          <Bar dataKey="count" fill={RAZER_GREEN} radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-razer-dark border border-razer-border rounded-2xl p-8">
                    <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                      <TrendingUp className="text-razer-green" />
                      Defect Velocity (30d)
                    </h3>
                    <div className="space-y-6">
                      {trendStats.defectVelocity.map((defect, idx) => {
                        const growth = defect.previous_count === 0 ? 100 : ((defect.recent_count - defect.previous_count) / defect.previous_count) * 100;
                        return (
                          <div key={idx} className="flex items-center justify-between p-4 bg-razer-black/50 border border-razer-border rounded-xl">
                            <div>
                              <div className="text-sm font-bold">{defect.defect_type}</div>
                              <div className="text-xs text-gray-500 font-mono mt-1">
                                {defect.recent_count} REPORTS THIS MONTH
                              </div>
                            </div>
                            <div className={`text-sm font-bold flex items-center gap-1 ${growth > 0 ? 'text-red-500' : 'text-razer-green'}`}>
                              {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
                              <TrendingUp size={14} className={growth > 0 ? 'rotate-0' : 'rotate-180'} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'live' && (
              <motion.div 
                key="live"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">Live Sentinel Feed</h2>
                    <p className="text-gray-500 mt-1">Real-time global RMA ingestion stream.</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-razer-green">
                    <div className="w-2 h-2 bg-razer-green rounded-full animate-ping" />
                    LIVE UPDATING
                  </div>
                </div>

                <div className="bg-razer-dark border border-razer-border rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-6 gap-4 p-4 bg-razer-black/50 border-b border-razer-border text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                    <div className="col-span-1">Timestamp</div>
                    <div className="col-span-2">Product</div>
                    <div className="col-span-1">Category</div>
                    <div className="col-span-1">Defect</div>
                    <div className="col-span-1 text-right">Status</div>
                  </div>
                  <div className="divide-y divide-razer-border max-h-[600px] overflow-y-auto">
                    {recentRMAs.map((rma) => (
                      <motion.div 
                        key={rma.id}
                        initial={{ backgroundColor: 'rgba(0, 255, 0, 0.1)' }}
                        animate={{ backgroundColor: 'transparent' }}
                        transition={{ duration: 2 }}
                        className="grid grid-cols-6 gap-4 p-4 items-center hover:bg-white/5 transition-colors"
                      >
                        <div className="col-span-1 text-xs font-mono text-gray-500">{rma.report_date}</div>
                        <div className="col-span-2 text-sm font-bold text-gray-200">{rma.product_name}</div>
                        <div className="col-span-1">
                          <span className="text-[10px] font-mono border border-razer-border px-2 py-0.5 rounded text-gray-400">
                            {rma.category}
                          </span>
                        </div>
                        <div className="col-span-1 text-xs text-yellow-500">{rma.defect_type}</div>
                        <div className="col-span-1 text-right">
                          <span className="text-[10px] font-bold text-razer-green bg-razer-green/10 px-2 py-1 rounded">
                            {rma.status.toUpperCase()}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, trend, trendUp, icon }: { title: string, value: string, trend: string, trendUp: boolean, icon: React.ReactNode }) {
  return (
    <div className="bg-razer-dark border border-razer-border rounded-xl p-6 hover:border-razer-green/30 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-razer-black rounded-lg border border-razer-border">
          {icon}
        </div>
        <div className={`text-xs font-mono px-2 py-1 rounded ${trendUp ? 'bg-razer-green/10 text-razer-green' : 'bg-red-500/10 text-red-500'}`}>
          {trend}
        </div>
      </div>
      <div className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-1">{title}</div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );
}
