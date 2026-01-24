// Shared types between frontend and backend

export interface CropItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface IFarmer {
  id?: number;
  businessName: string;
  ownership: 'Youth-owned' | 'Non youth-owned';
  commencementDate: string;
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  ownerName: string;
  phone: string;
  tin: string;
  businessType: string;
  participantType?: string;
  companyDescription?: string;
  supportReceived?: string;
  nationality?: string;
  nid?: string;
  ownerAge: number;
  gender?: string;
  educationLevel: string;
  disabilityStatus: string;
  businessSize: string;
  revenue: string;
  annualIncome: string;
  employees: number;
  femaleEmployees?: number;
  youthEmployees?: number;
  valueChain: string;
  permanentEmployees?: boolean;
  crops?: CropItem[];
  status?: 'Active' | 'Pending' | 'Inactive';
}

export interface IUser {
  id?: string;
  name: string;
  email: string;
  password?: string;
  role: 'Super Admin' | 'Admin' | 'Viewer';
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
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
  recentFarmers: IFarmer[];
  growthData: GraphData[];
  valueChainData: GraphData[];
  ownershipData: GraphData[];
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: Omit<IUser, 'password'>;
  message?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
}
