import { Farmer, DashboardData } from '../types';
import { initialFarmers } from './mockData';

const STORAGE_KEY = 'afm_businesses_registry_v1';

// Simulate a slight delay to mimic API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class FarmerService {
  private farmers: Farmer[];

  constructor() {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      this.farmers = JSON.parse(storedData);
    } else {
      this.farmers = initialFarmers;
      this.saveToStorage();
    }
  }

  private saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.farmers));
  }

  async getAll(): Promise<Farmer[]> {
    await delay(300);
    return [...this.farmers];
  }

  async getById(id: number): Promise<Farmer | undefined> {
    await delay(200);
    return this.farmers.find(f => f.id === id);
  }

  async create(farmer: Omit<Farmer, 'id'>): Promise<Farmer> {
    await delay(500);
    // Generate a simple numeric ID (max + 1)
    const maxId = this.farmers.reduce((max, f) => (f.id > max ? f.id : max), 0);
    const newFarmer: Farmer = { ...farmer, id: maxId + 1 };
    
    this.farmers = [newFarmer, ...this.farmers];
    this.saveToStorage();
    return newFarmer;
  }

  async update(id: number, updates: Partial<Farmer>): Promise<Farmer> {
    await delay(400);
    const index = this.farmers.findIndex(f => f.id === id);
    if (index === -1) throw new Error('Farmer not found');

    const updatedFarmer = { ...this.farmers[index], ...updates };
    this.farmers[index] = updatedFarmer;
    this.saveToStorage();
    return updatedFarmer;
  }

  async delete(id: number): Promise<void> {
    await delay(400);
    this.farmers = this.farmers.filter(f => f.id !== id);
    this.saveToStorage();
  }

  async getDashboardData(): Promise<DashboardData> {
    await delay(300);
    const totalFarmers = this.farmers.length;
    
    const youthOwnedCount = this.farmers.filter(f => f.ownership === 'Youth-owned').length;
    const youthOwnedPercentage = totalFarmers > 0 ? Math.round((youthOwnedCount / totalFarmers) * 100) : 0;
    
    const totalEmployees = this.farmers.reduce((sum, f) => sum + (f.employees || 0), 0);
    
    // District Distribution
    const districtCounts: Record<string, number> = {};
    const districts = new Set<string>();
    
    this.farmers.forEach(f => {
      if (f.district) {
        districts.add(f.district);
        districtCounts[f.district] = (districtCounts[f.district] || 0) + 1;
      }
    });

    const districtData = Object.entries(districtCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 districts

    // Value Chain Distribution
    const valueChains: Record<string, number> = {};
    this.farmers.forEach(f => {
      if (f.valueChain) {
        valueChains[f.valueChain] = (valueChains[f.valueChain] || 0) + 1;
      }
    });
    
    const valueChainData = Object.entries(valueChains)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const topValueChain = valueChainData[0]?.name || 'N/A';

    // Revenue/Income Distribution
    const revenueCounts: Record<string, number> = {};
    this.farmers.forEach(f => {
      const rev = f.revenue || 'Unknown';
      revenueCounts[rev] = (revenueCounts[rev] || 0) + 1;
    });

    const revenueData = Object.entries(revenueCounts)
      .map(([name, value]) => ({ name, value }));

    // Growth Trend (Mocked via commencementDate or random distribution over last 12 months for demo if dates missing)
    // In a real scenario, we group by commencementDate. Here we'll simulate a cumulative growth.
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let accum = 0;
    const growthData = months.map(month => {
       // Add random increment
       const increment = Math.floor(Math.random() * 5) + 1; 
       accum += totalFarmers > 0 ? Math.ceil(totalFarmers / 12) + increment : increment;
       return { name: month, value: Math.min(accum, totalFarmers + 50) }; // Cap/Smoothing
    });

    // Recent Farmers (Last 5)
    // Assuming higher ID is newer, or logic based on index if no dates
    const recentFarmers = [...this.farmers].reverse().slice(0, 5);

    return {
      stats: {
        totalFarmers,
        youthOwnedPercentage,
        totalEmployees,
        districtsCovered: districts.size,
        topValueChain
      },
      valueChainData,
      districtData,
      revenueData,
      growthData,
      recentFarmers
    };
  }

  // Deprecated - kept for backward compatibility if needed, but redirects to new structure part
  async getDashboardStats(): Promise<DashboardData['stats']> {
    const data = await this.getDashboardData();
    return data.stats;
  }
}

export const farmerService = new FarmerService();
