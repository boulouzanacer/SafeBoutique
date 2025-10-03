#!/usr/bin/env node

/**
 * Database Schema Generator Script
 * 
 * This script uses Drizzle Kit to generate SQL DDL statements
 * for creating all database tables in another environment.
 * 
 * Usage:
 * node generate-schema-script.js
 * 
 * Output: Creates database-schema.sql with all table creation statements
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Generating database schema SQL...');

try {
  // Generate SQL using drizzle-kit
  console.log('📋 Running drizzle-kit generate...');
  execSync('npx drizzle-kit generate', { stdio: 'inherit' });
  
  // Find the latest migration file
  const migrationsDir = './migrations';
  if (!fs.existsSync(migrationsDir)) {
    throw new Error('Migrations directory not found. Make sure drizzle-kit generated migrations.');
  }
  
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  if (migrationFiles.length === 0) {
    throw new Error('No migration SQL files found.');
  }
  
  const latestMigration = migrationFiles[migrationFiles.length - 1];
  const migrationPath = path.join(migrationsDir, latestMigration);
  
  console.log(`📄 Found latest migration: ${latestMigration}`);
  
  // Read the migration SQL
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  
  // Create enhanced script with comments
  const enhancedSQL = `-- =====================================================
-- AUTO-GENERATED DATABASE SCHEMA SCRIPT
-- Generated from: ${latestMigration}
-- Generated on: ${new Date().toISOString()}
-- Database: PostgreSQL with Drizzle ORM
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLE CREATION STATEMENTS
-- =====================================================

${migrationSQL}

-- =====================================================
-- USER DATA EXPORT/IMPORT HELPERS
-- =====================================================

-- Export users (run on source database):
-- COPY (SELECT * FROM users) TO '/tmp/users_export.csv' WITH CSV HEADER;

-- Import users (run on target database):
-- COPY users FROM '/tmp/users_export.csv' WITH CSV HEADER;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check constraints
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;
`;

  // Write the enhanced SQL file
  const outputFile = 'database-schema.sql';
  fs.writeFileSync(outputFile, enhancedSQL);
  
  console.log(`✅ Schema SQL generated successfully: ${outputFile}`);
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Review the generated SQL file');
  console.log('2. Run it on your target database');
  console.log('3. Use the export/import queries for user data migration');
  
} catch (error) {
  console.error('❌ Error generating schema:', error.message);
  process.exit(1);
}