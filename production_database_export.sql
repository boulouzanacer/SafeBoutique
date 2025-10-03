-- ===================================================================
-- PRODUCTION DATABASE EXPORT - SafeSoft Boutique E-commerce Platform
-- ===================================================================
-- This script contains the complete database schema and data export
-- Generated on: 2025-09-07
-- Total Tables: 10
-- Contains: Schema + Data
-- ===================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===================================================================
-- TABLE DEFINITIONS
-- ===================================================================

-- Families Table
CREATE TABLE families (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Products Table  
CREATE TABLE products (
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

-- Customers Table
CREATE TABLE customers (
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

-- Orders Table
CREATE TABLE orders (
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

-- Order Items Table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) NOT NULL,
    product_id INTEGER REFERENCES products(recordid) NOT NULL,
    quantity INTEGER NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sessions Table
CREATE TABLE sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);
CREATE INDEX IDX_session_expire ON sessions(expire);

-- Users Table
CREATE TABLE users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_image_url VARCHAR,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Product Reviews Table
CREATE TABLE product_reviews (
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

-- Site Settings Table
CREATE TABLE site_settings (
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

-- Slider Images Table
CREATE TABLE slider_images (
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

-- ===================================================================
-- DATA INSERTION
-- ===================================================================

-- Insert Families Data
INSERT INTO families (id, name, created_at, updated_at) VALUES
(1, 'LCD NOKIA', '2025-08-31 15:22:19.960712', '2025-08-31 15:22:19.960712'),
(2, 'nnnnn', '2025-08-31 15:22:19.960712', '2025-08-31 15:22:19.960712'),
(4, 'COMPUTER / INSTRUMENTS', '2025-08-31 15:22:19.960712', '2025-08-31 15:22:19.960712'),
(5, 'IPHONE', '2025-08-31 15:22:19.960712', '2025-08-31 15:22:19.960712'),
(8, 'ELECTRONICS_UPDATED', '2025-08-31 15:56:19.191139', '2025-09-06 13:01:28.826'),
(9, 'SMARTPHONES_UPDATED', '2025-08-31 15:59:58.488012', '2025-09-06 13:01:52.381'),
(3, 'Debour_UPDATED', '2025-08-31 15:22:19.960712', '2025-09-06 13:02:24.161');

-- Reset sequence for families
SELECT setval('families_id_seq', (SELECT MAX(id) FROM families));

-- Insert Customers Data
INSERT INTO customers (id, first_name, last_name, email, phone, address, city, state, zip_code, is_registered, created_at, updated_at) VALUES
(1, 'NASSER', 'BOULOUZA', 'boulouza.nacer@gmail.com', '0656232454', 'LAKHDARIA', 'BOUDERBALA', 'bouira', '10032', false, '2025-08-13 11:35:24.071443', '2025-08-13 11:35:24.071443'),
(2, 'Test', 'User', 'test@example.com', '1234567890', '123 Test St', 'Test City', 'Test State', '12345', false, '2025-08-17 17:16:47.091191', '2025-08-17 17:16:47.091191'),
(3, 'sebti', 'bouabdallah', 'sebrti.bouabdallah@gmail.com', '0550969595', 'parid', 'paris', 'lido', '75000', false, '2025-08-17 17:51:31.386381', '2025-08-17 17:51:31.386381'),
(4, 'NASSER', 'BOULOUZA', 'sarl.safe.soft@gmail.com', '0656232454', 'LAKHDARIA', 'BOUDERBALA', 'lido', '10032', false, '2025-08-20 15:15:07.137995', '2025-08-20 15:15:07.137995');

-- Reset sequence for customers
SELECT setval('customers_id_seq', (SELECT MAX(id) FROM customers));

-- Insert Users Data (excluding passwords for security)
INSERT INTO users (id, email, first_name, last_name, profile_image_url, is_email_verified, is_admin, created_at, updated_at) VALUES
('59d5d481-5367-412a-bda4-48ad474b221f', 'test@example.com', 'Test', 'User', NULL, false, false, '2025-08-17 17:14:06.065321', '2025-08-17 17:14:06.065321'),
('bd42c2b4-4cad-4f48-8baf-447250dc8d7c', 'sarl.safe.soft@gmail.com', 'NASSER', 'BOULOUZA', NULL, false, false, '2025-08-17 17:14:33.989446', '2025-08-17 17:14:33.989446'),
('681eed78-0d43-4cfa-a372-c74b64c177d2', 'sebrti.bouabdallah@gmail.com', 'sebti', 'bouabdallah', NULL, false, false, '2025-08-17 17:50:30.921362', '2025-08-17 17:50:30.921362'),

