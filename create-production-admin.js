// Production Admin Creation Script
// Run this script to ensure admin user exists in any database environment

import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

async function createProductionAdmin() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const adminEmail = 'boulouza.nacer@gmail.com';
    const adminPassword = '123456';
    
    console.log('🔍 Checking database connection...');
    const testQuery = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connected at:', testQuery[0].current_time);
    
    console.log('🔍 Checking if admin user exists...');
    const existingUser = await sql`
      SELECT id, email, first_name, last_name, is_admin, created_at
      FROM users 
      WHERE email = ${adminEmail}
    `;
    
    if (existingUser.length > 0) {
      console.log('👤 Admin user found:', existingUser[0]);
      
      // Update password and ensure admin privileges
      const hashedPassword = bcrypt.hashSync(adminPassword, 10);
      console.log('🔒 Updating password and admin privileges...');
      
      await sql`
        UPDATE users 
        SET 
          password = ${hashedPassword},
          is_admin = true,
          updated_at = NOW()
        WHERE email = ${adminEmail}
      `;
      
      console.log('✅ Admin user updated successfully!');
      
    } else {
      console.log('➕ Creating new admin user...');
      const hashedPassword = bcrypt.hashSync(adminPassword, 10);
      const userId = crypto.randomUUID();
      
      await sql`
        INSERT INTO users (
          id, email, password, first_name, last_name, 
          is_admin, is_email_verified, created_at, updated_at
        ) VALUES (
          ${userId}, ${adminEmail}, ${hashedPassword}, 
          'Nacer', 'Boulouza', true, true, NOW(), NOW()
        )
      `;
      
      console.log('✅ Admin user created successfully!');
    }
    
    // Verify the final result
    console.log('🔍 Verifying final admin user...');
    const finalUser = await sql`
      SELECT id, email, first_name, last_name, is_admin, created_at
      FROM users 
      WHERE email = ${adminEmail}
    `;
    
    if (finalUser.length > 0 && finalUser[0].is_admin) {
      console.log('✅ SUCCESS: Admin user verified!');
      console.log('📧 Email:', finalUser[0].email);
      console.log('🔑 Password: 123456');
      console.log('👑 Admin: true');
      console.log('🆔 ID:', finalUser[0].id);
    } else {
      console.log('❌ FAILED: Admin user verification failed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('💡 Make sure DATABASE_URL environment variable is set');
  }
}

// Run the function
createProductionAdmin();