import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../models'; // We only need User model for this

// Load environment variables
dotenv.config();

const createAdmin = async () => {
  try {
    // 1. Connect to MongoDB
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    // Log only host part for security
    const host = process.env.MONGODB_URI.split('@')[1];
    console.log(`✅ Connected to MongoDB: ${host || 'Unknown Host'}`); 

    // 2. Define Super Admin
    const adminEmail = 'admin@afrifarmers.rw';
    
    // Hard Reset: Always delete first to ensure we know the password is correct
    console.log(`🔄 Deleting any existing user with email: ${adminEmail} (Forcing Reset)`);
    await User.deleteMany({ email: adminEmail });
    
    const adminPassword = 'admin123'; 

    // 4. Create Admin
    // Note: We pass the PLAIN password because the User model has a pre-save hook
    // that will hash it automatically. If we hash it here, it gets double-hashed!
    
    await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'Super Admin',
        status: 'Active',
        twoFactorEnabled: false
    });
    console.log(`🎉 Super Admin RE-CREATED: ${adminEmail} / ${adminPassword}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

createAdmin();