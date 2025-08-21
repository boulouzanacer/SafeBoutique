-- SafeSoft Boutique MySQL Database Schema
-- Generated from PostgreSQL schema for MySQL compatibility
-- Date: 2025-08-20

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- Create database (uncomment and modify if needed)
-- CREATE DATABASE IF NOT EXISTS `safesoft_boutique` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE `safesoft_boutique`;

-- ========================================
-- Users Table (Authentication)
-- ========================================
CREATE TABLE `users` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(100) DEFAULT NULL,
  `last_name` VARCHAR(100) DEFAULT NULL,
  `profile_image_url` VARCHAR(255) DEFAULT NULL,
  `is_email_verified` BOOLEAN DEFAULT FALSE,
  `is_admin` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- Products Table (Main Product Catalog)
-- ========================================
CREATE TABLE `products` (
  `recordid` INT AUTO_INCREMENT PRIMARY KEY,
  `code_barre` VARCHAR(20) NOT NULL,
  `cb_colis` VARCHAR(20) DEFAULT NULL,
  `ref_produit` VARCHAR(20) NOT NULL,
  `produit` VARCHAR(100) DEFAULT NULL,
  `pa_ht` DOUBLE DEFAULT 0,
  `tva` DOUBLE DEFAULT 0,
  `pamp_ht` DOUBLE DEFAULT 0,
  `pv1_ht` DOUBLE DEFAULT NULL,
  `pv2_ht` DOUBLE DEFAULT NULL,
  `pv3_ht` DOUBLE DEFAULT NULL,
  `pv4_ht` DOUBLE DEFAULT NULL,
  `pv5_ht` DOUBLE DEFAULT NULL,
  `pv6_ht` DOUBLE DEFAULT NULL,
  `pv_limite` DOUBLE DEFAULT NULL,
  `ppa` DOUBLE DEFAULT NULL,
  `stock` DOUBLE DEFAULT 0,
  `colissage` DOUBLE DEFAULT NULL,
  `stock_ini` DOUBLE DEFAULT 0,
  `prix_ini` DOUBLE DEFAULT 0,
  `blocage` INT DEFAULT NULL,
  `ger_poids` INT DEFAULT NULL,
  `sup` INT DEFAULT NULL,
  `famille` VARCHAR(50) DEFAULT NULL,
  `sous_famille` VARCHAR(50) DEFAULT NULL,
  `photo` TEXT DEFAULT NULL,
  `detaille` VARCHAR(1536) DEFAULT NULL,
  `code_frs` VARCHAR(20) DEFAULT NULL,
  `promo` INT DEFAULT NULL,
  `d1` TIMESTAMP DEFAULT NULL,
  `d2` TIMESTAMP DEFAULT NULL,
  `pp1_ht` DOUBLE DEFAULT NULL,
  `qte_promo` INT DEFAULT NULL,
  `fid` INT DEFAULT NULL,
  `marque` VARCHAR(50) DEFAULT NULL,
  `um` VARCHAR(5) DEFAULT NULL,
  `poids` DOUBLE DEFAULT NULL,
  `utilisateur` VARCHAR(25) DEFAULT NULL,
  `rating` DOUBLE DEFAULT 0,
  `rating_count` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- Customers Table
-- ========================================
CREATE TABLE `customers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) UNIQUE DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `state` VARCHAR(100) DEFAULT NULL,
  `zip_code` VARCHAR(20) DEFAULT NULL,
  `is_registered` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- Orders Table
-- ========================================
CREATE TABLE `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_id` INT DEFAULT NULL,
  `order_number` VARCHAR(50) NOT NULL UNIQUE,
  `status` VARCHAR(50) DEFAULT 'pending',
  `subtotal` DOUBLE NOT NULL,
  `delivery` DOUBLE DEFAULT 9.99,
  `total` DOUBLE NOT NULL,
  `payment_method` VARCHAR(50) DEFAULT 'cod',
  `notes` TEXT DEFAULT NULL,
  `delivery_address` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL
);

-- ========================================
-- Order Items Table
-- ========================================
CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `price` DOUBLE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`recordid`) ON DELETE CASCADE
);

-- ========================================
-- Product Reviews Table
-- ========================================
CREATE TABLE `product_reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `customer_name` VARCHAR(100) NOT NULL,
  `customer_email` VARCHAR(255) DEFAULT NULL,
  `rating` INT NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `comment` TEXT DEFAULT NULL,
  `is_verified` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`recordid`) ON DELETE CASCADE
);

-- ========================================
-- Site Settings Table
-- ========================================
CREATE TABLE `site_settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `site_name` VARCHAR(255) NOT NULL,
  `site_description` TEXT NOT NULL,
  `logo` TEXT DEFAULT NULL,
  `favicon` TEXT DEFAULT NULL,
  `contact_email` VARCHAR(255) NOT NULL,
  `contact_phone` VARCHAR(20) NOT NULL,
  `contact_address` TEXT NOT NULL,
  `social_facebook` TEXT DEFAULT NULL,
  `social_instagram` TEXT DEFAULT NULL,
  `social_twitter` TEXT DEFAULT NULL,
  `footer_text` TEXT NOT NULL,
  `header_message` TEXT DEFAULT NULL,
  `delivery_info` TEXT NOT NULL,
  `return_policy` TEXT NOT NULL,
  `privacy_policy` TEXT NOT NULL,
  `terms_of_service` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- Slider Images Table
-- ========================================
CREATE TABLE `slider_images` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `image` TEXT NOT NULL,
  `link_url` TEXT DEFAULT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- Sessions Table (for Express Session Storage)
-- ========================================
CREATE TABLE `sessions` (
  `sid` VARCHAR(255) NOT NULL PRIMARY KEY,
  `sess` JSON NOT NULL,
  `expire` TIMESTAMP NOT NULL,
  INDEX `IDX_session_expire` (`expire`)
);

-- ========================================
-- Indexes for Performance
-- ========================================

-- Products indexes
CREATE INDEX `idx_products_code_barre` ON `products`(`code_barre`);
CREATE INDEX `idx_products_ref_produit` ON `products`(`ref_produit`);
CREATE INDEX `idx_products_famille` ON `products`(`famille`);
CREATE INDEX `idx_products_promo` ON `products`(`promo`);
CREATE INDEX `idx_products_stock` ON `products`(`stock`);

-- Orders indexes
CREATE INDEX `idx_orders_customer_id` ON `orders`(`customer_id`);
CREATE INDEX `idx_orders_status` ON `orders`(`status`);
CREATE INDEX `idx_orders_created_at` ON `orders`(`created_at`);

-- Order items indexes
CREATE INDEX `idx_order_items_order_id` ON `order_items`(`order_id`);
CREATE INDEX `idx_order_items_product_id` ON `order_items`(`product_id`);

-- Product reviews indexes
CREATE INDEX `idx_product_reviews_product_id` ON `product_reviews`(`product_id`);
CREATE INDEX `idx_product_reviews_rating` ON `product_reviews`(`rating`);

-- ========================================
-- Sample Data (Optional - uncomment if needed)
-- ========================================

-- Insert default admin user (password: 123456 - hashed with bcrypt)
-- INSERT INTO `users` (`email`, `password`, `first_name`, `last_name`, `is_admin`) VALUES
-- ('admin@safesoft.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', TRUE);

-- Insert default site settings
-- INSERT INTO `site_settings` (`site_name`, `site_description`, `contact_email`, `contact_phone`, `contact_address`, `footer_text`, `delivery_info`, `return_policy`, `privacy_policy`, `terms_of_service`) VALUES
-- ('SafeSoft Boutique', 'Your premier destination for professional software solutions and premium products.', 'contact@safesoft.com', '+213 XXX XXX XXX', 'Algeria', 'SafeSoft Boutique - Quality and elegance in every purchase.', 'We deliver within 2-3 business days.', 'Returns accepted within 14 days.', 'We protect your privacy and data.', 'By using our service, you agree to our terms.');

-- ========================================
-- Views for Complex Queries (Optional)
-- ========================================

-- Product statistics view
CREATE VIEW `product_stats` AS
SELECT 
    `famille` AS family,
    COUNT(*) AS product_count,
    AVG(`stock`) AS avg_stock,
    AVG(`rating`) AS avg_rating,
    SUM(CASE WHEN `promo` IS NOT NULL AND `promo` > 0 THEN 1 ELSE 0 END) AS promo_count
FROM `products`
WHERE `produit` IS NOT NULL
GROUP BY `famille`;

-- Order summary view
CREATE VIEW `order_summary` AS
SELECT 
    o.`id`,
    o.`order_number`,
    o.`status`,
    o.`total`,
    o.`created_at`,
    CONCAT(c.`first_name`, ' ', c.`last_name`) AS customer_name,
    c.`email` AS customer_email,
    COUNT(oi.`id`) AS item_count
FROM `orders` o
LEFT JOIN `customers` c ON o.`customer_id` = c.`id`
LEFT JOIN `order_items` oi ON o.`id` = oi.`order_id`
GROUP BY o.`id`, o.`order_number`, o.`status`, o.`total`, o.`created_at`, c.`first_name`, c.`last_name`, c.`email`;

COMMIT;

-- ========================================
-- Notes for Migration from PostgreSQL:
-- ========================================
-- 1. UUID() function replaces gen_random_uuid()
-- 2. JSON type replaces JSONB (MySQL 5.7+)
-- 3. AUTO_INCREMENT replaces SERIAL
-- 4. DOUBLE replaces DOUBLE PRECISION
-- 5. BOOLEAN type is supported in MySQL 5.7+
-- 6. VARCHAR lengths are preserved from PostgreSQL
-- 7. Foreign key constraints are included
-- 8. Indexes are created for performance

-- ========================================
-- Connection String Format for MySQL:
-- ========================================
-- mysql://username:password@localhost:3306/safesoft_boutique
-- 
-- Example for local development:
-- mysql://root:password@localhost:3306/safesoft_boutique
--
-- For production, use environment variables:
-- MYSQL_URL=mysql://user:pass@host:port/database