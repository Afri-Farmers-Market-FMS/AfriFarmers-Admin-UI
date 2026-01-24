// Frontend API Service - Connects to Backend API
import { Farmer, DashboardData } from '../types';

// ============== CONFIGURATION ==============
const API_BASE_URL = 'http://localhost:5000/api';
const TOKEN_KEY = 'afm_token';

// ============== TOKEN MANAGEMENT ==============
export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = (): void => localStorage.removeItem(TOKEN_KEY);

// ============== API CLIENT ==============
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = getToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const url = `${this.baseUrl}${endpoint}`;
    console.log(`📤 API Request: ${options.method || 'GET'} ${url}`);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();
      console.log(`📥 API Response:`, data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: Request failed`);
      }

      return data;
    } catch (error: any) {
      console.error(`❌ API Error:`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

const api = new ApiClient(API_BASE_URL);

// ============== AUTH SERVICE ==============
export const authService = {
  async login(email: string, password: string): Promise<{ user: any; token: string }> {
    console.log('🔐 Logging in:', email);
    const response = await api.post<{ success: boolean; user: any; token: string }>(
      '/auth/login',
      { email, password }
    );
    
    if (response.token) {
      setToken(response.token);
      console.log('✅ Login successful, token saved');
    }
    
    return { user: response.user, token: response.token };
  },

  async register(name: string, email: string, password: string, role: string = 'Viewer'): Promise<{ user: any; token: string }> {
    console.log('📝 Registering:', email);
    const response = await api.post<{ success: boolean; user: any; token: string }>(
      '/auth/register',
      { name, email, password, role }
    );
    
    if (response.token) {
      setToken(response.token);
    }
    
    return { user: response.user, token: response.token };
  },

  async getCurrentUser(): Promise<any | null> {
    if (!getToken()) return null;
    
    try {
      const response = await api.get<{ success: boolean; user: any }>('/auth/me');
      return response.user;
    } catch {
      removeToken();
      return null;
    }
  },

  logout(): void {
    removeToken();
    localStorage.removeItem('afm_user');
    console.log('👋 Logged out');
  },
};

// ============== FARMER SERVICE ==============
export const farmerService = {
  async getAll(): Promise<Farmer[]> {
    console.log('📋 Fetching all farmers...');
    const response = await api.get<{ success: boolean; data: Farmer[]; total: number }>(
      '/farmers'
    );
    console.log(`✅ Loaded ${response.data?.length || 0} farmers`);
    return response.data || [];
  },

  async getById(id: number): Promise<Farmer> {
    console.log('🔍 Fetching farmer:', id);
    const response = await api.get<{ success: boolean; data: Farmer }>(`/farmers/${id}`);
    return response.data;
  },

  async create(farmer: Omit<Farmer, 'id'>): Promise<Farmer> {
    console.log('➕ Creating farmer:', farmer.businessName);
    const response = await api.post<{ success: boolean; data: Farmer }>('/farmers', farmer);
    console.log('✅ Created farmer with ID:', response.data.id);
    return response.data;
  },

  async update(id: number, updates: Partial<Farmer>): Promise<Farmer> {
    console.log('✏️ Updating farmer:', id, updates);
    
    // Remove id from updates to avoid conflicts
    const { id: _, ...updateData } = updates as any;
    
    const response = await api.put<{ success: boolean; data: Farmer }>(
      `/farmers/${id}`,
      updateData
    );
    console.log('✅ Updated farmer:', response.data.id, response.data.businessName);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    console.log('🗑️ Deleting farmer:', id);
    await api.delete(`/farmers/${id}`);
    console.log('✅ Deleted farmer:', id);
  },

  async getDashboardData(): Promise<DashboardData> {
    console.log('📊 Fetching dashboard data...');
    const response = await api.get<{ success: boolean; data: DashboardData }>('/dashboard');
    return response.data;
  },
};

// ============== DASHBOARD SERVICE ==============
export const dashboardService = {
  async getData(): Promise<DashboardData> {
    console.log('📊 Fetching dashboard data...');
    const response = await api.get<{ success: boolean; data: DashboardData }>('/dashboard');
    return response.data;
  },
};

// ============== HEALTH CHECK ==============
export const checkBackendConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });
    const isConnected = response.ok;
    console.log(`🔌 Backend ${isConnected ? 'connected' : 'not available'}`);
    return isConnected;
  } catch {
    console.log('🔌 Backend not available');
    return false;
  }
};
