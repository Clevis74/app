import axios from 'axios';

// URL base da API das contas de energia
const API_URL = import.meta.env.REACT_APP_BACKEND_URL || '/api';

// Criar instância do axios com configuração base
const energyBillsApi = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interface para EnergyBill
export interface EnergyBill {
  id: string;
  property_id: string;
  tenant_id?: string;
  billing_period: string; // YYYY-MM
  due_date: string;
  amount: number;
  consumption_kwh: number;
  previous_reading: number;
  current_reading: number;
  tariff_rate: number;
  status: 'pending' | 'paid' | 'overdue';
  paid_date?: string;
  paid_amount?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Interface para criação de conta de energia
export interface CreateEnergyBillRequest {
  property_id: string;
  tenant_id?: string;
  billing_period: string;
  due_date: string;
  amount: number;
  consumption_kwh: number;
  previous_reading: number;
  current_reading: number;
  tariff_rate: number;
  notes?: string;
}

// Interface para atualização de conta de energia
export interface UpdateEnergyBillRequest {
  property_id?: string;
  tenant_id?: string;
  billing_period?: string;
  due_date?: string;
  amount?: number;
  consumption_kwh?: number;
  previous_reading?: number;
  current_reading?: number;
  tariff_rate?: number;
  status?: 'pending' | 'paid' | 'overdue';
  paid_date?: string;
  paid_amount?: number;
  notes?: string;
}

// Interceptors para adicionar token de autenticação
energyBillsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de autenticação
energyBillsApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// Serviços da API de Contas de Energia
export const energyBillsApiService = {
  // Listar contas de energia
  async getEnergyBills(filters?: {
    property_id?: string;
    tenant_id?: string;
    billing_period?: string;
    status?: string;
    skip?: number;
    limit?: number;
  }): Promise<EnergyBill[]> {
    const params = new URLSearchParams();
    if (filters?.property_id) params.append('property_id', filters.property_id);
    if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);
    if (filters?.billing_period) params.append('billing_period', filters.billing_period);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.skip) params.append('skip', filters.skip.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const response = await energyBillsApi.get(`/v1/energy-bills?${params.toString()}`);
    return response.data;
  },

  // Obter conta de energia por ID
  async getEnergyBillById(id: string): Promise<EnergyBill> {
    const response = await energyBillsApi.get(`/v1/energy-bills/${id}`);
    return response.data;
  },

  // Criar nova conta de energia
  async createEnergyBill(data: CreateEnergyBillRequest): Promise<EnergyBill> {
    const response = await energyBillsApi.post('/v1/energy-bills', data);
    return response.data;
  },

  // Atualizar conta de energia
  async updateEnergyBill(id: string, data: UpdateEnergyBillRequest): Promise<EnergyBill> {
    const response = await energyBillsApi.put(`/v1/energy-bills/${id}`, data);
    return response.data;
  },

  // Marcar conta como paga
  async markAsPaid(id: string, paidAmount?: number): Promise<EnergyBill> {
    const data: any = {
      status: 'paid',
      paid_date: new Date().toISOString(),
    };
    
    if (paidAmount !== undefined) {
      data.paid_amount = paidAmount;
    }
    
    const response = await energyBillsApi.put(`/v1/energy-bills/${id}`, data);
    return response.data;
  },

  // Excluir conta de energia
  async deleteEnergyBill(id: string): Promise<void> {
    await energyBillsApi.delete(`/v1/energy-bills/${id}`);
  },

  // Obter estatísticas de consumo de energia
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
    average_tariff: number;
  }> {
    const params = new URLSearchParams();
    if (filters?.property_id) params.append('property_id', filters.property_id);
    if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);
    if (filters?.start_period) params.append('start_period', filters.start_period);
    if (filters?.end_period) params.append('end_period', filters.end_period);
    
    const response = await energyBillsApi.get(`/v1/energy-bills/stats?${params.toString()}`);
    return response.data;
  },

  // Gerar relatório de contas de energia
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
    
    const response = await energyBillsApi.get(`/v1/energy-bills/report?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Calcular projeção de consumo
  async calculateProjection(
    propertyId: string,
    months: number = 12
  ): Promise<{
    projected_consumption: number;
    projected_cost: number;
    monthly_average: number;
    trend_analysis: 'increasing' | 'decreasing' | 'stable';
    confidence_level: number;
  }> {
    const response = await energyBillsApi.post('/v1/energy-bills/projection', {
      property_id: propertyId,
      projection_months: months,
    });
    return response.data;
  },
};