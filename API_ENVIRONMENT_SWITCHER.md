# API Environment Switcher

## Overview

The application now supports switching between three different API environments through a user-friendly settings interface:

- **GCP (Google Cloud Platform)** - Production environment (Default)
- **RAILWAY** - Staging environment
- **KOYEB** - Development environment

## Features

### User Interface
- Access the Settings page from:
  - Main menu at `/menu` (Settings card)
  - App sidebar (Settings link)
  - Direct URL: `/settings`

### Settings Page
The settings page provides:
- Clear display of the current active environment
- Radio button selection for switching environments
- Real-time environment information (name, description, URL)
- Warning message about page reload requirement
- Apply/Cancel buttons for changes

### Local Development
When `VITE_API_URL` is set to `localhost` or `127.0.0.1`, it takes priority over the environment selection. This allows developers to work with local backends without affecting the environment switcher.

## Environment Variables

You can customize the API URLs using environment variables:

```bash
# Local development (takes priority when set to localhost)
VITE_API_URL=http://127.0.0.1:8080

# GCP (Google Cloud Platform) - Production (Default)
VITE_GCP_API_URL=https://your-gcp-api-url.com

# Railway - Staging
VITE_RAILWAY_API_URL=https://myerp-production.up.railway.app

# Koyeb - Development
VITE_KOYEB_API_URL=https://your-koyeb-api-url.com
```

## Implementation Details

### File Structure

```
frontend/src/
├── lib/
│   └── api-environment.ts          # Core logic for environment management
├── hooks/
│   └── use-api-environment.ts      # React hook for components
├── pages/
│   └── dashboard/
│       └── settings-page.tsx       # Settings UI
└── app/
    ├── constants.ts                 # Updated to use environment manager
    └── routes.tsx                   # Added /settings route
```

### Storage

The selected environment is stored in `localStorage` under the key `api_environment`. This persists across browser sessions.

### Environment Change Flow

1. User selects a different environment
2. Clicks "Apply Changes"
3. Selection is saved to localStorage
4. Custom event `api-environment-changed` is dispatched
5. Page automatically reloads after 1.5 seconds
6. All API calls now use the new environment URL

### Default Values

If environment variables are not set, the system uses these defaults:
- **GCP**: `https://myerp-gcp.example.com`
- **RAILWAY**: `https://myerp-production.up.railway.app`
- **KOYEB**: `https://myerp-koyeb.example.com`

## Usage in Code

### Using the Hook

```typescript
import { useApiEnvironment } from '@/hooks/use-api-environment';

function MyComponent() {
  const { 
    currentEnvironment,      // 'GCP' | 'RAILWAY' | 'KOYEB'
    currentConfig,           // Full config with name, url, description
    availableEnvironments,   // Array of all environments
    setApiEnvironment        // Function to change environment
  } = useApiEnvironment();

  return (
    <div>
      Current: {currentEnvironment}
      URL: {currentConfig.url}
    </div>
  );
}
```

### Direct API Access

```typescript
import { getApiBaseUrl, getApiEnvironment } from '@/lib/api-environment';

// Get current environment name
const env = getApiEnvironment(); // 'GCP' | 'RAILWAY' | 'KOYEB'

// Get current API URL
const url = getApiBaseUrl();

// Change environment
import { setApiEnvironment } from '@/lib/api-environment';
setApiEnvironment('RAILWAY');
```

### Existing Code Compatibility

All existing code using `baseUrl` from `@/app/constants` continues to work without modification:

```typescript
import { baseUrl } from '@/app/constants';

// This automatically uses the selected environment
fetch(`${baseUrl}/api/endpoint`);
```

## Benefits

1. **No Code Changes Required**: Switch between environments without redeploying
2. **Persistent Selection**: Environment choice persists across sessions
3. **User-Friendly**: Simple UI for non-technical users
4. **Developer-Friendly**: Local development still works seamlessly
5. **Flexible**: Easy to add more environments in the future

## Adding New Environments

To add a new environment:

1. Update `API_ENVIRONMENTS` in `lib/api-environment.ts`:
```typescript
export const API_ENVIRONMENTS = {
  // ... existing environments
  NEW_ENV: {
    name: 'NEW_ENV',
    url: import.meta.env.VITE_NEW_ENV_API_URL || 'https://default-url.com',
    description: 'Description of new environment',
  },
};
```

2. Update the `ApiEnvironment` type:
```typescript
export type ApiEnvironment = 'GCP' | 'RAILWAY' | 'KOYEB' | 'NEW_ENV';
```

3. Add environment variable to your `.env` file:
```bash
VITE_NEW_ENV_API_URL=https://your-new-env-url.com
```

The UI will automatically show the new environment option!

## Troubleshooting

### Environment not changing
- Make sure to click "Apply Changes"
- The page should reload automatically
- Check browser console for errors

### Local development not working
- Ensure `VITE_API_URL` includes `localhost` or `127.0.0.1`
- This takes priority over environment selection

### Custom URLs not applying
- Check environment variable names (must start with `VITE_`)
- Restart the development server after changing `.env` files
- Vite only loads environment variables at build/start time






