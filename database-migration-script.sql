-- =====================================================
-- DATABASE MIGRATION SCRIPT
-- Creates all table structures for deployment to another environment
-- Generated from Drizzle ORM schema definitions
-- Database: PostgreSQL
-- =====================================================

-- Enable UUID extension for user IDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLE CREATION SCRIPTS
-- =====================================================

-- 1. Families table (must be created first due to product references)
CREATE TABLE IF NOT EXISTS families (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Products table
CREATE TABLE IF NOT EXISTS products (
    recordid SERIAL PRIMARY KEY,
    code_barre VARCHAR(20) NOT NULL UNIQUE,
    cb_colis VARCHAR(20),
    ref_produit VARCHAR(20) NOT NULL,
    produit VARCHAR(100),
    pa_ht DOUBLE PRECISION DEFAULT 0,
    tva DOUBLE PRECISION DEFAULT 0,
    pamp_ht DOUBLE PRECISION DEFAULT 0,
    pv1_ht DOUBLE PRECISION,
    pv2_ht DOUBLE PRECISION,
    pv3_ht DOUBLE PRECISION,
    pv4_ht DOUBLE PRECISION,
    pv5_ht DOUBLE PRECISION,
    pv6_ht DOUBLE PRECISION,
    pv_limite DOUBLE PRECISION,
    ppa DOUBLE PRECISION,
    stock DOUBLE PRECISION DEFAULT 0,
    colissage DOUBLE PRECISION,
    stock_ini DOUBLE PRECISION DEFAULT 0,
    prix_ini DOUBLE PRECISION DEFAULT 0,
    blocage INTEGER,
    ger_poids INTEGER,
    sup INTEGER,
    famille VARCHAR(50),
    sous_famille VARCHAR(50),
    photo TEXT,
    detaille VARCHAR(1536),
    code_frs VARCHAR(20),
    promo INTEGER,
    d1 TIMESTAMP,
    d2 TIMESTAMP,
    pp1_ht DOUBLE PRECISION,
    qte_promo INTEGER,
    fid INTEGER,
    marque VARCHAR(50),
    um VARCHAR(5),
    poids DOUBLE PRECISION,
    utilisateur VARCHAR(25),
    rating DOUBLE PRECISION DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Customers table
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    is_registered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'pending',
    subtotal DOUBLE PRECISION NOT NULL,
    delivery DOUBLE PRECISION DEFAULT 9.99,
    total DOUBLE PRECISION NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'cod',
    notes TEXT,
    delivery_address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Order Items table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) NOT NULL,
    product_id INTEGER REFERENCES products(recordid) NOT NULL,
    quantity INTEGER NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Sessions table (for authentication)
CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

-- Create index on session expire column
CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);

-- 7. Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_image_url VARCHAR,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. Product Reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(recordid) NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(255),
    rating INTEGER NOT NULL,
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 9. Site Settings table
CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    site_name VARCHAR(200) NOT NULL,
    site_description TEXT NOT NULL,
    logo TEXT,
    favicon TEXT,
    contact_email VARCHAR(200) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    contact_mobile1 VARCHAR(50),
    contact_mobile2 VARCHAR(50),
    contact_mobile3 VARCHAR(50),
    contact_mobile4 VARCHAR(50),
    contact_address TEXT NOT NULL,
    social_facebook TEXT,
    social_instagram TEXT,
    social_twitter TEXT,
    footer_text TEXT NOT NULL,
    header_message TEXT,
    delivery_info TEXT NOT NULL,
    return_policy TEXT NOT NULL,
    privacy_policy TEXT NOT NULL,
    terms_of_service TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 10. Slider Images table
CREATE TABLE IF NOT EXISTS slider_images (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    image TEXT NOT NULL,
    link_url TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- USER DATA EXPORT SCRIPT
-- Run this on source database to export user data
-- =====================================================

-- Export users table data (uncomment and run on source database)
/*
COPY (
    SELECT id, email, password, first_name, last_name, profile_image_url, 
           is_email_verified, is_admin, role, created_at, updated_at 
    FROM users
) TO '/tmp/users_export.csv' WITH CSV HEADER;
*/

-- =====================================================
-- USER DATA IMPORT SCRIPT
-- Run this on destination database to import user data
-- =====================================================

-- Import users table data (uncomment and run on destination database after file transfer)
/*
COPY users (id, email, password, first_name, last_name, profile_image_url, 
            is_email_verified, is_admin, role, created_at, updated_at)
FROM '/tmp/users_export.csv' WITH CSV HEADER;
*/

-- =====================================================
-- ALTERNATIVE: DIRECT DATA TRANSFER QUERIES
-- Use these if you have database-to-database connection
-- =====================================================

-- To export user data as INSERT statements (run on source database):
/*
SELECT 'INSERT INTO users (id, email, password, first_name, last_name, profile_image_url, is_email_verified, is_admin, role, created_at, updated_at) VALUES ' ||
       string_agg(
           '(''' || id || ''', ''' || email || ''', ''' || password || ''', ' ||
           COALESCE('''' || first_name || '''', 'NULL') || ', ' ||
           COALESCE('''' || last_name || '''', 'NULL') || ', ' ||
           COALESCE('''' || profile_image_url || '''', 'NULL') || ', ' ||
           is_email_verified || ', ' || is_admin || ', ''' || role || ''', ' ||
           '''' || created_at || ''', ''' || updated_at || ''')',
           '),(' || CHR(10) || '('
       ) || ';'
FROM users;
*/

-- =====================================================
-- VERIFICATION QUERIES
-- Run these to verify the migration was successful
-- =====================================================

-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check table row counts
SELECT 
    'families' as table_name, COUNT(*) as row_count FROM families
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL
SELECT 'sessions', COUNT(*) FROM sessions
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'product_reviews', COUNT(*) FROM product_reviews
UNION ALL
SELECT 'site_settings', COUNT(*) FROM site_settings
UNION ALL
SELECT 'slider_images', COUNT(*) FROM slider_images;

-- Check foreign key constraints
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- =====================================================
-- NOTES FOR DEPLOYMENT
-- =====================================================

/*
DEPLOYMENT INSTRUCTIONS:

1. PREPARATION:
   - Ensure PostgreSQL is installed and running on target environment
   - Create a new database: CREATE DATABASE your_database_name;
   - Connect to the new database

2. SCHEMA CREATION:
   - Run the table creation section of this script
   - Verify all tables are created successfully

3. USER DATA MIGRATION:
   - Option A: Use CSV export/import method
     * Run export query on source database
     * Transfer the CSV file to target environment
     * Run import query on target database
   
   - Option B: Use direct INSERT statements
     * Run the INSERT generation query on source database
     * Copy the generated INSERT statements
     * Run them on target database

4. VERIFICATION:
   - Run the verification queries
   - Check that all tables exist and have expected structure
   - Verify foreign key constraints are properly set up
   - Confirm user data has been migrated correctly

5. APPLICATION CONFIGURATION:
   - Update DATABASE_URL environment variable
   - Test database connection from your application
   - Run any additional application-specific setup

6. POST-DEPLOYMENT:
   - Test user authentication
   - Verify all application features work correctly
   - Monitor logs for any database-related errors

IMPORTANT NOTES:
- This script creates tables with IF NOT EXISTS to prevent errors on re-runs
- Foreign key relationships are preserved
- Default values and constraints are maintained
- The pgcrypto extension is required for UUID generation
- Sessions table will be empty initially (users will need to log in again)
- Products, orders, and other business data are NOT included by default
*/