import { Router, Response } from 'express';
import { Farmer } from '../models';
import { protect, AuthRequest } from '../middleware';
import { GraphData } from '../types';

const router = Router();

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/analytics
 * @desc    Get comprehensive analytics data
 * @access  Private
 */
router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const farmers = await Farmer.find();

    // Province Distribution
    const provinceCounts: Record<string, number> = {};
    farmers.forEach((f) => {
      if (f.province) {
        provinceCounts[f.province] = (provinceCounts[f.province] || 0) + 1;
      }
    });
    const provinceData: GraphData[] = Object.entries(provinceCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Gender Distribution
    const genderCounts: Record<string, number> = {};
    farmers.forEach((f) => {
      const gender = f.gender || 'Not specified';
      genderCounts[gender] = (genderCounts[gender] || 0) + 1;
    });
    const genderData: GraphData[] = Object.entries(genderCounts).map(([name, value]) => ({
      name,
      value,
    }));

    // Age Distribution
    const ageBrackets: Record<string, number> = {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-55': 0,
      '55+': 0,
    };
    farmers.forEach((f) => {
      const age = f.ownerAge || 0;
      if (age >= 18 && age <= 25) ageBrackets['18-25']++;
      else if (age >= 26 && age <= 35) ageBrackets['26-35']++;
      else if (age >= 36 && age <= 45) ageBrackets['36-45']++;
      else if (age >= 46 && age <= 55) ageBrackets['46-55']++;
      else if (age > 55) ageBrackets['55+']++;
    });
    const ageData: GraphData[] = Object.entries(ageBrackets).map(([name, value]) => ({
      name,
      value,
    }));

    // Education Level Distribution
    const educationCounts: Record<string, number> = {};
    farmers.forEach((f) => {
      let edu = f.educationLevel || 'Not specified';
      // Normalize education levels
      if (edu.toLowerCase().includes('primary')) edu = 'Primary';
      else if (edu.toLowerCase().includes('secondary')) edu = 'Secondary';
      else if (edu.toLowerCase().includes('bachelor') || edu.toLowerCase().includes('university')) edu = 'University';
      else if (edu.toLowerCase().includes('tvet') || edu.toLowerCase().includes('vocational') || edu.toLowerCase().includes('diploma')) edu = 'Vocational/TVET';
      else if (edu.toLowerCase() === 'none' || edu === '') edu = 'None';
      
      educationCounts[edu] = (educationCounts[edu] || 0) + 1;
    });
    const educationData: GraphData[] = Object.entries(educationCounts).map(([name, value]) => ({
      name,
      value,
    }));

    // Business Type Distribution
    const businessTypeCounts: Record<string, number> = {};
    farmers.forEach((f) => {
      let type = f.businessType || 'Unknown';
      // Simplify business types
      if (type.includes('Individual')) type = 'Individual';
      else if (type.includes('Cooperative')) type = 'Cooperative';
      else if (type.includes('Formal')) type = 'Formal Enterprise';
      else if (type.includes('Informal')) type = 'Informal Enterprise';
      else if (type.includes('Association')) type = 'Association';
      
      businessTypeCounts[type] = (businessTypeCounts[type] || 0) + 1;
    });
    const businessTypeData: GraphData[] = Object.entries(businessTypeCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Disability Status Distribution
    const disabilityCounts: Record<string, number> = {};
    farmers.forEach((f) => {
      const status = f.disabilityStatus || 'None';
      disabilityCounts[status] = (disabilityCounts[status] || 0) + 1;
    });
    const disabilityData: GraphData[] = Object.entries(disabilityCounts).map(([name, value]) => ({
      name,
      value,
    }));

    // Support Types Distribution
    const supportCounts: Record<string, number> = {};
    farmers.forEach((f) => {
      if (f.supportReceived) {
        // Split support types as they can be comma-separated
        const supports = f.supportReceived.split(',').map((s) => s.trim());
        supports.forEach((support) => {
          if (support) {
            // Shorten long support descriptions
            let shortSupport = support;
            if (support.includes('Training')) shortSupport = 'Training';
            else if (support.includes('eCommerce')) shortSupport = 'eCommerce Onboarding';
            else if (support.includes('digital')) shortSupport = 'Digital Content Support';
            
            supportCounts[shortSupport] = (supportCounts[shortSupport] || 0) + 1;
          }
        });
      }
    });
    const supportData: GraphData[] = Object.entries(supportCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Monthly Registration Trend (current year)
    const currentYear = new Date().getFullYear();
    const monthlyTrend: Record<string, number> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach((m) => {
      monthlyTrend[m] = 0;
    });

    farmers.forEach((f) => {
      if (f.createdAt) {
        const date = new Date(f.createdAt);
        if (date.getFullYear() === currentYear) {
          const month = months[date.getMonth()];
          monthlyTrend[month]++;
        }
      }
    });

    const monthlyTrendData: GraphData[] = months.map((month) => ({
      name: month,
      value: monthlyTrend[month],
    }));

    // Employees by Province
    const employeesByProvince: Record<string, number> = {};
    farmers.forEach((f) => {
      if (f.province) {
        employeesByProvince[f.province] =
          (employeesByProvince[f.province] || 0) + (f.employees || 0);
      }
    });
    const employeesByProvinceData: GraphData[] = Object.entries(employeesByProvince)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    res.json({
      success: true,
      data: {
        provinceData,
        genderData,
        ageData,
        educationData,
        businessTypeData,
        disabilityData,
        supportData,
        monthlyTrendData,
        employeesByProvinceData,
        totalFarmers: farmers.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

/**
 * @route   GET /api/analytics/export
 * @desc    Get data formatted for export
 * @access  Private
 */
router.get('/export', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const farmers = await Farmer.find().sort({ farmerId: 1 });

    res.json({
      success: true,
      count: farmers.length,
      data: farmers,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

export default router;
