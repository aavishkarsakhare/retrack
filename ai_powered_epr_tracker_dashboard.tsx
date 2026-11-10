import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie
} from 'recharts';
import {
  ShieldAlert, ShieldCheck, Award, TrendingUp, Cpu, FileText, CheckCircle, AlertTriangle,
  Search, Filter, Plus, MessageSquare, Send, X, QrCode, RefreshCw, ChevronRight,
  Bell, User, Menu, Download, ExternalLink, Leaf, ArrowUpRight, ArrowDownRight,
  Settings, CheckCircle2, AlertCircle, Info, Sparkles, Building2, Calendar, FileSpreadsheet, Lock
} from 'lucide-react';

// ==========================================
// MOCK DATA LAYER (mockData.js simulation)
// ==========================================
const MOCK_DATA = {
  kpis: {
    totalTargetKg: 10000,
    achievedTargetKg: 6500,
    certificateInventory: 450, // in credits (1 credit = 10kg e-waste)
    complianceStatus: 'Compliant', // 'Compliant' or 'At Risk'
    targetYear: '2026',
    riskScoreAvg: 14, // 0-100 (lower is better)
  },
  
  targetVsAchievedHistorical: [
    { year: '2023', target: 5000, achieved: 5200, predicted: null },
    { year: '2024', target: 7200, achieved: 7100, predicted: null },
    { year: '2025', target: 8800, achieved: 8950, predicted: null },
    { year: '2026 (YTD)', target: 10000, achieved: 6500, predicted: 10200 },
    { year: '2027 (AI Forecast)', target: 12500, achieved: 0, predicted: 12800 },
  ],

  forecast12Months: [
    { month: 'Jan', target: 800, predictedCollection: 820, riskConfidence: 96 },
    { month: 'Feb', target: 800, predictedCollection: 790, riskConfidence: 95 },
    { month: 'Mar', target: 850, predictedCollection: 910, riskConfidence: 94 },
    { month: 'Apr', target: 850, predictedCollection: 840, riskConfidence: 93 },
    { month: 'May', target: 900, predictedCollection: 930, riskConfidence: 95 },
    { month: 'Jun', target: 900, predictedCollection: 880, riskConfidence: 92 },
    { month: 'Jul', target: 950, predictedCollection: 990, riskConfidence: 96 },
    { month: 'Aug', target: 950, predictedCollection: 920, riskConfidence: 94 },
    { month: 'Sep', target: 1000, predictedCollection: 1050, riskConfidence: 91 },
    { month: 'Oct', target: 1000, predictedCollection: 980, riskConfidence: 93 },
    { month: 'Nov', target: 1000, predictedCollection: 1020, riskConfidence: 95 },
    { month: 'Dec', target: 1000, predictedCollection: 1070, riskConfidence: 97 },
  ],

  alerts: [
    {
      id: 'ALT-2026-001',
      title: 'Weight Anomaly Detected in Recycler Manifest',
      severity: 'High',
      recycler: 'GreenTech Disposals Pvt Ltd',
      timestamp: '2 hours ago',
      description: 'Reported 1,200 kg PCB scrap batch carries a 38% variance against standard density AI models.',
      status: 'Open'
    },
    {
      id: 'ALT-2026-002',
      title: 'Duplicate Certificate Signature Flagged',
      severity: 'High',
      recycler: 'EcoRefine Solutions',
      timestamp: 'Yesterday',
      description: 'Certificate ID CERT-EW-9941 matches previously submitted invoice metadata from Q1 2025.',
      status: 'Under Review'
    },
    {
      id: 'ALT-2026-003',
      title: 'CPCB Registration Renewal Due',
      severity: 'Medium',
      recycler: 'TechCorp Self-Fulfillment',
      timestamp: '3 days ago',
      description: 'Recycler partner CPCB portal registration expires in 14 days. Renewal filing recommended.',
      status: 'Open'
    }
  ],

  certificates: [
    {
      id: 'CERT-EW-2026-001',
      recycler: 'Apex E-Waste Recyclers India',
      cpcbRegNo: 'CPCB/EW-REG/MH/2022/441',
      date: '2026-02-14',
      quantityKg: 1500,
      credits: 150,
      riskScore: 'Low',
      riskNumeric: 8,
      status: 'Verified',
      wasteCategory: 'IT & Telecommunication Equipment'
    },
    {
      id: 'CERT-EW-2026-002',
      recycler: 'Vanguard Scrap Solutions',
      cpcbRegNo: 'CPCB/EW-REG/DL/2021/889',
      date: '2026-02-10',
      quantityKg: 850,
      credits: 85,
      riskScore: 'High',
      riskNumeric: 84,
      status: 'Flagged',
      wasteCategory: 'Consumer Electronics'
    },
    {
      id: 'CERT-EW-2026-003',
      recycler: 'EcoGreen Processing Systems',
      cpcbRegNo: 'CPCB/EW-REG/KA/2023/102',
      date: '2026-01-28',
      quantityKg: 2200,
      credits: 220,
      riskScore: 'Low',
      riskNumeric: 5,
      status: 'Verified',
      wasteCategory: 'Large Household Appliances'
    },
    {
      id: 'CERT-EW-2026-004',
      recycler: 'Urban Miner Metals Pvt',
      cpcbRegNo: 'CPCB/EW-REG/GJ/2020/554',
      date: '2026-01-19',
      quantityKg: 600,
      credits: 60,
      riskScore: 'Medium',
      riskNumeric: 42,
      status: 'Pending Verification',
      wasteCategory: 'Printed Circuit Boards (PCBs)'
    },
    {
      id: 'CERT-EW-2026-005',
      recycler: 'Verde E-Recycling Logistics',
      cpcbRegNo: 'CPCB/EW-REG/TN/2024/019',
      date: '2026-01-05',
      quantityKg: 1350,
      credits: 135,
      riskScore: 'Low',
      riskNumeric: 11,
      status: 'Verified',
      wasteCategory: 'Batteries & Displays'
    }
  ],

  passports: [
    {
      id: 'PROD-EW-2026-88',
      name: 'EcoBook Pro 15 Ultra Laptop',
      sku: 'TC-EBP15-2026-GRN',
      brand: 'TechCorp India',
      category: 'Laptops & Computers',
      releaseDate: '2026-01-15',
      weightKg: 1.65,
      recyclabilityScore: 88,
      eprFeePaid: 50, // INR
      cpcbCertificateRef: 'CERT-EW-2026-001',
      blockchainTx: '0x94f...c41e9',
      status: 'Compliant & Traceable',
      materials: [
        { name: 'Post-Consumer Recycled Plastics', percentage: 40, color: '#15803d' },
        { name: 'High-Purity Copper & Aluminum', percentage: 35, color: '#0369a1' },
        { name: 'Display Glass & Sapphire', percentage: 15, color: '#854d0e' },
        { name: 'Rare Earth Elements & Gold', percentage: 10, color: '#b91c1c' }
      ],
      hazardousMaterials: 'Zero lead (RoHS compliant), Halogen-free PCB design'
    },
    {
      id: 'PROD-EW-2026-99',
      name: 'SmartDisplay EcoVision 27',
      sku: 'TC-SDE27-2025-SLV',
      brand: 'TechCorp India',
      category: 'Monitors & Displays',
      releaseDate: '2025-11-20',
      weightKg: 4.80,
      recyclabilityScore: 79,
      eprFeePaid: 85,
      cpcbCertificateRef: 'CERT-EW-2026-003',
      blockchainTx: '0x71b...d92a0',
      status: 'Compliant & Traceable',
      materials: [
        { name: 'Recycled Aluminum Housing', percentage: 45, color: '#0369a1' },
        { name: 'Tempered Glass Panel', percentage: 30, color: '#854d0e' },
        { name: 'Recycled Polymer Base', percentage: 15, color: '#15803d' },
        { name: 'Circuitry & Connectors', percentage: 10, color: '#b91c1c' }
      ],
      hazardousMaterials: 'Mercury-free LED backlighting'
    }
  ],

  cpcbSummary: {
    quarter: 'Q3 2026 (Oct - Dec)',
    filingDeadline: '2026-11-30',
    totalObligationKg: 2500,
    collectedKg: 2650,
    attachedCertificatesCount: 4,
    status: 'Ready to File', // 'Ready to File', 'Filed', 'Pending Audit'
    lastRefNumber: 'CPCB-2026-EW-8942'
  }
};

// ==========================================
// MAIN APP CONTAINER & ROUTER STATE
// ==========================================
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'certificates', 'cpcb', 'passport', 'settings'
  const [passportId, setPassportId] = useState('PROD-EW-2026-88');
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  // Helper toast notification function
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Switch tab with mock loader
  const handleTabChange = (tabName, extraParam = null) => {
    if (extraParam) setPassportId(extraParam);
    setLoading(true);
    setMobileMenuOpen(false);
    setActiveTab(tabName);
    setTimeout(() => {
      setLoading(false);
    }, 350);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col md:flex-row">
      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 animate-slide-in ${
              toast.type === 'success'
                ? 'bg-emerald-900/90 text-white border-emerald-700'
                : toast.type === 'warning'
                ? 'bg-amber-900/90 text-white border-amber-700'
                : 'bg-rose-900/90 text-white border-rose-700'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
            {toast.type === 'error' && <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />}
            <span className="text-sm font-medium leading-snug">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <TopBar
          unreadCount={unreadCount}
          setUnreadCount={setUnreadCount}
          notificationsOpen={notificationsOpen}
          setNotificationsOpen={setNotificationsOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          handleTabChange={handleTabChange}
        />

        {/* Page Content Rendered with Skeleton state */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {loading ? (
            <SkeletonLoader />
          ) : (
            <>
              {activeTab === 'dashboard' && <DashboardPage onNavigate={handleTabChange} addToast={addToast} />}
              {activeTab === 'certificates' && <CertificatesPage addToast={addToast} />}
              {activeTab === 'cpcb' && <CpcbFilingPage addToast={addToast} />}
              {activeTab === 'passport' && <PassportPage passportId={passportId} addToast={addToast} setPassportId={setPassportId} />}
              {activeTab === 'settings' && <SettingsPage addToast={addToast} />}
            </>
          )}
        </main>
      </div>

      {/* Floating Chatbot Assistant Component (Global Bottom Right) */}
      <FloatingChatbot addToast={addToast} />
    </div>
  );
}

// ==========================================
// NAVIGATION SIDEBAR COMPONENT
// ==========================================
function Sidebar({ activeTab, setActiveTab, mobileOpen, setMobileOpen }) {
  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: TrendingUp },
    { id: 'certificates', label: 'Certificate Inventory', icon: Award, badge: 'High Risk Alert' },
    { id: 'cpcb', label: 'CPCB Portal Filing', icon: FileText, badge: 'Due Q3' },
    { id: 'passport', label: 'Digital Product Passport', icon: QrCode },
    { id: 'settings', label: 'Compliance Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-emerald-950 text-slate-100 flex flex-col border-r border-emerald-900 transition-transform duration-300 transform ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 flex items-center justify-between border-b border-emerald-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center shadow-lg shadow-emerald-900/50">
              <Leaf className="w-6 h-6 text-emerald-950 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none tracking-tight text-white">EPR Track AI</h1>
              <span className="text-xs text-emerald-400 font-medium">E-Waste Compliance</span>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40 font-semibold'
                    : 'text-emerald-100/70 hover:bg-emerald-900/50 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-emerald-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.id === 'certificates' && (
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
                    1 Flagged
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Producer Organization Info Card */}
        <div className="p-4 m-3 bg-emerald-900/40 rounded-xl border border-emerald-800/60">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">Registered Brand</span>
          </div>
          <p className="text-sm font-bold text-white">TechCorp India Pvt Ltd</p>
          <p className="text-xs text-emerald-300/80">CPCB ID: EWR-2024-MH-8841</p>
          <div className="mt-3 pt-2 border-t border-emerald-800/50 flex justify-between items-center text-[11px] text-emerald-400">
            <span>Audit Status</span>
            <span className="text-emerald-300 font-medium flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-400" /> Verified 2026
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-emerald-900/80 text-xs text-emerald-400/60 flex items-center justify-between">
          <span>AI Engine v2.4 (Active)</span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
      </aside>
    </>
  );
}

// ==========================================
// TOP HEADER BAR COMPONENT
// ==========================================
function TopBar({
  unreadCount,
  setUnreadCount,
  notificationsOpen,
  setNotificationsOpen,
  setMobileMenuOpen,
  handleTabChange
}) {
  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden text-slate-600 hover:text-slate-900 p-1 rounded-lg hover:bg-slate-100"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Search Bar */}
        <div className="relative hidden sm:block w-64 lg:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Certificates, Products, Recyclers..."
            className="w-full pl-9 pr-4 py-2 bg-slate-100 text-xs rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-800 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Quick Verification Shortcut */}
        <button
          onClick={() => handleTabChange('passport', 'PROD-EW-2026-88')}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200/80 transition-colors"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Quick QR Scan</span>
        </button>

        {/* Notifications Popover Trigger */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              if (unreadCount > 0) setUnreadCount(0);
            }}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 relative transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <h4 className="font-semibold text-sm text-slate-800">Compliance Notifications</h4>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                  3 Real-time Alerts
                </span>
              </div>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {MOCK_DATA.alerts.map((alert) => (
                  <div key={alert.id} className="p-3.5 hover:bg-slate-50 transition-colors flex gap-3">
                    <AlertTriangle className={`w-5 h-5 shrink-0 ${alert.severity === 'High' ? 'text-rose-500' : 'text-amber-500'}`} />
                    <div className="text-xs">
                      <p className="font-semibold text-slate-900">{alert.title}</p>
                      <p className="text-slate-500 mt-0.5 line-clamp-2">{alert.description}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{alert.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-4 pt-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setNotificationsOpen(false);
                    handleTabChange('certificates');
                  }}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Manage All Security Flagged Items &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="text-right hidden lg:block">
            <p className="text-xs font-bold text-slate-800">Rajesh Sharma</p>
            <p className="text-[11px] text-slate-500">Chief Sustainability Officer</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-xs shadow-md ring-2 ring-emerald-600/30">
            RS
          </div>
        </div>
      </div>
    </header>
  );
}

// ==========================================
// PAGE 1: DASHBOARD HOME VIEW
// ==========================================
function DashboardPage({ onNavigate, addToast }) {
  const [targetYear, setTargetYear] = useState('2026');
    // ---- AI E-Waste Prediction (connects to backend) ----
  const API_BASE = 'http://localhost:3000';
  const [mlStates, setMlStates] = useState([]);
  const [mlState, setMlState] = useState('');
  const [mlYear, setMlYear] = useState(2026);
  const [mlResult, setMlResult] = useState(null);
  const [mlLoading, setMlLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/ml/states`)
      .then((res) => res.json())
      .then((data) => {
        setMlStates(data.states || []);
        if (data.states && data.states.length > 0) setMlState(data.states[0]);
      })
      .catch(() => addToast('Could not load states from backend', 'error'));
  }, []);

  const runPrediction = async () => {
    setMlLoading(true);
    setMlResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/ml/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: mlState, year: Number(mlYear) }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.detail || data.message || 'Prediction failed', 'error');
      } else {
        setMlResult(data);
      }
    } catch (err) {
      addToast('Backend is not reachable', 'error');
    }
    setMlLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">EPR Compliance Dashboard</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time Extended Producer Responsibility obligation tracking & AI fraud monitoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={targetYear}
            onChange={(e) => setTargetYear(e.target.value)}
            className="bg-white border border-slate-300 text-xs font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-sm"
          >
            <option value="2026">Financial Year 2026</option>
            <option value="2025">Financial Year 2025</option>
          </select>
          <button
            onClick={() => onNavigate('cpcb')}
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md shadow-emerald-700/20 flex items-center gap-2 transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>File CPCB Return</span>
          </button>
        </div>
      </div>

            {/* AI E-WASTE PREDICTION CARD */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-emerald-700" />
          <h3 className="font-bold text-slate-900 text-base">AI E-Waste Prediction</h3>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">State</label>
            <select
              value={mlState}
              onChange={(e) => setMlState(e.target.value)}
              className="bg-white border border-slate-300 text-sm rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {mlStates.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">Year</label>
            <input
              type="number"
              value={mlYear}
              onChange={(e) => setMlYear(e.target.value)}
              className="bg-white border border-slate-300 text-sm rounded-xl px-3 py-2 w-28 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <button
            onClick={runPrediction}
            disabled={mlLoading || !mlState}
            className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl shadow-md transition-all"
          >
            {mlLoading ? 'Predicting...' : 'Predict'}
          </button>
        </div>

        {mlResult && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <p className="text-xs text-slate-500">
              {mlResult.state} &middot; FY {mlResult.financial_year}
            </p>
            <p className="text-2xl font-bold text-emerald-800">
              {Number(mlResult.predicted_ewaste).toLocaleString()} {mlResult.unit}
            </p>
          </div>
        )}
      </div>

      {/* 4 KPI CARDS SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total EPR Target */}
        <KpiCard
          title="Total EPR Obligation"
          value={`${MOCK_DATA.kpis.totalTargetKg.toLocaleString()} kg`}
          subtitle="Mandated E-Waste Target"
          icon={Cpu}
          iconBg="bg-blue-50 text-blue-600"
          trend="+13.6% vs last year"
          trendUp={true}
        />

        {/* Card 2: Achieved Target */}
        <KpiCard
          title="Achieved Collection"
          value={`${MOCK_DATA.kpis.achievedTargetKg.toLocaleString()} kg`}
          subtitle="65% Goal Completed"
          icon={CheckCircle}
          iconBg="bg-emerald-50 text-emerald-600"
          progress={65}
        />

        {/* Card 3: Certificate Inventory */}
        <KpiCard
          title="Certificate Inventory"
          value={`${MOCK_DATA.kpis.certificateInventory} Credits`}
          subtitle="1 Credit = 10kg Certified Recycled"
          icon={Award}
          iconBg="bg-amber-50 text-amber-600"
          actionText="Trade / Buy"
          onAction={() => onNavigate('certificates')}
        />

        {/* Card 4: Compliance Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Compliance Status</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                Compliant
              </span>
              <span className="text-xs text-slate-500 font-medium">Risk Score: 14/100</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Next quarterly audit in <strong className="text-slate-800">22 Days</strong>
            </p>
          </div>
        </div>
      </div>

      {/* CHARTS SECTION (2 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Bar Chart Target vs Achieved */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Target vs. Achieved (2023-2027)</h3>
              <p className="text-xs text-slate-500">Historical recycling targets against verified credits</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-3 h-3 bg-slate-300 rounded-sm"></span> Target
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-3 h-3 bg-emerald-700 rounded-sm"></span> Achieved
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_DATA.targetVsAchievedHistorical} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(val) => [`${val} kg`, '']}
                />
                <Bar dataKey="target" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="achieved" fill="#15803d" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Line Chart Predicted 12-Month Forecast */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Predicted EPR Target Forecast</h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Model
                </span>
              </div>
              <p className="text-xs text-slate-500">12-month projected collection trajectory & seasonal trend</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_DATA.forecast12Months} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} dot={false} name="Monthly Target" />
                <Line type="monotone" dataKey="predictedCollection" stroke="#16a34a" strokeWidth={3} dot={{ fill: '#16a34a', r: 4 }} name="AI Predicted Run-rate" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RECENT ALERTS PANEL & QUICK PASSPORT LAUNCH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Alerts (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-slate-900 text-base">AI Compliance & Fraud Alerts</h3>
            </div>
            <button
              onClick={() => onNavigate('certificates')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View All Certificates</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {MOCK_DATA.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  alert.severity === 'High' ? 'bg-rose-50/50 border-rose-200' : 'bg-amber-50/50 border-amber-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      alert.severity === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs text-slate-900">{alert.title}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          alert.severity === 'High' ? 'bg-rose-200 text-rose-800' : 'bg-amber-200 text-amber-800'
                        }`}
                      >
                        {alert.severity} Risk
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{alert.description}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2">
                      <span>Recycler: <strong>{alert.recycler}</strong></span>
                      <span>•</span>
                      <span>{alert.timestamp}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    addToast(`Investigating alert ${alert.id} with AI auditor...`, 'warning');
                    onNavigate('certificates');
                  }}
                  className="self-end sm:self-center px-3 py-1.5 bg-white text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-lg border border-slate-300 shadow-sm shrink-0"
                >
                  Audit Details
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Digital Product Passport Quick Entry Card */}
        <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mb-4">
              <QrCode className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold">Digital Product Passport (DPP)</h3>
            <p className="text-xs text-emerald-200/80 mt-2 leading-relaxed">
              Verify e-waste component circularity, plastic compliance score, and EPR credit lineage via blockchain-backed QR tags.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => onNavigate('passport', 'PROD-EW-2026-88')}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Scan / Inspect EcoBook Passport</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-center text-emerald-400/70">Sample Product: PROD-EW-2026-88</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// KPI CARD COMPONENT
function KpiCard({ title, value, subtitle, icon: Icon, iconBg, progress, trend, trendUp, actionText, onAction }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <h4 className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</h4>
        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">
        {progress !== undefined && (
          <div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}

        {trend && (
          <div className={`text-xs font-semibold flex items-center gap-1 ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trendUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>{trend}</span>
          </div>
        )}

        {actionText && (
          <button
            onClick={onAction}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>{actionText}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ==========================================
// PAGE 2: CERTIFICATE MARKETPLACE & VERIFICATION
// ==========================================
function CertificatesPage({ addToast }) {
  const [certificates, setCertificates] = useState(MOCK_DATA.certificates);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);

  // Form State for Modal
  const [formData, setFormData] = useState({
    certId: '',
    recycler: '',
    cpcbRegNo: '',
    quantityKg: '',
    date: '',
    wasteCategory: 'IT & Telecommunication Equipment'
  });
  const [validating, setValidating] = useState(false);

  // Filter logic
  const filteredCerts = useMemo(() => {
    return certificates.filter((cert) => {
      const matchesSearch =
        cert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.recycler.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.cpcbRegNo.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk = riskFilter === 'All' || cert.riskScore === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [certificates, searchQuery, riskFilter]);

  const handleVerifyNew = (e) => {
    e.preventDefault();
    setValidating(true);

    setTimeout(() => {
      setValidating(false);
      const isHighRisk = formData.recycler.toLowerCase().includes('vanguard') || Number(formData.quantityKg) > 5000;
      const newCert = {
        id: formData.certId || `CERT-EW-2026-${Math.floor(100 + Math.random() * 900)}`,
        recycler: formData.recycler,
        cpcbRegNo: formData.cpcbRegNo || 'CPCB/EW-REG/MH/2026/099',
        date: formData.date || new Date().toISOString().split('T')[0],
        quantityKg: Number(formData.quantityKg) || 1000,
        credits: Math.floor((Number(formData.quantityKg) || 1000) / 10),
        riskScore: isHighRisk ? 'High' : 'Low',
        riskNumeric: isHighRisk ? 82 : 6,
        status: isHighRisk ? 'Flagged' : 'Verified',
        wasteCategory: formData.wasteCategory
      };

      setCertificates([newCert, ...certificates]);
      setIsModalOpen(false);

      if (isHighRisk) {
        addToast(`Certificate ${newCert.id} added but FLAGGED by AI (High Anomaly Risk)`, 'warning');
      } else {
        addToast(`Certificate ${newCert.id} verified and added to inventory!`, 'success');
      }

      // Reset form
      setFormData({ certId: '', recycler: '', cpcbRegNo: '', quantityKg: '', date: '', wasteCategory: 'IT & Telecommunication Equipment' });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Certificate Verification & Inventory</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Audit recycler credit lineage, verify CPCB validity, and detect weight anomaly frauds.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Verify New Certificate</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Cert ID, Recycler Name, CPCB Reg..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-500 font-medium shrink-0">AI Risk Filter:</span>
          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            {['All', 'Low', 'Medium', 'High'].map((risk) => (
              <button
                key={risk}
                onClick={() => setRiskFilter(risk)}
                className={`flex-1 sm:flex-initial px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  riskFilter === risk ? 'bg-white text-emerald-800 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {risk}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Cert ID</th>
                <th className="py-3.5 px-4">Recycler Name</th>
                <th className="py-3.5 px-4">CPCB Reg No</th>
                <th className="py-3.5 px-4">Issue Date</th>
                <th className="py-3.5 px-4 text-right">Quantity (kg)</th>
                <th className="py-3.5 px-4 text-center">AI Risk Score</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCerts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No matching e-waste certificates found.
                  </td>
                </tr>
              ) : (
                filteredCerts.map((cert) => {
                  const isHighRisk = cert.riskScore === 'High';
                  return (
                    <tr
                      key={cert.id}
                      className={`transition-colors ${
                        isHighRisk ? 'bg-rose-50/70 border-l-4 border-l-rose-500' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                        {isHighRisk && <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />}
                        <span>{cert.id}</span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">{cert.recycler}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{cert.cpcbRegNo}</td>
                      <td className="py-3.5 px-4 text-slate-600">{cert.date}</td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-900">
                        {cert.quantityKg.toLocaleString()} kg
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                            cert.riskScore === 'High'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : cert.riskScore === 'Medium'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          {cert.riskScore} ({cert.riskNumeric})
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-semibold ${
                            cert.status === 'Verified'
                              ? 'text-emerald-700'
                              : cert.status === 'Flagged'
                              ? 'text-rose-700 font-bold'
                              : 'text-amber-700'
                          }`}
                        >
                          {cert.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedCert(cert)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg border border-slate-300 transition-colors"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VERIFY NEW CERTIFICATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-emerald-950 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">Verify & Add E-Waste Certificate</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVerifyNew} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Certificate ID</label>
                  <input
                    type="text"
                    placeholder="e.g. CERT-EW-2026-999"
                    value={formData.certId}
                    onChange={(e) => setFormData({ ...formData, certId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity (kg)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1500"
                    value={formData.quantityKg}
                    onChange={(e) => setFormData({ ...formData, quantityKg: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Recycler Name</label>
                <input
                  type="text"
                  placeholder="Recycler organization name..."
                  value={formData.recycler}
                  onChange={(e) => setFormData({ ...formData, recycler: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">CPCB Registration Number</label>
                <input
                  type="text"
                  placeholder="CPCB/EW-REG/MH/2026/XXXX"
                  value={formData.cpcbRegNo}
                  onChange={(e) => setFormData({ ...formData, cpcbRegNo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">E-Waste Category</label>
                  <select
                    value={formData.wasteCategory}
                    onChange={(e) => setFormData({ ...formData, wasteCategory: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="IT & Telecommunication Equipment">IT & Telecommunication</option>
                    <option value="Consumer Electronics">Consumer Electronics</option>
                    <option value="Large Household Appliances">Household Appliances</option>
                    <option value="Printed Circuit Boards (PCBs)">PCBs & Metals</option>
                  </select>
                </div>
              </div>

              {/* AI Auto-audit hint box */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>AI will check density anomalies, CPCB active status, and invoice hash duplicates automatically.</span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={validating}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {validating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Running AI Audit...</span>
                    </>
                  ) : (
                    <span>Submit & Audit Certificate</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECT DETAIL MODAL */}
      {selectedCert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Certificate Inspection Details</h3>
                <p className="text-xs text-slate-500">{selectedCert.id}</p>
              </div>
              <button onClick={() => setSelectedCert(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block font-medium">Recycler Partner</span>
                  <span className="font-bold text-slate-900">{selectedCert.recycler}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">CPCB Registration</span>
                  <span className="font-mono text-slate-800">{selectedCert.cpcbRegNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Weight Certified</span>
                  <span className="font-bold text-slate-900">{selectedCert.quantityKg} kg</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">EPR Credits</span>
                  <span className="font-bold text-emerald-700">{selectedCert.credits} Credits</span>
                </div>
              </div>

              <div className="p-3 bg-slate-100 rounded-xl space-y-1">
                <span className="font-bold text-slate-800">AI Risk Breakdown</span>
                <p className="text-[11px] text-slate-600">
                  {selectedCert.riskScore === 'High'
                    ? '⚠️ Anomaly Detected: Weight density ratio reported is 38% higher than standard PCB yield standards. Requires manual manifest verification.'
                    : '✓ Verified: GST match confirmed, physical facility location verified via CPCB geofence.'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setSelectedCert(null)}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// PAGE 3: CPCB FILING & NLP CHATBOT PAGE
// ==========================================
function CpcbFilingPage({ addToast }) {
  const [isFiling, setIsFiling] = useState(false);
  const [filingStatus, setFilingStatus] = useState(MOCK_DATA.cpcbSummary.status);

  const handleFileReturn = () => {
    setIsFiling(true);
    setTimeout(() => {
      setIsFiling(false);
      setFilingStatus('Filed');
      addToast('Return Filed Successfully to CPCB Portal (Ref: CPCB-2026-EW-8942)', 'success');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">CPCB Filing & Compliance Assistant</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Automated quarterly returns generation for Central Pollution Control Board portal submission.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CPCB Quarterly Summary Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Current Obligation Period
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2">{MOCK_DATA.cpcbSummary.quarter}</h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Filing Deadline</span>
              <span className="text-sm font-bold text-rose-600">{MOCK_DATA.cpcbSummary.filingDeadline}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-xs text-slate-500 font-medium">Obligation Target</span>
              <p className="text-lg font-bold text-slate-900 mt-1">{MOCK_DATA.cpcbSummary.totalObligationKg} kg</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200/60">
              <span className="text-xs text-emerald-700 font-medium">Collected & Verified</span>
              <p className="text-lg font-bold text-emerald-800 mt-1">{MOCK_DATA.cpcbSummary.collectedKg} kg</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-xs text-slate-500 font-medium">Attached Certificates</span>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {MOCK_DATA.cpcbSummary.attachedCertificatesCount} Recycler Manifests
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-sm">Filing Status: {filingStatus}</p>
                <p className="text-xs text-slate-300">
                  {filingStatus === 'Filed'
                    ? `Acknowledged by CPCB Portal. Reference Ref ID: ${MOCK_DATA.cpcbSummary.lastRefNumber}`
                    : 'All 4 quarterly certificates verified and cryptographically signed.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleFileReturn}
              disabled={isFiling || filingStatus === 'Filed'}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all disabled:opacity-50 shrink-0 flex items-center justify-center gap-2"
            >
              {isFiling ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting CPCB Portal...</span>
                </>
              ) : filingStatus === 'Filed' ? (
                <span>Filing Complete ✓</span>
              ) : (
                <span>File Return to CPCB</span>
              )}
            </button>
          </div>
        </div>

        {/* CPCB Guidelines Box */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-700" />
            <span>CPCB Compliance Rules (2026)</span>
          </h4>
          <ul className="space-y-3 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0"></span>
              <span>Producers must submit quarterly recycling targets by the 30th of the month following each quarter.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0"></span>
              <span>Certificates must be purchased only from CPCB-registered recycling facilities with valid CTO permissions.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0"></span>
              <span>Non-compliance attracts environmental compensation penalty under Rule 21 of E-Waste Management Rules.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// FLOATING NLP AI CHATBOT WIDGET
// ==========================================
function FloatingChatbot({ addToast }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your AI EPR Compliance Assistant. Ask me anything about CPCB targets, recycling credit verification, or penalty calculations.'
    }
  ]);
  const [input, setInput] = useState('');

  const sampleQuestions = [
    'How do I calculate my 2024 EPR target?',
    'What are the penalties for CPCB default?',
    'Show high-risk recycler list'
  ];

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: query }];
    setMessages(newMessages);
    if (!textToSend) setInput('');

    // Simulate AI response
    setTimeout(() => {
      let botResponse = 'I have queried the CPCB 2026 E-Waste Management framework.';
      const lower = query.toLowerCase();

      if (lower.includes('calculate') || lower.includes('target')) {
        botResponse =
          'Your EPR Target is calculated based on: **Target = (Average Quantity of EEE placed in market in preceding years) × (Specified % multiplier)**. For 2026, IT equipment carries a **60% collection target**.';
      } else if (lower.includes('penalty') || fontMatch(lower, ['penalties', 'default', 'fine'])) {
        botResponse =
          'Under CPCB Environmental Compensation guidelines, non-fulfillment incurs a penalty ranging from **₹10 to ₹50 per kg** of unfulfilled e-waste obligation, alongside potential suspension of import/manufacture license.';
      } else if (lower.includes('high-risk') || lower.includes('recycler')) {
        botResponse =
          'Currently, **Vanguard Scrap Solutions** has been flagged with an AI Risk Score of **84/100** due to density yield anomalies. Avoid purchasing credits from unverified batches.';
      }

      setMessages((prev) => [...prev, { sender: 'bot', text: botResponse }]);
    }, 750);
  };

  function fontMatch(str, words) {
    return words.some((w) => str.includes(w));
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-emerald-800 hover:bg-emerald-900 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 group transition-all transform hover:scale-105"
        >
          <Sparkles className="w-6 h-6 text-emerald-300 animate-pulse" />
          <span className="font-bold text-xs pr-1">EPR Compliance AI</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden h-[480px] animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="bg-emerald-950 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <h4 className="font-bold text-xs">EPR Compliance Assistant</h4>
                <span className="text-[10px] text-emerald-400">Powered by CPCB Regulatory Knowledge Base</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-emerald-700 text-white rounded-br-none font-medium'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Prompts */}
          <div className="p-2 bg-slate-100 border-t border-slate-200 flex flex-wrap gap-1">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="text-[10px] font-semibold bg-white text-slate-700 hover:text-emerald-700 px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs truncate max-w-full"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI assistant..."
              className="flex-1 px-3 py-2 bg-slate-100 text-xs rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-800"
            />
            <button
              type="submit"
              className="p-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// ==========================================
// PAGE 4: DIGITAL PRODUCT PASSPORT (QR / PASSPORT)
// ==========================================
function PassportPage({ passportId, setPassportId, addToast }) {
  const currentPassport =
    MOCK_DATA.passports.find((p) => p.id === passportId) || MOCK_DATA.passports[0];
  const [showQrModal, setShowQrModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header with Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Digital Product Passport</h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Verified Blockchain
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Public circularity manifest & material composition transparency (Route: /passport/{currentPassport.id}).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={passportId}
            onChange={(e) => setPassportId(e.target.value)}
            className="bg-white border border-slate-300 text-xs font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-sm"
          >
            {MOCK_DATA.passports.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id})
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowQrModal(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md flex items-center gap-2"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Show QR Tag</span>
          </button>
        </div>
      </div>

      {/* PASSPORT CARD MAIN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Passport Details */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">{currentPassport.category}</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{currentPassport.name}</h3>
              <p className="text-xs text-slate-500 mt-1">SKU: {currentPassport.sku} • Manufactured by {currentPassport.brand}</p>
            </div>
            <div className="px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>EPR Compliant & Fee Paid</span>
            </div>
          </div>

          {/* Material Breakdown */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3">Material Composition Breakdown</h4>
            <div className="space-y-3">
              {currentPassport.materials.map((mat, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>{mat.name}</span>
                    <span className="font-bold">{mat.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${mat.percentage}%`, backgroundColor: mat.color }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hazardous statement */}
          <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 block">Hazardous Substances Compliance</span>
            <p>{currentPassport.hazardousMaterials}</p>
          </div>
        </div>

        {/* Right Col: Recyclability Score & Blockchain Lineage */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6">
          <div className="text-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recyclability Rating</span>
            {/* Circular score display */}
            <div className="relative w-36 h-36 mx-auto my-4 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="72" cy="72" r="60" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="#15803d"
                  strokeWidth="12"
                  strokeDasharray={377}
                  strokeDashoffset={377 - (377 * currentPassport.recyclabilityScore) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-slate-900">{currentPassport.recyclabilityScore}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">/ 100 Circular</span>
              </div>
            </div>
            <p className="text-xs text-emerald-700 font-medium">Grade A Circular Engineering</p>
          </div>

          {/* Fee & Blockchain Details */}
          <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">EPR Fee Paid</span>
              <span className="font-bold text-slate-900">₹{currentPassport.eprFeePaid} / Unit</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cert Ref ID</span>
              <span className="font-mono text-emerald-700">{currentPassport.cpcbCertificateRef}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Blockchain Hash</span>
              <span className="font-mono text-slate-700 truncate max-w-[120px]">{currentPassport.blockchainTx}</span>
            </div>
          </div>
        </div>
      </div>

      {/* QR MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base">Digital Product Passport QR</h3>
            <p className="text-xs text-slate-500">Print or attach this QR tag to product packaging for CPCB compliance auditing.</p>

            <div className="p-4 bg-white border-2 border-slate-900 rounded-xl inline-block shadow-inner">
              {/* Generated SVG QR Code simulation */}
              <svg className="w-44 h-44 mx-auto" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="#ffffff" />
                <path d="M0 0h30v30H0zM10 10h10v10H10zM70 0h30v30H70zM80 10h10v10H80zM0 70h30v30H0zM10 80h10v10H10z" fill="#0f172a" />
                <rect x="35" y="5" width="10" height="20" fill="#15803d" />
                <rect x="50" y="15" width="15" height="10" fill="#0f172a" />
                <rect x="35" y="35" width="30" height="30" fill="#0f172a" />
                <rect x="40" y="40" width="20" height="10" fill="#15803d" />
                <rect x="70" y="40" width="25" height="15" fill="#0f172a" />
                <rect x="75" y="70" width="20" height="25" fill="#15803d" />
              </svg>
            </div>

            <p className="text-xs font-mono font-bold text-slate-800">{currentPassport.id}</p>

            <button
              onClick={() => {
                addToast('QR Tag downloaded to PDF package', 'success');
                setShowQrModal(false);
              }}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Download PDF Tag
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// PAGE 5: COMPLIANCE SETTINGS
// ==========================================
function SettingsPage({ addToast }) {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Compliance & System Settings</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure AI fraud alert sensitivity threshold and CPCB API integration parameters.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        <h3 className="font-bold text-slate-900 text-base">AI Anomaly Detection Thresholds</h3>
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Scrap Density Variance Tolerance</label>
            <input type="range" min="10" max="50" defaultValue="25" className="w-full accent-emerald-700" />
            <span className="text-slate-400">Current Sensitivity: 25% Variance Flag</span>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block">Automated CPCB GST Sync</span>
              <span className="text-slate-500">Cross-reference recycler invoice numbers with GST portal daily</span>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-emerald-700" />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block">Real-time Fraud Alerts</span>
              <span className="text-slate-500">Notify Sustainability Team via Slack / Email on High Risk score</span>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-emerald-700" />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={() => addToast('Settings updated successfully', 'success')}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md"
          >
            Save Parameters
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// SKELETON LOADER COMPONENT
// ==========================================
function SkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-slate-200 rounded-lg w-1/3"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-slate-200 rounded-2xl"></div>
        <div className="h-80 bg-slate-200 rounded-2xl"></div>
      </div>
    </div>
  );
}