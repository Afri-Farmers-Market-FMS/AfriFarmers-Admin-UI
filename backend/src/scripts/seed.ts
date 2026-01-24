import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User, Farmer } from '../models';

// Load environment variables
dotenv.config();

// Initial farmers data - this will be imported from the frontend mockData
// For the seed script, we'll read from the compiled frontend data or use a simplified version

const initialUsers = [
  {
    name: 'Super Admin',
    email: 'admin@afrifarmers.rw',
    password: 'admin123',
    role: 'Super Admin' as const,
  },
  {
    name: 'John Doe',
    email: 'john@afrifarmers.rw',
    password: 'user123',
    role: 'Admin' as const,
  },
  {
    name: 'Jane Smith',
    email: 'jane@afrifarmers.rw',
    password: 'viewer123',
    role: 'Viewer' as const,
  },
];

// Sample farmers data (first 10 from actual data for quick testing)
const sampleFarmers = [
  {
    farmerId: 1,
    businessName: "Ubuhinzi",
    ownership: "Youth-owned",
    commencementDate: "9/15/2024",
    province: "East",
    district: "Nyagatare",
    sector: "Nyagatare",
    cell: "Nyagatare",
    village: "Nyagatare 2",
    ownerName: "niyokwizerwa",
    phone: "788445220",
    tin: "None",
    businessType: "Individual (solo worker)",
    participantType: "Individual",
    companyDescription: "Nkora ubuhinzi bwimboga mbusimburanya nibishyimbo",
    supportReceived: "Training / capacity building, eCommerce onboarding",
    nationality: "Rwandan",
    ownerAge: 31,
    gender: "Male",
    educationLevel: "None",
    disabilityStatus: "None",
    businessSize: "Micro (1 - 2 employees)",
    revenue: "Micro (less than 2 million RWF)",
    annualIncome: "Less than 840,000 RWF",
    employees: 2,
    femaleEmployees: 1,
    youthEmployees: 0,
    valueChain: "Cultivation of fresh produce such as maize, rice, tomatoes, fruits, and other crops.",
    status: "Active",
  },
  {
    farmerId: 2,
    businessName: "Ejo heza",
    ownership: "Non youth-owned",
    commencementDate: "1/5/2016",
    province: "West",
    district: "Rubavu",
    sector: "Nyundo",
    cell: "Terimbere",
    village: "Ntombe",
    ownerName: "Nyirahabimana Mariam",
    phone: "786310569",
    tin: "None",
    businessType: "Informal Enterprise (not registered)",
    participantType: "Enterprise/Company/Business",
    companyDescription: "Ubuhinzi bw'ibishyimbo, ibigori, imboga",
    supportReceived: "Training / capacity building, eCommerce onboarding",
    nationality: "Rwandan",
    ownerAge: 53,
    gender: "Female",
    educationLevel: "None",
    disabilityStatus: "None",
    businessSize: "Micro (1 - 2 employees)",
    revenue: "Micro (less than 2 million RWF)",
    annualIncome: "Less than 840,000 RWF",
    employees: 0,
    femaleEmployees: 0,
    youthEmployees: 0,
    valueChain: "Cultivation of fresh produce such as maize, rice, tomatoes, fruits, and other crops.",
    status: "Active",
  },
  {
    farmerId: 3,
    businessName: "NSABIMANA",
    ownership: "Non youth-owned",
    commencementDate: "5/12/1985",
    province: "West",
    district: "Rubavu",
    sector: "NYUNDO",
    cell: "Kavumu",
    village: "Gitwa",
    ownerName: "NSABIMANA Jean Damascene",
    phone: "789819379",
    tin: "None",
    businessType: "Individual (solo worker)",
    participantType: "Individual",
    companyDescription: "Cultivate maize and beans",
    supportReceived: "Training / capacity building",
    nationality: "Rwandan",
    ownerAge: 40,
    gender: "Male",
    educationLevel: "None",
    disabilityStatus: "None",
    businessSize: "Micro (1 - 2 employees)",
    revenue: "Micro (less than 2 million RWF)",
    annualIncome: "Between 840,000 - 1,200,000 RWF",
    employees: 0,
    femaleEmployees: 0,
    youthEmployees: 0,
    valueChain: "Cultivation of fresh produce such as maize, rice, tomatoes, fruits, and other crops.",
    status: "Active",
  },
];

const seedDatabase = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/afrifarmers';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Farmer.deleteMany({});

    // Seed users
    console.log('👤 Seeding users...');
    for (const userData of initialUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`   ✓ Created user: ${userData.email} (${userData.role})`);
    }

    // Seed farmers
    console.log('🌱 Seeding farmers...');
    await Farmer.insertMany(sampleFarmers);
    console.log(`   ✓ Created ${sampleFarmers.length} farmers`);

    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║     ✅ Database seeded successfully!             ║');
    console.log('╠══════════════════════════════════════════════════╣');
    console.log('║                                                  ║');
    console.log('║  Default Login Credentials:                      ║');
    console.log('║                                                  ║');
    console.log('║  Super Admin:                                    ║');
    console.log('║    Email: admin@afrifarmers.rw                   ║');
    console.log('║    Password: admin123                            ║');
    console.log('║                                                  ║');
    console.log('║  Admin:                                          ║');
    console.log('║    Email: john@afrifarmers.rw                    ║');
    console.log('║    Password: user123                             ║');
    console.log('║                                                  ║');
    console.log('║  Viewer:                                         ║');
    console.log('║    Email: jane@afrifarmers.rw                    ║');
    console.log('║    Password: viewer123                           ║');
    console.log('║                                                  ║');
    console.log('╚══════════════════════════════════════════════════╝');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

// Run seed
seedDatabase();
