import React, { useMemo, useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Download, Calendar, DollarSign } from 'lucide-react';
import { Property, Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/optimizedCalculations';
import { useRenderMonitor } from '../../utils/performanceMonitor';

interface ReportManagerProps {
  properties: Property[];
  transactions: Transaction[];
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    occupancyRate: number;
    averageRent: number;
    totalInvestment: number;
    monthlyROI: number;
  };
  showValues: boolean;
}

const ReportManager: React.FC<ReportManagerProps> = ({
  properties,
  transactions,
  summary,
  showValues
}) => {
  useRenderMonitor('ReportManager');
  
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [reportType, setReportType] = useState<'financial' | 'properties' | 'occupancy'>('financial');

  // Calcular dados para gráficos e relatórios
  const reportData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (selectedPeriod) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const periodTransactions = transactions.filter(t => 
      new Date(t.date) >= startDate && new Date(t.date) <= now
    );

    const monthlyData = [];
    const months = selectedPeriod === 'year' ? 12 : selectedPeriod === 'quarter' ? 3 : 1;
    
    for (let i = 0; i < months; i++) {
      const monthStart = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      const monthEnd = new Date(startDate.getFullYear(), startDate.getMonth() + i + 1, 0);
      
      const monthTransactions = periodTransactions.filter(t => {
        const transDate = new Date(t.date);
        return transDate >= monthStart && transDate <= monthEnd;
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      monthlyData.push({
        month: monthStart.toLocaleDateString('pt-BR', { month: 'short' }),
        income,
        expenses,
        profit: income - expenses
      });
    }

    return {
      periodTransactions,
      monthlyData,
      totalIncome: monthlyData.reduce((sum, m) => sum + m.income, 0),
      totalExpenses: monthlyData.reduce((sum, m) => sum + m.expenses, 0),
      totalProfit: monthlyData.reduce((sum, m) => sum + m.profit, 0)
    };
  }, [transactions, selectedPeriod]);

  // Relatório de propriedades
  const propertyReport = useMemo(() => {
    return properties.map(property => {
      const propertyTransactions = transactions.filter(t => t.propertyId === property.id);
      const income = propertyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const expenses = propertyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        ...property,
        totalIncome: income,
        totalExpenses: expenses,
        netProfit: income - expenses,
        roi: property.purchasePrice > 0 ? ((income - expenses) / property.purchasePrice) * 100 : 0
      };
    });
  }, [properties, transactions]);

  const handleExportReport = () => {
    const reportContent = {
      period: selectedPeriod,
      type: reportType,
      generatedAt: new Date(),
      summary,
      data: reportType === 'financial' ? reportData : propertyReport
    };

    const blob = new Blob([JSON.stringify(reportContent, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${reportType}-${selectedPeriod}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sistema de Relatórios</h2>
          <p className="text-gray-600 mt-1">Análise detalhada do desempenho do seu portfólio</p>
        </div>
        
        <div className="flex space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as 'month' | 'quarter' | 'year')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="month">Este Mês</option>
            <option value="quarter">Este Trimestre</option>
            <option value="year">Este Ano</option>
          </select>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as 'financial' | 'properties' | 'occupancy')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="financial">Relatório Financeiro</option>
            <option value="properties">Relatório por Propriedade</option>
            <option value="occupancy">Taxa de Ocupação</option>
          </select>
          <button
            onClick={handleExportReport}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Resumo do Período */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Receita do Período</p>
              <p className="text-lg font-bold text-green-600">
                {showValues ? formatCurrency(reportData.totalIncome) : '****'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <TrendingDown className="w-5 h-5 text-red-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Despesas do Período</p>
              <p className="text-lg font-bold text-red-600">
                {showValues ? formatCurrency(reportData.totalExpenses) : '****'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Lucro do Período</p>
              <p className={`text-lg font-bold ${reportData.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {showValues ? formatCurrency(reportData.totalProfit) : '****'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <BarChart3 className="w-5 h-5 text-purple-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">ROI do Período</p>
              <p className="text-lg font-bold text-purple-600">
                {showValues ? `${((reportData.totalProfit / summary.totalInvestment) * 100).toFixed(2)}%` : '****'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo do Relatório */}
      {reportType === 'financial' && (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolução Financeira</h3>
          <div className="space-y-4">
            {reportData.monthlyData.map((month, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{month.month}</span>
                <div className="flex space-x-4">
                  <span className="text-green-600">
                    +{showValues ? formatCurrency(month.income) : '****'}
                  </span>
                  <span className="text-red-600">
                    -{showValues ? formatCurrency(month.expenses) : '****'}
                  </span>
                  <span className={`font-bold ${month.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {showValues ? formatCurrency(month.profit) : '****'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {reportType === 'properties' && (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Desempenho por Propriedade</h3>
          <div className="space-y-4">
            {propertyReport.map((property) => (
              <div key={property.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{property.name}</h4>
                    <p className="text-sm text-gray-600">{property.address}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    property.status === 'rented' ? 'bg-green-100 text-green-800' : 
                    property.status === 'vacant' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {property.status === 'rented' ? 'Alugada' : 
                     property.status === 'vacant' ? 'Vaga' : 'Manutenção'}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Receita</p>
                    <p className="font-medium text-green-600">
                      {showValues ? formatCurrency(property.totalIncome) : '****'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Despesas</p>
                    <p className="font-medium text-red-600">
                      {showValues ? formatCurrency(property.totalExpenses) : '****'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Lucro Líquido</p>
                    <p className={`font-medium ${property.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {showValues ? formatCurrency(property.netProfit) : '****'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">ROI</p>
                    <p className="font-medium text-blue-600">
                      {showValues ? `${property.roi.toFixed(2)}%` : '****'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {reportType === 'occupancy' && (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Taxa de Ocupação</h3>
          <div className="space-y-4">
            <div className="text-center p-8">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {showValues ? `${summary.occupancyRate.toFixed(1)}%` : '****'}
              </div>
              <p className="text-gray-600">Taxa de Ocupação Atual</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {properties.filter(p => p.status === 'rented').length}
                </div>
                <p className="text-green-700">Propriedades Alugadas</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {properties.filter(p => p.status === 'vacant').length}
                </div>
                <p className="text-yellow-700">Propriedades Vagas</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {properties.filter(p => p.status === 'maintenance').length}
                </div>
                <p className="text-red-700">Em Manutenção</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportManager;