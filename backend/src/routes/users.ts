import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models';
import { protect, authorize, AuthRequest } from '../middleware';

const router = Router();

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (Admin, Super Admin)
 */
router.get(
  '/',
  authorize('Super Admin', 'Admin'),
  async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const users = await User.find().sort({ createdAt: -1 });

      res.json({
        success: true,
        count: users.length,
        data: users,
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
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin, Super Admin)
 */
router.get(
  '/:id',
  authorize('Super Admin', 'Admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        data: user,
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
 * @route   POST /api/users
 * @desc    Create a new user (admin creates user)
 * @access  Private (Super Admin only)
 */
router.post(
  '/',
  authorize('Super Admin'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .isIn(['Super Admin', 'Admin', 'Viewer'])
      .withMessage('Invalid role'),
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

      const { name, email, password, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'User with this email already exists',
        });
        return;
      }

      const user = await User.create({
        name,
        email,
        password,
        role,
      });

      res.status(201).json({
        success: true,
        data: user,
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
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Super Admin, or self)
 */
router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Please enter a valid email'),
    body('role')
      .optional()
      .isIn(['Super Admin', 'Admin', 'Viewer'])
      .withMessage('Invalid role'),
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

      // Check authorization: Super Admin can update anyone, others can only update self
      const isSelf = req.user?._id.toString() === req.params.id;
      const isSuperAdmin = req.user?.role === 'Super Admin';

      if (!isSelf && !isSuperAdmin) {
        res.status(403).json({
          success: false,
          message: 'Not authorized to update this user',
        });
        return;
      }

      // Prevent non-super-admins from changing role
      if (!isSuperAdmin && req.body.role) {
        res.status(403).json({
          success: false,
          message: 'Only Super Admin can change user roles',
        });
        return;
      }

      const { name, email, role } = req.body;
      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (role && isSuperAdmin) updateData.role = role;

      const user = await User.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        data: user,
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
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private (Super Admin only)
 */
router.delete(
  '/:id',
  authorize('Super Admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Prevent self-deletion
      if (req.user?._id.toString() === req.params.id) {
        res.status(400).json({
          success: false,
          message: 'Cannot delete your own account',
        });
        return;
      }

      const user = await User.findByIdAndDelete(req.params.id);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Server error',
      });
    }
  }
);

export default router;
