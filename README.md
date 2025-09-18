# COSMOS ERP Frontend

## Overview
This is the frontend application for COSMOS ERP, a comprehensive Enterprise Resource Planning system built for modern businesses. The application includes multiple modules, with a special focus on delivery management, inventory control, and sales tracking.

## Key Features

### Core Modules
- **User Management**: Role-based access control with different user types (Admin, Moderator, Franchise)
- **Product Management**: Complete product lifecycle with variants and barcode support
- **Inventory Control**: Real-time tracking across multiple locations
- **Sales & Purchases**: Comprehensive sales management with receipt generation
- **Supplier Management**: Supplier relationship management and billing
- **Franchise Management**: Multi-franchise oversight and coordination
- **Order & Delivery**: Integrated delivery tracking system
- **Analytics & Reporting**: Advanced business intelligence dashboards

### Delivery App Features
- Real-time order tracking with WebSocket integration
- Mobile-optimized interface
- Offline capability with PWA support
- Delivery status management
- Customer contact integration
- Order history tracking
- Geolocation support

## Technical Architecture

### Frontend Framework
- **Core**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7 with type-safe routes

### State Management
- **Global State**: Redux Toolkit with typed slices
- **Server State**: TanStack Query (React Query) v5
  - Optimistic updates
  - Real-time data synchronization
  - Automatic background refetching
  - Infinite loading support

### Data Fetching
- **API Client**: Native Fetch API with typed responses
- **Real-time Updates**: WebSocket integration for live order tracking
- **Caching Strategy**: 
  - Persistent caching with React Query
  - Optimistic updates for better UX
  - Automatic retry on failure

### UI Components
- **Component Library**: Shadcn UI & Radix UI
- **Styling**: TailwindCSS with custom theme
- **Data Grid**: TanStack Table with features:
  - Sorting
  - Filtering
  - Pagination
  - Column visibility
  - Row selection

### Form Handling
- **Form Management**: React Hook Form
- **Validation**: Zod schemas
- **Type Safety**: Full TypeScript integration

### Authentication & Security
- **Token Management**: JWT with secure storage
- **Role-Based Access**: Protected routes by user type
- **API Security**: Bearer token authentication

### Performance Optimizations
- **Code Splitting**: Route-based chunking
- **PWA Features**: 
  - Service Worker caching
  - Offline support
  - Home screen installation
- **Image Optimization**: Lazy loading and WebP support

## Project Structure
```
src/
├── app/          # App configuration, Redux store
├── assets/       # Static assets (images, icons)
├── components/   # Reusable UI components
│   ├── common/   # Shared components
│   ├── ui/       # UI primitives
│   └── feature-specific/ # Feature-based components
├── features/     # Redux slices and features
├── hooks/        # Custom React hooks
├── layouts/      # Page layouts
├── models/       # TypeScript types
├── pages/        # Application routes
├── schemas/      # Validation schemas
├── services/     # API services
└── utils/        # Utility functions
```

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- Yarn or npm
- Git

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd cosmos-erp/frontend
```

2. Install dependencies
```bash
yarn install
# or
npm install
```

3. Start the development server
```bash
yarn dev
# or
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Mobile Support
The application is optimized for mobile devices with:
- Responsive design using Tailwind breakpoints
- PWA support with manifest.json configuration
- Offline capabilities through service worker
- Touch-optimized interfaces
- Adaptive layouts for different screen sizes

## Deployment
The application is configured for deployment on Vercel with:
- Automatic HTTPS
- Edge Network CDN
- Continuous Deployment
- Environment Variable Management
- Preview Deployments for PRs

## Best Practices

### Code Organization
- Feature-based component structure
- Shared component library
- Type-safe development with TypeScript
- Consistent file naming conventions

### Development Guidelines
- Use TypeScript for all new code
- Implement proper error handling
- Write responsive layouts
- Follow component composition patterns
- Use React Query for data fetching
- Implement proper loading states

### Performance
- Implement code splitting
- Optimize bundle size
- Use proper caching strategies
- Implement proper error boundaries
- Optimize images and assets
- Minimize main thread blocking

### State Management
- Use Redux for global application state
- Use React Query for server state
- Implement optimistic updates
- Handle loading and error states
- Use proper caching strategies

## Contributing
1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License
Proprietary software. All rights reserved by COSMOS Algerie.


