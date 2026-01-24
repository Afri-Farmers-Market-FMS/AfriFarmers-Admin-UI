// src/pages/Farmers.tsx
import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Filter, MapPin, Briefcase, Calendar, 
  Trash2, Edit, Plus, X, Download, List, Grid, FileSpreadsheet, ChevronLeft, ChevronRight,
  Eye, EyeOff 
} from 'lucide-react';
import { farmerService } from '../services/api'; 
import { Farmer } from '../types';
import FarmerModal from '../components/FarmerModal';
import { useAuth } from '../context/AuthContext';

// @ts-ignore
import html2pdf from 'html2pdf.js';

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
};

// Highlight matching text in search results
const highlightText = (text: string | undefined, query: string): React.ReactNode => {
  if (!text || !query.trim()) return text || '-';
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, i) => 
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">{part}</mark>
    ) : part
  );
};

const Farmers = () => {
    // --- Auth ---
    const { user } = useAuth();
    const canEdit = user?.role === 'Super Admin' || user?.role === 'Admin';
    const isViewer = user?.role === 'Viewer';
    
    // --- Data State ---
    const [businesses, setBusinesses] = useState<Farmer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // --- Refs ---
    const tableContainerRef = useRef<HTMLDivElement>(null);

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
    const [sortField, setSortField] = useState<'date' | 'name' | 'revenue' | 'district' | 'employees'>('date');
    const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [visibleNids, setVisibleNids] = useState<Record<string, boolean>>({});

    const toggleNid = (ev: React.MouseEvent, id: string) => {
        ev.stopPropagation();
        setVisibleNids(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // --- Load Data ---
    const loadBusinesses = async () => {
        console.log('🔄 loadBusinesses called');
        setLoading(true);
        setError(null);
        try {
            const data = await farmerService.getAll();
            console.log('📋 Loaded', data?.length, 'businesses');
            setBusinesses(data || []);
        } catch (e: any) { 
            console.error('❌ loadBusinesses error:', e);
            setError(e.message || 'Failed to load businesses');
        } 
        finally { setLoading(false); }
    };

    // Reload data when user changes (login/logout)
    useEffect(() => {
        console.log('👤 User changed, reloading data. User:', user?.email);
        loadBusinesses();
    }, [user]);

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
                b.ownerName?.toLowerCase().includes(q) ||
                b.tin?.includes(q) ||
                b.phone?.includes(q) ||
                b.crops?.some(crop => crop.name?.toLowerCase().includes(q))
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
            let valA: any = 0;
            let valB: any = 0;

            switch(sortField) {
                case 'name':
                    valA = a.businessName?.toLowerCase() || '';
                    valB = b.businessName?.toLowerCase() || '';
                    break;
                case 'district':
                    valA = a.district?.toLowerCase() || '';
                    valB = b.district?.toLowerCase() || '';
                    break;
                case 'employees':
                    valA = a.employees || 0;
                    valB = b.employees || 0;
                    break;
                case 'revenue':
                     const rank = (s: string) => {
                         if(!s) return 0;
                         if(s.startsWith('<')) return 1;
                         if(s.startsWith('840k')) return 2;
                         if(s.startsWith('1.2M')) return 3;
                         if(s.startsWith('2.4M')) return 4;
                         if(s.startsWith('>')) return 5;
                         return 0;
                     };
                     valA = rank(a.revenue);
                     valB = rank(b.revenue);
                     break;
                default: // date
                    valA = a.commencementDate ? new Date(a.commencementDate).getTime() : 0;
                    valB = b.commencementDate ? new Date(b.commencementDate).getTime() : 0;
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [businesses, searchQuery, filterOwnership, filterDistrict, filterBusinessType, filterSize, filterEducation, filterDisability, sortOrder, sortField]);

    // Pagination
    const paginatedData = useMemo(() => {
        if (itemsPerPage === -1) return processedData;
        const startIndex = (currentPage - 1) * itemsPerPage;
        return processedData.slice(startIndex, startIndex + itemsPerPage);
    }, [processedData, currentPage, itemsPerPage]);

    const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(processedData.length / itemsPerPage);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [processedData.length, itemsPerPage]);

    // Scroll to top of table when page changes
    useEffect(() => {
        if (tableContainerRef.current) {
            tableContainerRef.current.scrollTop = 0;
        }
    }, [currentPage]);

    // --- Handlers ---
    const handleAdd = () => {
        setSelectedBusiness(undefined);
        setModalMode('add');
        setIsModalOpen(true);
    };

    const handleEdit = (e: React.MouseEvent, business: Farmer) => {
        e.stopPropagation(); // Prevent row click
        console.log('✏️ Edit clicked for business:', business);
        console.log('🆔 Business ID:', business.id);
        setSelectedBusiness(business);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleView = (e: React.MouseEvent, business: Farmer) => {
        e.stopPropagation(); // Prevent row click
        console.log('👁️ View clicked for business:', business);
        setSelectedBusiness(business);
        setModalMode('edit'); // Still use edit mode but readOnly prop makes it view-only
        setIsModalOpen(true);
    };

    const handleRowClick = (business: Farmer) => {
        console.log('👆 Row clicked for business:', business);
        console.log('🆔 Business ID:', business.id);
        setSelectedBusiness(business);
        setModalMode('edit'); // Or maybe a 'view' mode, but 'edit' shows full info form which is what user wants "see how form looks"
        setIsModalOpen(true);
    }

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (!canEdit) {
            alert('You do not have permission to delete businesses. Admin or Super Admin role required.');
            return;
        }
        if(confirm('Are you sure you want to delete this business?')) {
            try {
                setError(null);
                await farmerService.delete(id);
                setBusinesses(prev => prev.filter(b => b.id !== id));
            } catch (err: any) {
                setError(err.message || 'Failed to delete business');
                alert(`Failed to delete: ${err.message || 'Unknown error'}`);
            }
        }
    };

    const handleSave = async (farmerData: Omit<Farmer, 'id'> | Farmer) => {
        console.log('💾 Farmers.handleSave called');
        console.log('📋 farmerData:', farmerData);
        console.log('🔧 modalMode:', modalMode);
        
        if (!canEdit) {
            throw new Error('You do not have permission to modify businesses. Admin or Super Admin role required.');
        }
        try {
            setError(null);
            if (modalMode === 'add') {
                console.log('➕ Creating new farmer...');
                const newFarmer = await farmerService.create(farmerData as Omit<Farmer, 'id'>);
                console.log('✅ Created:', newFarmer);
                setBusinesses(prev => [newFarmer, ...prev]);
            } else {
                const farmerId = (farmerData as Farmer).id;
                console.log('🔄 Updating farmer with ID:', farmerId);
                if (!farmerId) {
                    throw new Error('Farmer ID is missing - cannot update');
                }
                const updated = await farmerService.update(farmerId, farmerData);
                console.log('✅ Updated farmer:', updated);
                console.log('   Updated ID:', updated.id);
                console.log('   Updated Name:', updated.businessName);
                
                // Update the local state with the response from the server
                setBusinesses(prev => {
                    const newList = prev.map(b => b.id === updated.id ? updated : b);
                    console.log('📋 Updated businesses list, farmer at index:', newList.findIndex(b => b.id === updated.id));
                    return newList;
                });
                
                // Also refresh the entire list to ensure we have the latest data
                console.log('🔄 Refreshing all data from server...');
                await loadBusinesses();
            }
            setIsModalOpen(false);
        } catch (err: any) {
            console.error('❌ handleSave error:', err);
            setError(err.message || 'Failed to save business');
            throw err; // Re-throw so FarmerModal can show the error
        }
    };

    const handleExportCSV = () => {
        const revealNid = window.confirm("Security Alert: Do you want to unmask National IDs in the export file?\n\nOK = Unmask (Visible)\nCancel = Keep Masked (***********)");
        let headers: string[] = [];
        let rows: any[] = [];
        const dateStr = new Date().toISOString().split('T')[0];

        if (viewMode === 'detailed') {
            headers = [
                "ID,Business Name,Status,TIN,Owner Name,Phone,NID,Gender,Age,Nationality,Education,Disability,Business Type,Participant Type,Ownership,Province,District,Sector,Cell,Village,Business Size,Revenue,Annual Income,Total Employees,Female Employees,Youth Employees,Permanent Employees,Value Chain,Description,Support Received,Date Joined"
            ];
            rows = processedData.map(b => [
                b.id,
                `"${b.businessName?.replace(/"/g, '""') || ''}"`,
                `"${b.status || 'Active'}"`,
                `"${b.tin || ''}"`,
                `"${b.ownerName?.replace(/"/g, '""') || ''}"`,
                `"${b.phone || ''}"`,
                `"${revealNid ? (b.nid || '') : '*************'}"`,
                `"${b.gender || ''}"`,
                `"${b.ownerAge || ''}"`,
                `"${b.nationality || 'Rwandan'}"`,
                `"${b.educationLevel || ''}"`,
                `"${b.disabilityStatus || ''}"`,
                `"${b.businessType || ''}"`,
                `"${b.participantType || ''}"`,
                `"${b.ownership || ''}"`,
                `"${b.province || ''}"`,
                `"${b.district || ''}"`,
                `"${b.sector || ''}"`,
                `"${b.cell || ''}"`,
                `"${b.village || ''}"`,
                `"${b.businessSize || ''}"`,
                `"${b.revenue || ''}"`,
                `"${b.annualIncome || ''}"`,
                b.employees || 0,
                b.femaleEmployees || 0,
                b.youthEmployees || 0,
                b.permanentEmployees ? 'Yes' : 'No',
                `"${b.valueChain || ''}"`,
                `"${b.companyDescription?.replace(/"/g, '""') || ''}"`,
                `"${b.supportReceived || ''}"`,
                `"${b.commencementDate || ''}"`
            ]);
        } else {
            headers = ["ID,Business Name,TIN,Type,Ownership,District,Province,Revenue,Employees,Date Joined"];
            rows = processedData.map(b => [
                b.id,
                `"${b.businessName?.replace(/"/g, '""') || ''}"`,
                `"${b.tin || ''}"`,
                `"${b.businessType || ''}"`,
                `"${b.ownership || ''}"`,
                `"${b.district || ''}"`,
                `"${b.province || ''}"`,
                `"${b.revenue || ''}"`,
                b.employees || 0,
                `"${b.commencementDate || ''}"`
            ]);
        }
        
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows.map(r => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `afm_businesses_${viewMode}_${dateStr}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadProfile = (e: React.MouseEvent, business: Farmer) => {
        e.stopPropagation();
        const revealNid = window.confirm("Security Alert: Include full National ID in PDF?\n\nOK = Visible\nCancel = Masked");
        
        // Create a temporary hidden container
        const element = document.createElement('div');
        element.innerHTML = `
            <div style="padding: 40px; font-family: sans-serif; color: #1a202c;">
                <div style="border-bottom: 2px solid #047857; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h1 style="font-size: 24px; font-weight: bold; color: #064e3b; margin: 0;">Business Profile</h1>
                        <p style="color: #64748b; margin: 5px 0 0 0;">Generated from AFM Registry</p>
                    </div>
                    <div style="text-align: right;">
                        <h2 style="font-size: 18px; font-weight: bold; margin: 0;">${business.businessName}</h2>
                        <div style="margin-top: 5px;">
                            <span style="background: ${business.status === 'Active' ? '#dcfce7' : '#f1f5f9'}; color: ${business.status === 'Active' ? '#166534' : '#475569'}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
                                ${business.status || 'Active'}
                            </span>
                        </div>
                        <p style="color: #64748b; margin: 5px 0 0 0; font-size: 12px;">TIN: ${business.tin}</p>
                    </div>
                </div>

                <div style="margin-bottom: 30px;">
                    <h3 style="background: #f0fdf4; color: #065f46; padding: 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; margin-bottom: 15px;">Identity & Demographics</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="padding: 8px 0; color: #64748b; width: 40%;">Owner Name:</td><td style="font-weight: 500;">${business.ownerName}</td></tr>
                        <tr><td style="padding: 8px 0; color: #64748b;">NID:</td><td style="font-weight: 500;">${revealNid ? (business.nid || 'N/A') : '*************'}</td></tr>
                        <tr><td style="padding: 8px 0; color: #64748b;">Phone:</td><td style="font-weight: 500;">${business.phone}</td></tr>
                        <tr><td style="padding: 8px 0; color: #64748b;">Gender/Age:</td><td style="font-weight: 500;">${business.gender || '-'} / ${business.ownerAge || '-'}</td></tr>
                        <tr><td style="padding: 8px 0; color: #64748b;">Education:</td><td style="font-weight: 500;">${business.educationLevel || '-'}</td></tr>
                        <tr><td style="padding: 8px 0; color: #64748b;">Business Type:</td><td style="font-weight: 500;">${business.businessType}</td></tr>
                        <tr><td style="padding: 8px 0; color: #64748b;">Participant Type:</td><td style="font-weight: 500;">${business.participantType || '-'}</td></tr>
                        <tr><td style="padding: 8px 0; color: #64748b;">Ownership:</td><td style="font-weight: 500;">${business.ownership}</td></tr>
                        <tr><td style="padding: 8px 0; color: #64748b;">Registration Date:</td><td style="font-weight: 500;">${formatDate(business.commencementDate)}</td></tr>
                    </table>
                </div>

                <div style="margin-bottom: 30px;">
                    <h3 style="background: #f0fdf4; color: #065f46; padding: 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; margin-bottom: 15px;">Location</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="padding: 8px 0; color: #64748b; width: 40%;">Province:</td><td style="font-weight: 500;">${business.province}</td></tr>
                        <tr><td style="padding: 8px 0; color: #64748b;">District:</td><td style="font-weight: 500;">${business.district}</td></tr>
                        <tr><td style="padding: 8px 0; color: #64748b;">Sector:</td><td style="font-weight: 500;">${business.sector}</td></tr>
                        <tr><td style="padding: 8px 0; color: #64748b;">Cell:</td><td style="font-weight: 500;">${business.cell}</td></tr>
                        <tr><td style="padding: 8px 0; color: #64748b;">Village:</td><td style="font-weight: 500;">${business.village}</td></tr>
                    </table>
                </div>

                <div style="margin-bottom: 30px;">
                     <h3 style="background: #f0fdf4; color: #065f46; padding: 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; margin-bottom: 15px;">Operations & Finance</h3>
                     <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="padding: 8px 0; color: #64748b; width: 40%;">Description:</td><td style="font-weight: 500;">${business.companyDescription || 'N/A'}</td></tr>
                        <tr><td style="padding: 8px 0; color: #64748b; width: 40%;">Value Chain:</td><td style="font-weight: 500;">${business.valueChain}</td></tr>
                        <tr><td style="padding: 8px 0; color: #64748b;">Business Size:</td><td style="font-weight: 500;">${business.businessSize}</td></tr>
                        <tr><td style="padding: 8px 0; color: #64748b;">Annual Revenue:</td><td style="font-weight: 500;">${business.revenue}</td></tr>
                        <tr><td style="padding: 8px 0; color: #64748b;">Net Income:</td><td style="font-weight: 500;">${business.annualIncome || '-'}</td></tr>
                        <tr><td style="padding: 8px 0; color: #64748b;">Employees:</td><td style="font-weight: 500;">Total: ${business.employees} (Female: ${business.femaleEmployees || 0}, Youth: ${business.youthEmployees || 0})</td></tr>
                        <tr><td style="padding: 8px 0; color: #64748b;">Permanent Staff:</td><td style="font-weight: 500;">${business.permanentEmployees ? 'Yes' : 'No'}</td></tr>
                        <tr><td style="padding: 8px 0; color: #64748b;">Support:</td><td style="font-weight: 500;">${business.supportReceived || 'None'}</td></tr>
                     </table>
                </div>
                
                <div style="margin-top: 50px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                    © 2026 AFM Admin System. Confidential Document.
                </div>
            </div>
        `;

        const opt = {
            margin: 10,
            filename: `${business.businessName.replace(/ /g, '_')}_profile.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
        };

        html2pdf().set(opt).from(element).save();
    };

    // --- Render ---
    if (loading) return <div className="flex items-center justify-center h-full text-green-700">Loading Directory...</div>;

    return (
        <div className="flex flex-col h-full bg-transparent max-w-full overflow-hidden">
            {/* Error Banner */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-700">
                        <X size={18} />
                        <span>{error}</span>
                    </div>
                    <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                        <X size={18} />
                    </button>
                </div>
            )}
            
            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div>
                   <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                       <Briefcase className="text-green-600" /> Business Directory
                   </h1>
                   <p className="text-gray-500 text-sm mt-1">Manage {businesses.length} enterprises {!canEdit && <span className="text-amber-600">(Read-only mode)</span>}</p>
                </div>
                
                <div className="flex flex-wrap gap-3 w-full lg:w-auto items-center">
                   <div className="relative flex-1 lg:w-64 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input 
                        type="text" 
                        placeholder="Search..." 
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                      />
                   </div>

                    <div className="h-8 w-px bg-gray-200 hidden lg:block mx-1"></div>

                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button 
                            onClick={() => setViewMode('summary')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'summary' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Summary View"
                        >
                            <List size={18} />
                        </button>
                        <button 
                            onClick={() => setViewMode('detailed')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'detailed' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Detailed Table View"
                        >
                            <Grid size={18} />
                        </button>
                    </div>

                    <button 
                        onClick={handleExportCSV}
                        className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border border-transparent ${isViewer ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:border-gray-300'}`}
                        title={isViewer ? "Export disabled for viewers" : "Export displayed list to CSV"}
                        disabled={isViewer}
                    >
                        <FileSpreadsheet size={18} /> <span className="hidden sm:inline">Export</span>
                    </button>

                    <button 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`px-3 py-2 border rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${isFilterOpen ? 'bg-green-50, border-green-200 text-green-700' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                        <Filter size={18} /> <span className="hidden sm:inline">Filter</span>
                    </button>

                    {canEdit && (
                        <button onClick={handleAdd} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-green-700 shadow-sm hover:shadow-md transition-all">
                            <Plus size={18} /> <span className="hidden sm:inline">Add New</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-1 relative gap-4 items-start">
                {/* Sidebar Filters - Modern Panel Design */}
                {isFilterOpen && (
                    <aside className="w-72 flex-shrink-0 bg-green-900 rounded-r-2xl shadow-2xl overflow-hidden animate-in slide-in-from-left duration-300 text-white flex flex-col z-20 h-[calc(100vh-140px)] border-r border-green-800/50">
                          <div className="bg-green-950/30 backdrop-blur-sm z-10 p-5 border-b border-green-800/50 flex justify-between items-center shadow-sm">
                                <h3 className="font-bold text-white flex items-center gap-2 text-lg"><Filter size={20}/> Refine Results</h3>
                                <button onClick={() => setIsFilterOpen(false)} className="text-green-300 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"><X size={24}/></button>
                            </div>

                            <div className="space-y-6 p-6 flex-1 overflow-y-auto sidebar-scrollbar">
                                {/* Filter Item Helper */}
                                {[
                                   { label: 'Ownership Type', value: filterOwnership, set: setFilterOwnership, options: ['Youth-owned', 'Non youth-owned'] },
                                   { label: 'District / Region', value: filterDistrict, set: setFilterDistrict, options: districts },
                                   { label: 'Business Type', value: filterBusinessType, set: setFilterBusinessType, options: businessTypes },
                                   { label: 'Business Size', value: filterSize, set: setFilterSize, options: ['Micro', 'Small', 'Medium', 'Large'] },
                                   { label: 'Owner Education', value: filterEducation, set: setFilterEducation, options: ['None', 'Primary', 'Secondary', 'University', 'Vocational'] },
                                   { label: 'Disability Status', value: filterDisability, set: setFilterDisability, options: ['None', 'Physical', 'Mental', 'Visual', 'Hearing', 'Other'] },
                                ].map((f, i) => (
                                   <div key={i}>
                                      <label className="text-xs font-bold text-green-300 uppercase block mb-2 tracking-wide flex items-center gap-2">
                                          <div className="w-1 h-3 bg-green-500 rounded-full"></div> {f.label}
                                      </label>
                                      <select 
                                        className="w-full text-sm bg-green-800/50 border border-green-700/50 text-white rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent placeholder-green-400 py-2.5 px-3 hover:bg-green-800 transition-colors" 
                                        value={f.value} 
                                        onChange={e => f.set(e.target.value)}
                                      >
                                          <option value="" className="bg-green-900">All Categories</option>
                                          {f.options.map(o => <option key={o} value={o} className="bg-green-900">{o}</option>)}
                                      </select>
                                   </div>
                                ))}
                                
                                <div className="pt-6 border-t border-green-800">
                                  <label className="text-xs font-bold text-green-300 uppercase block mb-3 flex items-center gap-2">
                                      <div className="w-1 h-3 bg-green-500 rounded-full"></div> Sort By
                                  </label>
                                  <div className="grid grid-cols-2 gap-2 mb-3">
                                     <button onClick={() => setSortField('date')} className={`px-3 py-2.5 text-xs font-medium rounded-lg transition-all border ${sortField === 'date' ? 'bg-white text-green-900 border-white shadow-md transform scale-105' : 'bg-transparent text-green-200 border-green-700 hover:border-green-500 hover:bg-green-800'}`}>Date Joined</button>
                                     <button onClick={() => setSortField('name')} className={`px-3 py-2.5 text-xs font-medium rounded-lg transition-all border ${sortField === 'name' ? 'bg-white text-green-900 border-white shadow-md transform scale-105' : 'bg-transparent text-green-200 border-green-700 hover:border-green-500 hover:bg-green-800'}`}>Name (A-Z)</button>
                                     <button onClick={() => setSortField('revenue')} className={`px-3 py-2.5 text-xs font-medium rounded-lg transition-all border ${sortField === 'revenue' ? 'bg-white text-green-900 border-white shadow-md transform scale-105' : 'bg-transparent text-green-200 border-green-700 hover:border-green-500 hover:bg-green-800'}`}>Revenue</button>
                                     <button onClick={() => setSortField('district')} className={`px-3 py-2.5 text-xs font-medium rounded-lg transition-all border ${sortField === 'district' ? 'bg-white text-green-900 border-white shadow-md transform scale-105' : 'bg-transparent text-green-200 border-green-700 hover:border-green-500 hover:bg-green-800'}`}>Location</button>
                                  </div>
                                  
                                  <div className="flex bg-green-800 p-1 rounded-lg">
                                     <button onClick={() => setSortOrder('asc')} className={`flex-1 py-2 text-xs font-bold rounded transition-all ${sortOrder === 'asc' ? 'bg-green-600 text-white shadow-sm' : 'text-green-300 hover:text-white'}`}>Ascending (A-Z)</button>
                                     <button onClick={() => setSortOrder('desc')} className={`flex-1 py-2 text-xs font-bold rounded transition-all ${sortOrder === 'desc' ? 'bg-green-600 text-white shadow-sm' : 'text-green-300 hover:text-white'}`}>Descending (Z-A)</button>
                                  </div>
                                </div>
                            </div>
                           
                            <div className="p-5 border-t border-green-800/50 bg-green-950/30 backdrop-blur-sm z-10">
                                <button 
                                 onClick={() => {
                                     setFilterOwnership(''); setFilterDistrict(''); setFilterBusinessType(''); 
                                     setFilterSize(''); setFilterEducation(''); setFilterDisability('');
                                     setSortField('date'); setSortOrder('desc');
                                 }}
                                 className="w-full py-3 text-white/90 text-sm font-bold hover:bg-white/10 rounded-xl border border-white/20 hover:border-white/50 transition-all uppercase tracking-wider shadow-sm hover:shadow active:scale-95"
                                >Clear All Filters</button>
                            </div>
                        </aside>
                )}

                {/* Table */}
                <div className="flex-1 overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col relative settings-scroll transition-all duration-300">
                   <div 
                     ref={tableContainerRef}
                     className="overflow-auto w-full max-h-[350px] lg:max-h-[450px]"
                   >
                      <table className="w-full text-left border-collapse min-w-max">
                         <thead className="bg-gray-50/80 backdrop-blur sticky top-0 z-20 text-xs uppercase text-gray-500 font-bold tracking-wider border-b border-gray-200">
                             <tr>
                                 {viewMode === 'detailed' ? (
                                    <>
                                        <th className="px-2 py-2 min-w-[50px] whitespace-nowrap">ID</th>
                                        <th className="px-2 py-2 min-w-[150px] whitespace-nowrap">Business Name</th>
                                        <th className="px-2 py-2 min-w-[80px] whitespace-nowrap">Status</th>
                                        <th className="px-2 py-2 min-w-[100px] whitespace-nowrap">TIN</th>
                                        <th className="px-2 py-2 min-w-[120px] whitespace-nowrap">Owner</th>
                                        <th className="px-2 py-2 min-w-[100px] whitespace-nowrap">Phone</th>
                                        <th className="px-2 py-2 min-w-[80px] whitespace-nowrap">NID</th>
                                        <th className="px-2 py-2 min-w-[60px] whitespace-nowrap">Sex</th>
                                        <th className="px-2 py-2 min-w-[40px] whitespace-nowrap">Age</th>
                                        <th className="px-2 py-2 min-w-[80px] whitespace-nowrap">Nationality</th>
                                        <th className="px-2 py-2 min-w-[100px] whitespace-nowrap">Education</th>
                                        <th className="px-2 py-2 min-w-[80px] whitespace-nowrap">Disability</th>
                                        <th className="px-2 py-2 min-w-[120px] whitespace-nowrap">Type</th>
                                        <th className="px-2 py-2 min-w-[120px] whitespace-nowrap">Participant</th>
                                        <th className="px-2 py-2 min-w-[100px] whitespace-nowrap">Ownership</th>
                                        <th className="px-2 py-2 min-w-[80px] whitespace-nowrap">Province</th>
                                        <th className="px-2 py-2 min-w-[80px] whitespace-nowrap">District</th>
                                        <th className="px-2 py-2 min-w-[80px] whitespace-nowrap">Sector</th>
                                        <th className="px-2 py-2 min-w-[80px] whitespace-nowrap">Cell</th>
                                        <th className="px-2 py-2 min-w-[80px] whitespace-nowrap">Village</th>
                                        <th className="px-2 py-2 min-w-[80px] whitespace-nowrap">Size</th>
                                        <th className="px-2 py-2 min-w-[100px] whitespace-nowrap">Revenue</th>
                                        <th className="px-2 py-2 min-w-[100px] whitespace-nowrap">Income</th>
                                        <th className="px-2 py-2 min-w-[50px] whitespace-nowrap">Empl.</th>
                                        <th className="px-2 py-2 min-w-[50px] whitespace-nowrap">F. Emp</th>
                                        <th className="px-2 py-2 min-w-[50px] whitespace-nowrap">Y. Emp</th>
                                        <th className="px-2 py-2 min-w-[80px] whitespace-nowrap">Perm. Emp</th>
                                        <th className="px-2 py-2 min-w-[150px] whitespace-nowrap">Value Chain</th>
                                        <th className="px-2 py-2 min-w-[180px] whitespace-nowrap">Production & Crops</th>
                                        <th className="px-2 py-2 min-w-[200px] whitespace-nowrap">Description</th>
                                        <th className="px-2 py-2 min-w-[100px] whitespace-nowrap">Support</th>
                                        <th className="px-2 py-2 min-w-[80px] whitespace-nowrap">Joined</th>
                                        <th className="px-2 py-2 text-right sticky right-0 bg-gray-50/90 backdrop-blur shadow-l min-w-[80px]">Actions</th>
                                    </>
                                 ) : (
                                    <>
                                        <th className="px-6 py-4">Business Identity</th>
                                        <th className="px-6 py-4">Type & Ownership</th>
                                        <th className="px-6 py-4">Location</th>
                                        <th className="px-6 py-4">Financials</th>
                                        <th className="px-6 py-4">Production & Crops</th>
                                        <th className="px-6 py-4">Started</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </>
                                 )}
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100 text-sm">
                             {paginatedData.map(business => (
                                 <tr 
                                     key={business.id} 
                                     onClick={() => handleRowClick(business)}
                                     className={`hover:bg-green-50 cursor-pointer group transition-all duration-200 ${viewMode === 'detailed' ? 'text-sm' : ''}`}
                                 >
                                    {viewMode === 'detailed' ? (
                                        <>
                                            <td className="px-2 py-1.5 border-r border-gray-50">{business.id}</td>
                                            <td className="px-2 py-1.5 font-semibold text-gray-900 border-r border-gray-50">{highlightText(business.businessName, searchQuery)}</td>
                                            <td className="px-2 py-1.5 border-r border-gray-50">
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${business.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {business.status || 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-2 py-1.5 font-mono text-gray-500 border-r border-gray-50">{highlightText(business.tin, searchQuery)}</td>
                                            <td className="px-2 py-1.5 border-r border-gray-50 text-gray-700">{highlightText(business.ownerName, searchQuery)}</td>
                                            <td className="px-2 py-1.5 font-mono text-gray-600 border-r border-gray-50">{highlightText(business.phone, searchQuery)}</td>
                                            <td className="px-2 py-1.5 font-mono text-gray-500 border-r border-gray-50 min-w-[120px]">
                                                <div className="flex items-center gap-2 group/nid">
                                                    <span>{isViewer ? '***********' : (visibleNids[business.id] ? (business.nid || '-') : (business.nid ? '***********' : '-'))}</span>
                                                    {business.nid && !isViewer && (
                                                        <button 
                                                        onClick={(e) => toggleNid(e, String(business.id))} 
                                                        className="opacity-0 group-hover/nid:opacity-100 transition-opacity p-1 hover:bg-green-100 rounded-full text-green-600"
                                                        title={visibleNids[business.id] ? "Hide ID" : "Show ID"}
                                                        >
                                                            {visibleNids[business.id] ? <EyeOff size={14}/> : <Eye size={14}/>}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-2 py-1.5 border-r border-gray-50">{business.gender || '-'}</td>
                                            <td className="px-2 py-1.5 border-r border-gray-50">{business.ownerAge || '-'}</td>
                                            <td className="px-2 py-1.5 border-r border-gray-50">{business.nationality || 'Rwandan'}</td>
                                            <td className="px-2 py-1.5 border-r border-gray-50">{business.educationLevel}</td>
                                            <td className="px-2 py-1.5 border-r border-gray-50">{business.disabilityStatus}</td>
                                            <td className="px-2 py-1.5 border-r border-gray-50 truncare max-w-[150px]" title={business.businessType}>{business.businessType}</td>
                                            <td className="px-2 py-1.5 border-r border-gray-50 truncate max-w-[120px]" title={business.participantType}>{business.participantType || '-'}</td>
                                            <td className="px-2 py-1.5 border-r border-gray-50 text-gray-600">{business.ownership}</td>
                                            <td className="px-2 py-1.5 border-r border-gray-50">{business.province}</td>
                                            <td className="px-2 py-1.5 border-r border-gray-50">{business.district}</td>
                                            <td className="px-2 py-1.5 border-r border-gray-50">{business.sector}</td>
                                            <td className="px-2 py-1.5 border-r border-gray-50">{business.cell}</td>
                                            <td className="px-2 py-1.5 border-r border-gray-50">{business.village}</td>
                                            <td className="px-2 py-1.5 border-r border-gray-50">{business.businessSize}</td>
                                            <td className="px-2 py-1.5 font-medium text-gray-900 border-r border-gray-50">{business.revenue}</td>
                                            <td className="px-2 py-1.5 border-r border-gray-50">{business.annualIncome}</td>
                                            <td className="px-2 py-1.5 text-center border-r border-gray-50">{business.employees}</td>
                                            <td className="px-2 py-1.5 text-center border-r border-gray-50">{business.femaleEmployees || 0}</td>
                                            <td className="px-2 py-1.5 text-center border-r border-gray-50">{business.youthEmployees || 0}</td>
                                            <td className="px-2 py-1.5 text-center border-r border-gray-50">{business.permanentEmployees ? 'Yes' : 'No'}</td>
                                            <td className="px-2 py-1.5 border-r border-gray-50 truncate max-w-[150px]" title={business.valueChain}>{business.valueChain}</td>
                                            <td className="px-2 py-1.5 border-r border-gray-50">
                                                {business.crops && business.crops.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {business.crops.slice(0, 3).map((crop, idx) => (
                                                            <span key={idx} className="bg-green-50 text-green-700 text-[10px] px-1.5 py-0.5 rounded" title={`${crop.quantity} ${crop.unit}`}>
                                                                {highlightText(crop.name, searchQuery)}
                                                            </span>
                                                        ))}
                                                        {business.crops.length > 3 && <span className="text-gray-400 text-[10px]">+{business.crops.length - 3}</span>}
                                                    </div>
                                                ) : <span className="text-gray-400">-</span>}
                                            </td>
                                            <td className="px-2 py-1.5 border-r border-gray-50 truncate max-w-[200px]" title={business.companyDescription}>{business.companyDescription || '-'}</td>
                                            <td className="px-2 py-1.5 border-r border-gray-50 truncate max-w-[100px]" title={business.supportReceived}>{business.supportReceived || '-'}</td>
                                            <td className="px-2 py-1.5 text-gray-500">{formatDate(business.commencementDate)}</td>
                                            <td className="px-2 py-1.5 text-center sticky right-0 bg-white group-hover:bg-green-50 shadow-l">
                                                <div className="flex justify-center gap-1">
                                                    {isViewer && <button onClick={(e) => handleView(e, business)} className="p-1 text-gray-600 hover:bg-gray-100 rounded" title="View Profile"><Eye size={14}/></button>}
                                                    {canEdit && <button onClick={(e) => handleEdit(e, business)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit"><Edit size={14}/></button>}
                                                    {!isViewer && <button onClick={(e) => handleDownloadProfile(e, business)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Download Profile"><Download size={14}/></button>}
                                                    {canEdit && <button onClick={(e) => handleDelete(e, business.id)} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Delete"><Trash2 size={14}/></button>}
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-green-200 text-green-700 flex items-center justify-center font-bold text-sm shrink-0 shadow-inner">
                                                        {business.businessName.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 text-base group-hover:text-green-700 transition-colors">{highlightText(business.businessName, searchQuery)}</div>
                                                        <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-medium">TIN: {highlightText(business.tin, searchQuery)}</span>
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
                                            <td className="px-6 py-4">
                                                {business.crops && business.crops.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {business.crops.slice(0, 2).map((crop, idx) => (
                                                            <span key={idx} className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-md font-medium" title={`${crop.quantity} ${crop.unit}`}>
                                                                {highlightText(crop.name, searchQuery)}
                                                            </span>
                                                        ))}
                                                        {business.crops.length > 2 && <span className="text-gray-400 text-xs">+{business.crops.length - 2} more</span>}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">No crops listed</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} className="text-gray-400" />
                                                    {formatDate(business.commencementDate)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                    {isViewer && (
                                                        <button onClick={(e) => handleView(e, business)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors shadow-sm border border-transparent hover:border-gray-200" title="View Profile">
                                                            <Eye size={16} />
                                                        </button>
                                                    )}
                                                    {!isViewer && (
                                                        <button onClick={(e) => handleDownloadProfile(e, business)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors shadow-sm border border-transparent hover:border-green-100" title="Download Profile">
                                                            <Download size={16} />
                                                        </button>
                                                    )}
                                                    {canEdit && (
                                                        <button onClick={(e) => handleEdit(e, business)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shadow-sm border border-transparent hover:border-blue-100" title="Edit Details">
                                                            <Edit size={16} />
                                                        </button>
                                                    )}
                                                    {canEdit && (
                                                        <button onClick={(e) => handleDelete(e, business.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors shadow-sm border border-transparent hover:border-red-100" title="Remove Business">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </>
                                    )}
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
                      
                       <div className="flex items-center gap-4">
                           <span>Showing <span className="font-bold text-gray-900">{processedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> - <span className="font-bold text-gray-900">{itemsPerPage === -1 ? processedData.length : Math.min(currentPage * itemsPerPage, processedData.length)}</span> of <span className="font-bold text-gray-900">{processedData.length}</span></span>
                           
                           <div className="h-4 w-px bg-gray-200"></div>
                           
                           <div className="flex items-center gap-2">
                               <span>Rows per page:</span>
                               <select 
                                  value={itemsPerPage}
                                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                  className="border border-gray-200 rounded px-1 py-0.5 bg-gray-50 focus:ring-green-500 focus:border-green-500"
                               >
                                   <option value={10}>10</option>
                                   <option value={20}>20</option>
                                   <option value={50}>50</option>
                               </select>
                           </div>
                       </div>

                       <div className="flex items-center gap-2">
                           <button 
                             className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1 font-medium text-gray-700 bg-white shadow-sm"
                             onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                             disabled={currentPage === 1}
                           >
                               <ChevronLeft size={16} /> Previous
                           </button>
                           <span className="font-medium mx-2 text-gray-900">Page {currentPage} of {totalPages}</span>
                           <button 
                             className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1 font-medium text-gray-700 bg-white shadow-sm"
                             onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                             disabled={currentPage === totalPages}
                           >
                              Next <ChevronRight size={16} />
                           </button>
                       </div>
                   </div>
                </div>
            </div>

            <FarmerModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSave} 
                initialData={selectedBusiness} 
                mode={modalMode}
                readOnly={isViewer}
            />
        </div>
    );
}

export default Farmers;
