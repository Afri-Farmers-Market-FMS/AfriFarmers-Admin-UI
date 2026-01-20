import { 
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { GraphData } from '../types';

interface ChartProps {
  data: GraphData[];
}

const PIE_COLORS = ['#15803d', '#22c55e', '#86efac', '#bbf7d0', '#dcfce7'];
const DISTRICT_COLORS = ['#0f766e', '#0d9488', '#14b8a6', '#5eead4', '#ccfbf1']; // Teal Palette

// Graph 1: Operational Scale (Business Size) - PIE
export const OperationalScaleChart = ({ data }: ChartProps) => {
    return (
      <div className="flex flex-col h-full p-2">
        <div className="mb-2 px-4 pt-4">
            <h3 className="text-lg font-bold text-gray-900 border-l-4 border-green-600 pl-3">Operational Scale</h3>
            <p className="text-sm text-gray-400 pl-4">Distribution by Business Size</p>
        </div>
        <div className="flex-1 w-full min-h-[250px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                 itemStyle={{ color: '#166534', fontWeight: 600 }}
              />
              <Legend 
                  verticalAlign="middle" 
                  align="right" 
                  layout="vertical" 
                  iconType="circle"
                  wrapperStyle={{ paddingRight: '10px', fontSize: '12px', color: '#4b5563' }}
               />
            </PieChart>
          </ResponsiveContainer>
          {/* Center Text Overlay */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center pr-20 md:pr-16">
             <span className="block text-2xl font-bold text-gray-800">
                 {data.reduce((acc, cur) => acc + cur.value, 0)}
             </span>
             <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Total</span>
          </div>
        </div>
      </div>
    );
};

// Graph 2: Regional Footprint - PIE (Donut)
export const RegionalFootprintChart = ({ data }: ChartProps) => {
  return (
    <div className="flex flex-col h-full p-2">
      <div className="mb-2 px-4 pt-4">
        <h3 className="text-lg font-bold text-gray-900 border-l-4 border-teal-600 pl-3">Regional Footprint</h3>
        <p className="text-sm text-gray-400 pl-4">Top Districts by Density</p>
      </div>
      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
           <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                stroke="white"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={DISTRICT_COLORS[index % DISTRICT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                 itemStyle={{ color: '#0f766e', fontWeight: 600 }}
              />
              <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', color: '#4b5563', paddingTop: '10px' }}
               />
            </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Graph 3: Financial Health (Income Brackets) - AREA
export const FinancialHealthChart = ({ data }: ChartProps) => {
    return (
      <div className="flex flex-col h-full p-2">
        <div className="mb-2 px-4 pt-4">
            <h3 className="text-lg font-bold text-gray-900 border-l-4 border-emerald-600 pl-3">Financial Profile</h3>
            <p className="text-sm text-gray-400 pl-4">Annual Income Distribution</p>
        </div>
        <div className="flex-1 w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="emeraldArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#4b5563', fontWeight: 600 }} 
                dy={10}
              />
              <YAxis 
                 axisLine={false} 
                 tickLine={false}
                 tick={{ fontSize: 10, fill: '#9ca3af' }}
              />
              <Tooltip 
                 cursor={{ stroke: '#6ee7b7', strokeWidth: 2 }}
                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                 itemStyle={{ color: '#047857', fontWeight: 600 }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#059669" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#emeraldArea)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
};

// Graph 4: Growth Trend - LINE
export const GrowthLineChart = ({ data }: ChartProps) => {
    return (
      <div className="flex flex-col h-full p-2">
        <div className="mb-2 px-4 pt-4">
            <h3 className="text-lg font-bold text-gray-900 border-l-4 border-lime-500 pl-3">Ecosystem Growth</h3>
            <p className="text-sm text-gray-400 pl-4">Cumulative Registrations</p>
        </div>
        <div className="flex-1 w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#84cc16" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#84cc16" stopOpacity={0}/>
                </linearGradient>
                </defs>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <Tooltip 
                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                />
                <Area type="monotone" dataKey="value" stroke="#84cc16" strokeWidth={3} fillOpacity={1} fill="url(#colorGrowth)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
};

// Graph 5: Value Chain Distribution - BAR
export const ValueChainChart = ({ data }: ChartProps) => {
    const top5 = data.slice(0, 5);
    return (
      <div className="flex flex-col h-full p-2">
        <div className="mb-2 px-4 pt-4">
            <h3 className="text-lg font-bold text-gray-900 border-l-4 border-lime-600 pl-3">Top Value Chains</h3>
            <p className="text-sm text-gray-400 pl-4">Dominant Agricultural Sectors</p>
        </div>
        <div className="flex-1 w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={top5}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
              barSize={20}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#f3f4f6" />
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 10, fill: '#374151', fontWeight: 600 }} 
                width={80}
                interval={0}
                axisLine={false}
                tickLine={false}
              />
               <Tooltip 
                  cursor={{ fill: '#ecfeff', opacity: 0.6 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                  itemStyle={{ color: '#4d7c0f', fontWeight: 600 }}
              />
              <Bar dataKey="value" fill="#65a30d" radius={[0, 4, 4, 0]} animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };
  
// Graph 6: Ownership Structure - PIE
export const OwnershipChart = ({ data }: ChartProps) => {
    const COLORS = ['#166534', '#bbf7d0', '#f0fdf4']; // Dark Green vs Light Green
    return (
        <div className="flex flex-col h-full p-2">
        <div className="mb-2 px-4 pt-4">
            <h3 className="text-lg font-bold text-gray-900 border-l-4 border-green-800 pl-3">Ownership</h3>
            <p className="text-sm text-gray-400 pl-4">Youth vs Non-Youth</p>
        </div>
        <div className="flex-1 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
                >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                </Pie>
                <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                itemStyle={{ color: '#166534', fontWeight: 600 }}
                />
                <Legend 
                verticalAlign="bottom" 
                align="center"
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', color: '#4b5563' }}
                />
            </PieChart>
            </ResponsiveContainer>
        </div>
        </div>
    );
};


