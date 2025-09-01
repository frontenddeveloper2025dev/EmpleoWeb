# replit.md

## Overview

This is a job portal web application built with React, Express.js, and PostgreSQL. The platform serves two types of users: job seekers who can browse and apply for jobs, and employers who can post job openings and manage applications. The application features user authentication, job search functionality with filters, application management, and a comprehensive dashboard for both user types.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for client-side routing with pages for home, login, register, dashboard, and job details
- **UI Components**: Shadcn/ui component library with Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Forms**: React Hook Form with Zod for validation and type safety

### Backend Architecture
- **Framework**: Express.js with TypeScript running in ESM mode
- **Database ORM**: Drizzle ORM for type-safe database operations and migrations
- **Authentication**: JWT-based authentication with bcryptjs for password hashing
- **API Design**: RESTful API structure with middleware for authentication and logging
- **Error Handling**: Centralized error handling middleware with structured error responses

### Database Design
- **Users Table**: Stores user credentials and profile information with user type differentiation
- **Companies Table**: Company information linked to employer users
- **Jobs Table**: Job postings with detailed information including salary ranges and skills
- **Applications Table**: Job applications linking users to jobs with status tracking
- **Relationships**: Proper foreign key relationships between all entities for data integrity

### Authentication & Authorization
- **Registration/Login**: Separate endpoints for user registration and authentication
- **JWT Tokens**: Stateless authentication using JSON Web Tokens
- **Role-based Access**: User type differentiation (job_seeker vs employer) for feature access
- **Protected Routes**: Middleware-based route protection for authenticated endpoints

### Data Storage Strategy
- **Development Storage**: In-memory storage implementation for rapid development and testing
- **Production Ready**: Drizzle ORM configuration for PostgreSQL with proper migration support
- **Schema Validation**: Zod schemas for runtime type checking and API validation
- **Type Safety**: Shared TypeScript types between frontend and backend

## External Dependencies

### Database
- **PostgreSQL**: Primary database using Neon Database serverless PostgreSQL
- **Drizzle ORM**: Type-safe database operations with automatic migration generation

### UI/UX Libraries
- **Radix UI**: Accessible, unstyled UI primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography
- **React Icons**: Additional icon sets including social media icons

### Development Tools
- **TypeScript**: Full type safety across the entire application
- **ESBuild**: Fast bundling for production builds
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

### Authentication & Security
- **bcryptjs**: Password hashing for secure user authentication
- **jsonwebtoken**: JWT token generation and verification

### Date/Time Handling
- **date-fns**: Modern date utility library with internationalization support

### Form Management
- **React Hook Form**: Performant form library with minimal re-renders
- **Hookform Resolvers**: Integration with Zod for schema validation

### Deployment
- **Replit**: Configured for Replit deployment with development tools
- **Environment Variables**: DATABASE_URL and JWT_SECRET for configuration