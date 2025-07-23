# Technology Stack

## Core Technologies
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Package Manager**: NPM
- **Routing**: React Router v7
- **State Management**: Redux Toolkit + React Query
- **UI Components**: Shadcn UI & Radix UI primitives
- **Styling**: TailwindCSS
- **Form Handling**: React Hook Form with Zod validation
- **Data Tables**: TanStack Table (React Table)
- **API Client**: Axios
- **Authentication**: JWT with secure storage

## Key Libraries
- **Data Fetching**: @tanstack/react-query
- **State Management**: @reduxjs/toolkit, react-redux
- **UI Components**: Multiple Radix UI components (@radix-ui/*)
- **Styling Utilities**: class-variance-authority, tailwind-merge, clsx
- **Form Validation**: zod, @hookform/resolvers
- **Date Handling**: date-fns
- **Charts**: recharts, chart.js
- **Icons**: lucide-react, @iconify/react
- **Notifications**: sonner, @radix-ui/react-toast
- **Barcode**: react-barcode

## Project Commands
```bash
# Development server
npm run dev

# Type checking and production build
npm run build

# Linting
npm run lint

# Preview production build
npm run preview
```

## Path Aliases
- `@/` - Alias for the src directory

## Browser Support
- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers on iOS and Android

## Deployment
- Configured for Vercel deployment
- Environment variables managed through Vercel
- Continuous deployment from main branch