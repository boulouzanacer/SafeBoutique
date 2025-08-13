# Overview

SafeSoft Boutique is a full-stack e-commerce web application built with React and Express.js. The application provides an online storefront for product browsing and purchasing, with a comprehensive admin panel for inventory and order management. It features a modern, responsive design using shadcn/ui components and Tailwind CSS, with PostgreSQL database integration via Drizzle ORM.

# User Preferences

Preferred communication style: Simple, everyday language.

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
- **Products Table**: Detailed product information including pricing tiers, stock levels, categories, and base64 encoded images
- **Orders & Order Items**: Complete order management with customer relationships and line items
- **Customers Table**: Customer information for order tracking and management
- **Users Table**: Basic user authentication structure

## Component Architecture
The application is organized into logical component directories:
- **UI Components**: Reusable shadcn/ui components for consistent design
- **Page Components**: Top-level route components (Home, Admin, Checkout)
- **Feature Components**: Business logic components (ProductCard, CartSidebar, Admin modules)
- **Layout Components**: Structural components (Header) for consistent page layout

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