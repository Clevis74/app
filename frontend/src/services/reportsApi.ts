import axios from 'axios';

// URL base da API de relatórios
const API_URL = import.meta.env.REACT_APP_BACKEND_URL || '/api';

// Criar instância do axios com configuração base
const reportsApi = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Timeout maior para relatórios que podem demorar
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interface para ReportRequest
export interface ReportRequest {
  type: 'financial' | 'properties' | 'tenants' | 'consumption' | 'custom';
  format: 'pdf' | 'xlsx' | 'csv';
  date_range: {
    start_date: string;
    end_date: string;
  };
  filters?: {
    property_ids?: string[];
    tenant_ids?: string[];
    transaction_types?: string[];
    status?: string[];
  };
  options?: {
    include_charts?: boolean;
    group_by?: 'property' | 'tenant' | 'month' | 'category';
    summary_only?: boolean;
  };
}

// Interface para ReportResponse
export interface ReportResponse {
  id: string;
  type: string;
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_url?: string;
  file_size?: number;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

// Interface para Dashboard Summary
export interface DashboardSummary {
  total_properties: number;
  total_tenants: number;
  occupied_properties: number;
  vacant_properties: number;
  total_monthly_income: number;
  total_monthly_expenses: number;
  pending_alerts: number;
  recent_transactions: any[];
  occupancy_rate: number;
  revenue_trend: number;
}

// Interceptors para adicionar token de autenticação
reportsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de autenticação
reportsApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// Serviços da API de Relatórios
export const reportsApiService = {
  // Gerar relatório
  async generateReport(request: ReportRequest): Promise<ReportResponse> {
    const response = await reportsApi.post('/v1/reports/generate', request);
    return response.data;
  },

  // Listar relatórios
  async getReports(filters?: {
    type?: string;
    status?: string;
    skip?: number;
    limit?: number;
  }): Promise<ReportResponse[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.skip) params.append('skip', filters.skip.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const response = await reportsApi.get(`/v1/reports?${params.toString()}`);
    return response.data;
  },

  // Obter relatório por ID
  async getReportById(id: string): Promise<ReportResponse> {
    const response = await reportsApi.get(`/v1/reports/${id}`);
    return response.data;
  },

  // Download de relatório
  async downloadReport(id: string): Promise<Blob> {
    const response = await reportsApi.get(`/v1/reports/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Excluir relatório
  async deleteReport(id: string): Promise<void> {
    await reportsApi.delete(`/v1/reports/${id}`);
  },

  // Obter resumo do dashboard
  async getDashboardSummary(): Promise<DashboardSummary> {
    const response = await reportsApi.get('/v1/dashboard/summary');
    return response.data;
  },

  // Gerar relatório financeiro rápido
  async generateFinancialReport(
    startDate: string,
    endDate: string,
    format: 'pdf' | 'xlsx' = 'pdf'
  ): Promise<Blob> {
    const response = await reportsApi.post('/v1/reports/financial/quick', {
      start_date: startDate,
      end_date: endDate,
      format,
    }, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Gerar relatório de propriedades
  async generatePropertiesReport(
    propertyIds?: string[],
    format: 'pdf' | 'xlsx' = 'pdf'
  ): Promise<Blob> {
    const response = await reportsApi.post('/v1/reports/properties/quick', {
      property_ids: propertyIds,
      format,
    }, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Gerar relatório de inquilinos
  async generateTenantsReport(
    tenantIds?: string[],
    format: 'pdf' | 'xlsx' = 'pdf'
  ): Promise<Blob> {
    const response = await reportsApi.post('/v1/reports/tenants/quick', {
      tenant_ids: tenantIds,
      format,
    }, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Obter estatísticas de performance
  async getPerformanceStats(
    startDate: string,
    endDate: string
  ): Promise<{
    revenue_growth: number;
    occupancy_trend: number;
    maintenance_costs: number;
    roi_percentage: number;
    top_properties: any[];
  }> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });
    
    const response = await reportsApi.get(`/v1/reports/performance?${params.toString()}`);
    return response.data;
  },
};