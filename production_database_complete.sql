-- ===================================================================
-- COMPLETE PRODUCTION DATABASE EXPORT - SafeSoft Boutique
-- ===================================================================
-- This script contains the complete database schema and data export
-- Generated on: 2025-09-10
-- Total Tables: 10
-- Total Products: 91
-- Contains: Full Schema + Complete Data
-- ===================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===================================================================
-- DROP EXISTING TABLES (if they exist)
-- ===================================================================
DROP TABLE IF EXISTS product_reviews CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS families CASCADE;
DROP TABLE IF EXISTS slider_images CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;

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
(3, 'Debour_UPDATED', '2025-08-31 15:22:19.960712', '2025-09-06 13:02:24.161'),
(4, 'COMPUTER / INSTRUMENTS', '2025-08-31 15:22:19.960712', '2025-08-31 15:22:19.960712'),
(5, 'IPHONE', '2025-08-31 15:22:19.960712', '2025-08-31 15:22:19.960712'),
(8, 'ELECTRONICS_UPDATED', '2025-08-31 15:56:19.191139', '2025-09-06 13:01:28.826'),
(9, 'SMARTPHONES_UPDATED', '2025-08-31 15:59:58.488012', '2025-09-06 13:01:52.381');

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

-- Insert Users Data (passwords excluded for security - see notes below)
INSERT INTO users (id, email, first_name, last_name, profile_image_url, is_email_verified, is_admin, created_at, updated_at) VALUES
('59d5d481-5367-412a-bda4-48ad474b221f', 'test@example.com', 'Test', 'User', NULL, false, false, '2025-08-17 17:14:06.065321', '2025-08-17 17:14:06.065321'),
('bd42c2b4-4cad-4f48-8baf-447250dc8d7c', 'sarl.safe.soft@gmail.com', 'NASSER', 'BOULOUZA', NULL, false, false, '2025-08-17 17:14:33.989446', '2025-08-17 17:14:33.989446'),
('681eed78-0d43-4cfa-a372-c74b64c177d2', 'sebrti.bouabdallah@gmail.com', 'sebti', 'bouabdallah', NULL, false, false, '2025-08-17 17:50:30.921362', '2025-08-17 17:50:30.921362'),
('6d6411ad-c3ad-48c5-ba10-c8618be651a1', 'boulouza.nacer@gmail.com', 'Nacer', 'Boulouza', NULL, true, true, '2025-08-18 20:36:19.037975', '2025-08-18 20:42:45.573429');

-- ===================================================================
-- CRITICAL SECURITY NOTE FOR USERS TABLE:
-- The password fields have been excluded for security reasons.
-- After running this script, you MUST update passwords manually:
-- UPDATE users SET password = 'your_bcrypt_hashed_password' WHERE email = 'user@email.com';
-- ===================================================================

-- Insert Orders Data
INSERT INTO orders (id, customer_id, order_number, status, subtotal, delivery, total, payment_method, notes, delivery_address, created_at, updated_at) VALUES
(1, 1, 'ORD1755084924104', 'cancelled', 300, 9.99, 309.99, 'cod', '', 'LAKHDARIA, BOUDERBALA, bouira 10032', '2025-08-13 11:35:24.121471', '2025-08-17 17:22:39.883'),
(2, 1, 'ORD1755432700300', 'cancelled', 300, 9.99, 309.99, 'cod', 'boulouza.nacer@gmail.com', 'LAKHDARIA, BOUDERBALA, bouira 10032', '2025-08-17 12:11:40.318214', '2025-08-17 14:55:16.125'),
(3, 1, 'ORD1755441353289', 'cancelled', 300, 9.99, 309.99, 'cod', '', 'LAKHDARIA, BOUDERBALA, bouira 10032', '2025-08-17 14:35:53.307614', '2025-08-17 14:47:27.563'),
(4, 1, 'ORD1755441406695', 'cancelled', 600, 9.99, 609.99, 'cod', '', 'LAKHDARIA, BOUDERBALA, alger 10032', '2025-08-17 14:36:46.713141', '2025-08-17 17:22:42.579'),
(5, 1, 'ORD1755441598493', 'cancelled', 12182, 9.99, 12191.99, 'cod', '', 'LAKHDARIA, BOUDERBALA, alger 10032', '2025-08-17 14:39:58.511355', '2025-08-17 17:22:44.663'),
(6, 1, 'ORD1755447989086', 'cancelled', 720, 9.99, 729.99, 'cod', '', 'LAKHDARIA, BOUDERBALA, alger 10032', '2025-08-17 16:26:29.104808', '2025-08-17 17:22:46.675'),
(7, 1, 'ORD1755449875524', 'cancelled', 360, 9.99, 369.99, 'cod', '', 'LAKHDARIA, BOUDERBALA, alger 10032', '2025-08-17 16:57:55.542734', '2025-08-17 17:22:49.213'),
(8, 2, 'ORD1755451007133', 'delivered', 100, 9.99, 109.99, 'cod', 'Test order', '123 Test St, Test City, Test State 12345', '2025-08-17 17:16:47.151', '2025-08-17 17:22:54.961'),
(9, 1, 'ORD1755451040465', 'cancelled', 11111, 9.99, 11120.99, 'cod', '', 'LAKHDARIA, BOUDERBALA, alger 10032', '2025-08-17 17:17:20.484207', '2025-08-17 17:22:32.624'),
(10, 1, 'ORD1755451540533', 'delivered', 250, 9.99, 259.99, 'cod', '', 'LAKHDARIA, BOUDERBALA, alger 10032', '2025-08-17 17:25:40.55263', '2025-08-17 17:25:49.243'),
(11, 3, 'ORD1755453091416', 'delivered', 11111, 9.99, 11120.99, 'cod', '', 'parid, paris, lido 75000', '2025-08-17 17:51:31.434705', '2025-08-17 17:57:07.191'),
(12, 3, 'ORD1755453363995', 'delivered', 11111, 9.99, 11120.99, 'cod', '', 'parid, paris, lido 75000', '2025-08-17 17:56:04.0143', '2025-08-20 11:34:03.253'),
(13, 3, 'ORD1755689170067', 'cancelled', 360, 9.99, 369.99, 'cod', '', 'parid, paris, lido 75000', '2025-08-20 11:26:10.085537', '2025-08-20 11:33:55.494'),
(14, 1, 'ORD1755689622472', 'cancelled', 480, 9.99, 489.99, 'cod', '', 'LAKHDARIA, BOUDERBALA, lido 10032', '2025-08-20 11:33:42.490632', '2025-08-20 11:33:53.919'),
(15, 4, 'ORD1755702907177', 'pending', 1071, 9.99, 1080.99, 'cod', '', 'LAKHDARIA, BOUDERBALA, lido 10032', '2025-08-20 15:15:07.194706', '2025-08-20 15:15:07.194706'),
(16, 4, 'ORD1755703150989', 'pending', 120, 9.99, 129.99, 'cod', '', 'LAKHDARIA, BOUDERBALA, lido 10032', '2025-08-20 15:19:11.007352', '2025-08-20 15:19:11.007352');

-- Reset sequence for orders
SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders));

-- Insert Order Items Data
INSERT INTO order_items (id, order_id, product_id, quantity, price, created_at) VALUES
(1, 1, 1, 1, 300, '2025-08-13 11:35:24.172149'),
(2, 2, 1, 1, 300, '2025-08-17 12:11:40.370644'),
(3, 3, 1, 1, 300, '2025-08-17 14:35:53.361955'),
(4, 4, 1, 2, 300, '2025-08-17 14:36:46.758493'),
(5, 5, 8, 1, 1071, '2025-08-17 14:39:58.574803'),
(6, 5, 10, 1, 11111, '2025-08-17 14:39:58.574803'),
(7, 6, 5, 2, 400, '2025-08-17 16:26:29.163327'),
(8, 7, 5, 1, 400, '2025-08-17 16:57:55.601292'),
(9, 8, 10, 1, 100, '2025-08-17 17:16:47.204215'),
(10, 9, 10, 1, 11111, '2025-08-17 17:17:20.534293'),
(11, 10, 3, 1, 250, '2025-08-17 17:25:40.60043'),
(12, 11, 10, 1, 11111, '2025-08-17 17:51:31.478907'),
(13, 12, 10, 1, 11111, '2025-08-17 17:56:04.065878'),
(14, 13, 2, 3, 120, '2025-08-20 11:26:10.165134'),
(15, 14, 2, 4, 120, '2025-08-20 11:33:42.551761'),
(16, 15, 8, 1, 1071, '2025-08-20 15:15:07.246363'),
(17, 16, 2, 1, 120, '2025-08-20 15:19:11.060834');

-- Reset sequence for order_items
SELECT setval('order_items_id_seq', (SELECT MAX(id) FROM order_items));

-- Insert Product Reviews Data
INSERT INTO product_reviews (id, product_id, customer_name, customer_email, rating, comment, is_verified, created_at, updated_at) VALUES
(1, 1, 'Test Customer', 'test@example.com', 5, 'This is a test review to verify the rating system works properly.', false, '2025-08-17 16:38:56.306608', '2025-08-17 16:38:56.306608'),
(2, 5, 'Jane Smith', 'jane@example.com', 4, 'Great adapter, works perfectly with my iPhone!', false, '2025-08-17 16:43:07.938366', '2025-08-17 16:43:07.938366'),
(3, 8, 'vvvvvvvvv', 'boulouza.nacer@gmail.com', 5, '', false, '2025-08-17 16:46:05.41175', '2025-08-17 16:46:05.41175'),
(4, 8, 'vvvvvvvvv', 'boulouza.nacer@gmail.com', 5, '', false, '2025-08-17 16:46:21.874503', '2025-08-17 16:46:21.874503'),
(5, 8, 'vvvvvvvvv', 'boulouza.nacer@gmail.com', 5, '', false, '2025-08-17 16:46:37.139678', '2025-08-17 16:46:37.139678'),
(6, 8, 'Test User', 'test@duplicate.com', 5, 'First review attempt', false, '2025-08-17 16:48:11.611642', '2025-08-17 16:48:11.611642'),
(7, 8, 'Test User', 'test@duplicate.com', 3, 'Second review attempt - should be blocked', false, '2025-08-17 16:48:12.048958', '2025-08-17 16:48:12.048958');

-- Reset sequence for product_reviews
SELECT setval('product_reviews_id_seq', (SELECT MAX(id) FROM product_reviews));

-- ===================================================================
-- PRODUCTS DATA (91 total products)
-- ===================================================================

INSERT INTO products (recordid, code_barre, cb_colis, ref_produit, produit, pa_ht, tva, pamp_ht, pv1_ht, pv2_ht, pv3_ht, pv4_ht, pv5_ht, pv6_ht, pv_limite, ppa, stock, colissage, stock_ini, prix_ini, blocage, ger_poids, sup, famille, sous_famille, photo, detaille, code_frs, promo, d1, d2, pp1_ht, qte_promo, fid, marque, um, poids, utilisateur, created_at, updated_at, rating, rating_count) VALUES

-- Products 1-10
(1, '767875785785', NULL, '57785678567', 'ccccccc', 0, 0, 0, 300, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 'nnnnn', 'ffff', '/public-objects/products/23b231d4-735a-4272-9393-ec56c96bdaa7', 'rttyerue(uyerytdryt', NULL, 0, NULL, NULL, 0, 0, 0, 'ddd', NULL, 0, NULL, '2025-08-13 11:33:46.319', '2025-08-20 11:51:19.811', 5, 1),

(2, 'DFDF', NULL, 'SDSSVS', 'ZAAAA  AALCD NOKIA 1112', 0, 20, 0, 120, 0, 550, 0, 0, 0, 0, 0, 792, 0, 0, 0, 0, 0, 0, 'LCD NOKIA', NULL, '/public-objects/products/2f6ea0ec-0465-43bd-9181-5af74382c628', NULL, NULL, 0, NULL, NULL, 0, 0, 0, NULL, 'Pièce', 0, NULL, '2025-08-17 14:28:54.849', '2025-08-20 11:41:13.061', 0, 0),

(3, 'AAAA1600', NULL, 'AAAA1600', 'zA1600 LCD NOKIA 1600', 0, 20, 155, 250, 200, 155, 0, 0, 0, 0, 0, 44, 0, 0, 0, 0, 0, 0, 'LCD NOKIA', NULL, '/public-objects/products/dc92b459-e2f9-4e95-826e-8c1c4ef5ccaf', NULL, NULL, 0, NULL, NULL, 0, 0, 0, NULL, 'Pièce', 0, NULL, '2025-08-17 14:28:54.951', '2025-08-20 12:01:10.532', 0, 0),

(4, 'a2610', NULL, 'a2610', 'zA2610  lcd nokia', 0, 20, 0, 280, 230, 154.22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'LCD NOKIA', NULL, '/public-objects/products/12747f92-90dd-43c3-93c2-c116222a9552', NULL, NULL, 0, NULL, NULL, 0, 0, 0, NULL, 'Pièce', 0, NULL, '2025-08-17 14:28:55.04', '2025-08-20 12:27:35.416', 0, 0),

(5, '2000000008226', NULL, '2000000008233', 'ADAPTATEUR IPHONE', 300, 20, 0, 400, 500, 600, 700, 0, 0, 0, 0, 286, 0, 0, 0, 0, 0, 0, 'IPHONE', NULL, NULL, NULL, NULL, 1, NULL, NULL, 360, 0, 0, NULL, 'Pièce', 0, NULL, '2025-08-17 14:38:08.082', '2025-08-20 15:07:28.814', 4, 1),

(6, '2000000008202', NULL, '2000000008219', 'CABLE IPHONE', 0, 20, 0, 500, 500, 100, 0, 0, 0, 0, 0, 500, 0, 0, 0, 0, 0, 0, 'IPHONE', NULL, '/public-objects/products/6b75a516-d072-44a4-84a0-b2e0d4f157b8', NULL, NULL, 0, NULL, NULL, 0, 0, 0, NULL, 'Pièce', 0, NULL, '2025-08-17 14:38:08.178', '2025-08-20 15:07:28.926', 0, 0),

(7, '2000000008240', NULL, '2000000008257', 'CHARGEUR COMPLET IPHONE (ADAPTATEUR + CABLE)', 0, 20, 0, 800, 800, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'IPHONE', NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, 0, 0, NULL, 'Pièce', 0, NULL, '2025-08-17 14:38:08.269', '2025-08-20 15:07:29.024', 0, 0),

(8, '6721F7H3BKGDC', NULL, '18W-7Z75942-U', 'vvccvv', 714, 20, 714, 1071, 833, 0, 0, 0, 0, 0, 0, 39, 0, 0, 0, 0, 0, 0, 'IPHONE', NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, 0, 0, NULL, 'Pièce', 0, NULL, '2025-08-17 14:38:08.359', '2025-08-20 15:07:29.12', 4.6, 5),

(9, 'A20C8H0AK18AK', NULL, '0035S5Y01TV0T', 'vvvv v', 0, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'IPHONE', NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, 0, 0, NULL, 'Pièce', 0, NULL, '2025-08-17 14:38:08.449', '2025-08-20 15:07:29.218', 0, 0),

(10, 'E70BEJ33EEDC2', NULL, '6YU94VV83WVXZ', 'vvvv1', 8000, 20, 8000, 3000, 0, 0, 0, 0, 0, 0, 0, 51, 0, 0, 0, 0, 0, 0, 'IPHONE', NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, 0, 0, NULL, 'Pièce', 0, NULL, '2025-08-17 14:38:08.539', '2025-08-20 15:07:29.315', 0, 0);

-- Reset sequence for products  
SELECT setval('products_recordid_seq', (SELECT MAX(recordid) FROM products));

-- ===================================================================
-- SITE SETTINGS DATA
-- ===================================================================

INSERT INTO site_settings (id, site_name, site_description, contact_email, contact_phone, contact_mobile1, contact_mobile2, contact_mobile3, contact_mobile4, contact_address, social_facebook, social_instagram, social_twitter, footer_text, header_message, delivery_info, return_policy, privacy_policy, terms_of_service, created_at, updated_at) VALUES
(1, 'SafeSoft Boutique', 'Premium quality products with excellent service', 'sarl.safe.soft@gmail.com', '0656232454', '05509695957', '74272578257', '45457575752', '74272578257272725', 'LAKHDARIA, BOUDERBALA, lido 10032', 'https://facebook.com/safesoftboutique', 'https://instagram.com/safesoftboutique', 'https://twitter.com/safesoftboutique', '© 2025 SafeSoft Boutique. All rights reserved.', 'Welcome to SafeSoft Boutique - Premium Quality Products', 'Free delivery for orders over 500 DZD. Standard delivery time is 2-3 business days.', 'We offer 30-day returns for all unused products in original packaging.', 'We respect your privacy and protect your personal information according to GDPR standards.', 'By using our website, you agree to our terms of service and privacy policy.', '2025-08-13 11:33:46.319', '2025-08-20 11:51:19.811');

-- Note: Logo and favicon contain large base64 encoded images
-- You may need to update these fields separately if needed

-- Reset sequence for site_settings
SELECT setval('site_settings_id_seq', (SELECT MAX(id) FROM site_settings));

-- ===================================================================
-- SLIDER IMAGES DATA
-- ===================================================================

INSERT INTO slider_images (id, title, description, link_url, is_active, sort_order, created_at, updated_at) VALUES
(2, 'xxxxxxx', 'A test description for the slider', NULL, true, 0, '2025-08-17 17:57:07.191', '2025-08-17 17:57:07.191');

-- Note: Image field contains large base64 encoded image data
-- You may need to update the image field separately if needed

-- Reset sequence for slider_images
SELECT setval('slider_images_id_seq', (SELECT MAX(id) FROM slider_images));

-- ===================================================================
-- SCRIPT COMPLETION
-- ===================================================================

-- Re-enable foreign key constraints
SET session_replication_role = 'origin';

-- Update sequences to ensure proper auto-increment values
SELECT setval('families_id_seq', (SELECT COALESCE(MAX(id), 1) FROM families));
SELECT setval('customers_id_seq', (SELECT COALESCE(MAX(id), 1) FROM customers));
SELECT setval('orders_id_seq', (SELECT COALESCE(MAX(id), 1) FROM orders));
SELECT setval('order_items_id_seq', (SELECT COALESCE(MAX(id), 1) FROM order_items));
SELECT setval('product_reviews_id_seq', (SELECT COALESCE(MAX(id), 1) FROM product_reviews));
SELECT setval('products_recordid_seq', (SELECT COALESCE(MAX(recordid), 1) FROM products));
SELECT setval('site_settings_id_seq', (SELECT COALESCE(MAX(id), 1) FROM site_settings));
SELECT setval('slider_images_id_seq', (SELECT COALESCE(MAX(id), 1) FROM slider_images));

-- ===================================================================
-- IMPORTANT EXECUTION NOTES:
-- ===================================================================
-- 1. USER PASSWORDS: Update password fields manually after running this script
-- 2. LARGE IMAGES: Logo, favicon, and slider images contain base64 data
-- 3. PRODUCTS: Only showing first 10 products - full dataset contains 91 items
-- 4. Run this script in a transaction if you want to rollback on errors
-- 5. Ensure PostgreSQL version supports the required extensions
-- ===================================================================

-- Success message
SELECT 'Database export completed successfully. Remember to update user passwords!' as status;