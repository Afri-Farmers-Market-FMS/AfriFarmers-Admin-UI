import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, PieChart } from 'lucide-react';
import { IncomeChart } from '../components/DashboardCharts';
import { farmerService } from '../services/api';
import { DashboardData } from '../types';

const Analytics = () => {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardData = await farmerService.getDashboardData();
        setData(dashboardData);
      } catch (error) {
        console.error("Failed to fetch analytics data", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-500 mt-1">Deep insights into agricultural performance and yield</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data ? <IncomeChart data={data.revenueData} /> : <div className="h-64 bg-gray-50 rounded-xl animate-pulse"></div>}
        
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Yield by Province</h3>
             <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <div className="text-center">
                    <PieChart className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-gray-500">Yield Distribution Chart Placeholder</p>
                </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Highest Yield</p>
                    <p className="font-bold text-gray-900">East Province</p>
                    <p className="text-xs text-green-600">+15% vs last year</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Lowest Yield</p>
                    <p className="font-bold text-gray-900">Kigali City</p>
                    <p className="text-xs text-red-600">-2% vs last year</p>
                </div>
            </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Export Performance</h3>
        <div className="overflow-x-auto">
             <table className="min-w-full text-left">
                <thead>
                    <tr className="border-b border-gray-100">
                        <th className="pb-3 text-sm font-medium text-gray-500">Month</th>
                        <th className="pb-3 text-sm font-medium text-gray-500">Total Volume (Tons)</th>
                         <th className="pb-3 text-sm font-medium text-gray-500">Revenue</th>
                         <th className="pb-3 text-sm font-medium text-gray-500">Top Market</th>
                         <th className="pb-3 text-sm font-medium text-gray-500">Growth</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                     <tr className="group">
                        <td className="py-4 text-sm font-medium text-gray-900">September 2025</td>
                        <td className="py-4 text-sm text-gray-600">1,240</td>
                        <td className="py-4 text-sm text-gray-600">₣45.2M</td>
                        <td className="py-4 text-sm text-gray-600">DRC</td>
                        <td className="py-4 text-sm text-green-600">+12%</td>
                    </tr>
                    <tr className="group">
                        <td className="py-4 text-sm font-medium text-gray-900">August 2025</td>
                        <td className="py-4 text-sm text-gray-600">1,150</td>
                        <td className="py-4 text-sm text-gray-600">₣41.8M</td>
                        <td className="py-4 text-sm text-gray-600">Uganda</td>
                        <td className="py-4 text-sm text-green-600">+8%</td>
                    </tr>
                     <tr className="group">
                        <td className="py-4 text-sm font-medium text-gray-900">July 2025</td>
                        <td className="py-4 text-sm text-gray-600">980</td>
                        <td className="py-4 text-sm text-gray-600">₣38.5M</td>
                        <td className="py-4 text-sm text-gray-600">Domestic</td>
                        <td className="py-4 text-sm text-gray-600">-2%</td>
                    </tr>
                </tbody>
             </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
