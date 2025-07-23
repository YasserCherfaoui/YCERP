# Project Structure

## Directory Organization

```
src/
├── app/          # App configuration, Redux store, routes, constants
├── assets/       # Static assets (images, SVGs, JSON data)
├── components/   # UI components organized by purpose
│   ├── common/   # Shared components (app-bar, sidebar, etc.)
│   ├── ui/       # UI primitives (shadcn components)
│   ├── feature-specific/ # Feature-based components organized by domain
│   └── theme-provider.tsx # Theme configuration
├── context/      # React context providers
├── features/     # Redux slices organized by domain
├── hooks/        # Custom React hooks
├── layouts/      # Page layout components
├── lib/          # Utility libraries and helpers
├── models/       # TypeScript type definitions
│   ├── data/     # Core data models
│   ├── requests/ # API request types
│   └── responses/ # API response types
├── pages/        # Route components organized by feature
├── schemas/      # Zod validation schemas
├── services/     # API service modules
├── styles/       # Global CSS and style configurations
└── utils/        # Utility functions
```

## Naming Conventions

- **Files**: Kebab-case for component files (`app-sidebar.tsx`)
- **Components**: PascalCase for component names (`AppSidebar`)
- **Types/Interfaces**: PascalCase with descriptive names (`ProductVariant`)
- **Functions**: camelCase for functions and hooks (`useAuth`, `validateEntryExitBill`)
- **Constants**: UPPER_SNAKE_CASE for constants

## Component Organization

### Feature-Specific Components
Components are organized by domain/feature:
- `company/` - Company management components
- `company-products/` - Product management components
- `company-sales/` - Sales management components
- `franchise/` - Franchise-specific components
- `orders/` - Order management components

### Common Components
Reusable components shared across features:
- Navigation elements
- Authentication components
- Layout components
- UI utilities

### UI Components
Shadcn UI components and primitives:
- Form controls
- Data display components
- Feedback components
- Navigation components

## State Management

- **Global State**: Redux slices in `features/` directory
- **Server State**: API services in `services/` directory
- **Local State**: React hooks and context in components

## Routing

- Routes defined in `app/routes.tsx`
- Page components in `pages/` directory
- Route protection via `*-private-route.tsx` components