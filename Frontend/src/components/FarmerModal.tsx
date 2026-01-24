// src/components/FarmerModal.tsx
import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Edit } from 'lucide-react';
import { Farmer, CropItem } from '../types';

interface FarmerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (farmer: Omit<Farmer, 'id'> | Farmer) => Promise<void>;
  initialData?: Farmer;
  mode: 'add' | 'edit';
}

const FarmerModal = ({ isOpen, onClose, onSave, initialData, mode }: FarmerModalProps) => {
  const [formData, setFormData] = useState<Partial<Farmer>>({
    businessName: '',
    ownerName: '',
    nid: '', 
    ownership: 'Youth-owned',
    commencementDate: '',
    province: '',
    district: '',
    sector: '',
    cell: '',
    village: '',
    phone: '',
    tin: '',
    businessType: 'Individual',
    participantType: 'Individual',
    companyDescription: '',
    supportReceived: 'None',
    nationality: 'Rwandan',
    ownerAge: 0,
    gender: 'Male',
    educationLevel: 'None',
    disabilityStatus: 'None',
    businessSize: 'Micro',
    revenue: '',
    annualIncome: '',
    employees: 0,
    femaleEmployees: 0,
    youthEmployees: 0,
    valueChain: '',
    permanentEmployees: false,
    crops: [],
    status: 'Active'
  });

  const [loading, setLoading] = useState(false);
  const [newCrop, setNewCrop] = useState<Partial<CropItem>>({ name: '', quantity: 0, unit: 'kg' });
  const [showCropForm, setShowCropForm] = useState(false);

  useEffect(() => {
    console.log('🔄 FarmerModal useEffect - mode:', mode, 'initialData:', initialData);
    if (initialData && mode === 'edit') {
      console.log('📥 Setting formData from initialData, id:', initialData.id);
      setFormData(initialData);
    } else {
       // Reset for add mode
       setFormData({
        businessName: '',
        ownerName: '',
        nid: '', 
        ownership: 'Youth-owned',
        commencementDate: '',
        province: '',
        district: '',
        sector: '',
        cell: '',
        village: '',
        phone: '',
        tin: '',
        businessType: 'Individual',
        participantType: 'Individual',
        companyDescription: '',
        supportReceived: 'None',
        nationality: 'Rwandan',
        ownerAge: 0,
        gender: 'Male',
        educationLevel: 'None',
        disabilityStatus: 'None',
        businessSize: 'Micro',
        revenue: '',
        annualIncome: '',
        employees: 0,
        femaleEmployees: 0,
        youthEmployees: 0,
        valueChain: '',
        permanentEmployees: false,
        crops: [],
        status: 'Active'
      });
    }
  }, [initialData, mode, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    console.log('📝 handleChange:', name, '=', value, '(type:', type, ')');
    if (name === 'permanentEmployees') {
        setFormData(prev => {
          console.log('   prev.id:', (prev as any).id);
          return { ...prev, [name]: value === 'true' };
        });
    } else if (type === 'number') {
        setFormData(prev => {
          console.log('   prev.id:', (prev as any).id);
          return { ...prev, [name]: Number(value) };
        });
    } else {
        setFormData(prev => {
          console.log('   prev.id:', (prev as any).id);
          return { ...prev, [name]: value };
        });
    }
  };

  const addCrop = () => {
    if (newCrop.name && newCrop.quantity) {
      const crop: CropItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: newCrop.name || '',
        quantity: Number(newCrop.quantity),
        unit: newCrop.unit || 'kg'
      };
      setFormData(prev => ({
        ...prev,
        crops: [...(prev.crops || []), crop]
      }));
      setNewCrop({ name: '', quantity: 0, unit: 'kg' });
      setShowCropForm(false);
    }
  };

  const removeCrop = (cropId: string) => {
    setFormData(prev => ({
      ...prev,
      crops: prev.crops?.filter(c => c.id !== cropId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 FarmerModal.handleSubmit called');
    console.log('📋 formData:', formData);
    console.log('🆔 formData.id:', (formData as any).id);
    setLoading(true);
    try {
      await onSave(formData as Farmer);
      console.log('✅ Save successful');
      onClose();
    } catch (error: any) {
      console.error('❌ Save failed:', error);
      alert('Failed to save business: ' + (error?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-8 py-5 bg-green-900 text-white flex justify-between items-center shrink-0">
          <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                 {mode === 'add' ? <Plus size={24} /> : <Edit size={24} />}
                 {mode === 'add' ? 'Register New Business' : 'Edit Business Profile'}
              </h2>
              <p className="text-green-200 text-sm mt-1 opacity-90">Complete the information below to update the registry.</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/80 custom-scrollbar">
        <form id="farmerForm" onSubmit={handleSubmit} className="space-y-8">
          
          {/* Group 1: Business Identity */}
          <section className="section-card">
             <h3 className="section-header">
                <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs mr-2 border border-green-200">01</span>
                Business Identity
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                    <label className="input-label">Business Name <span className="text-red-500">*</span></label>
                    <input required name="businessName" value={formData.businessName} onChange={handleChange} className="input-field" placeholder="e.g. AGRO LTD" />
                 </div>
                 <div>
                    <label className="input-label">TIN Number</label>
                    <input name="tin" value={formData.tin} onChange={handleChange} className="input-field" placeholder="9 Digits" />
                 </div>
                 <div>
                    <label className="input-label">Business Type</label>
                    <select name="businessType" value={formData.businessType} onChange={handleChange} className="input-field">
                        <option value="Individual">Individual</option>
                        <option value="Cooperative">Cooperative</option>
                        <option value="Company">Company</option>
                        <option value="NGO">NGO</option>
                        <option value="Group">Group</option>
                    </select>
                 </div>
                 <div className="md:col-span-2">
                    <label className="input-label">Description</label>
                    <textarea name="companyDescription" value={formData.companyDescription} onChange={handleChange} className="input-field min-h-[80px]" placeholder="Brief description of activities..." />
                 </div>
                 <div>
                     <label className="input-label">Support Received</label>
                     <input name="supportReceived" value={formData.supportReceived} onChange={handleChange} className="input-field" placeholder="e.g. Training, Grants" />
                 </div>
                 <div>
                    <label className="input-label">Commencement Date</label>
                    <input type="date" name="commencementDate" value={formData.commencementDate} onChange={handleChange} className="input-field" />
                 </div>
                 <div>
                    <label className="input-label">Ownership Status</label>
                    <select name="ownership" value={formData.ownership} onChange={handleChange} className="input-field">
                        <option value="Youth-owned">Youth-owned</option>
                        <option value="Non youth-owned">Non youth-owned</option>
                    </select>
                 </div>
             </div>
          </section>

          {/* Group 2: Owner & Demographics */}
          <section className="section-card">
             <h3 className="section-header">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs mr-2 border border-blue-200">02</span>
                Owner & Demographics
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <div className="md:col-span-2">
                    <label className="input-label">Owner Name <span className="text-red-500">*</span></label>
                    <input required name="ownerName" value={formData.ownerName} onChange={handleChange} className="input-field" />
                 </div>
                 <div>
                    <label className="input-label">National ID</label>
                    <input name="nid" value={formData.nid} onChange={handleChange} className="input-field" placeholder="16 Digits" />
                 </div>
                 <div>
                    <label className="input-label">Phone</label>
                    <input required name="phone" value={formData.phone} onChange={handleChange} className="input-field" />
                 </div>
                 <div>
                    <label className="input-label">Age</label>
                    <input type="number" name="ownerAge" value={formData.ownerAge} onChange={handleChange} className="input-field" />
                 </div>
                 <div>
                    <label className="input-label">Gender</label>
                     <select name="gender" value={formData.gender} onChange={handleChange} className="input-field">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                 </div>
                 <div>
                    <label className="input-label">Education Level</label>
                    <select name="educationLevel" value={formData.educationLevel} onChange={handleChange} className="input-field">
                        <option value="None">None</option>
                        <option value="Primary">Primary</option>
                        <option value="Secondary">Secondary</option>
                        <option value="Vocational">Vocational</option>
                        <option value="University">University</option>
                    </select>
                 </div>
                 <div>
                    <label className="input-label">Disability Status</label>
                    <select name="disabilityStatus" value={formData.disabilityStatus} onChange={handleChange} className="input-field">
                        <option value="None">None</option>
                        <option value="Physical">Physical</option>
                        <option value="Visual">Visual</option>
                        <option value="Hearing">Hearing</option>
                        <option value="Mental">Mental</option>
                        <option value="Other">Other</option>
                    </select>
                 </div>
             </div>
          </section>

          {/* Group 3: Location */}
          <section className="section-card">
             <h3 className="section-header">
                <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs mr-2 border border-purple-200">03</span>
                Location
             </h3>
             <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                 <div>
                    <label className="input-label">Province</label>
                    <select name="province" value={formData.province} onChange={handleChange} className="input-field">
                        <option value="">Select...</option>
                        <option value="Kigali">Kigali</option>
                        <option value="North">North</option>
                        <option value="South">South</option>
                        <option value="East">East</option>
                        <option value="West">West</option>
                    </select>
                 </div>
                 <div>
                    <label className="input-label">District</label>
                    <input name="district" value={formData.district} onChange={handleChange} className="input-field" />
                 </div>
                 <div>
                    <label className="input-label">Sector</label>
                    <input name="sector" value={formData.sector} onChange={handleChange} className="input-field" />
                 </div>
                 <div>
                    <label className="input-label">Cell</label>
                    <input name="cell" value={formData.cell} onChange={handleChange} className="input-field" />
                 </div>
                 <div>
                    <label className="input-label">Village</label>
                    <input name="village" value={formData.village} onChange={handleChange} className="input-field" />
                 </div>
             </div>
          </section>

          {/* Group 4: Finance & Operations */}
          <section className="section-card">
             <h3 className="section-header">
                <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs mr-2 border border-orange-200">04</span>
                Operations & Financials
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                    <label className="input-label">Business Size</label>
                    <select name="businessSize" value={formData.businessSize} onChange={handleChange} className="input-field">
                        <option value="Micro">Micro</option>
                        <option value="Small">Small</option>
                        <option value="Medium">Medium</option>
                        <option value="Large">Large</option>
                    </select>
                 </div>
                 <div>
                    <label className="input-label">Annual Revenue (Range)</label>
                    <select name="revenue" value={formData.revenue} onChange={handleChange} className="input-field">
                        <option value="">Select...</option>
                        <option value="< 840,000 RWF">&lt; 840,000 RWF</option>
                        <option value="840k - 1.2M RWF">840k - 1.2M RWF</option>
                        <option value="1.2M - 2.4M RWF">1.2M - 2.4M RWF</option>
                        <option value="2.4M - 3.6M RWF">2.4M - 3.6M RWF</option>
                        <option value="> 3.6M RWF">&gt; 3.6M RWF</option>
                    </select>
                 </div>
                 <div>
                    <label className="input-label">Annual Income</label>
                    <input name="annualIncome" value={formData.annualIncome} onChange={handleChange} className="input-field" placeholder="Exact amount if known" />
                 </div>
                 
                 <div className="md:col-span-3 bg-gray-50/50 p-4 rounded-lg border border-gray-200 mt-2">
                     <label className="input-label mb-3 block text-gray-900 border-b border-gray-200 pb-2">Workforce Composition</label>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="input-label">Total Employees</label>
                            <input type="number" name="employees" value={formData.employees} onChange={handleChange} className="input-field" />
                        </div>
                        <div>
                            <label className="input-label text-pink-600">Female Employees</label>
                            <input type="number" name="femaleEmployees" value={formData.femaleEmployees} onChange={handleChange} className="input-field focus:ring-pink-500 hover:border-pink-200" />
                        </div>
                         <div>
                            <label className="input-label text-blue-600">Youth Employees</label>
                            <input type="number" name="youthEmployees" value={formData.youthEmployees} onChange={handleChange} className="input-field focus:ring-blue-500 hover:border-blue-200" />
                        </div>
                     </div>
                 </div>
                 
                 <div className="md:col-span-3">
                    <label className="input-label">Value Chain Activities</label>
                    <input name="valueChain" value={formData.valueChain} onChange={handleChange} className="input-field" placeholder="Main value chain activities..." />
                 </div>
             </div>
          </section>

          {/* Group 5: Production & Crops */}
          <section className="section-card">
             <h3 className="section-header">
                <span className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-xs mr-2 border border-yellow-200">05</span>
                Production & Crops
             </h3>
             
             <div className="space-y-4">
               {/* Add New Crop */}
               <div className="bg-yellow-50/50 p-4 rounded-lg border border-yellow-100">
                  <label className="text-xs font-bold text-yellow-800 uppercase tracking-wider mb-3 block">Add Production Record</label>
                  <div className="flex gap-2">
                      <input 
                        placeholder="Crop/Product Name" 
                        value={newCrop.name}
                        onChange={(e) => setNewCrop({...newCrop, name: e.target.value})}
                        className="input-field flex-1"
                      />
                      <input 
                        type="number" 
                        placeholder="Qty" 
                        value={newCrop.quantity || ''}
                        onChange={(e) => setNewCrop({...newCrop, quantity: Number(e.target.value)})}
                        className="input-field w-24"
                      />
                      <select
                        value={newCrop.unit}
                        onChange={(e) => setNewCrop({...newCrop, unit: e.target.value})}
                        className="input-field w-24"
                      >
                         <option value="kg">kg</option>
                         <option value="tons">tons</option>
                         <option value="liters">L</option>
                         <option value="pieces">pcs</option>
                      </select>
                      <button type="button" onClick={addCrop} className="px-4 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-lg font-bold shadow-sm transition-colors">
                        <Plus size={20} />
                      </button>
                  </div>
               </div>

               {/* List Crops */}
               {formData.crops && formData.crops.length > 0 ? (
                 <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left">
                       <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs">
                          <tr>
                             <th className="px-4 py-3">Item</th>
                             <th className="px-4 py-3">Quantity</th>
                             <th className="px-4 py-3 text-right">Action</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100 bg-white">
                          {formData.crops.map((crop) => (
                             <tr key={crop.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 font-medium text-gray-900">{crop.name}</td>
                                <td className="px-4 py-3 text-gray-600 font-mono">{crop.quantity} {crop.unit}</td>
                                <td className="px-4 py-3 text-right">
                                   <button type="button" onClick={() => removeCrop(crop.id)} className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50">
                                      <Trash2 size={16} />
                                   </button>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
               ) : (
                 <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                    No production records added yet.
                 </div>
               )}
             </div>
          </section>

        </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 border border-transparent hover:bg-gray-50 rounded-lg transition-colors">
                Cancel
            </button>
            <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="px-8 py-2.5 bg-green-900 text-white text-sm font-bold rounded-lg shadow-lg hover:bg-green-800 hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
                {loading ? (
                    'Saving...'
                ) : (
                    <>
                    <Save size={18} />
                    {mode === 'add' ? 'Register Business' : 'Save Changes'}
                    </>
                )}
            </button>
        </div>
      </div>
      
      <style>{`
        .input-label { @apply block text-xs font-semibold text-gray-500 uppercase mb-1.5; }
        .input-field { @apply w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all; }
      `}</style>
    </div>
  );
};

export default FarmerModal;
