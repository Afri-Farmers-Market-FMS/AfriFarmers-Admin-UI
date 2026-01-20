// src/components/FarmerModal.tsx
import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
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
    if (initialData && mode === 'edit') {
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
    if (name === 'permanentEmployees') {
        setFormData(prev => ({ ...prev, [name]: value === 'true' }));
    } else if (type === 'number') {
        setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
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
    setLoading(true);
    try {
      await onSave(formData as Farmer);
      onClose();
    } catch (error) {
      console.error(error);
      alert('Failed to save business');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="px-6 py-4 bg-green-900 text-white flex justify-between items-center shrink-0">
          <div>
              <h2 className="text-xl font-bold">{mode === 'add' ? 'Register New Business' : 'Edit Business Details'}</h2>
              <p className="text-green-200 text-xs">Complete the profile below</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
        <form id="farmerForm" onSubmit={handleSubmit} className="space-y-6">
          
          {/* Group 1: Business Identity */}
          <section className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
             <h3 className="text-sm font-bold text-green-800 uppercase tracking-wider mb-4 border-b pb-2">Business Identity</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <section className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
             <h3 className="text-sm font-bold text-green-800 uppercase tracking-wider mb-4 border-b pb-2">Owner & Demographics</h3>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <section className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
             <h3 className="text-sm font-bold text-green-800 uppercase tracking-wider mb-4 border-b pb-2">Location</h3>
             <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
          <section className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
             <h3 className="text-sm font-bold text-green-800 uppercase tracking-wider mb-4 border-b pb-2">Operations & Financials</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                 
                 <div>
                    <label className="input-label">Total Employees</label>
                    <input type="number" name="employees" value={formData.employees} onChange={handleChange} className="input-field" />
                 </div>
                 <div>
                    <label className="input-label">Female Employees</label>
                    <input type="number" name="femaleEmployees" value={formData.femaleEmployees} onChange={handleChange} className="input-field" />
                 </div>
                 <div>
                    <label className="input-label">Youth Employees</label>
                    <input type="number" name="youthEmployees" value={formData.youthEmployees} onChange={handleChange} className="input-field" />
                 </div>
                 
                 <div className="md:col-span-3">
                    <label className="input-label">Value Chain Activities</label>
                    <input name="valueChain" value={formData.valueChain} onChange={handleChange} className="input-field" placeholder="Main value chain activities..." />
                 </div>
             </div>
          </section>

        </form>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} className="px-5 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors">Cancel</button>
            <button form="farmerForm" type="submit" disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium shadow-sm transition-colors">
                <Save size={18} /> {loading ? 'Saving...' : 'Save Record'}
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
