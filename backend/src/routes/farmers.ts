import { Router, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import multer from 'multer';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { Farmer } from '../models';
import { protect, authorize, AuthRequest } from '../middleware';

const router = Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];
    if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(xlsx|xls)$/)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    }
  },
});

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
 * @route   GET /api/farmers/template
 * @desc    Download Excel template for bulk import with dropdown validations
 * @access  Private (Admin+)
 */
router.get(
  '/template',
  authorize('Super Admin', 'Admin'),
  async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Create workbook using ExcelJS for proper data validation support
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'AfriFarmers Admin System';
      workbook.created = new Date();

      // =============== MAIN TEMPLATE SHEET ===============
      const ws = workbook.addWorksheet('Farmers Template', {
        views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }], // Freeze header row
      });

      // Define columns with headers and widths
      ws.columns = [
        { header: 'Business Name*', key: 'businessName', width: 25 },
        { header: 'Owner Name*', key: 'ownerName', width: 20 },
        { header: 'Phone*', key: 'phone', width: 15 },
        { header: 'Province*', key: 'province', width: 12 },
        { header: 'District*', key: 'district', width: 15 },
        { header: 'Sector*', key: 'sector', width: 12 },
        { header: 'Cell*', key: 'cell', width: 12 },
        { header: 'Village*', key: 'village', width: 15 },
        { header: 'Ownership*', key: 'ownership', width: 18 },
        { header: 'Business Type*', key: 'businessType', width: 18 },
        { header: 'Value Chain*', key: 'valueChain', width: 15 },
        { header: 'Commencement Date*', key: 'commencementDate', width: 18 },
        { header: 'Owner Age*', key: 'ownerAge', width: 12 },
        { header: 'Education Level', key: 'educationLevel', width: 15 },
        { header: 'Gender', key: 'gender', width: 10 },
        { header: 'TIN', key: 'tin', width: 15 },
        { header: 'NID', key: 'nid', width: 20 },
        { header: 'Nationality', key: 'nationality', width: 12 },
        { header: 'Business Size', key: 'businessSize', width: 12 },
        { header: 'Employees', key: 'employees', width: 12 },
        { header: 'Female Employees', key: 'femaleEmployees', width: 16 },
        { header: 'Youth Employees', key: 'youthEmployees', width: 16 },
        { header: 'Revenue', key: 'revenue', width: 28 },
        { header: 'Annual Income', key: 'annualIncome', width: 28 },
        { header: 'Disability Status', key: 'disabilityStatus', width: 15 },
        { header: 'Participant Type', key: 'participantType', width: 18 },
        { header: 'Company Description', key: 'companyDescription', width: 40 },
        { header: 'Support Received', key: 'supportReceived', width: 25 },
        { header: 'Status', key: 'status', width: 10 },
        // Crops/Production fields
        { header: 'Crop 1 Name', key: 'crop1Name', width: 15 },
        { header: 'Crop 1 Quantity', key: 'crop1Qty', width: 14 },
        { header: 'Crop 1 Unit', key: 'crop1Unit', width: 12 },
        { header: 'Crop 2 Name', key: 'crop2Name', width: 15 },
        { header: 'Crop 2 Quantity', key: 'crop2Qty', width: 14 },
        { header: 'Crop 2 Unit', key: 'crop2Unit', width: 12 },
        { header: 'Crop 3 Name', key: 'crop3Name', width: 15 },
        { header: 'Crop 3 Quantity', key: 'crop3Qty', width: 14 },
        { header: 'Crop 3 Unit', key: 'crop3Unit', width: 12 },
      ];

      // Style header row
      ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      ws.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0D5F2C' }, // Dark green
      };
      ws.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
      ws.getRow(1).height = 25;

      // Add sample data row
      ws.addRow({
        businessName: 'Example Farm Ltd',
        ownerName: 'John Doe',
        phone: '0781234567',
        province: 'Kigali',
        district: 'Gasabo',
        sector: 'Remera',
        cell: 'Rukiri',
        village: 'Nyabisindu',
        ownership: 'Youth-owned',
        businessType: 'Crop Production',
        valueChain: 'Horticulture',
        commencementDate: '2020-01-15',
        ownerAge: 30,
        educationLevel: 'Bachelor',
        gender: 'Male',
        tin: '123456789',
        nid: '1199012345678901',
        nationality: 'Rwandan',
        businessSize: 'Micro',
        employees: 5,
        femaleEmployees: 2,
        youthEmployees: 3,
        revenue: '1M - 5M RWF',
        annualIncome: '500K - 1M RWF',
        disabilityStatus: 'None',
        participantType: 'Direct Beneficiary',
        companyDescription: 'A small-scale vegetable farming business',
        supportReceived: 'Training, Seeds',
        status: 'Active',
        crop1Name: 'Tomatoes',
        crop1Qty: 500,
        crop1Unit: 'Kg',
        crop2Name: 'Cabbage',
        crop2Qty: 300,
        crop2Unit: 'Kg',
        crop3Name: '',
        crop3Qty: '',
        crop3Unit: '',
      });

      // Style sample row (light gray background to indicate it should be deleted)
      ws.getRow(2).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF0F0F0' },
      };

      // Define dropdown options
      const dropdownOptions = {
        province: ['Kigali', 'Northern', 'Southern', 'Eastern', 'Western'],
        ownership: ['Youth-owned', 'Non youth-owned'],
        educationLevel: ['None', 'Primary', 'Secondary', 'TVET', 'Bachelor', 'Master', 'PhD'],
        gender: ['Male', 'Female', 'Other'],
        nationality: ['Rwandan', 'Burundian', 'Congolese', 'Ugandan', 'Kenyan', 'Tanzanian', 'Other'],
        businessSize: ['Micro', 'Small', 'Medium', 'Large'],
        revenue: ['< 500K RWF', '500K - 1M RWF', '1M - 5M RWF', '5M - 10M RWF', '> 10M RWF'],
        annualIncome: ['< 200K RWF', '200K - 500K RWF', '500K - 1M RWF', '1M - 5M RWF', '> 5M RWF'],
        disabilityStatus: ['None', 'Physical', 'Visual', 'Hearing', 'Mental', 'Other'],
        status: ['Active', 'Pending', 'Inactive'],
        businessType: ['Crop Production', 'Livestock', 'Agro-processing', 'Trading', 'Services', 'Mixed Farming'],
        valueChain: ['Horticulture', 'Cereals', 'Dairy', 'Poultry', 'Fisheries', 'Coffee', 'Tea', 'Other'],
        participantType: ['Direct Beneficiary', 'Indirect Beneficiary', 'Lead Farmer', 'Cooperative Member', 'Other'],
        cropUnit: ['Kg', 'Tons', 'Bags', 'Crates', 'Bunches', 'Liters', 'Pieces'],
        cropName: ['Tomatoes', 'Cabbage', 'Carrots', 'Onions', 'Beans', 'Maize', 'Rice', 'Potatoes', 'Bananas', 'Coffee', 'Tea', 'Cassava', 'Sweet Potatoes', 'Sorghum', 'Other'],
      };

      // Apply data validation (dropdowns) for rows 2-500
      const maxRow = 500;

      // Column D - Province
      for (let row = 2; row <= maxRow; row++) {
        ws.getCell(`D${row}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`"${dropdownOptions.province.join(',')}"`],
        };
      }

      // Column I - Ownership
      for (let row = 2; row <= maxRow; row++) {
        ws.getCell(`I${row}`).dataValidation = {
          type: 'list',
          allowBlank: false,
          formulae: [`"${dropdownOptions.ownership.join(',')}"`],
        };
      }

      // Column J - Business Type
      for (let row = 2; row <= maxRow; row++) {
        ws.getCell(`J${row}`).dataValidation = {
          type: 'list',
          allowBlank: false,
          formulae: [`"${dropdownOptions.businessType.join(',')}"`],
        };
      }

      // Column K - Value Chain
      for (let row = 2; row <= maxRow; row++) {
        ws.getCell(`K${row}`).dataValidation = {
          type: 'list',
          allowBlank: false,
          formulae: [`"${dropdownOptions.valueChain.join(',')}"`],
        };
      }

      // Column N - Education Level
      for (let row = 2; row <= maxRow; row++) {
        ws.getCell(`N${row}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`"${dropdownOptions.educationLevel.join(',')}"`],
        };
      }

      // Column O - Gender
      for (let row = 2; row <= maxRow; row++) {
        ws.getCell(`O${row}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`"${dropdownOptions.gender.join(',')}"`],
        };
      }

      // Column R - Nationality
      for (let row = 2; row <= maxRow; row++) {
        ws.getCell(`R${row}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`"${dropdownOptions.nationality.join(',')}"`],
        };
      }

      // Column S - Business Size
      for (let row = 2; row <= maxRow; row++) {
        ws.getCell(`S${row}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`"${dropdownOptions.businessSize.join(',')}"`],
        };
      }

      // Column W - Revenue
      for (let row = 2; row <= maxRow; row++) {
        ws.getCell(`W${row}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`"${dropdownOptions.revenue.join(',')}"`],
        };
      }

      // Column X - Annual Income
      for (let row = 2; row <= maxRow; row++) {
        ws.getCell(`X${row}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`"${dropdownOptions.annualIncome.join(',')}"`],
        };
      }

      // Column Y - Disability Status
      for (let row = 2; row <= maxRow; row++) {
        ws.getCell(`Y${row}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`"${dropdownOptions.disabilityStatus.join(',')}"`],
        };
      }

      // Column Z - Participant Type
      for (let row = 2; row <= maxRow; row++) {
        ws.getCell(`Z${row}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`"${dropdownOptions.participantType.join(',')}"`],
        };
      }

      // Column AC - Status
      for (let row = 2; row <= maxRow; row++) {
        ws.getCell(`AC${row}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`"${dropdownOptions.status.join(',')}"`],
        };
      }

      // Crop Name columns (AD, AG, AJ)
      ['AD', 'AG', 'AJ'].forEach(col => {
        for (let row = 2; row <= maxRow; row++) {
          ws.getCell(`${col}${row}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [`"${dropdownOptions.cropName.join(',')}"`],
          };
        }
      });

      // Crop Unit columns (AF, AI, AL)
      ['AF', 'AI', 'AL'].forEach(col => {
        for (let row = 2; row <= maxRow; row++) {
          ws.getCell(`${col}${row}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [`"${dropdownOptions.cropUnit.join(',')}"`],
          };
        }
      });

      // =============== INSTRUCTIONS SHEET ===============
      const wsInstructions = workbook.addWorksheet('Instructions');
      
      wsInstructions.columns = [{ width: 80 }];
      
      const instructions = [
        ['BULK IMPORT TEMPLATE - INSTRUCTIONS'],
        [''],
        ['HOW TO USE:'],
        ['1. Fill in the data starting from row 2 (row 1 contains headers)'],
        ['2. Fields marked with * are REQUIRED'],
        ['3. Do NOT modify the column headers'],
        ['4. Click on cells to see dropdown options where available'],
        ['5. Delete the sample row (row 2) before uploading'],
        [''],
        ['DROPDOWN FIELDS (Click cell to see arrow, then click arrow):'],
        ['• Province - Select from Rwanda provinces'],
        ['• Ownership* - Youth-owned or Non youth-owned'],
        ['• Business Type* - Type of business'],
        ['• Value Chain* - Agricultural value chain'],
        ['• Education Level - None to PhD'],
        ['• Gender - Male, Female, or Other'],
        ['• Nationality - Common nationalities'],
        ['• Business Size - Micro, Small, Medium, Large'],
        ['• Revenue - Revenue brackets'],
        ['• Annual Income - Income brackets'],
        ['• Disability Status - None or type of disability'],
        ['• Participant Type - Type of program participant'],
        ['• Status - Active, Pending, or Inactive'],
        ['• Crop Names - Common crops'],
        ['• Crop Units - Measurement units'],
        [''],
        ['CROPS/PRODUCTION FIELDS:'],
        ['• You can add up to 3 crops per business'],
        ['• For each crop: Name, Quantity, and Unit'],
        ['• Leave blank if no crops to add'],
        [''],
        ['FIELD GUIDELINES:'],
        ['• Phone: Rwanda format (e.g., 0781234567)'],
        ['• Commencement Date: Format YYYY-MM-DD (e.g., 2020-01-15)'],
        ['• Owner Age: Must be 18 or older'],
        ['• Employees: Numeric values (0 or more)'],
        ['• TIN: Tax Identification Number (optional)'],
        ['• NID: National ID (16 digits, optional)'],
        ['• Crop Quantity: Numeric values'],
        [''],
        ['TIPS:'],
        ['• You can add up to 498 rows of data'],
        ['• Save the file before uploading'],
        ['• If upload fails, check the error report for row-specific issues'],
        ['• To see dropdown, click on cell then click the small arrow that appears'],
      ];

      instructions.forEach((row, idx) => {
        const cell = wsInstructions.getCell(`A${idx + 1}`);
        cell.value = row[0];
        if (idx === 0) {
          cell.font = { bold: true, size: 14, color: { argb: 'FF0D5F2C' } };
        } else if (row[0]?.endsWith(':')) {
          cell.font = { bold: true };
        }
      });

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Set headers for download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=farmers_import_template.xlsx');
      res.send(buffer);
    } catch (error: any) {
      console.error('Template generation error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate template',
      });
    }
  }
);

/**
 * @route   POST /api/farmers/upload-excel
 * @desc    Upload and import farmers from Excel file
 * @access  Private (Admin+)
 */
router.post(
  '/upload-excel',
  authorize('Super Admin', 'Admin'),
  upload.single('file'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'Please upload an Excel file',
        });
        return;
      }

      // Read the Excel file from buffer
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      
      console.log('📊 Excel Upload Debug:');
      console.log('   Available sheets:', workbook.SheetNames);
      
      // Try to find the "Data Entry" sheet first, otherwise use first sheet
      let sheetName = workbook.SheetNames.find(name => 
        name.toLowerCase().includes('data') || 
        name.toLowerCase().includes('entry') ||
        name.toLowerCase().includes('farmer') ||
        name.toLowerCase().includes('business')
      );
      
      // If no data sheet found, use the first sheet that's not "Instructions"
      if (!sheetName) {
        sheetName = workbook.SheetNames.find(name => !name.toLowerCase().includes('instruction')) || workbook.SheetNames[0];
      }
      
      console.log('   Using sheet:', sheetName);
      
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with header row detection
      const rawData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      
      console.log('   Raw data rows:', rawData.length);
      if (rawData.length > 0) {
        console.log('   Actual column names from Excel:', Object.keys(rawData[0]));
        console.log('   First row data:', JSON.stringify(rawData[0], null, 2));
      } else {
        // Try reading with raw: true to see what's in the sheet
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
        console.log('   Sheet range:', worksheet['!ref']);
        console.log('   Rows in range:', range.e.r - range.s.r + 1);
        console.log('   Cols in range:', range.e.c - range.s.c + 1);
        
        // Log first few cells to debug
        for (let r = 0; r <= Math.min(2, range.e.r); r++) {
          for (let c = 0; c <= Math.min(5, range.e.c); c++) {
            const cellRef = XLSX.utils.encode_cell({ r, c });
            const cell = worksheet[cellRef];
            if (cell) {
              console.log(`   Cell ${cellRef}:`, cell.v);
            }
          }
        }
      }

      if (rawData.length === 0) {
        res.status(400).json({
          success: false,
          message: 'The Excel file is empty or has no valid data. Make sure to fill in the "Data Entry" sheet.',
          sheets: workbook.SheetNames,
          selectedSheet: sheetName,
        });
        return;
      }

      // Map Excel columns to database fields
      // Support both exact matches and trimmed/normalized matches
      const columnMapping: Record<string, string> = {
        'Business Name*': 'businessName',
        'Owner Name*': 'ownerName',
        'Phone*': 'phone',
        'Province*': 'province',
        'District*': 'district',
        'Sector*': 'sector',
        'Cell*': 'cell',
        'Village*': 'village',
        'Ownership*': 'ownership',
        'Business Type*': 'businessType',
        'Value Chain*': 'valueChain',
        'Commencement Date*': 'commencementDate',
        'Owner Age*': 'ownerAge',
        'Education Level': 'educationLevel',
        'Gender': 'gender',
        'TIN': 'tin',
        'NID': 'nid',
        'Nationality': 'nationality',
        'Business Size': 'businessSize',
        'Employees': 'employees',
        'Female Employees': 'femaleEmployees',
        'Youth Employees': 'youthEmployees',
        'Revenue': 'revenue',
        'Annual Income': 'annualIncome',
        'Disability Status': 'disabilityStatus',
        'Participant Type': 'participantType',
        'Company Description': 'companyDescription',
        'Support Received': 'supportReceived',
        'Status': 'status',
        // Crops fields
        'Crop 1 Name': 'crop1Name',
        'Crop 1 Quantity': 'crop1Qty',
        'Crop 1 Unit': 'crop1Unit',
        'Crop 2 Name': 'crop2Name',
        'Crop 2 Quantity': 'crop2Qty',
        'Crop 2 Unit': 'crop2Unit',
        'Crop 3 Name': 'crop3Name',
        'Crop 3 Quantity': 'crop3Qty',
        'Crop 3 Unit': 'crop3Unit',
      };

      // Create a normalized mapping (lowercase, trimmed) for flexible matching
      const normalizedMapping: Record<string, string> = {};
      Object.entries(columnMapping).forEach(([key, value]) => {
        normalizedMapping[key.toLowerCase().trim()] = value;
        // Also add version without asterisk
        normalizedMapping[key.replace('*', '').toLowerCase().trim()] = value;
      });
      
      console.log('📊 Column mapping check:');
      console.log('   Expected columns:', Object.keys(columnMapping));
      if (rawData.length > 0) {
        console.log('   Actual columns:', Object.keys(rawData[0]));
        // Check which columns match
        const actualCols = Object.keys(rawData[0]);
        const matchedCols = actualCols.filter(col => columnMapping[col] || normalizedMapping[col.toLowerCase().trim()]);
        const unmatchedCols = actualCols.filter(col => !columnMapping[col] && !normalizedMapping[col.toLowerCase().trim()]);
        console.log('   Matched columns:', matchedCols.length);
        console.log('   Unmatched columns:', unmatchedCols);
      }

      // Required fields
      const requiredFields = [
        'businessName', 'ownerName', 'phone', 'province', 'district',
        'sector', 'cell', 'village', 'ownership', 'businessType',
        'valueChain', 'commencementDate', 'ownerAge'
      ];

      // Get starting farmerId
      const lastFarmer = await Farmer.findOne().sort({ farmerId: -1 }).select('farmerId');
      let nextFarmerId = lastFarmer ? lastFarmer.farmerId + 1 : 1;

      // Helper function to normalize phone numbers for comparison
      const normalizePhone = (phone: any): string => {
        if (!phone) return '';
        // Remove all non-digits and convert to string
        const digits = phone.toString().replace(/\D/g, '');
        // If it starts with country code 250, remove it
        if (digits.startsWith('250') && digits.length > 9) {
          return digits.slice(3);
        }
        // If it starts with 0, remove it (0781... -> 781...)
        if (digits.startsWith('0') && digits.length === 10) {
          return digits.slice(1);
        }
        return digits;
      };

      // Helper function to create a fingerprint from all key fields
      const createFingerprint = (f: any): string => {
        const parts = [
          f.businessName?.toString().trim().toLowerCase() || '',
          f.ownerName?.toString().trim().toLowerCase() || '',
          normalizePhone(f.phone),
          f.province?.toString().trim().toLowerCase() || '',
          f.district?.toString().trim().toLowerCase() || '',
          f.sector?.toString().trim().toLowerCase() || '',
          f.cell?.toString().trim().toLowerCase() || '',
          f.village?.toString().trim().toLowerCase() || '',
          f.ownership?.toString().trim().toLowerCase() || '',
          f.businessType?.toString().trim().toLowerCase() || '',
          f.valueChain?.toString().trim().toLowerCase() || '',
        ];
        const fingerprint = parts.join('|');
        // Check if fingerprint is essentially empty (all empty values)
        const nonEmptyParts = parts.filter(p => p !== '');
        console.log(`   Fingerprint parts: ${nonEmptyParts.length} non-empty of ${parts.length}`);
        return fingerprint;
      };

      // Helper to check if a fingerprint is essentially empty (no meaningful data)
      const isEmptyFingerprint = (fp: string): boolean => {
        // A fingerprint of just pipe characters means no real data
        return fp.replace(/\|/g, '').trim() === '';
      };

      // Fetch existing farmers for duplicate checking (all key fields)
      const existingFarmers = await Farmer.find({}, {
        businessName: 1, ownerName: 1, phone: 1, province: 1, district: 1,
        sector: 1, cell: 1, village: 1, ownership: 1, businessType: 1, valueChain: 1
      }).lean();
      
      // Create fingerprints for all existing farmers
      const existingFingerprints = new Set(existingFarmers.map(f => createFingerprint(f)));
      
      console.log('📊 Existing farmers in DB:', existingFarmers.length);

      // Track duplicates within the Excel file itself
      const seenInFile = new Set<string>();

      // Process and validate each row
      const validFarmers: any[] = [];
      const errors: { row: number; errors: string[] }[] = [];
      const skippedDuplicates: { row: number; reason: string }[] = [];

      for (let index = 0; index < rawData.length; index++) {
        const row = rawData[index];
        const rowNumber = index + 2; // +2 because Excel row 1 is header, and arrays are 0-indexed
        const rowErrors: string[] = [];
        const farmer: any = {};

        console.log(`\n📝 Processing Row ${rowNumber}:`, JSON.stringify(row).substring(0, 200));

        // Map columns - use flexible matching
        Object.keys(row).forEach((excelCol) => {
          const value = row[excelCol];
          
          // Try exact match first
          let dbField = columnMapping[excelCol];
          
          // If no exact match, try normalized match
          if (!dbField) {
            const normalizedKey = excelCol.toLowerCase().trim();
            dbField = normalizedMapping[normalizedKey];
          }
          
          // If still no match, try without asterisk in the row key
          if (!dbField) {
            const withoutAsterisk = excelCol.replace('*', '').toLowerCase().trim();
            dbField = normalizedMapping[withoutAsterisk];
          }
          
          if (dbField && value !== undefined && value !== null && value !== '') {
            farmer[dbField] = value;
          }
        });

        console.log(`   Mapped farmer fields:`, Object.keys(farmer).join(', '));
        console.log(`   Mapped farmer data:`, JSON.stringify(farmer).substring(0, 300));

        // Check if the row is essentially empty (no mapped fields)
        if (Object.keys(farmer).length === 0) {
          console.log(`   ⏭️ Row ${rowNumber} is empty, skipping`);
          continue; // Skip empty rows
        }

        // Validate required fields
        requiredFields.forEach(field => {
          if (!farmer[field]) {
            const excelCol = Object.entries(columnMapping).find(([_, v]) => v === field)?.[0] || field;
            rowErrors.push(`Missing required field: ${excelCol}`);
          }
        });

        console.log(`   Required field errors: ${rowErrors.length > 0 ? rowErrors.join('; ') : 'None'}`);

        // Validate ownership
        if (farmer.ownership && !['Youth-owned', 'Non youth-owned'].includes(farmer.ownership)) {
          rowErrors.push(`Invalid ownership: "${farmer.ownership}". Must be "Youth-owned" or "Non youth-owned"`);
        }

        // Validate gender
        if (farmer.gender && !['Male', 'Female', 'Other', ''].includes(farmer.gender)) {
          rowErrors.push(`Invalid gender: "${farmer.gender}". Must be "Male", "Female", or "Other"`);
        }

        // Validate status
        if (farmer.status && !['Active', 'Pending', 'Inactive'].includes(farmer.status)) {
          rowErrors.push(`Invalid status: "${farmer.status}". Must be "Active", "Pending", or "Inactive"`);
        }

        // Validate owner age
        if (farmer.ownerAge) {
          const age = Number(farmer.ownerAge);
          if (isNaN(age) || age < 18) {
            rowErrors.push(`Invalid owner age: "${farmer.ownerAge}". Must be 18 or older`);
          } else {
            farmer.ownerAge = age;
          }
        }

        // Validate phone format (Rwanda: 9 digits without country code, or 10 with leading 0)
        if (farmer.phone) {
          const phoneStr = farmer.phone.toString().trim().replace(/\D/g, ''); // Remove non-digits
          if (phoneStr.length < 9) {
            rowErrors.push(`Invalid phone: "${farmer.phone}". Must be at least 9 digits`);
          }
          // Normalize phone to consistent format
          farmer.phone = phoneStr;
        }

        // Validate numeric fields
        ['employees', 'femaleEmployees', 'youthEmployees'].forEach(field => {
          if (farmer[field] !== undefined) {
            const num = Number(farmer[field]);
            if (isNaN(num) || num < 0) {
              rowErrors.push(`Invalid ${field}: "${farmer[field]}". Must be a non-negative number`);
            } else {
              farmer[field] = num;
            }
          }
        });

        // ============ DUPLICATE DETECTION (based on ALL key fields) ============
        const rowFingerprint = createFingerprint(farmer);

        console.log(`   Fingerprint: "${rowFingerprint.substring(0, 80)}..."`);
        console.log(`   Is empty fingerprint: ${isEmptyFingerprint(rowFingerprint)}`);

        // If there are validation errors, add to errors array and skip further processing
        if (rowErrors.length > 0) {
          console.log(`   ❌ Row ${rowNumber} has ${rowErrors.length} validation error(s): ${rowErrors.join('; ')}`);
          errors.push({ row: rowNumber, errors: rowErrors });
          continue; // Skip to next row
        }

        // Skip duplicate detection for empty fingerprints (they're not real duplicates)
        if (!isEmptyFingerprint(rowFingerprint)) {
          // Check for exact duplicate in database (all key fields match)
          if (existingFingerprints.has(rowFingerprint)) {
            console.log(`   ⚠️ Row ${rowNumber} is duplicate of existing DB record`);
            skippedDuplicates.push({
              row: rowNumber,
              reason: `Duplicate record found (exists in database or uploaded file)`,
            });
            continue; // Skip this row
          }

          // Check for exact duplicate within the same Excel file
          console.log(`   Checking within-file duplicates. seenInFile size: ${seenInFile.size}`);
          if (seenInFile.has(rowFingerprint)) {
            console.log(`   ⚠️ Row ${rowNumber} is duplicate of another row in file (fingerprint already seen)`);
            skippedDuplicates.push({
              row: rowNumber,
              reason: `Duplicate record found (exists in database or uploaded file)`,
            });
            continue; // Skip this row
          }

          // Mark as seen for within-file duplicate detection
          console.log(`   Adding fingerprint to seenInFile: "${rowFingerprint.substring(0, 50)}..."`);
          seenInFile.add(rowFingerprint);
        }

        // Row is valid - add to valid farmers
        console.log(`   ✅ Row ${rowNumber} is valid, adding to import list`);
        
        // Add farmerId and default status
        farmer.farmerId = nextFarmerId++;
        farmer.status = farmer.status || 'Active';
        
        // Process crops into an array
        const crops: { id: string; name: string; quantity: number; unit: string }[] = [];
        
        // Crop 1
        if (farmer.crop1Name) {
          const qty = farmer.crop1Qty ? Number(farmer.crop1Qty) : 0;
          crops.push({
            id: `crop-${Date.now()}-1`,
            name: farmer.crop1Name,
            quantity: isNaN(qty) ? 0 : qty,
            unit: farmer.crop1Unit || 'Kg',
          });
        }
        
        // Crop 2
        if (farmer.crop2Name) {
          const qty = farmer.crop2Qty ? Number(farmer.crop2Qty) : 0;
          crops.push({
            id: `crop-${Date.now()}-2`,
            name: farmer.crop2Name,
            quantity: isNaN(qty) ? 0 : qty,
            unit: farmer.crop2Unit || 'Kg',
          });
        }
        
        // Crop 3
        if (farmer.crop3Name) {
          const qty = farmer.crop3Qty ? Number(farmer.crop3Qty) : 0;
          crops.push({
            id: `crop-${Date.now()}-3`,
            name: farmer.crop3Name,
            quantity: isNaN(qty) ? 0 : qty,
            unit: farmer.crop3Unit || 'Kg',
          });
        }
        
        // Add crops array to farmer
        if (crops.length > 0) {
          farmer.crops = crops;
        }
        
        // Remove temporary crop fields
        delete farmer.crop1Name;
        delete farmer.crop1Qty;
        delete farmer.crop1Unit;
        delete farmer.crop2Name;
        delete farmer.crop2Qty;
        delete farmer.crop2Unit;
        delete farmer.crop3Name;
        delete farmer.crop3Qty;
        delete farmer.crop3Unit;
        
        // Add to existing fingerprints to prevent duplicates within this batch
        existingFingerprints.add(rowFingerprint);
        
        validFarmers.push(farmer);
      }

      // Summary logging
      console.log('\n📊 ========== VALIDATION SUMMARY ==========');
      console.log(`   Total rows processed: ${rawData.length}`);
      console.log(`   Valid farmers: ${validFarmers.length}`);
      console.log(`   Validation errors: ${errors.length}`);
      console.log(`   Duplicates skipped: ${skippedDuplicates.length}`);
      console.log(`   Unaccounted rows: ${rawData.length - validFarmers.length - errors.length - skippedDuplicates.length}`);
      if (errors.length > 0) {
        console.log('   First error:', JSON.stringify(errors[0]));
      }
      if (skippedDuplicates.length > 0) {
        console.log('   First duplicate:', JSON.stringify(skippedDuplicates[0]));
      }
      if (validFarmers.length > 0) {
        console.log('   First valid farmer:', JSON.stringify(validFarmers[0]).substring(0, 500));
      }
      console.log('==========================================\n');
      
      if (validFarmers.length === 0) {
        let message = 'No valid data to import.';
        if (errors.length > 0 && skippedDuplicates.length > 0) {
          message = `No valid data to import. ${errors.length} row(s) have errors, ${skippedDuplicates.length} row(s) are duplicates.`;
        } else if (errors.length > 0) {
          message = `No valid data to import. All ${errors.length} row(s) have validation errors.`;
        } else if (skippedDuplicates.length > 0) {
          message = `No valid data to import. All ${skippedDuplicates.length} row(s) are duplicates that already exist.`;
        }
        
        // Always include the full arrays so frontend can display details
        res.status(400).json({
          success: false,
          message,
          totalRows: rawData.length,
          importedCount: 0,
          duplicateCount: skippedDuplicates.length,
          errorCount: errors.length,
          errors: errors,           // Always include (even if empty array)
          duplicates: skippedDuplicates,  // Always include (even if empty array)
        });
        return;
      }

      // Insert valid farmers
      let insertedCount = 0;
      let insertErrors: string[] = [];
      
      console.log(`\n📥 Attempting to insert ${validFarmers.length} valid farmers...`);
      
      try {
        const result = await Farmer.insertMany(validFarmers, { ordered: false });
        insertedCount = result.length;
        console.log(`   ✅ Successfully inserted ${insertedCount} farmers`);
      } catch (insertError: any) {
        console.log(`   ❌ Insert error:`, insertError.message);
        console.log(`   Error code:`, insertError.code);
        console.log(`   Error details:`, JSON.stringify(insertError.writeErrors || insertError.errors || 'No details', null, 2).substring(0, 500));
        
        // Handle partial insert failures
        if (insertError.insertedDocs) {
          insertedCount = insertError.insertedDocs.length;
          console.log(`   Partial insert: ${insertedCount} docs inserted`);
        }
        if (insertError.result?.insertedCount) {
          insertedCount = insertError.result.insertedCount;
          console.log(`   Result insertedCount: ${insertedCount}`);
        }
        if (insertError.writeErrors) {
          insertErrors = insertError.writeErrors.map((e: any) => 
            `Row error: ${e.errmsg || 'Unknown error'}`
          );
        }
        // Also capture the error for the response
        if (insertedCount === 0 && !insertError.writeErrors) {
          insertErrors.push(insertError.message || 'Database insert failed');
        }
      }

      // Build detailed response message
      let message = `Successfully imported ${insertedCount} farmer(s)`;
      if (skippedDuplicates.length > 0) {
        message += `, skipped ${skippedDuplicates.length} duplicate(s)`;
      }
      if (errors.length > 0) {
        message += `, ${errors.length} row(s) had validation errors`;
      }

      res.status(201).json({
        success: insertedCount > 0,
        message,
        totalRows: rawData.length,
        importedCount: insertedCount,
        duplicateCount: skippedDuplicates.length,
        errorCount: errors.length,
        duplicates: skippedDuplicates.length > 0 ? skippedDuplicates : undefined,
        errors: errors.length > 0 ? errors : undefined,
        insertErrors: insertErrors.length > 0 ? insertErrors : undefined,
      });
    } catch (error: any) {
      console.error('❌ Excel upload error:', error);
      
      // Handle duplicate key errors or other MongoDB errors
      if (error.code === 11000) {
        res.status(400).json({
          success: false,
          message: 'Duplicate entry found. Some farmers may already exist in the database.',
          error: error.message,
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to process Excel file',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
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
