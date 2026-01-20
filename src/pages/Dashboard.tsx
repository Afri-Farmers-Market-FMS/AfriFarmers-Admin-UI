import { useEffect, useState } from 'react';
import { Users, Sprout, Map, ArrowRight, Activity, TrendingUp, Building2, Download } from 'lucide-react';
import { GrowthLineChart, OperationalScaleChart } from '../components/DashboardCharts';
import { farmerService } from '../services/api';
import { DashboardData, Farmer } from '../types';
import { Link } from 'react-router-dom';
import FarmerModal from '../components/FarmerModal';
// @ts-ignore
import html2pdf from 'html2pdf.js';

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardData = await farmerService.getDashboardData();
        setData(dashboardData);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto-scroll to metrics on load
  useEffect(() => {
    if (!loading && data) {
       // Small timeout to ensure rendering
       setTimeout(() => {
          const element = document.getElementById('metrics-grid');
          if (element) {
             element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
       }, 500);
    }
  }, [loading, data]);

  const handleRowClick = (farmer: Farmer) => {
      setSelectedFarmer(farmer);
      setIsModalOpen(true);
  };
  
  // No-op for save since this is just a view/edit from dashboard
  const handleSave = async () => {
    // In a real app, update state/backend here
    setIsModalOpen(false);
  };

  const handleDownload = () => {
    const element = document.getElementById('dashboard-content');
    if (!element) return;
    const opt = {
      margin:       10,
      filename:     `AfriFarmers_Report_${new Date().toISOString().split('T')[0]}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, windowWidth: 1440 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };
    html2pdf().set(opt).from(element).save();
  };

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center h-full">
         <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-green-100 rounded-full mb-4 flex items-center justify-center text-green-600"><Activity /></div>
            <div className="h-4 w-48 bg-gray-200 rounded"></div>
         </div>
      </div>
    );
  }

  const { stats, businessSizeData, recentFarmers, growthData } = data;

  // Key Metrics Card Config
  const statsConfig = [
    { 
       value: stats.totalFarmers, 
       label: 'Total Businesses', 
       icon: Building2, 
       bg: 'bg-gradient-to-br from-gray-800 to-gray-900',
       metric: 'Active', 
       metricColor: 'text-green-400'
    },
    { 
       value: stats.totalEmployees, 
       label: 'Jobs Created', 
       icon: Users, 
       bg: 'bg-gradient-to-br from-green-600 to-green-700', 
       metric: `${stats.femaleEmployees} Female`,
       metricColor: 'text-green-200'
    },
    { 
      value: `${stats.youthOwnedPercentage}%`, 
      label: 'Youth Inclusion', 
      icon: Sprout, 
      bg: 'bg-gradient-to-br from-blue-600 to-blue-700', 
      metric: `${stats.youthEmployees} Youth Jobs`,
      metricColor: 'text-blue-200'
   },
    { 
       value: stats.districtsCovered, 
       label: 'Districts Reached', 
       icon: Map, 
       bg: 'bg-gradient-to-br from-purple-600 to-purple-700', 
       metric: 'Nationwide',
       metricColor: 'text-purple-200'
    },
  ];

  return (
    <div id="dashboard-content" className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header & Executive Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-b border-gray-100 pb-8">
        <div className="lg:col-span-2 flex flex-col justify-center">
           <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Program Dashboard</h1>
        </div>
        <div className="lg:col-span-1 flex flex-col justify-center items-start lg:items-end">
             <div className="text-right">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Last Data Refresh</p>
                <p className="text-2xl font-bold text-gray-900">{new Date().toLocaleDateString('en-GB')}</p>
             </div>
             <button onClick={handleDownload} data-html2canvas-ignore="true" className="mt-4 px-4 py-2 bg-gray-900 border border-gray-900 shadow-md rounded-lg text-sm font-medium text-white hover:bg-gray-800 flex items-center gap-2 transition-all transform hover:-translate-y-0.5">
                  <Download size={16} className="text-white" /> Download Report
            </button>
        </div>
      </div>

      {/* Hero Metrics Row */}
      <div id="metrics-grid" className="scroll-mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-4">
         {statsConfig.map((stat, i) => (
             <div key={i} className={`relative overflow-hidden rounded-2xl p-6 shadow-lg text-white ${stat.bg} group hover:translate-y-[-4px] transition-all duration-300`}>
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                     <stat.icon size={80} />
                 </div>
                 <div className="relative z-10">
                     <div className="flex items-center gap-2 mb-4 opacity-90">
                         <stat.icon size={20} />
                         <span className="text-xs font-bold uppercase tracking-wider">{stat.label}</span>
                     </div>
                     <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
                     <p className={`text-xs font-medium ${stat.metricColor} flex items-center gap-1`}>
                        <TrendingUp size={12} /> {stat.metric}
                     </p>
                 </div>
             </div>
         ))}
      </div>

       {/* The 2 Core Graphs: 1 Pie + 1 Line */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-auto md:h-[400px] print:grid-cols-2">
           <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 h-full">
                <OperationalScaleChart data={businessSizeData} />
           </div>
           <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 h-full">
                <GrowthLineChart data={growthData} />
           </div>
       </div>

       {/* Recent Activity/List */}
       <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
           <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <div>
                  <h3 className="text-lg font-bold text-gray-900">Recent Registrations</h3>
                  <p className="text-sm text-gray-500">New businesses entering the ecosystem</p>
               </div>
               <Link to="/farmers" className="text-sm font-medium text-green-700 hover:text-green-800 flex items-center gap-1">
                   Full Directory <ArrowRight size={16} />
               </Link>
           </div>
           
           <div className="grid grid-cols-1 divide-y divide-gray-100">
               {recentFarmers.map((farmer) => (
                   <div key={farmer.id} onClick={() => handleRowClick(farmer)} className="cursor-pointer p-4 hover:bg-green-50/30 transition-colors flex items-center gap-4 group">
                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-green-200 text-green-700 flex items-center justify-center font-bold text-sm shrink-0">
                           {farmer.businessName.substring(0, 2).toUpperCase()}
                       </div>
                       <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                           <div className="md:col-span-1">
                               <p className="font-bold text-sm text-gray-900 truncate group-hover:text-green-700 transition-colors">{farmer.businessName}</p>
                               <p className="text-[10px] text-gray-500 uppercase">{farmer.tin || 'No TIN'}</p>
                           </div>
                           <div className="hidden md:block">
                               <p className="text-xs text-gray-600 truncate flex items-center gap-1"><Map size={10}/> {farmer.district}</p>
                           </div>
                           <div className="hidden md:block">
                               <p className="text-xs font-medium text-gray-700 truncate bg-gray-100 px-2 py-1 rounded-md inline-block">{farmer.valueChain.split(' ')[0]}...</p>
                           </div>
                           <div className="text-right">
                               <span className={`text-xs font-bold px-2 py-1 rounded-full ${farmer.ownership === 'Youth-owned' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                                   {farmer.ownership}
                               </span>
                           </div>
                       </div>
                   </div>
               ))}
           </div>
       </div>

       {isModalOpen && selectedFarmer && (
          <FarmerModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSave}
            initialData={selectedFarmer}
            mode="edit"
          />
       )}
    </div>
  );
};

export default Dashboard;
