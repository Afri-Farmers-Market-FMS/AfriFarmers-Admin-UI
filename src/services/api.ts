import { Farmer, DashboardData } from '../types';
import { initialFarmers } from './mockData';

const STORAGE_KEY = 'afm_businesses_registry_v2';

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
    
    // Demographics Stats
    const youthOwnedCount = this.farmers.filter(f => f.ownership === 'Youth-owned').length;
    const youthOwnedPercentage = totalFarmers > 0 ? Math.round((youthOwnedCount / totalFarmers) * 100) : 0;
    
    // Employee Stats
    const totalEmployees = this.farmers.reduce((sum, f) => sum + (Number(f.employees) || 0), 0);
    const femaleEmployees = this.farmers.reduce((sum, f) => sum + (Number(f.femaleEmployees) || 0), 0);
    const youthEmployees = this.farmers.reduce((sum, f) => sum + (Number(f.youthEmployees) || 0), 0);
    
    // 1. District Distribution (For Graph 1)
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

    // Value Chain Analysis
    const valueChains: Record<string, number> = {};
    this.farmers.forEach(f => {
      if (f.valueChain) {
        // Group similar value chains if needed, for now use raw
        const shortVC = f.valueChain.split(' ')[0] + '...'; // Simplify for display
        valueChains[shortVC] = (valueChains[shortVC] || 0) + 1;
      }
    });
    
    const valueChainData = Object.entries(valueChains)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const topValueChain = valueChainData[0]?.name || 'N/A';

    // 2. Annual Income Distribution (For Graph 2)
    const revenueCounts: Record<string, number> = {};
    this.farmers.forEach(f => {
      // Normalize common CSV formats
      let rev = f.annualIncome || f.revenue || 'Unknown';
      if(rev.includes('Less than')) rev = '< 840k';
      else if(rev.includes('Between 840')) rev = '840k-1.2M';
      else if(rev.includes('1.2M')) rev = '1.2M-2.4M';
      else if(rev.includes('3.6M')) rev = '> 3.6M';
      
      revenueCounts[rev] = (revenueCounts[rev] || 0) + 1;
    });

    const revenueData = Object.entries(revenueCounts)
      .map(([name, value]) => ({ name, value }));
      
    // 3. Business Size Distribution (For Graph 3)
    const sizeCounts: Record<string, number> = {};
    this.farmers.forEach(f => {
        let size = f.businessSize || 'Unknown';
        // Simplify "Micro (1-2 employees)" to "Micro"
        if(size.includes('Micro')) size = 'Micro';
        if(size.includes('Small')) size = 'Small';
        if(size.includes('Medium')) size = 'Medium';
        if(size.includes('Large')) size = 'Large';
        sizeCounts[size] = (sizeCounts[size] || 0) + 1;
    });
    
    const businessSizeData = Object.entries(sizeCounts)
      .map(([name, value]) => ({ name, value }));

    // 4. Ownership Distribution
    const ownershipCounts: Record<string, number> = {};
    this.farmers.forEach(f => {
       const own = f.ownership || 'Other';
       ownershipCounts[own] = (ownershipCounts[own] || 0) + 1;
    });
    const ownershipData = Object.entries(ownershipCounts)
        .map(([name, value]) => ({ name, value }));

    // Growth Trend (Real Data from commencementDate)
    const growthMap: Record<string, number> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize last 12 months with 0
    // Simplified: Just aggregate by available years/months in data
    // Or better: aggregate by year for simplicity if data spans many years
    
    this.farmers.forEach(f => {
        if (!f.commencementDate) return;
        // Try parsing "DD/MM/YYYY" or "YYYY-MM-DD"
        // Most CSVs might have dates like "23-01-2022" or "2022"
        let yearString = '';
        if (f.commencementDate.includes('/')) {
            const parts = f.commencementDate.split('/');
            if (parts.length === 3) yearString = parts[2]; // Assume DD/MM/YYYY
        } else if (f.commencementDate.includes('-')) {
             const parts = f.commencementDate.split('-');
             if (parts.length === 3) yearString = parts[0].length === 4 ? parts[0] : parts[2];
        } else {
            // Maybe it's just a year
            if (f.commencementDate.length === 4) yearString = f.commencementDate;
        }

        if (yearString && yearString.length === 4) {
            growthMap[yearString] = (growthMap[yearString] || 0) + 1;
        }
    });

    // Convert to cumulative series for "Growth"
    const sortedYears = Object.keys(growthMap).sort();
    let cumulative = 0;
    const growthData = sortedYears.map(year => {
        cumulative += growthMap[year];
        return { name: year, value: cumulative };
    });

    // If empty (no valid dates), fallback to a basic placeholder using index
    if (growthData.length === 0) {
        growthData.push({ name: '2023', value: Math.floor(totalFarmers * 0.3) });
        growthData.push({ name: '2024', value: Math.floor(totalFarmers * 0.7) });
        growthData.push({ name: '2025', value: totalFarmers });
    }
    
    // Recent Farmers (Last 5)
    // Assuming mock data is static, reverse it to show first ones added as recent for demo
    const recentFarmers = [...this.farmers].reverse().slice(0, 5);

    return {
      stats: {
        totalFarmers,
        youthOwnedPercentage,
        totalEmployees,
        femaleEmployees,
        youthEmployees,
        districtsCovered: districts.size,
        topValueChain
      },
      districtData,
      revenueData,
      businessSizeData,
      growthData,
      recentFarmers,
      valueChainData,
      ownershipData
    };
  }
}

export const farmerService = new FarmerService();
