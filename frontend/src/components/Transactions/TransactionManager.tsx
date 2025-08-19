import React, { useState, useMemo, useCallback } from 'react';
import { Plus, Edit, Trash2, DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Transaction, Property } from '../../types';
import { TransactionForm } from './TransactionForm';
import { formatCurrency, formatDate } from '../../utils/optimizedCalculations';
import { useRenderMonitor } from '../../utils/performanceMonitor';
import { useDebouncedCallback } from '../../utils/debounceUtils';

interface TransactionManagerProps {
  transactions: Transaction[];
  properties: Property[];
  showValues: boolean;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onUpdateTransaction: (id: string, updates: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
}

// Componente de card de transação memoizado
const TransactionCard = React.memo(({ 
  transaction, 
  linkedProperty, 
  showValues, 
  onEdit, 
  onDelete 
}: {
  transaction: Transaction;
  linkedProperty?: Property;
  showValues: boolean;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income': return 'bg-green-100 text-green-800';
      case 'expense': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'income' ? TrendingUp : TrendingDown;
  };

  const getTypeText = (type: string) => {
    return type === 'income' ? 'Receita' : 'Despesa';
  };

  const Icon = getTypeIcon(transaction.type);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
              transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <Icon className={`w-5 h-5 ${
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{transaction.description}</h3>
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(transaction.type)}`}>
                {getTypeText(transaction.type)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <DollarSign className="w-4 h-4 mr-2" />
            <span className="text-lg font-bold">
              {showValues ? formatCurrency(transaction.amount) : '****'}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="text-sm">{formatDate(transaction.date)}</span>
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-4">
          <p>Propriedade: {linkedProperty?.name || 'Não especificada'}</p>
          <p>Categoria: {transaction.category || 'Sem categoria'}</p>
          {transaction.isRecurring && (
            <p className="text-blue-600">🔄 Transação recorrente</p>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={() => onEdit(transaction)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar transação"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(transaction.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Excluir transação"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

TransactionCard.displayName = 'TransactionCard';

const TransactionManager: React.FC<TransactionManagerProps> = ({
  transactions,
  properties,
  showValues,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction
}) => {
  useRenderMonitor('TransactionManager');
  
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  // Memoizar transações filtradas
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;
    
    if (searchTerm) {
      filtered = filtered.filter(transaction => 
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filterType);
    }
    
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, filterType]);

  // Memoizar propriedades vinculadas
  const linkedProperties = useMemo(() => {
    const propertyMap = new Map(properties.map(p => [p.id, p]));
    return propertyMap;
  }, [properties]);

  // Callbacks memoizados
  const handleAddTransaction = useCallback((transactionData: Omit<Transaction, 'id'>) => {
    onAddTransaction(transactionData);
    setShowForm(false);
  }, [onAddTransaction]);

  const handleEditTransaction = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  }, []);

  const handleUpdateTransaction = useCallback((transactionData: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      onUpdateTransaction(editingTransaction.id, transactionData);
      setEditingTransaction(null);
      setShowForm(false);
    }
  }, [editingTransaction, onUpdateTransaction]);

  const handleCancelForm = useCallback(() => {
    setShowForm(false);
    setEditingTransaction(null);
  }, []);

  // Debounce para busca
  const debouncedSearch = useDebouncedCallback((term: string) => {
    setSearchTerm(term);
  }, 300);

  // Estatísticas resumidas
  const stats = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      count: filteredTransactions.length
    };
  }, [filteredTransactions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Transações Financeiras</h2>
          <p className="text-gray-600 mt-1">
            {filteredTransactions.length} de {transactions.length} transação{transactions.length !== 1 ? 'ões' : ''}
          </p>
        </div>
        
        <div className="flex space-x-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os tipos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>
          <input
            type="text"
            placeholder="Buscar transações..."
            onChange={(e) => debouncedSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Transação
          </button>
        </div>
      </div>

      {/* Resumo das estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Receitas</p>
              <p className="text-lg font-bold text-green-600">
                {showValues ? formatCurrency(stats.totalIncome) : '****'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <TrendingDown className="w-5 h-5 text-red-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Despesas</p>
              <p className="text-lg font-bold text-red-600">
                {showValues ? formatCurrency(stats.totalExpenses) : '****'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Saldo</p>
              <p className={`text-lg font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {showValues ? formatCurrency(stats.balance) : '****'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-gray-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-lg font-bold text-gray-900">{stats.count}</p>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          properties={properties}
          onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
          onCancel={handleCancelForm}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTransactions.map((transaction) => {
          const linkedProperty = linkedProperties.get(transaction.propertyId);
          return (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              linkedProperty={linkedProperty}
              showValues={showValues}
              onEdit={handleEditTransaction}
              onDelete={onDeleteTransaction}
            />
          );
        })}
      </div>

      {filteredTransactions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm || filterType !== 'all' ? 'Nenhuma transação encontrada' : 'Nenhuma transação cadastrada'}
          </p>
          <p className="text-gray-400 mt-2">
            {searchTerm || filterType !== 'all' ? 'Tente ajustar os filtros de busca' : 'Comece adicionando sua primeira transação'}
          </p>
        </div>
      )}
    </div>
  );
};

export default TransactionManager;