// src/pages/Farmers.tsx
import { useState, useEffect, useMemo } from 'react';
import { 
  Search, Filter, MapPin, Users, Briefcase, Calendar, 
  Trash2, Edit, Plus, X, ChevronDown, ChevronUp, Eye, FileText
} from 'lucide-react';
import { farmerService } from '../services/api'; 
import { Farmer } from '../types';
import FarmerModal from '../components/FarmerModal';

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
};

const Farmers = () => {
    // --- Data State ---
    const [businesses, setBusinesses] = useState<Farmer[]>([]);
    const [loading, setLoading] = useState(true);
    
    // --- Modal State ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedBusiness, setSelectedBusiness] = useState<Farmer | undefined>(undefined);

    // --- Filter State ---
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterOwnership, setFilterOwnership] = useState<string>('');
    const [filterDistrict, setFilterDistrict] = useState<string>('');
    const [filterBusinessType, setFilterBusinessType] = useState<string>('');
    const [filterSize, setFilterSize] = useState<string>('');
    const [filterEducation, setFilterEducation] = useState<string>('');
    const [filterDisability, setFilterDisability] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

    // --- Load Data ---
    const loadBusinesses = async () => {
        setLoading(true);
        try {
            const data = await farmerService.getAll();
            setBusinesses(data);
        } catch (e) { console.error(e); } 
        finally { setLoading(false); }
    };

    useEffect(() => {
        loadBusinesses();
    }, []);

    // --- Derivations (Unique Values for Dropdowns) ---
    const districts = useMemo(() => Array.from(new Set(businesses.map(b => b.district).filter(Boolean).sort())), [businesses]);
    const businessTypes = useMemo(() => Array.from(new Set(businesses.map(b => b.businessType).filter(Boolean).sort())), [businesses]);

    // --- Filtering Logic ---
    const processedData = useMemo(() => {
        let result = businesses;

        // 1. Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(b => 
                b.businessName?.toLowerCase().includes(q) || 
                b.valueChain?.toLowerCase().includes(q) || 
                b.ownerName?.toLowerCase().includes(q) ||
                b.tin?.includes(q)
            );
        }

        // 2. Filters
        if (filterOwnership) result = result.filter(b => b.ownership === filterOwnership);
        if (filterDistrict) result = result.filter(b => b.district === filterDistrict);
        if (filterBusinessType) result = result.filter(b => b.businessType === filterBusinessType);
        if (filterSize) result = result.filter(b => b.businessSize === filterSize);
        if (filterEducation) result = result.filter(b => b.educationLevel === filterEducation);
        if (filterDisability) result = result.filter(b => b.disabilityStatus === filterDisability);

        // 3. Sort
        result.sort((a, b) => {
            const dateA = a.commencementDate ? new Date(a.commencementDate).getTime() : 0;
            const dateB = b.commencementDate ? new Date(b.commencementDate).getTime() : 0;
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

        return result;
    }, [businesses, searchQuery, filterOwnership, filterDistrict, filterBusinessType, filterSize, filterEducation, filterDisability, sortOrder]);

    // --- Handlers ---
    const handleAdd = () => {
        setSelectedBusiness(undefined);
        setModalMode('add');
        setIsModalOpen(true);
    };

    const handleEdit = (e: React.MouseEvent, business: Farmer) => {
        e.stopPropagation(); // Prevent row click
        setSelectedBusiness(business);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleRowClick = (business: Farmer) => {
        setSelectedBusiness(business);
        setModalMode('edit'); // Or maybe a 'view' mode, but 'edit' shows full info form which is what user wants "see how form looks"
        setIsModalOpen(true);
    }

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if(confirm('Are you sure you want to delete this business?')) {
            await farmerService.delete(id);
            setBusinesses(prev => prev.filter(b => b.id !== id));
        }
    };

    const handleSave = async (farmerData: Omit<Farmer, 'id'> | Farmer) => {
        if (modalMode === 'add') {
            const newFarmer = await farmerService.create(farmerData as Omit<Farmer, 'id'>);
            setBusinesses(prev => [newFarmer, ...prev]);
        } else {
            const updated = await farmerService.update((farmerData as Farmer).id, farmerData);
            setBusinesses(prev => prev.map(b => b.id === updated.id ? updated : b));
        }
        setIsModalOpen(false);
    };

    // --- Render ---
    if (loading) return <div className="flex items-center justify-center h-full text-green-700">Loading Directory...</div>;

    return (
        <div className="flex flex-col h-full bg-transparent max-w-full overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div>
                   <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                       <Briefcase className="text-green-600" /> Business Registry
                   </h1>
                   <p className="text-gray-500 text-sm mt-1">Manage and track {businesses.length} agricultural enterprises</p>
                </div>
                
                <div className="flex flex-wrap gap-3 w-full lg:w-auto items-center">
                   <div className="relative flex-1 lg:w-80 min-w-[240px]">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input 
                        type="text" 
                        placeholder="Search name, TIN, value chain..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                      />
                   </div>

                    <div className="h-8 w-px bg-gray-200 hidden lg:block mx-1"></div>

                    <button 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`px-4 py-2.5 border rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${isFilterOpen ? 'bg-green-50 border-green-200 text-green-700 shadow-inner' : 'bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm'}`}
                    >
                        <Filter size={16} /> Filters
                    </button>

                    <button onClick={handleAdd} className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-green-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                        <Plus size={18} /> Add Business
                    </button>
                </div>
            </div>

            <div className="flex flex-1 gap-6 overflow-hidden">
                {/* Sidebar Filters */}
                {isFilterOpen && (
                    <aside className="w-64 flex-shrink-0 bg-white border border-gray-200 rounded-xl overflow-y-auto p-4 space-y-6 animate-in slide-in-from-left duration-200 shadow-sm">
                       <div className="flex justify-between items-center">
                          <h3 className="font-bold text-gray-900">Refine List</h3>
                          <button onClick={() => setIsFilterOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={16}/></button>
                       </div>

                       <div className="space-y-4">
                           {/* Filter Item Helper */}
                           {[
                               { label: 'Ownership', value: filterOwnership, set: setFilterOwnership, options: ['Youth-owned', 'Non youth-owned'] },
                               { label: 'Location / District', value: filterDistrict, set: setFilterDistrict, options: districts },
                               { label: 'Business Type', value: filterBusinessType, set: setFilterBusinessType, options: businessTypes },
                               { label: 'Size', value: filterSize, set: setFilterSize, options: ['Micro', 'Small', 'Medium', 'Large'] },
                               { label: 'Education Level', value: filterEducation, set: setFilterEducation, options: ['None', 'Primary', 'Secondary', 'University', 'Vocational'] },
                               { label: 'Disability', value: filterDisability, set: setFilterDisability, options: ['None', 'Physical', 'Mental', 'Visual', 'Hearing', 'Other'] },
                           ].map((f, i) => (
                               <div key={i}>
                                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">{f.label}</label>
                                  <select className="w-full text-sm border-gray-200 rounded-md focus:ring-green-500 focus:border-green-500" value={f.value} onChange={e => f.set(e.target.value)}>
                                      <option value="">All</option>
                                      {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                                  </select>
                               </div>
                           ))}
                       </div>
                       
                       <div className="pt-2 border-t">
                          <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Sort Order</label>
                          <div className="flex rounded-md shadow-sm">
                             <button onClick={() => setSortOrder('desc')} className={`flex-1 px-3 py-1.5 text-xs font-medium border border-r-0 rounded-l-md transition-colors ${sortOrder === 'desc' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Newest</button>
                             <button onClick={() => setSortOrder('asc')} className={`flex-1 px-3 py-1.5 text-xs font-medium border rounded-r-md transition-colors ${sortOrder === 'asc' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Oldest</button>
                          </div>
                       </div>
                       
                       <button 
                         onClick={() => {
                             setFilterOwnership(''); setFilterDistrict(''); setFilterBusinessType(''); 
                             setFilterSize(''); setFilterEducation(''); setFilterDisability('');
                         }}
                         className="w-full py-2 text-red-600 text-xs font-medium hover:bg-red-50 rounded bg-transparent border border-transparent hover:border-red-100 transition-colors"
                       >Clear All Filters</button>
                    </aside>
                )}

                {/* Table */}
                <div className="flex-1 overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col relative settings-scroll">
                   <div className="overflow-y-auto flex-1">
                      <table className="w-full text-left border-collapse">
                         <thead className="bg-gray-50/80 backdrop-blur sticky top-0 z-20 text-xs uppercase text-gray-500 font-bold tracking-wider border-b border-gray-200">
                             <tr>
                                 <th className="px-6 py-4">Business Identity</th>
                                 <th className="px-6 py-4">Type & Ownership</th>
                                 <th className="px-6 py-4">Location</th>
                                 <th className="px-6 py-4">Financials</th>
                                 <th className="px-6 py-4">Started</th>
                                 <th className="px-6 py-4 text-right">Actions</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100 text-sm">
                             {processedData.map(business => (
                                 <tr 
                                     key={business.id} 
                                     onClick={() => handleRowClick(business)}
                                     className="hover:bg-green-50/40 cursor-pointer group transition-all duration-200"
                                 >
                                     <td className="px-6 py-4">
                                         <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-green-200 text-green-700 flex items-center justify-center font-bold text-sm shrink-0 shadow-inner">
                                                {business.businessName.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 text-base group-hover:text-green-700 transition-colors">{business.businessName}</div>
                                                <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-medium">TIN: {business.tin}</span>
                                                </div>
                                            </div>
                                         </div>
                                     </td>
                                     <td className="px-6 py-4">
                                         <span className="block text-gray-900 font-medium">{business.businessType}</span>
                                         <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full inline-block mt-1.5 ${
                                             business.ownership === 'Youth-owned' 
                                             ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                                             : 'bg-gray-100 text-gray-600 border border-gray-200'
                                         }`}>
                                            {business.ownership}
                                         </span>
                                     </td>
                                     <td className="px-6 py-4">
                                         <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                                            <MapPin size={14} className="text-green-600 shrink-0" /> 
                                            <span className="truncate max-w-[120px]" title={business.district}>{business.district}</span>
                                         </div>
                                         <span className="text-xs text-gray-500 pl-5 block mt-0.5">{business.province} Region</span>
                                     </td>
                                     <td className="px-6 py-4">
                                         <div className="text-gray-900 font-bold">{business.revenue}</div>
                                         <div className="text-xs text-gray-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span> Annual Rev.</div>
                                     </td>
                                     <td className="px-6 py-4 text-gray-600 font-medium">
                                         <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-gray-400" />
                                            {formatDate(business.commencementDate)}
                                         </div>
                                     </td>
                                     <td className="px-6 py-4 text-right">
                                         <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                             <button onClick={(e) => handleEdit(e, business)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shadow-sm border border-transparent hover:border-blue-100" title="Edit Details">
                                                 <Edit size={16} />
                                             </button>
                                             <button onClick={(e) => handleDelete(e, business.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors shadow-sm border border-transparent hover:border-red-100" title="Remove Business">
                                                 <Trash2 size={16} />
                                             </button>
                                         </div>
                                     </td>
                                 </tr>
                             ))}
                             {processedData.length === 0 && (
                                 <tr>
                                     <td colSpan={6} className="text-center py-20 px-6">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <div className="bg-gray-50 p-4 rounded-full mb-4">
                                                <Search size={32} className="text-gray-300" />
                                            </div>
                                            <p className="text-lg font-medium text-gray-900">No businesses found</p>
                                            <p className="text-sm">Try adjusting your filters or search terms</p>
                                        </div>
                                     </td>
                                 </tr>
                             )}
                         </tbody>
                      </table>
                   </div>
                   <div className="bg-white border-t p-3 text-xs flex justify-between items-center text-gray-500">
                       <span>Showing <span className="font-bold text-gray-900">{processedData.length}</span> records</span>
                       <span className="italic">Click row to view full details</span>
                   </div>
                </div>
            </div>

            <FarmerModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSave} 
                initialData={selectedBusiness} 
                mode={modalMode} 
            />
        </div>
    );
}

export default Farmers;
