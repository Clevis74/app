/**
 * Lighthouse Performance Dashboard - SISMOBI v3.2.0
 * Component para visualizar métricas de performance do Lighthouse CI
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  Zap, 
  Eye, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  TrendingUp,
  Monitor,
  Smartphone,
  Timer,
  FileText
} from 'lucide-react';

interface LighthouseMetrics {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  cls: number; // Cumulative Layout Shift
  tbt: number; // Total Blocking Time
}

interface LighthouseResult {
  url: string;
  timestamp: string;
  device: 'mobile' | 'desktop';
  metrics: LighthouseMetrics;
  passed: boolean;
}

interface LighthouseDashboardProps {
  isVisible: boolean;
  onClose: () => void;
}

export const LighthouseDashboard: React.FC<LighthouseDashboardProps> = ({
  isVisible,
  onClose
}) => {
  const [results, setResults] = useState<LighthouseResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<'mobile' | 'desktop' | 'all'>('all');

  // Simulação de dados do Lighthouse (em produção viria da API)
  const mockResults: LighthouseResult[] = [
    {
      url: 'http://localhost:3000',
      timestamp: new Date().toISOString(),
      device: 'desktop',
      metrics: {
        performance: 0.95,
        accessibility: 0.98,
        bestPractices: 0.92,
        seo: 0.89,
        fcp: 1200,
        lcp: 2100,
        cls: 0.05,
        tbt: 150
      },
      passed: true
    },
    {
      url: 'http://localhost:3000/properties',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      device: 'mobile',
      metrics: {
        performance: 0.87,
        accessibility: 0.96,
        bestPractices: 0.90,
        seo: 0.85,
        fcp: 1800,
        lcp: 2900,
        cls: 0.08,
        tbt: 280
      },
      passed: true
    },
    {
      url: 'http://localhost:3000/reports',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      device: 'desktop',
      metrics: {
        performance: 0.82,
        accessibility: 0.94,
        bestPractices: 0.88,
        seo: 0.91,
        fcp: 1500,
        lcp: 3200,
        cls: 0.12,
        tbt: 320
      },
      passed: false
    }
  ];

  useEffect(() => {
    if (isVisible) {
      // Simular carregamento de dados
      setIsLoading(true);
      setTimeout(() => {
        setResults(mockResults);
        setIsLoading(false);
      }, 1000);
    }
  }, [isVisible, mockResults]); // Add mockResults dependency

  const getScoreColor = (score: number): string => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 0.9) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (score >= 0.8) return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  const formatMetricValue = (metric: string, value: number): string => {
    switch (metric) {
      case 'fcp':
      case 'lcp':
      case 'tbt':
        return `${value}ms`;
      case 'cls':
        return value.toFixed(3);
      default:
        return Math.round(value * 100).toString();
    }
  };

  const getAverageScores = () => {
    if (results.length === 0) return null;
    
    const filtered = selectedDevice === 'all' 
      ? results 
      : results.filter(r => r.device === selectedDevice);
    
    const avgPerformance = filtered.reduce((sum, r) => sum + r.metrics.performance, 0) / filtered.length;
    const avgAccessibility = filtered.reduce((sum, r) => sum + r.metrics.accessibility, 0) / filtered.length;
    const avgBestPractices = filtered.reduce((sum, r) => sum + r.metrics.bestPractices, 0) / filtered.length;
    const avgSEO = filtered.reduce((sum, r) => sum + r.metrics.seo, 0) / filtered.length;

    return {
      performance: avgPerformance,
      accessibility: avgAccessibility,
      bestPractices: avgBestPractices,
      seo: avgSEO
    };
  };

  const runNewAudit = async () => {
    setIsLoading(true);
    // Simular execução de nova auditoria
    setTimeout(() => {
      // Em produção, chamaria a API do Lighthouse CI
      console.log('🚀 Nova auditoria Lighthouse iniciada...');
      setIsLoading(false);
    }, 2000);
  };

  if (!isVisible) return null;

  const filteredResults = selectedDevice === 'all' 
    ? results 
    : results.filter(r => r.device === selectedDevice);

  const averageScores = getAverageScores();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Lighthouse Performance Dashboard</h2>
                <p className="text-purple-200">Métricas de Performance, Acessibilidade e SEO</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200 text-2xl font-bold"
              aria-label="Fechar dashboard"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando métricas do Lighthouse...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedDevice}
                    onChange={(e) => setSelectedDevice(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">Todos os Dispositivos</option>
                    <option value="desktop">Desktop</option>
                    <option value="mobile">Mobile</option>
                  </select>
                  <span className="text-sm text-gray-600">
                    {filteredResults.length} resultado(s)
                  </span>
                </div>
                
                <button
                  onClick={runNewAudit}
                  disabled={isLoading}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50"
                >
                  <Zap className="w-4 h-4" />
                  <span>Nova Auditoria</span>
                </button>
              </div>

              {/* Average Scores */}
              {averageScores && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                    Pontuações Médias
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Zap className="w-5 h-5 mr-2 text-orange-600" />
                        <span className="font-medium">Performance</span>
                      </div>
                      <div className={`text-2xl font-bold ${getScoreColor(averageScores.performance)}`}>
                        {Math.round(averageScores.performance * 100)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Eye className="w-5 h-5 mr-2 text-blue-600" />
                        <span className="font-medium">Acessibilidade</span>
                      </div>
                      <div className={`text-2xl font-bold ${getScoreColor(averageScores.accessibility)}`}>
                        {Math.round(averageScores.accessibility * 100)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                        <span className="font-medium">Boas Práticas</span>
                      </div>
                      <div className={`text-2xl font-bold ${getScoreColor(averageScores.bestPractices)}`}>
                        {Math.round(averageScores.bestPractices * 100)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Search className="w-5 h-5 mr-2 text-purple-600" />
                        <span className="font-medium">SEO</span>
                      </div>
                      <div className={`text-2xl font-bold ${getScoreColor(averageScores.seo)}`}>
                        {Math.round(averageScores.seo * 100)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Results List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  Resultados das Auditorias
                </h3>
                
                {filteredResults.map((result, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {result.device === 'mobile' ? (
                            <Smartphone className="w-5 h-5 text-gray-600" />
                          ) : (
                            <Monitor className="w-5 h-5 text-gray-600" />
                          )}
                          <span className="font-medium">{result.url}</span>
                        </div>
                        {getScoreIcon(result.metrics.performance)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(result.timestamp).toLocaleString('pt-BR')}
                      </div>
                    </div>

                    {/* Scores Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="flex items-center justify-center mb-1">
                          <Zap className="w-4 h-4 mr-1 text-orange-600" />
                          <span className="text-sm">Performance</span>
                        </div>
                        <div className={`text-lg font-bold ${getScoreColor(result.metrics.performance)}`}>
                          {Math.round(result.metrics.performance * 100)}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="flex items-center justify-center mb-1">
                          <Eye className="w-4 h-4 mr-1 text-blue-600" />
                          <span className="text-sm">Acessibilidade</span>
                        </div>
                        <div className={`text-lg font-bold ${getScoreColor(result.metrics.accessibility)}`}>
                          {Math.round(result.metrics.accessibility * 100)}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="flex items-center justify-center mb-1">
                          <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                          <span className="text-sm">Boas Práticas</span>
                        </div>
                        <div className={`text-lg font-bold ${getScoreColor(result.metrics.bestPractices)}`}>
                          {Math.round(result.metrics.bestPractices * 100)}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="flex items-center justify-center mb-1">
                          <Search className="w-4 h-4 mr-1 text-purple-600" />
                          <span className="text-sm">SEO</span>
                        </div>
                        <div className={`text-lg font-bold ${getScoreColor(result.metrics.seo)}`}>
                          {Math.round(result.metrics.seo * 100)}
                        </div>
                      </div>
                    </div>

                    {/* Core Web Vitals */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3 flex items-center">
                        <Timer className="w-4 h-4 mr-2 text-purple-600" />
                        Core Web Vitals
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">FCP:</span>
                          <span className="ml-2 font-medium">{formatMetricValue('fcp', result.metrics.fcp)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">LCP:</span>
                          <span className="ml-2 font-medium">{formatMetricValue('lcp', result.metrics.lcp)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">CLS:</span>
                          <span className="ml-2 font-medium">{formatMetricValue('cls', result.metrics.cls)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">TBT:</span>
                          <span className="ml-2 font-medium">{formatMetricValue('tbt', result.metrics.tbt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredResults.length === 0 && (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum resultado encontrado</h3>
                  <p className="text-gray-600">Execute uma auditoria para ver as métricas de performance</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center text-sm text-gray-600">
          <div>
            Lighthouse CI v0.12.0 | SISMOBI v3.2.0
          </div>
          <div>
            Próxima auditoria automática: {new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString('pt-BR')}
          </div>
        </div>
      </div>
    </div>
  );
};