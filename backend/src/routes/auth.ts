import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { User } from '../models';
import { generateToken, protect, AuthRequest } from '../middleware';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
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

      // Create new user
      const user = await User.create({
        name,
        email,
        password,
        role: role || 'Viewer',
      });

      // Generate token
      const token = generateToken(user);

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          twoFactorEnabled: user.twoFactorEnabled,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Server error during registration',
      });
    }
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return token (with 2FA check)
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    body('twoFactorCode').optional().isString(),
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

      const { email, password, twoFactorCode } = req.body;

      // Find user and include password for comparison
      const user = await User.findOne({ email }).select('+password +twoFactorSecret');
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
        return;
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
        return;
      }

      // Check if 2FA is enabled
      if (user.twoFactorEnabled && user.twoFactorSecret) {
        // If 2FA is enabled, require the code
        if (!twoFactorCode) {
          res.status(200).json({
            success: true,
            requiresTwoFactor: true,
            message: 'Two-factor authentication code required',
          });
          return;
        }

        // Verify the 2FA code
        const verified = speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: 'base32',
          token: twoFactorCode,
          window: 1, // Allow 1 step tolerance
        });

        if (!verified) {
          res.status(401).json({
            success: false,
            message: 'Invalid two-factor authentication code',
          });
          return;
        }
      }

      // Generate token
      const token = generateToken(user);

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
          twoFactorEnabled: user.twoFactorEnabled,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Server error during login',
      });
    }
  }
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
router.get('/me', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt,
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
 * @route   PUT /api/auth/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put(
  '/profile',
  protect,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Please enter a valid email'),
    body('phone').optional().isString(),
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

      const { name, email, phone } = req.body;
      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;

      const user = await User.findByIdAndUpdate(req.user?._id, updateData, {
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
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          twoFactorEnabled: user.twoFactorEnabled,
        },
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
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal, server can blacklist if needed)
 * @access  Private
 */
router.post('/logout', protect, (_req: AuthRequest, res: Response): void => {
  // In a stateless JWT setup, logout is handled client-side
  // For enhanced security, you could implement token blacklisting here
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * @route   PUT /api/auth/password
 * @desc    Update password
 * @access  Private
 */
router.put(
  '/password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
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

      const { currentPassword, newPassword } = req.body;

      // Get user with password
      const user = await User.findById(req.user?._id).select('+password');
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // Check current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
        });
        return;
      }

      // Update password
      user.password = newPassword;
      await user.save();

      // Generate new token
      const token = generateToken(user);

      res.json({
        success: true,
        message: 'Password updated successfully',
        token,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Server error',
      });
    }
  }
);

// ============== 2FA ENDPOINTS ==============

/**
 * @route   POST /api/auth/2fa/setup
 * @desc    Generate 2FA secret and QR code for setup
 * @access  Private
 */
router.post('/2fa/setup', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Generate a new secret
    const secret = speakeasy.generateSecret({
      name: `AfriFarmers (${user.email})`,
      issuer: 'AfriFarmers Admin',
      length: 20,
    });

    // Store temporary secret (not enabled yet)
    user.twoFactorTempSecret = secret.base32;
    await user.save();

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url || '');

    res.json({
      success: true,
      data: {
        secret: secret.base32,
        qrCode: qrCodeDataUrl,
        otpauthUrl: secret.otpauth_url,
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
 * @route   POST /api/auth/2fa/verify
 * @desc    Verify 2FA code and enable 2FA
 * @access  Private
 */
router.post(
  '/2fa/verify',
  protect,
  [body('code').notEmpty().withMessage('Verification code is required')],
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

      const { code } = req.body;

      const user = await User.findById(req.user?._id).select('+twoFactorTempSecret');
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      if (!user.twoFactorTempSecret) {
        res.status(400).json({
          success: false,
          message: 'Please setup 2FA first by calling /2fa/setup',
        });
        return;
      }

      // Verify the code against temp secret
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorTempSecret,
        encoding: 'base32',
        token: code,
        window: 1,
      });

      if (!verified) {
        res.status(400).json({
          success: false,
          message: 'Invalid verification code. Please try again.',
        });
        return;
      }

      // Code is valid - move temp secret to permanent and enable 2FA
      user.twoFactorSecret = user.twoFactorTempSecret;
      user.twoFactorTempSecret = undefined;
      user.twoFactorEnabled = true;
      await user.save();

      res.json({
        success: true,
        message: 'Two-factor authentication enabled successfully',
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
 * @route   POST /api/auth/2fa/disable
 * @desc    Disable 2FA (requires password confirmation)
 * @access  Private
 */
router.post(
  '/2fa/disable',
  protect,
  [body('password').notEmpty().withMessage('Password is required to disable 2FA')],
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

      const { password } = req.body;

      const user = await User.findById(req.user?._id).select('+password');
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: 'Incorrect password',
        });
        return;
      }

      // Disable 2FA
      user.twoFactorEnabled = false;
      user.twoFactorSecret = undefined;
      user.twoFactorTempSecret = undefined;
      await user.save();

      res.json({
        success: true,
        message: 'Two-factor authentication disabled',
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
 * @route   GET /api/auth/2fa/status
 * @desc    Get current 2FA status
 * @access  Private
 */
router.get('/2fa/status', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        enabled: user.twoFactorEnabled,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

export default router;
