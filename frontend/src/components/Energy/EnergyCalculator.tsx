import React, { useState, useMemo, useCallback } from 'react';
import { Plus, Edit, Trash2, Zap, Calculator, TrendingUp, AlertTriangle } from 'lucide-react';
import { EnergyBill, Property } from '../../types';
import { EnergyBillForm } from './EnergyBillForm';
import { formatCurrency, formatDate } from '../../utils/optimizedCalculations';
import { useRenderMonitor } from '../../utils/performanceMonitor';

interface EnergyCalculatorProps {
  energyBills: EnergyBill[];
  properties: Property[];
  showValues: boolean;
  onAddEnergyBill: (bill: Omit<EnergyBill, 'id' | 'createdAt' | 'lastUpdated'>) => void;
  onUpdateEnergyBill: (id: string, updates: Partial<EnergyBill>) => void;
  onDeleteEnergyBill: (id: string) => void;
}

const EnergyBillCard = React.memo(({ 
  bill, 
  linkedProperty, 
  showValues, 
  onEdit, 
  onDelete 
}: {
  bill: EnergyBill;
  linkedProperty?: Property;
  showValues: boolean;
  onEdit: (bill: EnergyBill) => void;
  onDelete: (id: string) => void;
}) => {
  const isPaid = bill.isPaid;
  const isOverdue = !isPaid && new Date(bill.dueDate) < new Date();

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden border ${
      isOverdue ? 'border-red-300' : isPaid ? 'border-green-300' : 'border-gray-200'
    }`}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
              isOverdue ? 'bg-red-100' : isPaid ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              <Zap className={`w-5 h-5 ${
                isOverdue ? 'text-red-600' : isPaid ? 'text-green-600' : 'text-yellow-600'
              }`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Conta de Energia - {bill.referenceMonth}
              </h3>
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                isOverdue ? 'bg-red-100 text-red-800' : 
                isPaid ? 'bg-green-100 text-green-800' : 
                'bg-yellow-100 text-yellow-800'
              }`}>
                {isOverdue ? 'Atrasada' : isPaid ? 'Paga' : 'Pendente'}
              </span>
            </div>
          </div>
          {isOverdue && (
            <AlertTriangle className="w-5 h-5 text-red-600" title="Conta em atraso" />
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Consumo Total:</span>
            <span className="text-sm font-medium">{bill.totalConsumption} kWh</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Valor Total:</span>
            <span className="text-sm font-bold">
              {showValues ? formatCurrency(bill.totalAmount) : '****'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Vencimento:</span>
            <span className="text-sm">{formatDate(bill.dueDate)}</span>
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-4">
          <p>Propriedade: {linkedProperty?.name || 'Não especificada'}</p>
          <p>Grupo: {bill.groupId || 'Sem grupo'}</p>
          {bill.readings && bill.readings.length > 0 && (
            <p>Leituras: {bill.readings.length} apartamento(s)</p>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={() => onEdit(bill)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar conta"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(bill.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Excluir conta"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

EnergyBillCard.displayName = 'EnergyBillCard';

const EnergyCalculator: React.FC<EnergyCalculatorProps> = ({
  energyBills,
  properties,
  showValues,
  onAddEnergyBill,
  onUpdateEnergyBill,
  onDeleteEnergyBill
}) => {
  useRenderMonitor('EnergyCalculator');
  
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState<EnergyBill | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  // Memoizar contas filtradas
  const filteredBills = useMemo(() => {
    let filtered = energyBills;
    
    if (filterStatus !== 'all') {
      const now = new Date();
      filtered = filtered.filter(bill => {
        switch (filterStatus) {
          case 'paid':
            return bill.isPaid;
          case 'pending':
            return !bill.isPaid && new Date(bill.dueDate) >= now;
          case 'overdue':
            return !bill.isPaid && new Date(bill.dueDate) < now;
          default:
            return true;
        }
      });
    }
    
    return filtered.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  }, [energyBills, filterStatus]);

  // Memoizar propriedades vinculadas
  const linkedProperties = useMemo(() => {
    const propertyMap = new Map(properties.map(p => [p.id, p]));
    return propertyMap;
  }, [properties]);

  // Estatísticas das contas
  const stats = useMemo(() => {
    const now = new Date();
    const paid = energyBills.filter(b => b.isPaid);
    const pending = energyBills.filter(b => !b.isPaid && new Date(b.dueDate) >= now);
    const overdue = energyBills.filter(b => !b.isPaid && new Date(b.dueDate) < now);
    
    const totalAmount = energyBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const totalConsumption = energyBills.reduce((sum, bill) => sum + bill.totalConsumption, 0);
    
    return {
      total: energyBills.length,
      paid: paid.length,
      pending: pending.length,
      overdue: overdue.length,
      totalAmount,
      totalConsumption
    };
  }, [energyBills]);

  // Callbacks memoizados
  const handleAddBill = useCallback((billData: Omit<EnergyBill, 'id' | 'createdAt' | 'lastUpdated'>) => {
    onAddEnergyBill(billData);
    setShowForm(false);
  }, [onAddEnergyBill]);

  const handleEditBill = useCallback((bill: EnergyBill) => {
    setEditingBill(bill);
    setShowForm(true);
  }, []);

  const handleUpdateBill = useCallback((billData: Omit<EnergyBill, 'id' | 'createdAt' | 'lastUpdated'>) => {
    if (editingBill) {
      onUpdateEnergyBill(editingBill.id, billData);
      setEditingBill(null);
      setShowForm(false);
    }
  }, [editingBill, onUpdateEnergyBill]);

  const handleCancelForm = useCallback(() => {
    setShowForm(false);
    setEditingBill(null);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Calculadora de Energia</h2>
          <p className="text-gray-600 mt-1">
            Gestão e rateio de contas de energia elétrica
          </p>
        </div>
        
        <div className="flex space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'paid' | 'pending' | 'overdue')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas as contas</option>
            <option value="paid">Pagas</option>
            <option value="pending">Pendentes</option>
            <option value="overdue">Atrasadas</option>
          </select>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Conta
          </button>
        </div>
      </div>

      {/* Estatísticas das contas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <Calculator className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Total de Contas</p>
              <p className="text-lg font-bold text-blue-600">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Pagas</p>
              <p className="text-lg font-bold text-green-600">{stats.paid}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <Zap className="w-5 h-5 text-yellow-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Pendentes</p>
              <p className="text-lg font-bold text-yellow-600">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Atrasadas</p>
              <p className="text-lg font-bold text-red-600">{stats.overdue}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div>
            <p className="text-sm text-gray-600">Valor Total</p>
            <p className="text-lg font-bold text-gray-900">
              {showValues ? formatCurrency(stats.totalAmount) : '****'}
            </p>
            <p className="text-xs text-gray-500">{stats.totalConsumption} kWh</p>
          </div>
        </div>
      </div>

      {showForm && (
        <EnergyBillForm
          bill={editingBill}
          properties={properties}
          onSubmit={editingBill ? handleUpdateBill : handleAddBill}
          onCancel={handleCancelForm}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBills.map((bill) => {
          const linkedProperty = linkedProperties.get(bill.propertyId);
          return (
            <EnergyBillCard
              key={bill.id}
              bill={bill}
              linkedProperty={linkedProperty}
              showValues={showValues}
              onEdit={handleEditBill}
              onDelete={onDeleteEnergyBill}
            />
          );
        })}
      </div>

      {filteredBills.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
            <Zap className="w-8 h-8 text-yellow-600" />
          </div>
          <p className="text-gray-500 text-lg">
            {filterStatus !== 'all' ? 'Nenhuma conta encontrada neste filtro' : 'Nenhuma conta de energia cadastrada'}
          </p>
          <p className="text-gray-400 mt-2">
            {filterStatus !== 'all' ? 'Tente ajustar o filtro de status' : 'Comece adicionando sua primeira conta de energia'}
          </p>
        </div>
      )}
    </div>
  );
};

export default EnergyCalculator;