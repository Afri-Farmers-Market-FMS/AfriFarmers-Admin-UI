import { useEffect, useState } from 'react';
import { Users, Sprout, Briefcase, Map, ArrowRight } from 'lucide-react';
import { DistrictChart, IncomeChart, GrowthTrendChart } from '../components/DashboardCharts';
import { farmerService } from '../services/api';
import { DashboardData } from '../types';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading || !data) {
    return <div className="p-8 text-center text-green-700">Loading Dashboard...</div>;
  }

  const { stats, districtData, revenueData, growthData, recentFarmers } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-green-900">Program Overview (2025/2026)</h1>
        <p className="text-gray-500 mt-1">Real-time insights from the AFM E-commerce Onboarding Program.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 flex items-center hover:shadow-md transition-shadow">
          <div className="p-3 bg-green-100 text-green-600 rounded-full mr-4">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Onboarded</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalFarmers}</h3>
            <p className="text-xs text-green-600 font-medium mt-1">Active Farmers</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 flex items-center hover:shadow-md transition-shadow">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full mr-4">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Youth-Owned</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.youthOwnedPercentage}%</h3>
            <p className="text-xs text-gray-500 mt-1">Demographic</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 flex items-center hover:shadow-md transition-shadow">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full mr-4">
            <Map size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Districts</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.districtsCovered}</h3>
            <p className="text-xs text-gray-500 mt-1">Geographic Reach</p>
          </div>
        </div>
      </div>

       {/* Main Trend Chart */}
       <div className="w-full">
         <GrowthTrendChart data={growthData} />
       </div>

      {/* Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="lg:col-span-1 h-80">
            <DistrictChart data={districtData} />
         </div>
         <div className="lg:col-span-1 h-80">
            <IncomeChart data={revenueData} />
         </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Recent Activity / Farmers List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-green-900">Recent Onboarding</h3>
              <Link to="/farmers" className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center">
                View All <ArrowRight size={14} className="ml-1"/>
              </Link>
           </div>
           <div className="space-y-4">
              {recentFarmers.map(farmer => (
                <div key={farmer.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg group hover:bg-green-100 transition-colors">
                    <div className="flex items-center overflow-hidden">
                        <div className="w-10 h-10 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0">
                            {farmer.businessName.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="truncate">
                            <p className="text-sm font-medium text-gray-900 truncate">{farmer.businessName}</p>
                            <p className="text-xs text-gray-500 truncate">{farmer.district} · {farmer.valueChain}</p>
                        </div>
                    </div>
                     <span className="text-xs font-medium text-green-600 bg-white px-3 py-1 rounded-full border border-green-100">Active</span>
                </div>
              ))}
              {recentFarmers.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">No recent farmers found.</p>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
