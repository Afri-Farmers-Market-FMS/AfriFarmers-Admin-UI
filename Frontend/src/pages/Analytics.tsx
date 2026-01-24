import { useEffect, useState } from 'react';
import { FinancialHealthChart, RegionalFootprintChart, ValueChainChart, OwnershipChart } from '../components/DashboardCharts';
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
        <p className="text-green-800 mt-1">Deep insights into agricultural performance and yield</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Graph 1: Financial Health (Area) */}
         <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[300px] overflow-hidden">
             {data ? <FinancialHealthChart data={data.revenueData} /> : <div className="h-full bg-gray-50 animate-pulse"></div>}
         </div>
        
         {/* Graph 2: Regional Footprint (Donut) */}
         <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[300px] overflow-hidden">
             {data ? <RegionalFootprintChart data={data.districtData} /> : <div className="h-full bg-gray-50 animate-pulse"></div>}
        </div>

         {/* Graph 3: Value Chains (Bar) */}
         <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[300px] overflow-hidden">
             {data ? <ValueChainChart data={data.valueChainData} /> : <div className="h-full bg-gray-50 animate-pulse"></div>}
         </div>

         {/* Graph 4: Ownership (Pie) */}
         <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[300px] overflow-hidden">
             {data ? <OwnershipChart data={data.ownershipData} /> : <div className="h-full bg-gray-50 animate-pulse"></div>}
         </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Top Value Chains Detailed</h3>
        <div className="overflow-x-auto">
             <table className="min-w-full text-left">
                <thead>
                    <tr className="border-b border-gray-100">
                        <th className="pb-3 text-sm font-medium text-gray-500">Value Chain</th>
                        <th className="pb-3 text-sm font-medium text-gray-500">Count</th>
                        <th className="pb-3 text-sm font-medium text-gray-500">Percentage</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                     {data?.valueChainData.slice(0, 5).map((vc, index) => (
                         <tr key={index} className="group">
                            <td className="py-4 text-sm font-medium text-gray-900">{vc.name}</td>
                            <td className="py-4 text-sm text-gray-600">{vc.value}</td>
                            <td className="py-4 text-sm text-green-600">
                                {data?.stats?.totalFarmers ? ((vc.value / data.stats.totalFarmers) * 100).toFixed(1) + '%' : '-'}
                            </td>
                        </tr>
                     ))}
                </tbody>
             </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
