import { Router, Response } from 'express';
import { Farmer } from '../models';
import { protect, AuthRequest } from '../middleware';
import { DashboardData, DashboardStats, GraphData } from '../types';

const router = Router();

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/dashboard
 * @desc    Get dashboard data including stats and charts
 * @access  Private
 */
router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const farmers = await Farmer.find();

    const totalFarmers = farmers.length;

    // Demographics Stats
    const youthOwnedCount = farmers.filter((f) => f.ownership === 'Youth-owned').length;
    const youthOwnedPercentage =
      totalFarmers > 0 ? Math.round((youthOwnedCount / totalFarmers) * 100) : 0;

    // Employee Stats
    const totalEmployees = farmers.reduce((sum, f) => sum + (Number(f.employees) || 0), 0);
    const femaleEmployees = farmers.reduce(
      (sum, f) => sum + (Number(f.femaleEmployees) || 0),
      0
    );
    const youthEmployees = farmers.reduce(
      (sum, f) => sum + (Number(f.youthEmployees) || 0),
      0
    );

    // District Distribution
    const districtCounts: Record<string, number> = {};
    const districts = new Set<string>();
    farmers.forEach((f) => {
      if (f.district) {
        districts.add(f.district);
        districtCounts[f.district] = (districtCounts[f.district] || 0) + 1;
      }
    });

    const districtData: GraphData[] = Object.entries(districtCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Value Chain Analysis
    const valueChains: Record<string, number> = {};
    farmers.forEach((f) => {
      if (f.valueChain) {
        const shortVC = f.valueChain.length > 30 ? f.valueChain.substring(0, 30) + '...' : f.valueChain;
        valueChains[shortVC] = (valueChains[shortVC] || 0) + 1;
      }
    });

    const valueChainData: GraphData[] = Object.entries(valueChains)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const topValueChain = valueChainData[0]?.name || 'N/A';

    // Revenue Distribution
    const revenueCounts: Record<string, number> = {};
    farmers.forEach((f) => {
      let rev = f.annualIncome || f.revenue || 'Unknown';
      if (rev.includes('Less than')) rev = '< 840k';
      else if (rev.includes('Between 840')) rev = '840k-1.2M';
      else if (rev.includes('1,200,000') || rev.includes('1.2M')) rev = '1.2M-2.4M';
      else if (rev.includes('2,400,000') || rev.includes('2.4M')) rev = '2.4M-3.6M';
      else if (rev.includes('3,600,000') || rev.includes('3.6M')) rev = '> 3.6M';
      else if (rev.includes('Above')) rev = '> 4.8M';

      revenueCounts[rev] = (revenueCounts[rev] || 0) + 1;
    });

    const revenueData: GraphData[] = Object.entries(revenueCounts).map(([name, value]) => ({
      name,
      value,
    }));

    // Business Size Distribution
    const sizeCounts: Record<string, number> = {};
    farmers.forEach((f) => {
      let size = f.businessSize || 'Unknown';
      if (size.includes('Micro')) size = 'Micro';
      if (size.includes('Small')) size = 'Small';
      if (size.includes('Medium')) size = 'Medium';
      if (size.includes('Large')) size = 'Large';
      sizeCounts[size] = (sizeCounts[size] || 0) + 1;
    });

    const businessSizeData: GraphData[] = Object.entries(sizeCounts).map(([name, value]) => ({
      name,
      value,
    }));

    // Ownership Distribution
    const ownershipCounts: Record<string, number> = {};
    farmers.forEach((f) => {
      const own = f.ownership || 'Other';
      ownershipCounts[own] = (ownershipCounts[own] || 0) + 1;
    });
    const ownershipData: GraphData[] = Object.entries(ownershipCounts).map(([name, value]) => ({
      name,
      value,
    }));

    // Growth Trend (by month of commencement)
    const growthMap: Record<string, number> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Initialize all months
    months.forEach((m) => {
      growthMap[m] = 0;
    });

    farmers.forEach((f) => {
      if (f.commencementDate) {
        try {
          const date = new Date(f.commencementDate);
          if (!isNaN(date.getTime())) {
            const month = months[date.getMonth()];
            growthMap[month] = (growthMap[month] || 0) + 1;
          }
        } catch {
          // Skip invalid dates
        }
      }
    });

    const growthData: GraphData[] = months.map((month) => ({
      name: month,
      value: growthMap[month],
    }));

    // Recent Farmers
    const recentFarmers = await Farmer.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Build stats
    const stats: DashboardStats = {
      totalFarmers,
      youthOwnedPercentage,
      totalEmployees,
      topValueChain,
      districtsCovered: districts.size,
      femaleEmployees,
      youthEmployees,
    };

    const dashboardData: DashboardData = {
      stats,
      districtData,
      revenueData,
      businessSizeData,
      recentFarmers: recentFarmers.map((f) => f.toJSON()),
      growthData,
      valueChainData,
      ownershipData,
    };

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get only dashboard stats (lighter endpoint)
 * @access  Private
 */
router.get('/stats', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalFarmers = await Farmer.countDocuments();
    const youthOwnedCount = await Farmer.countDocuments({ ownership: 'Youth-owned' });
    const youthOwnedPercentage =
      totalFarmers > 0 ? Math.round((youthOwnedCount / totalFarmers) * 100) : 0;

    const employeeStats = await Farmer.aggregate([
      {
        $group: {
          _id: null,
          totalEmployees: { $sum: '$employees' },
          femaleEmployees: { $sum: '$femaleEmployees' },
          youthEmployees: { $sum: '$youthEmployees' },
        },
      },
    ]);

    const districtCount = await Farmer.distinct('district');

    const stats = {
      totalFarmers,
      youthOwnedPercentage,
      totalEmployees: employeeStats[0]?.totalEmployees || 0,
      femaleEmployees: employeeStats[0]?.femaleEmployees || 0,
      youthEmployees: employeeStats[0]?.youthEmployees || 0,
      districtsCovered: districtCount.length,
      topValueChain: 'N/A',
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

export default router;
