import { Router, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { Farmer } from '../models';
import { protect, authorize, AuthRequest } from '../middleware';

const router = Router();

// All routes require authentication
router.use(protect);

// Helper to transform farmer document to include 'id' field for frontend compatibility
const transformFarmer = (farmer: any) => {
  const obj = farmer.toObject ? farmer.toObject() : farmer;
  return {
    ...obj,
    id: obj.farmerId, // Frontend expects 'id' field
  };
};

/**
 * @route   GET /api/farmers
 * @desc    Get all farmers with optional filtering, search, and pagination
 * @access  Private
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
    query('search').optional().isString(),
    query('district').optional().isString(),
    query('province').optional().isString(),
    query('ownership').optional().isIn(['Youth-owned', 'Non youth-owned']),
    query('status').optional().isIn(['Active', 'Pending', 'Inactive']),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      // Build query
      const queryObj: any = {};

      // Filters
      if (req.query.district) queryObj.district = new RegExp(req.query.district as string, 'i');
      if (req.query.province) queryObj.province = new RegExp(req.query.province as string, 'i');
      if (req.query.ownership) queryObj.ownership = req.query.ownership;
      if (req.query.status) queryObj.status = req.query.status;

      // Search across multiple fields
      if (req.query.search) {
        const searchRegex = new RegExp(req.query.search as string, 'i');
        queryObj.$or = [
          { businessName: searchRegex },
          { ownerName: searchRegex },
          { district: searchRegex },
          { phone: searchRegex },
          { valueChain: searchRegex },
        ];
      }

      // Pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 0; // 0 means no limit
      const skip = (page - 1) * limit;

      // Execute query
      let query = Farmer.find(queryObj).sort({ createdAt: -1 });
      
      if (limit > 0) {
        query = query.skip(skip).limit(limit);
      }

      const [farmers, total] = await Promise.all([
        query,
        Farmer.countDocuments(queryObj),
      ]);

      // Transform farmers to include 'id' field for frontend
      const transformedFarmers = farmers.map(transformFarmer);

      res.json({
        success: true,
        count: farmers.length,
        total,
        page,
        pages: limit > 0 ? Math.ceil(total / limit) : 1,
        data: transformedFarmers,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Server error',
      });
    }
  }
);

/**
 * @route   GET /api/farmers/:id
 * @desc    Get farmer by ID
 * @access  Private
 */
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const farmerId = parseInt(req.params.id);
    
    // Try to find by farmerId (numeric) first, then by MongoDB _id
    let farmer = await Farmer.findOne({ farmerId });
    
    if (!farmer) {
      farmer = await Farmer.findById(req.params.id);
    }

    if (!farmer) {
      res.status(404).json({
        success: false,
        message: 'Farmer not found',
      });
      return;
    }

    res.json({
      success: true,
      data: transformFarmer(farmer),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

/**
 * @route   POST /api/farmers
 * @desc    Create a new farmer
 * @access  Private (Admin, Super Admin)
 */
router.post(
  '/',
  authorize('Super Admin', 'Admin'),
  [
    body('businessName').trim().notEmpty().withMessage('Business name is required'),
    body('ownership').isIn(['Youth-owned', 'Non youth-owned']).withMessage('Invalid ownership type'),
    body('commencementDate').notEmpty().withMessage('Commencement date is required'),
    body('province').trim().notEmpty().withMessage('Province is required'),
    body('district').trim().notEmpty().withMessage('District is required'),
    body('sector').trim().notEmpty().withMessage('Sector is required'),
    body('cell').trim().notEmpty().withMessage('Cell is required'),
    body('village').trim().notEmpty().withMessage('Village is required'),
    body('ownerName').trim().notEmpty().withMessage('Owner name is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('businessType').trim().notEmpty().withMessage('Business type is required'),
    body('ownerAge').isInt({ min: 18 }).withMessage('Owner must be at least 18 years old'),
    body('valueChain').trim().notEmpty().withMessage('Value chain is required'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      // Get next farmerId
      const lastFarmer = await Farmer.findOne().sort({ farmerId: -1 }).select('farmerId');
      const nextFarmerId = lastFarmer ? lastFarmer.farmerId + 1 : 1;

      const farmerData = {
        ...req.body,
        farmerId: nextFarmerId,
        status: req.body.status || 'Active',
      };

      const farmer = await Farmer.create(farmerData);

      res.status(201).json({
        success: true,
        data: transformFarmer(farmer),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Server error',
      });
    }
  }
);

/**
 * @route   PUT /api/farmers/:id
 * @desc    Update farmer
 * @access  Private (Admin, Super Admin)
 */
router.put(
  '/:id',
  authorize('Super Admin', 'Admin'),
  [
    body('businessName').optional().trim().notEmpty().withMessage('Business name cannot be empty'),
    body('ownership').optional().isIn(['Youth-owned', 'Non youth-owned']).withMessage('Invalid ownership type'),
    body('ownerAge').optional().isInt({ min: 18 }).withMessage('Owner must be at least 18 years old'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const farmerId = parseInt(req.params.id);
      
      console.log('📝 UPDATE REQUEST');
      console.log('   farmerId from URL:', farmerId);
      console.log('   req.body keys:', Object.keys(req.body));

      // Remove fields that shouldn't be updated
      const { farmerId: _, _id, id, __v, createdAt, updatedAt, ...updateData } = req.body;
      
      console.log('   updateData keys:', Object.keys(updateData));
      console.log('   businessName in update:', updateData.businessName);

      // Try to find by farmerId first, then by MongoDB _id
      let farmer = await Farmer.findOneAndUpdate(
        { farmerId },
        updateData,
        { new: true, runValidators: true }
      );
      
      console.log('   farmer found by farmerId?', !!farmer);

      if (!farmer) {
        farmer = await Farmer.findByIdAndUpdate(
          req.params.id,
          updateData,
          { new: true, runValidators: true }
        );
      }

      if (!farmer) {
        res.status(404).json({
          success: false,
          message: 'Farmer not found',
        });
        return;
      }

      res.json({
        success: true,
        data: transformFarmer(farmer),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Server error',
      });
    }
  }
);

/**
 * @route   DELETE /api/farmers/:id
 * @desc    Delete farmer
 * @access  Private (Admin, Super Admin)
 */
router.delete(
  '/:id',
  authorize('Super Admin', 'Admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const farmerId = parseInt(req.params.id);

      // Try to find by farmerId first, then by MongoDB _id
      let farmer = await Farmer.findOneAndDelete({ farmerId });

      if (!farmer) {
        farmer = await Farmer.findByIdAndDelete(req.params.id);
      }

      if (!farmer) {
        res.status(404).json({
          success: false,
          message: 'Farmer not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Farmer deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Server error',
      });
    }
  }
);

/**
 * @route   POST /api/farmers/bulk
 * @desc    Bulk import farmers
 * @access  Private (Super Admin only)
 */
router.post(
  '/bulk',
  authorize('Super Admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { farmers } = req.body;

      if (!Array.isArray(farmers) || farmers.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Please provide an array of farmers',
        });
        return;
      }

      // Get starting farmerId
      const lastFarmer = await Farmer.findOne().sort({ farmerId: -1 }).select('farmerId');
      let nextFarmerId = lastFarmer ? lastFarmer.farmerId + 1 : 1;

      // Prepare farmers with IDs
      const farmersWithIds = farmers.map((farmer: any) => ({
        ...farmer,
        farmerId: nextFarmerId++,
        status: farmer.status || 'Active',
      }));

      const result = await Farmer.insertMany(farmersWithIds, { ordered: false });

      res.status(201).json({
        success: true,
        count: result.length,
        message: `Successfully imported ${result.length} farmers`,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Server error during bulk import',
      });
    }
  }
);

export default router;
