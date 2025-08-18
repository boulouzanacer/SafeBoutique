// Direct production admin fix using production database URL
import { neon } from '@neondatabase/serverless';

async function fixProductionAdmin() {
  try {
    // Connect to production database directly
    const sql = neon(process.env.DATABASE_URL);
    const adminEmail = 'boulouza.nacer@gmail.com';
    
    console.log('🔍 Connecting to production database...');
    
    // Check current admin status
    console.log('📊 Current admin user status:');
    const currentUser = await sql`
      SELECT id, email, first_name, last_name, is_admin, created_at
      FROM users 
      WHERE email = ${adminEmail}
    `;
    
    if (currentUser.length === 0) {
      console.log('❌ Admin user not found in production database');
      return;
    }
    
    console.log('Current user:', currentUser[0]);
    
    // Update admin privileges
    console.log('🔧 Updating admin privileges...');
    const result = await sql`
      UPDATE users 
      SET is_admin = true, updated_at = NOW()
      WHERE email = ${adminEmail}
      RETURNING id, email, first_name, last_name, is_admin, updated_at
    `;
    
    if (result.length > 0) {
      console.log('✅ SUCCESS! Admin privileges updated:');
      console.log('📧 Email:', result[0].email);
      console.log('👑 Admin:', result[0].is_admin);
      console.log('🆔 ID:', result[0].id);
      console.log('📅 Updated:', result[0].updated_at);
    } else {
      console.log('❌ Failed to update admin privileges');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixProductionAdmin();