import mongoose, { Schema, Document } from 'mongoose';

export interface ICropItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface IFarmerDocument extends Document {
  farmerId: number; // Custom numeric ID for frontend compatibility
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
  crops?: ICropItem[];
  status: 'Active' | 'Pending' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const CropItemSchema = new Schema<ICropItem>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
  },
  { _id: false }
);

const FarmerSchema = new Schema<IFarmerDocument>(
  {
    farmerId: {
      type: Number,
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
    },
    ownership: {
      type: String,
      enum: ['Youth-owned', 'Non youth-owned'],
      required: [true, 'Ownership type is required'],
    },
    commencementDate: {
      type: String,
      required: [true, 'Commencement date is required'],
    },
    province: {
      type: String,
      required: [true, 'Province is required'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
    },
    sector: {
      type: String,
      required: [true, 'Sector is required'],
      trim: true,
    },
    cell: {
      type: String,
      required: [true, 'Cell is required'],
      trim: true,
    },
    village: {
      type: String,
      required: [true, 'Village is required'],
      trim: true,
    },
    ownerName: {
      type: String,
      required: [true, 'Owner name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    tin: {
      type: String,
      trim: true,
      default: 'None',
    },
    businessType: {
      type: String,
      required: [true, 'Business type is required'],
      trim: true,
    },
    participantType: {
      type: String,
      trim: true,
    },
    companyDescription: {
      type: String,
      trim: true,
    },
    supportReceived: {
      type: String,
      trim: true,
    },
    nationality: {
      type: String,
      trim: true,
      default: 'Rwandan',
    },
    nid: {
      type: String,
      trim: true,
    },
    ownerAge: {
      type: Number,
      required: [true, 'Owner age is required'],
      min: [18, 'Owner must be at least 18 years old'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', ''],
      default: '',
    },
    educationLevel: {
      type: String,
      trim: true,
      default: 'None',
    },
    disabilityStatus: {
      type: String,
      trim: true,
      default: 'None',
    },
    businessSize: {
      type: String,
      trim: true,
      default: 'Micro',
    },
    revenue: {
      type: String,
      trim: true,
    },
    annualIncome: {
      type: String,
      trim: true,
    },
    employees: {
      type: Number,
      default: 0,
      min: 0,
    },
    femaleEmployees: {
      type: Number,
      default: 0,
      min: 0,
    },
    youthEmployees: {
      type: Number,
      default: 0,
      min: 0,
    },
    valueChain: {
      type: String,
      required: [true, 'Value chain is required'],
      trim: true,
    },
    permanentEmployees: {
      type: Boolean,
      default: false,
    },
    crops: [CropItemSchema],
    status: {
      type: String,
      enum: ['Active', 'Pending', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
FarmerSchema.index({ district: 1 });
FarmerSchema.index({ province: 1 });
FarmerSchema.index({ ownership: 1 });
FarmerSchema.index({ businessName: 'text', ownerName: 'text', district: 'text' });

// Transform output for frontend compatibility
FarmerSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { _id, __v, farmerId, ...rest } = ret;
    return { id: farmerId, ...rest };
  },
});

// Static method to get next farmerId
FarmerSchema.statics.getNextFarmerId = async function (): Promise<number> {
  const lastFarmer = await this.findOne().sort({ farmerId: -1 }).select('farmerId');
  return lastFarmer ? lastFarmer.farmerId + 1 : 1;
};

export const Farmer = mongoose.model<IFarmerDocument>('Farmer', FarmerSchema);
