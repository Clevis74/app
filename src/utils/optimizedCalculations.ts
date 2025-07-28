import { Property, Transaction, FinancialSummary } from '../types';
import { formatDate as safeFormatDate, formatCurrency, createLocalDate, isDateInCurrentMonth } from './safeDateFormatting';

// ========== EXTENSÕES DE CACHE COM ALERTAS (REVERSÍVEIS) ==========

// Cache para evitar recálculos desnecessários com limite configurável
const calculationCache = new Map<string, any>();
const MAX_CACHE_SIZE = 20;
const CACHE_CLEANUP_THRESHOLD = 15;

// Sistema de alertas de cache (extensão modular)
const cacheAlerts = {
  enabled: true,
  thresholds: {
    maxSize: MAX_CACHE_SIZE,
    cleanupThreshold: CACHE_CLEANUP_THRESHOLD,
    hitRateWarning: 60, // %
    operationTimeWarning: 100 // ms
  },
  stats: {
    totalOperations: 0,
    cacheHits: 0,
    cleanupCount: 0,
    lastCleanup: 0
  }
};

// Função para log de alertas (defensiva)
const logCacheAlert = (type: string, message: string, data?: any) => {
  if (!cacheAlerts.enabled || process.env.NODE_ENV !== 'development') return;
  
  try {
    console.warn(`🚨 Cache Alert [${type}]: ${message}`, data || '');
    
    // Registrar alerta para análise posterior
    if (!window.__cacheAlerts) window.__cacheAlerts = [];
    window.__cacheAlerts.push({
      timestamp: Date.now(),
      type,
      message,
      data
    });
  } catch (error) {
    // Falha silenciosa para não impactar produção
  }
};

// Função auxiliar para criar chave de cache com validação segura
const createCacheKey = (properties: Property[], transactions: Transaction[], suffix: string = '') => {
  try {
    const propHash = properties.map(p => `${p.id}-${p.status}-${p.rentValue}`).join('|');
    const transHash = transactions.map(t => {
      const dateTime = t.date instanceof Date ? t.date.getTime() : new Date(t.date).getTime();
      return `${t.id}-${t.amount}-${isNaN(dateTime) ? '0' : dateTime}`;
    }).join('|');
    return `${propHash}:${transHash}${suffix}`;
  } catch (error) {
    console.warn('[createCacheKey] Erro ao criar chave de cache:', error);
    return `fallback-${Date.now()}${suffix}`;
  }
};

// Função para limpar cache quando necessário (implementação LRU)
const cleanupCache = () => {
  if (calculationCache.size > CACHE_CLEANUP_THRESHOLD) {
    const keysToDelete = Array.from(calculationCache.keys())
      .slice(0, calculationCache.size - MAX_CACHE_SIZE);
    keysToDelete.forEach(key => calculationCache.delete(key));
  }
};

// Memoização inteligente para cálculos financeiros
export const calculateFinancialSummary = (
  properties: Property[],
  transactions: Transaction[]
): FinancialSummary => {
  const cacheKey = createCacheKey(properties, transactions, '-financial');
  
  if (calculationCache.has(cacheKey)) {
    return calculationCache.get(cacheKey);
  }

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // Filtrar transações do mês atual com validação de data
  const monthlyTransactions = transactions.filter(t => {
    try {
      const transactionDate = new Date(t.date);
      if (isNaN(transactionDate.getTime())) {
        console.warn('[calculateFinancialSummary] Data inválida na transação:', t.id, t.date);
        return false;
      }
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    } catch (error) {
      console.warn('[calculateFinancialSummary] Erro ao processar data:', error, t);
      return false;
    }
  });

  // Calcular totais em uma única passagem
  let totalIncome = 0;
  let totalExpenses = 0;
  
  monthlyTransactions.forEach(t => {
    const amount = typeof t.amount === 'number' ? t.amount : 0;
    if (t.type === 'income') {
      totalIncome += amount;
    } else {
      totalExpenses += amount;
    }
  });

  const netIncome = totalIncome - totalExpenses;
  const totalProperties = properties.length;
  const rentedProperties = properties.filter(p => p.status === 'rented').length;
  const occupancyRate = totalProperties > 0 ? (rentedProperties / totalProperties) * 100 : 0;

  const totalInvestment = properties.reduce((sum, p) => {
    const price = typeof p.purchasePrice === 'number' ? p.purchasePrice : 0;
    return sum + price;
  }, 0);
  const monthlyROI = totalInvestment > 0 ? (netIncome / totalInvestment) * 100 : 0;

  const result: FinancialSummary = {
    totalIncome,
    totalExpenses,
    netIncome,
    occupancyRate,
    totalProperties,
    rentedProperties,
    monthlyROI
  };

  // Cache o resultado e limpa cache antigo
  calculationCache.set(cacheKey, result);
  cleanupCache();

  return result;
};

// Re-exportar funções seguras de formatação
export const formatDate = safeFormatDate;
export { formatCurrency, createLocalDate, isDateInCurrentMonth };

// Função para limpar cache quando necessário
export const clearCalculationCache = () => {
  calculationCache.clear();
};

// Função para calcular métricas de performance
export const getPerformanceMetrics = () => {
  return {
    calculationCacheSize: calculationCache.size,
    formatCacheSize: 0, // Será implementado quando necessário
    totalCacheEntries: calculationCache.size
  };
};