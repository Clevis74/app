// API configuration and services
import { Property, Tenant, Transaction, Alert, CreatePropertyRequest, CreateTenantRequest, CreateTransactionRequest, CreateAlertRequest } from '../types/api';

// Base URL configuration - use relative path for production compatibility
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || '/api';

// Generic API request function
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = API_BASE_URL.startsWith('/') ? API_BASE_URL + endpoint : API_BASE_URL + endpoint;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// Properties API
export const propertiesAPI = {
  async getAll(filters?: { status?: string; minRent?: number; maxRent?: number; type?: string }): Promise<Property[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.minRent) params.append('min_rent', filters.minRent.toString());
    if (filters?.maxRent) params.append('max_rent', filters.maxRent.toString());
    if (filters?.type) params.append('type', filters.type);
    
    const queryString = params.toString();
    return apiRequest(`/v1/properties${queryString ? `?${queryString}` : ''}`);
  },

  async getById(id: string): Promise<Property> {
    return apiRequest(`/v1/properties/${id}`);
  },

  async create(property: CreatePropertyRequest): Promise<Property> {
    return apiRequest(`/v1/properties`, {
      method: 'POST',
      body: JSON.stringify(property),
    });
  },

  async update(id: string, property: Partial<CreatePropertyRequest>): Promise<Property> {
    return apiRequest(`/v1/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(property),
    });
  },

  async delete(id: string): Promise<void> {
    return apiRequest(`/v1/properties/${id}`, {
      method: 'DELETE',
    });
  },
};

// Tenants API  
export const tenantsAPI = {
  async getAll(): Promise<Tenant[]> {
    return apiRequest('/v1/tenants');
  },

  async getById(id: string): Promise<Tenant> {
    return apiRequest(`/v1/tenants/${id}`);
  },

  async create(tenant: CreateTenantRequest): Promise<Tenant> {
    return apiRequest(`/v1/tenants`, {
      method: 'POST',
      body: JSON.stringify(tenant),
    });
  },

  async update(id: string, tenant: Partial<CreateTenantRequest>): Promise<Tenant> {
    return apiRequest(`/v1/tenants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tenant),
    });
  },

  async delete(id: string): Promise<void> {
    return apiRequest(`/v1/tenants/${id}`, {
      method: 'DELETE',
    });
  },
};

// Transactions API
export const transactionsAPI = {
  async getAll(filters?: { property_id?: string; tenant_id?: string; type?: string }): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (filters?.property_id) params.append('property_id', filters.property_id);
    if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);
    if (filters?.type) params.append('type', filters.type);
    
    const queryString = params.toString();
    return apiRequest(`/v1/transactions${queryString ? `?${queryString}` : ''}`);
  },

  async getById(id: string): Promise<Transaction> {
    return apiRequest(`/v1/transactions/${id}`);
  },

  async create(transaction: CreateTransactionRequest): Promise<Transaction> {
    return apiRequest(`/v1/transactions`, {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  },

  async update(id: string, transaction: Partial<CreateTransactionRequest>): Promise<Transaction> {
    return apiRequest(`/v1/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    });
  },

  async delete(id: string): Promise<void> {
    return apiRequest(`/v1/transactions/${id}`, {
      method: 'DELETE',
    });
  },
};

// Alerts API
export const alertsAPI = {
  async getAll(filters?: { property_id?: string; tenant_id?: string; priority?: string; resolved?: boolean }): Promise<Alert[]> {
    const params = new URLSearchParams();
    if (filters?.property_id) params.append('property_id', filters.property_id);
    if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.resolved !== undefined) params.append('resolved', filters.resolved.toString());
    
    const queryString = params.toString();
    return apiRequest(`/v1/alerts${queryString ? `?${queryString}` : ''}`);
  },

  async getById(id: string): Promise<Alert> {
    return apiRequest(`/v1/alerts/${id}`);
  },

  async create(alert: CreateAlertRequest): Promise<Alert> {
    return apiRequest(`/v1/alerts`, {
      method: 'POST',
      body: JSON.stringify(alert),
    });
  },

  async update(id: string, alert: Partial<CreateAlertRequest>): Promise<Alert> {
    return apiRequest(`/v1/alerts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(alert),
    });
  },

  async resolve(id: string): Promise<Alert> {
    return apiRequest(`/v1/alerts/${id}/resolve`, {
      method: 'PUT',
    });
  },

  async delete(id: string): Promise<void> {
    return apiRequest(`/v1/alerts/${id}`, {
      method: 'DELETE',
    });
  },
};

// Dashboard API
export const dashboardAPI = {
  async getSummary(): Promise<{
    total_properties: number;
    total_tenants: number;
    occupied_properties: number;
    vacant_properties: number;
    total_monthly_income: number;
    total_monthly_expenses: number;
    pending_alerts: number;
  }> {
    return apiRequest('/v1/dashboard/summary');
  },
};

// Auth API
export const authAPI = {
  async login(username: string, password: string): Promise<{ access_token: string; token_type: string }> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const url = API_BASE_URL.startsWith('/') ? API_BASE_URL + '/v1/auth/login' : API_BASE_URL + '/v1/auth/login';
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    return response.json();
  },

  async register(userData: { email: string; password: string; full_name: string }): Promise<{ access_token: string; token_type: string }> {
    return apiRequest('/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async verifyToken(): Promise<{ valid: boolean; user?: any }> {
    return apiRequest('/v1/auth/verify');
  },

  async getCurrentUser(): Promise<{ id: string; email: string; full_name: string; is_active: boolean }> {
    return apiRequest('/v1/auth/me');
  },
};