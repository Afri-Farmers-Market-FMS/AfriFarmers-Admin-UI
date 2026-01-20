export interface CropItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface Farmer {
  id: number;
  businessName: string; // Name of the business
  ownership: 'Youth-owned' | 'Non youth-owned'; // Business Ownership
  commencementDate: string; // Commencement date
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  ownerName: string; // Name of the business owner
  phone: string; // Phone numbers
  tin: string; // TIN number
  businessType: string; // Business Type (Individual, Cooperative, etc.)
  participantType?: string; // Type of participants
  companyDescription?: string; // Company description
  supportReceived?: string; // Support received or expected
  nationality?: string;
  nid?: string;
  ownerAge: number; // Business owner age
  gender?: string;
  educationLevel: 'None' | 'Primary' | 'Secondary' | 'University' | 'Vocational' | string; // Business Owner Education
  disabilityStatus: 'None' | 'Physical' | 'Mental' | 'Visual' | 'Hearing' | 'Other' | string; // Business owner disability status
  businessSize: 'Micro' | 'Small' | 'Medium' | 'Large' | string; // Business size
  revenue: string; // Average annual revenue
  annualIncome: string; // Average Annual Income
  employees: number; // Number of employees of your business
  femaleEmployees?: number; // Number of female employees
  youthEmployees?: number; // Number of employees of age between 18 - 35
  valueChain: string; // Your Business Value chain
  permanentEmployees?: boolean; // Ufite abakozi bahoraho? (Mapped to boolean if possible or string)
  crops?: CropItem[]; // Optional, if we keep the structure but user said value chain is enough for search
  status?: 'Active' | 'Pending' | 'Inactive';
}

export interface DashboardStats {
  totalFarmers: number;
  youthOwnedPercentage: number;
  totalEmployees: number;
  topValueChain: string;
  districtsCovered: number;
  femaleEmployees: number;
  youthEmployees: number;
}

export interface GraphData {
  name: string;
  value: number;
}

export interface DashboardData {
  stats: DashboardStats;
  districtData: GraphData[];
  revenueData: GraphData[];
  businessSizeData: GraphData[];
  recentFarmers: Farmer[];
  growthData: GraphData[];
  valueChainData: GraphData[];
  ownershipData: GraphData[];
}
