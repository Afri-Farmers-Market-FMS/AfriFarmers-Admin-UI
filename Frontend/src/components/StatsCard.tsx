import React, { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: ReactNode;
  description: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, trend, trendUp, icon, description }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{value}</h2>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
        <div className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          trendUp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {trendUp ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
          {trend}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
