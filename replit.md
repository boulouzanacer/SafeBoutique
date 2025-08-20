# Overview
SafeSoft Boutique is a full-stack e-commerce web application enabling online product browsing and purchasing, complemented by a comprehensive admin panel for inventory and order management. It features a modern, responsive design with dynamic content showcases, configurable site settings, a robust product review system, and secure custom authentication with role-based access control. The application aims to provide a smooth user experience with animated loading skeletons and a focus on intuitive management for business owners.

# User Preferences
Preferred communication style: Simple, everyday language.
Authentication preference: Custom email/password authentication without third-party dependencies.

# System Architecture

## Frontend Architecture
The client is built with React and TypeScript using Vite, following a component-based architecture.
- **State Management**: TanStack Query for server state and React Context for cart functionality.
- **Routing**: Wouter for client-side routing, covering home, admin, checkout, and 404 pages.
- **UI Framework**: shadcn/ui components built on Radix UI primitives, styled with Tailwind CSS.
- **Form Handling**: React Hook Form with Zod validation for type-safe form management.
- **Multilingual Support**: Comprehensive multilingual implementation across the admin panel, supporting English, French, and Arabic (with RTL support), including animated transitions and persistent language preferences.
- **UI/UX Decisions**: Responsive design, professional styling, animated loading skeletons, and a consistent icon library (Lucide React) for a smooth user experience.

## Backend Architecture
The server uses Express.js with TypeScript in ESM format.
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations.
- **API Design**: RESTful endpoints for products, customers, orders, and statistics.
- **Development Setup**: Vite middleware integration for hot reloading.
- **Error Handling**: Centralized error middleware with structured JSON responses.
- **Authentication**: localStorage-based JWT token authentication system with bcrypt hashing for passwords, role-based access control, and production-compatible CORS configurations.
- **Object Storage**: Integration with Google Cloud Storage for product image uploads, including secure presigned URL generation and handling of public/private access.

## Database Schema
The application uses a comprehensive PostgreSQL schema including:
- **Products**: Detailed product information (pricing tiers, stock, categories, images, ratings).
- **Orders & Order Items**: Complete order management.
- **Customers**: Customer information for tracking.
- **Users**: Custom authentication with email, hashed password, profile, and `isAdmin` field.
- **Sessions**: Secure session storage.
- **Product Reviews**: Customer feedback system.
- **Site Settings**: Dynamic site configuration.
- **Slider Images**: Homepage promotional content.

## Component Architecture
Organized into logical directories:
- **UI Components**: Reusable shadcn/ui components.
- **Page Components**: Top-level route components.
- **Feature Components**: Business logic components (e.g., ProductCard, CartSidebar, Admin modules).
- **Layout Components**: Structural components (e.g., Header).
- **Admin Management**: Settings, slider images, logo/favicon uploads, and bulk import/export with selective update options.
- **Authentication**: Custom signup/login pages.
- **Skeleton Components**: Comprehensive loading skeletons for various UI elements.

## Development Tooling
- **TypeScript**: Full type safety.
- **Path Aliases**: Organized imports.
- **Hot Reloading**: Fast development feedback via Vite.
- **Database Migrations**: Drizzle Kit for schema management.

# External Dependencies

## Database
- **Neon Serverless PostgreSQL**: Cloud-hosted PostgreSQL.
- **Drizzle ORM**: Type-safe database operations.

## UI Framework
- **Radix UI**: Accessible component primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.

## Build & Development Tools
- **Vite**: Fast build tool.
- **esbuild**: Fast JavaScript bundler.
- **PostCSS**: CSS processing.

## Form & Validation
- **React Hook Form**: Performant form library.
- **Zod**: Schema validation.
- **Hookform Resolvers**: Integration with Zod.

## State Management
- **TanStack Query**: Server state management.
- **React Context**: Client-side cart state management.

## Object Storage
- **Google Cloud Storage**: For product image storage.