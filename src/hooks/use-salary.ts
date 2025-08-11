import {
    approveSalaryCharge,
    createSalaryCharge,
    CreateSalaryChargeData,
    deleteSalaryCharge,
    FetchSalaryChargesParams,
    getPayrollBatches,
    getPendingSalaryCharges,
    getSalaryCharge,
    getSalaryCharges,
    getSalaryDashboard,
    getSalaryHistory,
    getSalaryTemplates,
    rejectSalaryCharge,
    SalaryDashboardParams,
    submitSalaryChargeForApproval,
    updateSalaryCharge,
    UpdateSalaryChargeData,
} from '@/services/salary-service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query keys
export const salaryKeys = {
  all: ['salary'] as const,
  lists: () => [...salaryKeys.all, 'list'] as const,
  list: (filters: FetchSalaryChargesParams) => [...salaryKeys.lists(), filters] as const,
  details: () => [...salaryKeys.all, 'detail'] as const,
  detail: (id: number) => [...salaryKeys.details(), id] as const,
  pending: (filters: any) => [...salaryKeys.all, 'pending', filters] as const,
  dashboard: (params: SalaryDashboardParams) => [...salaryKeys.all, 'dashboard', params] as const,
  templates: () => [...salaryKeys.all, 'templates'] as const,
  batches: () => [...salaryKeys.all, 'batches'] as const,
  history: (employeeId: number) => [...salaryKeys.all, 'history', employeeId] as const,
};

// Hook for fetching salary charges
export const useSalaryCharges = (params: FetchSalaryChargesParams = {}) => {
  return useQuery({
    queryKey: salaryKeys.list(params),
    queryFn: () => getSalaryCharges(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for fetching a single salary charge
export const useSalaryCharge = (id: number, companyId?: number) => {
  return useQuery({
    queryKey: salaryKeys.detail(id),
    queryFn: () => getSalaryCharge(id, companyId),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for fetching pending salary charges
export const usePendingSalaryCharges = (params: {
  limit?: number;
  offset?: number;
  department?: string;
  approver_id?: number;
  company_id?: number;
} = {}) => {
  return useQuery({
    queryKey: salaryKeys.pending(params),
    queryFn: () => getPendingSalaryCharges(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching salary dashboard data
export const useSalaryDashboard = (params: SalaryDashboardParams = {}) => {
  return useQuery({
    queryKey: salaryKeys.dashboard(params),
    queryFn: () => getSalaryDashboard(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for fetching salary templates
export const useSalaryTemplates = (companyId?: number) => {
  return useQuery({
    queryKey: salaryKeys.templates(),
    queryFn: () => getSalaryTemplates(companyId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook for fetching payroll batches
export const usePayrollBatches = (params: {
  limit?: number;
  offset?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
  company_id?: number;
} = {}) => {
  return useQuery({
    queryKey: salaryKeys.batches(),
    queryFn: () => getPayrollBatches(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for fetching salary history
export const useSalaryHistory = (employeeId: number, companyId?: number) => {
  return useQuery({
    queryKey: salaryKeys.history(employeeId),
    queryFn: () => getSalaryHistory(employeeId, companyId),
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Mutation hooks
export const useCreateSalaryCharge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateSalaryChargeData) => createSalaryCharge(data),
    onSuccess: () => {
      // Invalidate and refetch salary charges
      queryClient.invalidateQueries({ queryKey: salaryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: salaryKeys.pending({}) });
      queryClient.invalidateQueries({ queryKey: salaryKeys.dashboard({}) });
    },
  });
};

export const useUpdateSalaryCharge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data, companyId }: { id: number; data: UpdateSalaryChargeData; companyId?: number }) =>
      updateSalaryCharge(id, data, companyId),
    onSuccess: (data, variables) => {
      // Update the specific salary charge in cache
      queryClient.setQueryData(salaryKeys.detail(variables.id), data);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: salaryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: salaryKeys.pending({}) });
      queryClient.invalidateQueries({ queryKey: salaryKeys.dashboard({}) });
    },
  });
};

export const useDeleteSalaryCharge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, companyId }: { id: number; companyId?: number }) =>
      deleteSalaryCharge(id, companyId),
    onSuccess: (_, variables) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: salaryKeys.detail(variables.id) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: salaryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: salaryKeys.pending({}) });
      queryClient.invalidateQueries({ queryKey: salaryKeys.dashboard({}) });
    },
  });
};

export const useApproveSalaryCharge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, notes, companyId }: { id: number; notes?: string; companyId?: number }) =>
      approveSalaryCharge(id, notes, companyId),
    onSuccess: () => {
      // Invalidate pending charges and lists
      queryClient.invalidateQueries({ queryKey: salaryKeys.pending({}) });
      queryClient.invalidateQueries({ queryKey: salaryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: salaryKeys.dashboard({}) });
    },
  });
};

export const useRejectSalaryCharge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason, companyId }: { id: number; reason: string; companyId?: number }) =>
      rejectSalaryCharge(id, reason, companyId),
    onSuccess: () => {
      // Invalidate pending charges and lists
      queryClient.invalidateQueries({ queryKey: salaryKeys.pending({}) });
      queryClient.invalidateQueries({ queryKey: salaryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: salaryKeys.dashboard({}) });
    },
  });
};

export const useSubmitSalaryChargeForApproval = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, notes, companyId }: { id: number; notes?: string; companyId?: number }) =>
      submitSalaryChargeForApproval(id, notes, companyId),
    onSuccess: () => {
      // Invalidate pending charges and lists
      queryClient.invalidateQueries({ queryKey: salaryKeys.pending({}) });
      queryClient.invalidateQueries({ queryKey: salaryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: salaryKeys.dashboard({}) });
    },
  });
}; 