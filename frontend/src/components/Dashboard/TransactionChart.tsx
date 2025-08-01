import React from 'react';
import { Transaction } from '../../types';
import { formatCurrency } from '../../utils/calculations';

interface _TransactionChartProps {
  transactions: Transaction[];
  showValues: boolean;
}

export const TransactionChart: React.FC<{ transactions, showValues }> = ({ transactions, showValues }): JSX.Element => {
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      month: date.toLocaleDateString('pt-BR', { month: 'short' }),
      fullDate: date
    };
  }).reverse();

  const chartData = last6Months.map(({ month, fullDate }) => {
    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === fullDate.getMonth() && 
             transactionDate.getFullYear() === fullDate.getFullYear();
    });

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { month, income, expenses };
  });

  const maxValue = Math.max(...chartData.map(d => Math.max(d.income, d.expenses)));

  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span>Receitas</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <span>Despesas</span>
        </div>
      </div>
      
      <div className="h-64 flex items-end space-x-4">
        {chartData.map((data, index) => (
          <div key={index} className="flex-1 flex flex-col items-center space-y-1">
            <div className="w-full flex justify-center space-x-1">
              <div 
                className="w-4 bg-green-500 rounded-t"
                style={{ height: `${(data.income / maxValue) * 200}px` }}
                title={showValues ? `Receita: ${formatCurrency(data.income)}` : 'Receita: ****'}
              />
              <div 
                className="w-4 bg-red-500 rounded-t"
                style={{ height: `${(data.expenses / maxValue) * 200}px` }}
                title={showValues ? `Despesa: ${formatCurrency(data.expenses)}` : 'Despesa: ****'}
              />
            </div>
            <span className="text-xs text-gray-600">{data.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
};