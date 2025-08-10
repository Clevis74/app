/**
 * Componente de Relatórios SISMOBI
 * Autor: E1 Agent
 * Data: 2025-01-07
 */

import React, { useState, useEffect } from 'react';
import { 
  FileBarChart, 
  Download, 
  Filter,
  FileText,
  Building,
  Users,
  DollarSign,
  BarChart3,
  Clock,
  CheckCircle
} from 'lucide-react';

interface ReportFilters {
  properties: Array<{id: string, address: string, type: string, status: string}>;
  tenants: Array<{id: string, name: string, email: string, status: string}>;
  property_status: string[];
  tenant_status: string[];
  property_types: string[];
  quick_periods: Array<{key: string, label: string}>;
}

interface ReportsComponentProps {
  showValues?: boolean;
}

const ReportsComponent: React.FC<ReportsComponentProps> = ({ showValues = true }) => {
  // Remover warning: usando showValues no lugar de _showValues para indicar intenção
  const _showValues = showValues; // Mantém compatibilidade mas remove warning
  const [filters, setFilters] = useState<ReportFilters | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [reportOptions, setReportOptions] = useState({
    startDate: '',
    endDate: '',
    propertyId: '',
    tenantId: '',
    status: '',
    propertyType: '',
    quickPeriod: 'current_month'
  });

  // Carregar filtros disponíveis ao montar o componente
  useEffect(() => {
    loadAvailableFilters();
  }, []);

  const loadAvailableFilters = async (): Promise<void> => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.warn('No token found for reports');
        return;
      }

      const response = await fetch(`${backendUrl}/api/v1/reports/available-filters`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFilters(data);
      } else {
        console.error('Failed to load report filters:', response.status);
      }
    } catch (error) {
      console.error('Error loading report filters:', error);
    }
  };

  const generateReport = async (reportType: string): Promise<void> => {
    setLoading(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Token de autenticação não encontrado. Faça login novamente.');
        setLoading(false);
        return;
      }

      let url = `${backendUrl}/api/v1/reports/${reportType}`;
      const params = new URLSearchParams();

      // Adicionar parâmetros baseados no tipo de relatório
      switch (reportType) {
        case 'financial':
          if (reportOptions.startDate) params.append('start_date', reportOptions.startDate);
          if (reportOptions.endDate) params.append('end_date', reportOptions.endDate);
          if (reportOptions.propertyId) params.append('property_id', reportOptions.propertyId);
          if (reportOptions.tenantId) params.append('tenant_id', reportOptions.tenantId);
          break;
          
        case 'quick-financial':
          params.append('period', reportOptions.quickPeriod);
          break;
          
        case 'properties':
          if (reportOptions.status) params.append('status', reportOptions.status);
          if (reportOptions.propertyType) params.append('property_type', reportOptions.propertyType);
          break;
          
        case 'tenants':
          if (reportOptions.propertyId) params.append('property_id', reportOptions.propertyId);
          if (reportOptions.status) params.append('status', reportOptions.status);
          break;
          
        case 'comprehensive':
          if (reportOptions.startDate) params.append('start_date', reportOptions.startDate);
          if (reportOptions.endDate) params.append('end_date', reportOptions.endDate);
          break;
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Criar blob do PDF e fazer download
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        
        // Extrair nome do arquivo do header ou criar um padrão
        const contentDisposition = response.headers.get('Content-Disposition');
        const filename = contentDisposition
          ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
          : `relatorio_${reportType}_${new Date().toISOString().slice(0, 10)}.pdf`;
          
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        // Feedback visual
        setSelectedReport('');
        alert(`Relatório "${getReportTitle(reportType)}" gerado com sucesso!`);
        
      } else {
        const errorText = await response.text();
        console.error('Error generating report:', response.status, errorText);
        alert(`Erro ao gerar relatório: ${response.status}`);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Erro ao gerar relatório. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const getReportTitle = (reportType: string): string => {
    const titles = {
      'financial': 'Relatório Financeiro',
      'quick-financial': 'Relatório Financeiro Rápido',
      'properties': 'Relatório de Propriedades',
      'tenants': 'Relatório de Inquilinos',
      'comprehensive': 'Relatório Completo'
    };
    return titles[reportType as keyof typeof titles] || reportType;
  };

  const getReportIcon = (reportType: string) => {
    const icons = {
      'financial': <DollarSign className="w-6 h-6" />,
      'quick-financial': <Clock className="w-6 h-6" />,
      'properties': <Building className="w-6 h-6" />,
      'tenants': <Users className="w-6 h-6" />,
      'comprehensive': <BarChart3 className="w-6 h-6" />
    };
    return icons[reportType as keyof typeof icons] || <FileText className="w-6 h-6" />;
  };

  const reportTypes = [
    {
      key: 'quick-financial',
      title: 'Relatório Financeiro Rápido',
      description: 'Análise financeira com períodos pré-definidos',
      requiresOptions: false
    },
    {
      key: 'financial',
      title: 'Relatório Financeiro Customizado',
      description: 'Relatório financeiro com filtros personalizados',
      requiresOptions: true
    },
    {
      key: 'properties',
      title: 'Relatório de Propriedades',
      description: 'Resumo completo das propriedades cadastradas',
      requiresOptions: true
    },
    {
      key: 'tenants',
      title: 'Relatório de Inquilinos',
      description: 'Informações detalhadas dos inquilinos',
      requiresOptions: true
    },
    {
      key: 'comprehensive',
      title: 'Relatório Completo',
      description: 'Visão geral completa do sistema',
      requiresOptions: true
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FileBarChart className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Relatórios</h2>
            <p className="text-gray-500">Gere relatórios em PDF do seu sistema</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <CheckCircle className="w-4 h-4" />
          <span>Sistema de Relatórios Ativo</span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Gerando relatório...</span>
        </div>
      )}

      {/* Report Types Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {reportTypes.map((report) => (
            <div
              key={report.key}
              className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedReport === report.key
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setSelectedReport(selectedReport === report.key ? '' : report.key)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-blue-600">
                  {getReportIcon(report.key)}
                </div>
                {selectedReport === report.key && (
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{report.title}</h3>
              <p className="text-sm text-gray-600">{report.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Options Panel */}
      {selectedReport && !loading && (
        <div className="border-t pt-6">
          <div className="flex items-center mb-4">
            <Filter className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Opções para {getReportTitle(selectedReport)}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Quick Period Selector (for quick-financial) */}
            {selectedReport === 'quick-financial' && filters && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Período
                </label>
                <select
                  value={reportOptions.quickPeriod}
                  onChange={(e) => setReportOptions({...reportOptions, quickPeriod: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {filters.quick_periods.map((period) => (
                    <option key={period.key} value={period.key}>
                      {period.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Range */}
            {(selectedReport === 'financial' || selectedReport === 'comprehensive') && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Data Início
                  </label>
                  <input
                    type="date"
                    value={reportOptions.startDate}
                    onChange={(e) => setReportOptions({...reportOptions, startDate: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Data Fim
                  </label>
                  <input
                    type="date"
                    value={reportOptions.endDate}
                    onChange={(e) => setReportOptions({...reportOptions, endDate: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </>
            )}

            {/* Property Filter */}
            {(selectedReport === 'financial' || selectedReport === 'tenants') && filters && filters.properties.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Propriedade
                </label>
                <select
                  value={reportOptions.propertyId}
                  onChange={(e) => setReportOptions({...reportOptions, propertyId: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todas as propriedades</option>
                  {filters.properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.address}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Tenant Filter */}
            {selectedReport === 'financial' && filters && filters.tenants.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Inquilino
                </label>
                <select
                  value={reportOptions.tenantId}
                  onChange={(e) => setReportOptions({...reportOptions, tenantId: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos os inquilinos</option>
                  {filters.tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Filter */}
            {selectedReport === 'properties' && filters && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Status da Propriedade
                </label>
                <select
                  value={reportOptions.status}
                  onChange={(e) => setReportOptions({...reportOptions, status: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos os status</option>
                  {filters.property_status.map((status) => (
                    <option key={status} value={status}>
                      {status === 'available' ? 'Disponível' : 
                       status === 'occupied' ? 'Ocupada' :
                       status === 'maintenance' ? 'Manutenção' :
                       status === 'unavailable' ? 'Indisponível' : status}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedReport === 'tenants' && filters && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Status do Inquilino
                </label>
                <select
                  value={reportOptions.status}
                  onChange={(e) => setReportOptions({...reportOptions, status: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos os status</option>
                  {filters.tenant_status.map((status) => (
                    <option key={status} value={status}>
                      {status === 'active' ? 'Ativo' : 'Inativo'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Property Type Filter */}
            {selectedReport === 'properties' && filters && filters.property_types.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de Propriedade
                </label>
                <select
                  value={reportOptions.propertyType}
                  onChange={(e) => setReportOptions({...reportOptions, propertyType: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos os tipos</option>
                  {filters.property_types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={() => generateReport(selectedReport)}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Gerar Relatório PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* Info Panel */}
      {!selectedReport && !loading && (
        <div className="text-center py-8">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Selecione um Tipo de Relatório
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Escolha o tipo de relatório que deseja gerar. Cada relatório contém informações específicas
            e pode ser personalizado com diferentes filtros.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportsComponent;