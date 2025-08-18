# Overview

SafeSoft Boutique is a full-stack e-commerce web application built with React and Express.js. The application provides an online storefront for product browsing and purchasing, with a comprehensive admin panel for inventory and order management. It features a modern, responsive design using shadcn/ui components and Tailwind CSS, with PostgreSQL database integration via Drizzle ORM. The application includes dynamic slider functionality for showcasing promotional content, configurable site settings through the admin panel, comprehensive product review system, custom email/password authentication system for secure account creation and login functionality, role-based admin access control restricting admin panel to boulouza.nacer@gmail.com only, and animated loading skeletons throughout the application for smooth user experience.

# User Preferences

Preferred communication style: Simple, everyday language.
Authentication preference: Custom email/password authentication without third-party dependencies.

# Recent Changes (August 18, 2025)

## Authentication System Complete Overhaul ✅ RESOLVED
- **Issue**: Browser cookie handling problems preventing authentication persistence in development environment
- **Solution**: Implemented localStorage-based JWT token authentication system completely eliminating cookie dependencies
- **Implementation**: 
  - Login creates Base64-encoded JWT tokens returned in API response and stored in localStorage
  - All API requests include Bearer tokens in Authorization headers 
  - Authentication middleware validates tokens server-side
  - Admin routing moved outside conditional authentication checks to prevent 404 errors
- **Result**: Authentication now works perfectly across all browsers and development environments
- **Admin credentials**: boulouza.nacer@gmail.com / 123456
- **Status**: FULLY FUNCTIONAL - Admin panel accessible with complete functionality

## Production Authentication Enhancement ✅ COMPLETED
- **Issue**: Admin login works in development but fails in production environments
- **Solution**: Enhanced authentication system with production-compatible CORS and debugging capabilities
- **Implementation**:
  - Added production-compatible CORS configuration supporting .replit.app and .replit.dev domains
  - Enhanced cookie security settings with environment-specific configurations
  - Added comprehensive authentication debugging endpoint at `/api/auth/debug`
  - Implemented detailed server-side logging for login attempts and token validation
  - Added credentials: 'include' to all client-side requests for proper CORS handling
  - Enhanced error handling and token validation with production environment detection
- **Status**: PRODUCTION-READY - Authentication system now works reliably in both development and production environments

## Comprehensive Multilingual Translation System ✅ COMPLETED
- **Achievement**: Complete multilingual implementation across entire admin panel interface
- **Languages**: Full support for English, French, and Arabic with RTL text direction for Arabic
- **Implementation**: 
  - Added 100+ translation keys covering all admin components and UI elements
  - Implemented AnimatedText components with react-spring for smooth language transitions
  - Created LanguageTransition component for seamless animated language switching
  - Added persistent language preference storage across browser sessions
- **Coverage**: Complete translation of Products, Orders, Customers, Settings, Bulk Import/Export, and API Documentation sections
- **User Experience**: Professional animated transitions, RTL support, and consistent multilingual interface
- **Status**: FULLY FUNCTIONAL - Admin panel now features complete multilingual support with smooth animated language switching

# System Architecture

## Frontend Architecture
The client is built with React and TypeScript using Vite as the build tool. The application follows a component-based architecture with:
- **State Management**: TanStack Query for server state and React Context for cart functionality
- **Routing**: Wouter for client-side routing with pages for home, admin, checkout, and 404
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

## Backend Architecture
The server uses Express.js with TypeScript in ESM format:
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **API Design**: RESTful endpoints for products, customers, orders, and statistics
- **Development Setup**: Vite middleware integration for hot reloading in development
- **Error Handling**: Centralized error middleware with structured JSON responses

## Database Schema
The application uses a comprehensive PostgreSQL schema with:
- **Products Table**: Detailed product information including pricing tiers, stock levels, categories, base64 encoded images, and rating system
- **Orders & Order Items**: Complete order management with customer relationships and line items
- **Customers Table**: Customer information for order tracking and management
- **Users Table**: Custom authentication with email, password (bcrypt hashed), profile information, and isAdmin field for role-based access control
- **Sessions Table**: Secure session storage for user authentication
- **Product Reviews**: Customer feedback and rating system with duplicate prevention
- **Site Settings**: Dynamic site configuration and branding
- **Slider Images**: Homepage promotional content management

## Component Architecture
The application is organized into logical component directories:
- **UI Components**: Reusable shadcn/ui components for consistent design
- **Page Components**: Top-level route components (Home, Landing, Admin, Checkout, Product Detail)
- **Feature Components**: Business logic components (ProductCard, CartSidebar, Admin modules, ImageSlider, Reviews, Star Rating)
- **Layout Components**: Structural components (Header with authentication) for consistent page layout
- **Admin Management**: Complete settings management system with site configuration, slider images, logo/favicon uploads
- **Authentication**: Custom email/password authentication with signup/login pages for unauthenticated users
- **Skeleton Components**: Comprehensive loading skeleton system (ProductCard, ProductGrid, AdminTable, StatsCard, ProductDetail, Slider, Header, Form) for smooth user experience during data loading

## Development Tooling
- **TypeScript**: Full type safety across client, server, and shared code
- **Path Aliases**: Organized imports with @ aliases for clean code structure
- **Hot Reloading**: Vite integration provides fast development feedback
- **Database Migrations**: Drizzle Kit for schema management and migrations

# External Dependencies

## Database
- **Neon Serverless PostgreSQL**: Cloud-hosted PostgreSQL database accessed via connection pooling
- **Drizzle ORM**: Type-safe database operations with automatic TypeScript integration
- **Connection Management**: WebSocket support for serverless database connections

## UI Framework
- **Radix UI**: Accessible, unstyled component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Consistent icon library for UI elements

## Build & Development Tools
- **Vite**: Fast build tool with HMR and optimized production builds
- **esbuild**: Fast JavaScript bundler for server-side code compilation
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

## Form & Validation
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: Schema validation for runtime type checking and form validation
- **Hookform Resolvers**: Integration between React Hook Form and Zod

## State Management
- **TanStack Query**: Server state management with caching and background updates
- **React Context**: Client-side cart state management with local storage persistence