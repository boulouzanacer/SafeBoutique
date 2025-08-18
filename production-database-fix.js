// This script will connect to the actual production database and fix the admin user
// We need to ensure we're connecting to the same database as the production deployment

import { neon } from '@neondatabase/serverless';

async function fixProductionDatabase() {
  // Use the same DATABASE_URL that the production app uses
  const databaseUrl = process.env.DATABASE_URL;
  console.log('🔗 Connecting to database:', databaseUrl ? databaseUrl.substring(0, 50) + '...' : 'Not found');
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL not found');
    return;
  }

  try {
    const sql = neon(databaseUrl);
    const adminEmail = 'boulouza.nacer@gmail.com';

    // First, let's see what databases/users exist
    console.log('📊 Checking all users in database...');
    const allUsers = await sql`SELECT id, email, first_name, last_name, is_admin, created_at FROM users ORDER BY created_at DESC`;
    console.log('Total users found:', allUsers.length);
    allUsers.forEach(user => {
      console.log(`- ${user.email}: isAdmin=${user.is_admin}, created=${user.created_at}`);
    });

    // Find the admin user specifically
    console.log('\n🔍 Looking for admin user...');
    const adminUsers = await sql`SELECT * FROM users WHERE email = ${adminEmail}`;
    
    if (adminUsers.length === 0) {
      console.log('❌ Admin user not found. Creating...');
      
      // Create the admin user with proper bcrypt hash
      const hashedPassword = '$2b$10$j0/ho5NBc5nvlLB9SqqkMOD03VHmftZbWCoJUNcrRhPJZ2EbJhs8a'; // 123456
      
      const newUser = await sql`
        INSERT INTO users (
          id, email, password, first_name, last_name, 
          is_admin, is_email_verified, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), ${adminEmail}, ${hashedPassword}, 
          'Nacer', 'Boulouza', true, true, NOW(), NOW()
        )
        RETURNING id, email, first_name, last_name, is_admin
      `;
      
      console.log('✅ Admin user created:', newUser[0]);
    } else {
      console.log('👤 Admin user found:', adminUsers[0]);
      
      // Update to ensure admin privileges
      console.log('🔧 Ensuring admin privileges...');
      const updated = await sql`
        UPDATE users 
        SET 
          is_admin = true, 
          password = '$2b$10$j0/ho5NBc5nvlLB9SqqkMOD03VHmftZbWCoJUNcrRhPJZ2EbJhs8a',
          updated_at = NOW()
        WHERE email = ${adminEmail}
        RETURNING id, email, first_name, last_name, is_admin, updated_at
      `;
      
      console.log('✅ Admin user updated:', updated[0]);
    }

    // Final verification
    console.log('\n🔍 Final verification...');
    const finalCheck = await sql`SELECT id, email, first_name, last_name, is_admin, created_at, updated_at FROM users WHERE email = ${adminEmail}`;
    
    if (finalCheck.length > 0 && finalCheck[0].is_admin) {
      console.log('🎉 SUCCESS! Admin user is ready:');
      console.log(`📧 Email: ${finalCheck[0].email}`);
      console.log(`👑 Admin: ${finalCheck[0].is_admin}`);
      console.log(`🔑 Password: 123456`);
      console.log(`🆔 ID: ${finalCheck[0].id}`);
      console.log(`📅 Updated: ${finalCheck[0].updated_at}`);
    } else {
      console.log('❌ Something went wrong with the admin setup');
    }

  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('💡 Stack trace:', error.stack);
  }
}

console.log('🚀 Starting production database fix...');
fixProductionDatabase();