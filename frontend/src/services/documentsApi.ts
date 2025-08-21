import axios from 'axios';

// URL base da API dos documentos
const API_URL = import.meta.env.REACT_APP_BACKEND_URL || '/api';

// Criar instância do axios com configuração base
const documentsApi = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interface para Document
export interface Document {
  id: string;
  property_id: string;
  tenant_id?: string;
  type: 'contract' | 'invoice' | 'receipt' | 'identification' | 'other';
  name: string;
  file_path: string;
  uploaded_at: string;
  size: number;
  mime_type: string;
}

// Interface para criação de documento
export interface CreateDocumentRequest {
  property_id: string;
  tenant_id?: string;
  type: 'contract' | 'invoice' | 'receipt' | 'identification' | 'other';
  name: string;
  file: File;
}

// Interface para atualização de documento
export interface UpdateDocumentRequest {
  property_id?: string;
  tenant_id?: string;
  type?: 'contract' | 'invoice' | 'receipt' | 'identification' | 'other';
  name?: string;
}

// Interceptors para adicionar token de autenticação
documentsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de autenticação
documentsApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// Serviços da API de Documentos
export const documentsApiService = {
  // Listar documentos
  async getDocuments(filters?: {
    property_id?: string;
    tenant_id?: string;
    type?: string;
    skip?: number;
    limit?: number;
  }): Promise<Document[]> {
    const params = new URLSearchParams();
    if (filters?.property_id) params.append('property_id', filters.property_id);
    if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.skip) params.append('skip', filters.skip.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const response = await documentsApi.get(`/v1/documents?${params.toString()}`);
    return response.data;
  },

  // Obter documento por ID
  async getDocumentById(id: string): Promise<Document> {
    const response = await documentsApi.get(`/v1/documents/${id}`);
    return response.data;
  },

  // Upload de documento
  async uploadDocument(data: CreateDocumentRequest): Promise<Document> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('property_id', data.property_id);
    if (data.tenant_id) formData.append('tenant_id', data.tenant_id);
    formData.append('type', data.type);
    formData.append('name', data.name);

    const response = await documentsApi.post('/v1/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Atualizar documento
  async updateDocument(id: string, data: UpdateDocumentRequest): Promise<Document> {
    const response = await documentsApi.put(`/v1/documents/${id}`, data);
    return response.data;
  },

  // Excluir documento
  async deleteDocument(id: string): Promise<void> {
    await documentsApi.delete(`/v1/documents/${id}`);
  },

  // Download de documento
  async downloadDocument(id: string): Promise<Blob> {
    const response = await documentsApi.get(`/v1/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Obter URL de preview do documento
  getDocumentPreviewUrl(id: string): string {
    const token = localStorage.getItem('authToken');
    const baseUrl = API_URL.startsWith('/') ? window.location.origin + API_URL : API_URL;
    return `${baseUrl}/v1/documents/${id}/preview?token=${token}`;
  },
};