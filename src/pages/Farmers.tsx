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
        <div className="flex flex-col h-full bg-gray-50/50">
            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <div>
                   <h1 className="text-2xl font-bold text-gray-900">Business Registry</h1>
                   <p className="text-gray-500 text-sm">Manage {businesses.length} agricultural enterprises</p>
                </div>
                
                <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                   <div className="relative flex-1 min-w-[240px]">
                      <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" />
                      <input 
                        type="text" 
                        placeholder="Search name, TIN, value chain..." 
                        className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                      />
                   </div>

                    <button 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`px-3 py-2 border rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${isFilterOpen ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                        <Filter size={16} /> Filters
                    </button>

                    <button onClick={handleAdd} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-green-700 shadow-sm transition-colors">
                        <Plus size={16} /> Add Business
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
                <div className="flex-1 overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col">
                   <div className="overflow-y-auto flex-1">
                      <table className="w-full text-left">
                         <thead className="bg-gray-50 sticky top-0 z-10 text-xs uppercase text-gray-500 font-semibold shadow-sm">
                             <tr>
                                 <th className="px-4 py-3 pl-6">Business Identity</th>
                                 <th className="px-4 py-3">Type & Ownership</th>
                                 <th className="px-4 py-3">Location</th>
                                 <th className="px-4 py-3">Financials</th>
                                 <th className="px-4 py-3">Started</th>
                                 <th className="px-4 py-3 text-right pr-6">Actions</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100 text-sm">
                             {processedData.map(business => (
                                 <tr 
                                     key={business.id} 
                                     onClick={() => handleRowClick(business)} // Click row to view
                                     className="hover:bg-green-50/50 cursor-pointer group transition-colors"
                                 >
                                     <td className="px-4 py-3 pl-6">
                                         <div className="font-medium text-gray-900 group-hover:text-green-700 transition-colors">{business.businessName}</div>
                                         <div className="text-xs text-gray-500 mt-0.5">{business.valueChain?.substring(0, 35)}...</div>
                                     </td>
                                     <td className="px-4 py-3">
                                         <span className="block text-gray-900">{business.businessType}</span>
                                         <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ml-[-2px] inline-block mt-1 ${business.ownership === 'Youth-owned' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {business.ownership}
                                         </span>
                                     </td>
                                     <td className="px-4 py-3">
                                         <div className="flex items-center gap-1 text-gray-600">
                                            <MapPin size={12} className="text-gray-400" /> {business.district} 
                                         </div>
                                         <span className="text-xs text-gray-400 pl-4">{business.province}</span>
                                     </td>
                                     <td className="px-4 py-3">
                                         <div className="text-gray-900 font-medium">{business.revenue}</div>
                                         <div className="text-xs text-gray-500">Rev.</div>
                                     </td>
                                     <td className="px-4 py-3 text-gray-500">
                                         {formatDate(business.commencementDate)}
                                     </td>
                                     <td className="px-4 py-3 text-right pr-6">
                                         <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                             <button onClick={(e) => handleEdit(e, business)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                                                 <Edit size={16} />
                                             </button>
                                             <button onClick={(e) => handleDelete(e, business.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Delete">
                                                 <Trash2 size={16} />
                                             </button>
                                         </div>
                                     </td>
                                 </tr>
                             ))}
                             {processedData.length === 0 && (
                                 <tr><td colSpan={6} className="text-center py-12 text-gray-400">No businesses found. Try adjusting filters.</td></tr>
                             )}
                         </tbody>
                      </table>
                   </div>
                   <div className="bg-gray-50 border-t p-2 text-xs text-center text-gray-400">
                       Showing {processedData.length} records
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
