import axios from 'axios';

// URL base da API das contas de água
const API_URL = import.meta.env.REACT_APP_BACKEND_URL || '/api';

// Criar instância do axios com configuração base
const waterBillsApi = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interface para WaterBill
export interface WaterBill {
  id: string;
  property_id: string;
  tenant_id?: string;
  billing_period: string; // YYYY-MM
  due_date: string;
  amount: number;
  consumption_m3: number;
  previous_reading: number;
  current_reading: number;
  status: 'pending' | 'paid' | 'overdue';
  paid_date?: string;
  paid_amount?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Interface para criação de conta de água
export interface CreateWaterBillRequest {
  property_id: string;
  tenant_id?: string;
  billing_period: string;
  due_date: string;
  amount: number;
  consumption_m3: number;
  previous_reading: number;
  current_reading: number;
  notes?: string;
}

// Interface para atualização de conta de água
export interface UpdateWaterBillRequest {
  property_id?: string;
  tenant_id?: string;
  billing_period?: string;
  due_date?: string;
  amount?: number;
  consumption_m3?: number;
  previous_reading?: number;
  current_reading?: number;
  status?: 'pending' | 'paid' | 'overdue';
  paid_date?: string;
  paid_amount?: number;
  notes?: string;
}

// Interceptors para adicionar token de autenticação
waterBillsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de autenticação
waterBillsApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// Serviços da API de Contas de Água
export const waterBillsApiService = {
  // Listar contas de água
  async getWaterBills(filters?: {
    property_id?: string;
    tenant_id?: string;
    billing_period?: string;
    status?: string;
    skip?: number;
    limit?: number;
  }): Promise<WaterBill[]> {
    const params = new URLSearchParams();
    if (filters?.property_id) params.append('property_id', filters.property_id);
    if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);
    if (filters?.billing_period) params.append('billing_period', filters.billing_period);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.skip) params.append('skip', filters.skip.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const response = await waterBillsApi.get(`/v1/water-bills?${params.toString()}`);
    return response.data;
  },

  // Obter conta de água por ID
  async getWaterBillById(id: string): Promise<WaterBill> {
    const response = await waterBillsApi.get(`/v1/water-bills/${id}`);
    return response.data;
  },

  // Criar nova conta de água
  async createWaterBill(data: CreateWaterBillRequest): Promise<WaterBill> {
    const response = await waterBillsApi.post('/v1/water-bills', data);
    return response.data;
  },

  // Atualizar conta de água
  async updateWaterBill(id: string, data: UpdateWaterBillRequest): Promise<WaterBill> {
    const response = await waterBillsApi.put(`/v1/water-bills/${id}`, data);
    return response.data;
  },

  // Marcar conta como paga
  async markAsPaid(id: string, paidAmount?: number): Promise<WaterBill> {
    const data: any = {
      status: 'paid',
      paid_date: new Date().toISOString(),
    };
    
    if (paidAmount !== undefined) {
      data.paid_amount = paidAmount;
    }
    
    const response = await waterBillsApi.put(`/v1/water-bills/${id}`, data);
    return response.data;
  },

  // Excluir conta de água
  async deleteWaterBill(id: string): Promise<void> {
    await waterBillsApi.delete(`/v1/water-bills/${id}`);
  },

  // Obter estatísticas de consumo de água
  async getConsumptionStats(filters?: {
    property_id?: string;
    tenant_id?: string;
    start_period?: string;
    end_period?: string;
  }): Promise<{
    total_consumption: number;
    average_monthly: number;
    total_amount: number;
    bills_count: number;
    period_range: string;
  }> {
    const params = new URLSearchParams();
    if (filters?.property_id) params.append('property_id', filters.property_id);
    if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);
    if (filters?.start_period) params.append('start_period', filters.start_period);
    if (filters?.end_period) params.append('end_period', filters.end_period);
    
    const response = await waterBillsApi.get(`/v1/water-bills/stats?${params.toString()}`);
    return response.data;
  },

  // Gerar relatório de contas de água
  async generateReport(filters?: {
    property_id?: string;
    tenant_id?: string;
    start_period?: string;
    end_period?: string;
    format?: 'pdf' | 'xlsx';
  }): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters?.property_id) params.append('property_id', filters.property_id);
    if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);
    if (filters?.start_period) params.append('start_period', filters.start_period);
    if (filters?.end_period) params.append('end_period', filters.end_period);
    if (filters?.format) params.append('format', filters.format);
    
    const response = await waterBillsApi.get(`/v1/water-bills/report?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};