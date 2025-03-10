# MyERP Frontend

## Overview
This is the frontend application for MyERP, an Enterprise Resource Planning system. This React-based application provides a modern user interface for managing business operations.

## Technology Stack
- React 18
- TypeScript
- Vite (for build tooling)
- React Router v7 (for navigation)
- Redux Toolkit & React Redux (for state management)
- React Query (for data fetching)
- Axios (for API requests)
- React Hook Form (for form handling)
- Zod (for validation)
- Shadcn UI & Radix UI (for UI components)
- TailwindCSS (for styling)
- Chart.js (for data visualization)
- Stripe integration (for payments)

## Project Structure
```
src/
├── app/          # App configuration, Redux store
├── assets/       # Static assets (images, icons)
├── components/   # Reusable UI components
├── context/      # React context providers
├── features/     # Feature-based code organization
├── hooks/        # Custom React hooks
├── layouts/      # Page layout components
├── lib/          # Library configurations
├── models/       # TypeScript interfaces/types
├── pages/        # Application pages/routes
├── schemas/      # Zod validation schemas
├── services/     # API service calls
├── styles/       # Global styles
├── utils/        # Utility functions
├── App.tsx       # Main App component
└── main.tsx      # Application entry point
```

## Getting Started

### Prerequisites
- Node.js (v18 or later recommended)
- Yarn or npm

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd my-erp/frontend
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

- `yarn dev` - Start the development server
- `yarn build` - Build the production-ready application
- `yarn lint` - Run ESLint to check code quality
- `yarn preview` - Preview the built application locally

## Production Deployment

This application is configured for deployment on Vercel. The `vercel.json` file contains the necessary configuration for deployment.

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add some amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## Best Practices

- Follow the existing project structure
- Use TypeScript types for all components and functions
- Validate form inputs using Zod schemas
- Use React Query for API data fetching
- Implement responsive designs using TailwindCSS
- Follow the component patterns established in the codebase
