import { Sprout, AlertCircle } from 'lucide-react';

const crops = [
  { id: 1, name: 'Maize', variety: 'Hybrid 614', season: 'Sep - Jan', marketPrice: '450 RWF/kg', trend: '+5%', color: 'bg-yellow-100 text-yellow-700' },
  { id: 2, name: 'Beans', variety: 'RWR 2245', season: 'Sep - Dec', marketPrice: '800 RWF/kg', trend: '-2%', color: 'bg-red-100 text-red-700' },
  { id: 3, name: 'Coffee', variety: 'Arabica', season: 'Feb - May', marketPrice: '3200 RWF/kg', trend: '+12%', color: 'bg-amber-100 text-amber-900' },
  { id: 4, name: 'Irish Potatoes', variety: 'Kinigi', season: 'Year round', marketPrice: '350 RWF/kg', trend: 'Stable', color: 'bg-orange-100 text-orange-800' },
  { id: 5, name: 'Cassava', variety: 'Nase 14', season: 'Year round', marketPrice: '200 RWF/kg', trend: '+2%', color: 'bg-green-100 text-green-800' },
  { id: 6, name: 'Rice', variety: 'Kigori', season: 'Jun - Nov', marketPrice: '900 RWF/kg', trend: '-1%', color: 'bg-cyan-100 text-cyan-800' },
];

const Crops = () => {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Crop Directory</h1>
          <p className="text-gray-500 mt-1">Monitor crop varieties, seasonal data and market prices</p>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
          Add New Crop
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {crops.map((crop) => (
          <div key={crop.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg ${crop.color}`}>
                <Sprout size={24} />
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                 crop.trend.includes('+') ? 'bg-green-50 text-green-700' : 
                 crop.trend.includes('-') ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {crop.trend}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900">{crop.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{crop.variety}</p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Season:</span>
                <span className="font-medium text-gray-900">{crop.season}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Market Price:</span>
                <span className="font-medium text-gray-900">{crop.marketPrice}</span>
              </div>
            </div>

            <button className="w-full mt-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-primary-600 transition-colors">
              View Details
            </button>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start">
        <AlertCircle className="text-blue-600 mt-0.5 mr-3 flex-shrink-0" size={20} />
        <div>
          <h4 className="font-semibold text-blue-900">Crop Health Warning</h4>
          <p className="text-sm text-blue-700 mt-1">Reports of Fall Armyworm affecting Maize crops in Eastern Province. Please advise farmers to check for symptoms.</p>
        </div>
      </div>
    </div>
  );
};

export default Crops;
