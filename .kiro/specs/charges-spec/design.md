# Frontend Charges System Design

## Architecture Overview

### Component Architecture
The Frontend Charges System follows a modular component architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                     │
├─────────────────────────────────────────────────────────────┤
│                 Page Components                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Charges   │ │  Exchange   │ │   Salary    │           │
│  │    Pages    │ │    Pages    │ │    Pages    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│                 Feature Components                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Charges   │ │  Exchange   │ │   Salary    │           │
│  │ Components  │ │ Components  │ │ Components  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│                 Shared Components                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │     UI      │ │   Common    │ │   Layout    │           │
│  │ Components  │ │ Components  │ │ Components  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│                 State Management Layer                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Charges   │ │  Exchange   │ │   Salary    │           │
│  │    Slice    │ │    Slice    │ │    Slice    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│                 Service Layer (API)                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Charges   │ │  Exchange   │ │   Salary    │           │
│  │  Services   │ │  Services   │ │  Services   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│                 Backend API Layer (Go)                     │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure
```
src/
├── components/
│   ├── feature-specific/
│   │   ├── charges/
│   │   │   ├── charges-dashboard.tsx
│   │   │   ├── charges-list.tsx
│   │   │   ├── charges-form.tsx
│   │   │   ├── charges-detail.tsx
│   │   │   ├── charges-analytics.tsx
│   │   │   └── charges-export.tsx
│   │   ├── exchange-rates/
│   │   │   ├── exchange-dashboard.tsx
│   │   │   ├── exchange-form.tsx
│   │   │   ├── exchange-history.tsx
│   │   │   ├── exchange-calculator.tsx
│   │   │   └── exchange-chart.tsx
│   │   ├── salaries/
│   │   │   ├── salary-dashboard.tsx
│   │   │   ├── salary-form.tsx
│   │   │   ├── salary-calculator.tsx
│   │   │   ├── salary-history.tsx
│   │   │   └── salary-bulk.tsx
│   │   ├── boxing/
│   │   │   ├── boxing-dashboard.tsx
│   │   │   ├── boxing-form.tsx
│   │   │   ├── boxing-calculator.tsx
│   │   │   ├── material-management.tsx
│   │   │   └── boxing-analytics.tsx
│   │   ├── shipping/
│   │   │   ├── shipping-dashboard.tsx
│   │   │   ├── shipping-form.tsx
│   │   │   ├── shipping-calculator.tsx
│   │   │   ├── shipping-tracking.tsx
│   │   │   └── shipping-analytics.tsx
│   │   ├── returns/
│   │   │   ├── returns-dashboard.tsx
│   │   │   ├── returns-form.tsx
│   │   │   ├── returns-calculator.tsx
│   │   │   ├── yalidine-integration.tsx
│   │   │   └── returns-analytics.tsx
│   │   ├── advertising/
│   │   │   ├── advertising-dashboard.tsx
│   │   │   ├── advertising-form.tsx
│   │   │   ├── campaign-management.tsx
│   │   │   ├── roi-calculator.tsx
│   │   │   └── advertising-analytics.tsx
│   │   └── rent-utilities/
│   │       ├── rent-dashboard.tsx
│   │       ├── rent-form.tsx
│   │       ├── meter-readings.tsx
│   │       ├── usage-analytics.tsx
│   │       └── rent-calculator.tsx
│   ├── common/
│   │   ├── charge-card.tsx
│   │   ├── charge-table.tsx
│   │   ├── charge-filters.tsx
│   │   ├── charge-export.tsx
│   │   ├── charge-import.tsx
│   │   └── charge-approval.tsx
│   └── ui/
│       ├── data-table.tsx
│       ├── charts/
│       ├── forms/
│       └── modals/
├── pages/
│   ├── charges/
│   │   ├── charges-page.tsx
│   │   ├── exchange-rates-page.tsx
│   │   ├── salaries-page.tsx
│   │   ├── boxing-page.tsx
│   │   ├── shipping-page.tsx
│   │   ├── returns-page.tsx
│   │   ├── advertising-page.tsx
│   │   └── rent-utilities-page.tsx
│   └── dashboard/
│       └── charges-dashboard-page.tsx
├── features/
│   ├── charges/
│   │   ├── charges-slice.ts
│   │   ├── charges-selectors.ts
│   │   └── charges-thunks.ts
│   ├── exchange-rates/
│   │   ├── exchange-slice.ts
│   │   ├── exchange-selectors.ts
│   │   └── exchange-thunks.ts
│   └── salaries/
│       ├── salary-slice.ts
│       ├── salary-selectors.ts
│       └── salary-thunks.ts
├── services/
│   ├── charges-service.ts
│   ├── exchange-service.ts
│   ├── salary-service.ts
│   ├── boxing-service.ts
│   ├── shipping-service.ts
│   ├── returns-service.ts
│   ├── advertising-service.ts
│   └── rent-service.ts
└── models/
    ├── charges/
    │   ├── charge.model.ts
    │   ├── exchange-rate.model.ts
    │   ├── salary.model.ts
    │   ├── boxing.model.ts
    │   ├── shipping.model.ts
    │   ├── returns.model.ts
    │   ├── advertising.model.ts
    │   └── rent-utility.model.ts
    └── responses/
        └── charge-response.model.ts
```

## Component Design

### Core Charge Components

#### 1. ChargeCard Component
```typescript
interface ChargeCardProps {
  charge: Charge;
  onEdit?: (charge: Charge) => void;
  onDelete?: (id: string) => void;
  onApprove?: (id: string) => void;
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

const ChargeCard: React.FC<ChargeCardProps> = ({
  charge,
  onEdit,
  onDelete,
  onApprove,
  showActions = true,
  variant = 'default'
}) => {
  // Component implementation
};
```

#### 2. ChargeTable Component
```typescript
interface ChargeTableProps {
  charges: Charge[];
  loading?: boolean;
  onRowClick?: (charge: Charge) => void;
  onEdit?: (charge: Charge) => void;
  onDelete?: (charge: Charge) => void;
  filters?: ChargeFilters;
  onFiltersChange?: (filters: ChargeFilters) => void;
  pagination?: PaginationProps;
  onPaginationChange?: (pagination: PaginationProps) => void;
}

const ChargeTable: React.FC<ChargeTableProps> = ({
  charges,
  loading,
  onRowClick,
  onEdit,
  onDelete,
  filters,
  onFiltersChange,
  pagination,
  onPaginationChange
}) => {
  // Component implementation
};
```

#### 3. ChargeForm Component
```typescript
interface ChargeFormProps {
  charge?: Charge;
  onSubmit: (charge: ChargeFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
  chargeType: ChargeType;
  validationSchema?: ZodSchema;
}

const ChargeForm: React.FC<ChargeFormProps> = ({
  charge,
  onSubmit,
  onCancel,
  loading,
  chargeType,
  validationSchema
}) => {
  // Component implementation
};
```

### Specialized Charge Components

#### 1. Exchange Rate Components
```typescript
// Exchange Rate Dashboard
const ExchangeDashboard: React.FC = () => {
  // Real-time exchange rate display
  // Rate history charts
  // Quick actions for exchange operations
};

// Exchange Rate Calculator
const ExchangeCalculator: React.FC = () => {
  // Real-time exchange calculations
  // Loss/gain calculations
  // Rate source selection
};

// Exchange Rate History Chart
const ExchangeHistoryChart: React.FC<{ data: ExchangeRateHistory[] }> = ({ data }) => {
  // Interactive chart showing rate fluctuations
  // Time range selection
  // Multiple rate source comparison
};
```

#### 2. Salary Components
```typescript
// Salary Calculator
const SalaryCalculator: React.FC = () => {
  // Base salary input
  // Overtime calculations
  // Bonus and allowances
  // Real-time total calculation
};

// Salary History Chart
const SalaryHistoryChart: React.FC<{ data: SalaryHistory[] }> = ({ data }) => {
  // Visual representation of salary changes
  // Trend analysis
  // Comparison charts
};

// Bulk Salary Form
const BulkSalaryForm: React.FC = () => {
  // Multiple employee salary entry
  // Template import/export
  // Validation and preview
};
```

#### 3. Boxing Components
```typescript
// Boxing Calculator
const BoxingCalculator: React.FC = () => {
  // Material selection
  // Quantity input
  // Labor cost calculation
  // Real-time total cost
};

// Material Management
const MaterialManagement: React.FC = () => {
  // Material inventory
  // Cost tracking
  // Usage analytics
  // Reorder alerts
};
```

### Shared Components

#### 1. Data Table Component
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  pagination?: PaginationProps;
  filters?: FilterProps;
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
  exportOptions?: ExportOptions;
}

const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  loading,
  pagination,
  filters,
  onRowClick,
  onSelectionChange,
  exportOptions
}: DataTableProps<T>) => {
  // Generic data table implementation
};
```

#### 2. Chart Components
```typescript
// Line Chart for trends
const LineChart: React.FC<{ data: ChartData[]; config: ChartConfig }> = ({ data, config }) => {
  // Recharts implementation
};

// Bar Chart for comparisons
const BarChart: React.FC<{ data: ChartData[]; config: ChartConfig }> = ({ data, config }) => {
  // Recharts implementation
};

// Pie Chart for distributions
const PieChart: React.FC<{ data: ChartData[]; config: ChartConfig }> = ({ data, config }) => {
  // Recharts implementation
};
```

## State Management Design

### Redux Store Structure
```typescript
interface RootState {
  charges: ChargesState;
  exchangeRates: ExchangeRatesState;
  salaries: SalariesState;
  boxing: BoxingState;
  shipping: ShippingState;
  returns: ReturnsState;
  advertising: AdvertisingState;
  rentUtilities: RentUtilitiesState;
  ui: UIState;
  auth: AuthState;
}
```

### Charge State Structure
```typescript
interface ChargesState {
  // Data
  charges: Charge[];
  selectedCharge: Charge | null;
  chargeTypes: ChargeType[];
  categories: ChargeCategory[];
  
  // UI State
  loading: boolean;
  error: string | null;
  filters: ChargeFilters;
  pagination: PaginationState;
  
  // Form State
  formData: ChargeFormData | null;
  formErrors: Record<string, string>;
  isSubmitting: boolean;
  
  // Analytics
  analytics: ChargeAnalytics;
  trends: ChargeTrends;
}
```

### Redux Slices

#### 1. Charges Slice
```typescript
const chargesSlice = createSlice({
  name: 'charges',
  initialState,
  reducers: {
    setCharges: (state, action: PayloadAction<Charge[]>) => {
      state.charges = action.payload;
    },
    addCharge: (state, action: PayloadAction<Charge>) => {
      state.charges.push(action.payload);
    },
    updateCharge: (state, action: PayloadAction<Charge>) => {
      const index = state.charges.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.charges[index] = action.payload;
      }
    },
    deleteCharge: (state, action: PayloadAction<string>) => {
      state.charges = state.charges.filter(c => c.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setFilters: (state, action: PayloadAction<ChargeFilters>) => {
      state.filters = action.payload;
    },
    setPagination: (state, action: PayloadAction<PaginationState>) => {
      state.pagination = action.payload;
    }
  }
});
```

#### 2. Async Thunks
```typescript
// Fetch charges
export const fetchCharges = createAsyncThunk(
  'charges/fetchCharges',
  async (params: FetchChargesParams, { rejectWithValue }) => {
    try {
      const response = await chargesService.getCharges(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create charge
export const createCharge = createAsyncThunk(
  'charges/createCharge',
  async (chargeData: ChargeFormData, { rejectWithValue }) => {
    try {
      const response = await chargesService.createCharge(chargeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update charge
export const updateCharge = createAsyncThunk(
  'charges/updateCharge',
  async ({ id, data }: { id: string; data: ChargeFormData }, { rejectWithValue }) => {
    try {
      const response = await chargesService.updateCharge(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

### Selectors
```typescript
// Basic selectors
export const selectCharges = (state: RootState) => state.charges.charges;
export const selectChargesLoading = (state: RootState) => state.charges.loading;
export const selectChargesError = (state: RootState) => state.charges.error;

// Computed selectors
export const selectFilteredCharges = createSelector(
  [selectCharges, selectChargeFilters],
  (charges, filters) => {
    return charges.filter(charge => {
      // Apply filters logic
      return true;
    });
  }
);

export const selectChargeAnalytics = createSelector(
  [selectCharges],
  (charges) => {
    // Calculate analytics
    return {
      totalAmount: charges.reduce((sum, charge) => sum + charge.amount, 0),
      averageAmount: charges.length > 0 ? charges.reduce((sum, charge) => sum + charge.amount, 0) / charges.length : 0,
      // More analytics...
    };
  }
);
```

## API Integration Design

### Service Layer Structure
```typescript
// Base API service
class BaseApiService {
  protected api: AxiosInstance;
  
  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL,
      timeout: 10000,
    });
    
    this.setupInterceptors();
  }
  
  private setupInterceptors() {
    // Request interceptor for auth
    this.api.interceptors.request.use((config) => {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    
    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          logout();
        }
        return Promise.reject(error);
      }
    );
  }
}

// Charges service
class ChargesService extends BaseApiService {
  async getCharges(params: GetChargesParams): Promise<ApiResponse<Charge[]>> {
    const response = await this.api.get('/charges', { params });
    return response.data;
  }
  
  async getCharge(id: string): Promise<ApiResponse<Charge>> {
    const response = await this.api.get(`/charges/${id}`);
    return response.data;
  }
  
  async createCharge(data: ChargeFormData): Promise<ApiResponse<Charge>> {
    const response = await this.api.post('/charges', data);
    return response.data;
  }
  
  async updateCharge(id: string, data: ChargeFormData): Promise<ApiResponse<Charge>> {
    const response = await this.api.put(`/charges/${id}`, data);
    return response.data;
  }
  
  async deleteCharge(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/charges/${id}`);
    return response.data;
  }
  
  async approveCharge(id: string): Promise<ApiResponse<Charge>> {
    const response = await this.api.post(`/charges/${id}/approve`);
    return response.data;
  }
  
  async exportCharges(params: ExportChargesParams): Promise<Blob> {
    const response = await this.api.get('/charges/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  }
}
```

### React Query Integration
```typescript
// Custom hooks for data fetching
export const useCharges = (params: GetChargesParams) => {
  return useQuery({
    queryKey: ['charges', params],
    queryFn: () => chargesService.getCharges(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCharge = (id: string) => {
  return useQuery({
    queryKey: ['charges', id],
    queryFn: () => chargesService.getCharge(id),
    enabled: !!id,
  });
};

export const useCreateCharge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ChargeFormData) => chargesService.createCharge(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charges'] });
    },
  });
};

export const useUpdateCharge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChargeFormData }) =>
      chargesService.updateCharge(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['charges'] });
      queryClient.invalidateQueries({ queryKey: ['charges', data.id] });
    },
  });
};
```

## UI/UX Design Specifications

### Design System
```typescript
// Theme configuration
const theme = {
  colors: {
    primary: {
      50: '#eff6ff',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
    success: {
      500: '#10b981',
      600: '#059669',
    },
    warning: {
      500: '#f59e0b',
      600: '#d97706',
    },
    error: {
      500: '#ef4444',
      600: '#dc2626',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      500: '#6b7280',
      900: '#111827',
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
    }
  }
};
```

### Component Variants
```typescript
// Button variants
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

### Responsive Design
```typescript
// Breakpoint configuration
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Responsive utilities
const responsiveUtils = {
  // Grid columns
  gridCols: {
    sm: 'grid-cols-1',
    md: 'md:grid-cols-2',
    lg: 'lg:grid-cols-3',
    xl: 'xl:grid-cols-4',
  },
  // Flex direction
  flexDirection: {
    sm: 'flex-col',
    md: 'md:flex-row',
  },
  // Text alignment
  textAlign: {
    sm: 'text-left',
    md: 'md:text-center',
    lg: 'lg:text-right',
  }
};
```

### Accessibility Features
```typescript
// Focus management
const useFocusManagement = () => {
  const focusRef = useRef<HTMLElement>(null);
  
  const focusFirstElement = useCallback(() => {
    if (focusRef.current) {
      focusRef.current.focus();
    }
  }, []);
  
  return { focusRef, focusFirstElement };
};

// Keyboard navigation
const useKeyboardNavigation = (items: any[], onSelect: (item: any) => void) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, items.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        event.preventDefault();
        onSelect(items[selectedIndex]);
        break;
    }
  }, [items, selectedIndex, onSelect]);
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  return { selectedIndex };
};
```

## Performance Optimization

### Code Splitting
```typescript
// Lazy loading for pages
const ChargesPage = lazy(() => import('./pages/charges/charges-page'));
const ExchangeRatesPage = lazy(() => import('./pages/charges/exchange-rates-page'));
const SalariesPage = lazy(() => import('./pages/charges/salaries-page'));

// Route-based code splitting
const routes = [
  {
    path: '/charges',
    element: <Suspense fallback={<LoadingSpinner />}><ChargesPage /></Suspense>
  },
  {
    path: '/charges/exchange-rates',
    element: <Suspense fallback={<LoadingSpinner />}><ExchangeRatesPage /></Suspense>
  },
  {
    path: '/charges/salaries',
    element: <Suspense fallback={<LoadingSpinner />}><SalariesPage /></Suspense>
  }
];
```

### Virtual Scrolling
```typescript
// Virtual list for large datasets
const VirtualList = <T extends Record<string, any>>({
  items,
  height,
  itemHeight,
  renderItem
}: VirtualListProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(height / itemHeight) + 1,
      items.length
    );
    
    return items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      index: startIndex + index,
      style: {
        position: 'absolute',
        top: (startIndex + index) * itemHeight,
        height: itemHeight,
      }
    }));
  }, [items, scrollTop, height, itemHeight]);
  
  return (
    <div
      style={{ height, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map(renderItem)}
      </div>
    </div>
  );
};
```

### Memoization
```typescript
// Memoized components
const MemoizedChargeCard = memo(ChargeCard, (prevProps, nextProps) => {
  return prevProps.charge.id === nextProps.charge.id &&
         prevProps.charge.amount === nextProps.charge.amount &&
         prevProps.charge.status === nextProps.charge.status;
});

// Memoized selectors
const selectFilteredCharges = createSelector(
  [selectCharges, selectChargeFilters],
  (charges, filters) => {
    // Expensive filtering logic
    return charges.filter(charge => {
      // Apply filters
      return true;
    });
  }
);
```

## Error Handling

### Error Boundaries
```typescript
class ChargeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Charge Error:', error, errorInfo);
    // Log to error reporting service
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-200 rounded-md bg-red-50">
          <h2 className="text-lg font-semibold text-red-800">
            Something went wrong with the charges system
          </h2>
          <p className="text-red-600 mt-2">
            Please try refreshing the page or contact support if the problem persists.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

### API Error Handling
```typescript
// Error handling utilities
const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

// Error toast component
const ErrorToast: React.FC<{ error: string; onDismiss: () => void }> = ({
  error,
  onDismiss
}) => (
  <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-md">
    <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
    <div className="ml-3">
      <p className="text-sm font-medium text-red-800">{error}</p>
    </div>
    <button
      onClick={onDismiss}
      className="ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg p-1.5 hover:bg-red-100"
    >
      <XMarkIcon className="h-5 w-5" />
    </button>
  </div>
);
```

## Testing Strategy

### Unit Testing
```typescript
// Component testing
describe('ChargeCard', () => {
  it('renders charge information correctly', () => {
    const mockCharge: Charge = {
      id: '1',
      title: 'Test Charge',
      amount: 1000,
      type: 'other',
      status: 'pending',
      date: new Date(),
    };
    
    render(<ChargeCard charge={mockCharge} />);
    
    expect(screen.getByText('Test Charge')).toBeInTheDocument();
    expect(screen.getByText('1,000 DZD')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });
  
  it('calls onEdit when edit button is clicked', () => {
    const mockCharge: Charge = { /* ... */ };
    const mockOnEdit = jest.fn();
    
    render(<ChargeCard charge={mockCharge} onEdit={mockOnEdit} />);
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockCharge);
  });
});
```

### Integration Testing
```typescript
// API integration testing
describe('Charges API Integration', () => {
  it('fetches charges successfully', async () => {
    const mockCharges: Charge[] = [/* ... */];
    
    server.use(
      rest.get('/api/charges', (req, res, ctx) => {
        return res(ctx.json({ data: mockCharges }));
      })
    );
    
    render(<ChargesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Charge')).toBeInTheDocument();
    });
  });
});
```

### E2E Testing
```typescript
// E2E test example
describe('Charge Management E2E', () => {
  it('creates a new charge successfully', () => {
    cy.visit('/charges');
    cy.get('[data-testid="create-charge-button"]').click();
    cy.get('[data-testid="charge-title-input"]').type('Test Charge');
    cy.get('[data-testid="charge-amount-input"]').type('1000');
    cy.get('[data-testid="charge-type-select"]').select('other');
    cy.get('[data-testid="submit-button"]').click();
    
    cy.get('[data-testid="success-message"]').should('be.visible');
    cy.get('[data-testid="charges-table"]').should('contain', 'Test Charge');
  });
});
```

This design document provides a comprehensive foundation for implementing the frontend charges system with proper architecture, state management, and user experience considerations. 