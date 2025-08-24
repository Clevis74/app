import React, { useState, useEffect } from 'react';
import { EnergyBill, Property } from '../../types';

interface EnergyBillFormProps {
  bill?: EnergyBill | null;
  properties: Property[];
  onSubmit: (bill: Omit<EnergyBill, 'id' | 'createdAt' | 'lastUpdated'>) => void;
  onCancel: () => void;
}

export const EnergyBillForm: React.FC<EnergyBillFormProps> = ({ 
  bill, 
  properties, 
  onSubmit, 
  onCancel 
}): JSX.Element => {
  const [formData, setFormData] = useState({
    propertyId: '',
    groupId: '',
    referenceMonth: '',
    dueDate: '',
    amount: 0,
    consumption: 0,
    isPaid: false,
    notes: ''
  });

  useEffect(() => {
    if (bill) {
      setFormData({
        propertyId: bill.propertyId,
        groupId: bill.groupId,
        referenceMonth: bill.referenceMonth,
        dueDate: bill.dueDate instanceof Date ? bill.dueDate.toISOString().split('T')[0] : bill.dueDate,
        amount: bill.amount,
        consumption: bill.consumption,
        isPaid: bill.isPaid,
        notes: bill.notes || ''
      });
    }
  }, [bill]);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    onSubmit({
      ...formData,
      dueDate: new Date(formData.dueDate)
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              name === 'amount' || name === 'consumption' ? Number(value) : value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {bill ? 'Editar Conta de Energia' : 'Nova Conta de Energia'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Propriedade</label>
            <select
              name="propertyId"
              value={formData.propertyId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione uma propriedade</option>
              {properties.map(property => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grupo de Energia</label>
            <input
              type="text"
              name="groupId"
              value={formData.groupId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 802-Ca 01"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mês de Referência</label>
            <input
              type="text"
              name="referenceMonth"
              value={formData.referenceMonth}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Janeiro 2024"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Vencimento</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Consumo (kWh)</label>
            <input
              type="number"
              name="consumption"
              value={formData.consumption}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isPaid"
              checked={formData.isPaid}
              onChange={handleChange}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Conta paga</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Observações adicionais..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {bill ? 'Atualizar' : 'Criar'} Conta
          </button>
        </div>
      </form>
    </div>
  );
};