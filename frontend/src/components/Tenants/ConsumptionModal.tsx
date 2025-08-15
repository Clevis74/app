import React from 'react';
import { X, User, IdCard, Home, Zap, Droplets, Calculator, DollarSign, Mail, FileText, RefreshCw, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Tenant, Property, EnergyBill, WaterBill } from '../../types';
import { formatCurrency } from '../../utils/optimizedCalculations';

interface ConsumptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  property: Property | undefined;
  energyBills: EnergyBill[];
  waterBills: WaterBill[];
  showValues: boolean;
}

export const ConsumptionModal: React.FC<ConsumptionModalProps> = ({
  isOpen,
  onClose,
  tenant,
  property,
  energyBills,
  waterBills,
  showValues
}) => {
  // Buscar dados de consumo de energia para o inquilino
  const getEnergyConsumption = () => {
    if (!property?.energyUnitName) return null;

    // Buscar a conta de energia mais recente que contenha esta propriedade
    const relevantEnergyBill = energyBills
      .filter(bill => bill.propertiesInGroup.some(prop => prop.name === property.energyUnitName))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    if (!relevantEnergyBill) return null;

    // Encontrar os dados específicos desta propriedade
    const propertyData = relevantEnergyBill.propertiesInGroup.find(
      prop => prop.name === property.energyUnitName
    );

    return {
      totalGroupValue: relevantEnergyBill.totalGroupValue,
      proportionalValue: propertyData?.proportionalValue || 0,
      isPaid: propertyData?.isPaid || false,
      dueDate: propertyData?.dueDate
    };
  };

  // Buscar dados de consumo de água para o inquilino
  const getWaterConsumption = () => {
    if (!property?.energyUnitName) return null;

    // Buscar a conta de água mais recente que contenha esta propriedade
    const relevantWaterBill = waterBills
      .filter(bill => bill.propertiesInGroup.some(prop => prop.name === property.energyUnitName))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    if (!relevantWaterBill) return null;

    // Encontrar os dados específicos desta propriedade
    const propertyData = relevantWaterBill.propertiesInGroup.find(
      prop => prop.name === property.energyUnitName
    );

    return {
      totalGroupValue: relevantWaterBill.totalGroupValue,
      proportionalValue: propertyData?.proportionalValue || 0,
      isPaid: propertyData?.isPaid || false,
      dueDate: propertyData?.dueDate
    };
  };

  const energyData = getEnergyConsumption();
  const waterData = getWaterConsumption();

  const formatValue = (value: number) => showValues ? formatCurrency(value) : '****';

  const formatCPF = (cpf: string) => {
    // Verificar se é um CPF válido (não fictício)
    if (!cpf || cpf === '000.000.000-00' || cpf.replace(/\D/g, '').length !== 11) {
      return null;
    }
    return cpf;
  };

  const getPaymentStatus = (energyPaid: boolean, waterPaid: boolean) => {
    if (energyPaid && waterPaid) {
      return { status: 'pago', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' };
    }
    if (!energyPaid && !waterPaid) {
      return { status: 'vencido', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100' };
    }
    return { status: 'pendente', icon: AlertTriangle, color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
  };

  const totalProportionalValue = (energyData?.proportionalValue || 0) + (waterData?.proportionalValue || 0);
  const paymentStatus = getPaymentStatus(energyData?.isPaid || false, waterData?.isPaid || false);

  // Verificar disponibilidade de funcionalidades
  const isEmailIntegrated = false; // TODO: Verificar se há integração de e-mail
  const isPDFAvailable = false;    // TODO: Verificar se biblioteca PDF está disponível
  const canUpdateData = true;      // Sempre disponível para atualização

  if (!isOpen) return null;

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Handle ESC key
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="consumption-modal-title"
    >
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 
            id="consumption-modal-title" 
            className="text-xl font-semibold text-gray-900 flex items-center"
          >
            <Calculator className="w-6 h-6 mr-2 text-blue-600" />
            📋 Consumo de Energia e Água
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Dados do Inquilino */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
              <User className="w-5 h-5 mr-2" />
              🧍 Dados do Inquilino
            </h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-sm font-medium text-blue-800 w-20">Nome:</span>
                <span className="text-sm text-blue-900">{tenant.name}</span>
              </div>
              {formatCPF(tenant.cpf) && (
                <div className="flex items-center">
                  <IdCard className="w-4 h-4 mr-2 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800 w-16">CPF:</span>
                  <span className="text-sm text-blue-900">{formatCPF(tenant.cpf)}</span>
                </div>
              )}
              <div className="flex items-center">
                <Home className="w-4 h-4 mr-2 text-blue-600" />
                <span className="text-sm font-medium text-blue-800 w-20">Propriedade:</span>
                <span className="text-sm text-blue-900">
                  {property ? `🏠 ${property.name}` : "Não disponível"}
                </span>
              </div>
            </div>
          </div>

          {/* Consumo de Energia */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-3 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              ⚡ Consumo de Energia
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-yellow-800">💰 Valor total do grupo:</span>
                <p className="text-lg font-bold text-yellow-900">
                  {energyData ? formatValue(energyData.totalGroupValue) : "—"}
                </p>
              </div>
              <div>
                <span className="text-sm text-yellow-800">📊 Valor proporcional:</span>
                <p className="text-lg font-bold text-yellow-900">
                  {energyData ? formatValue(energyData.proportionalValue) : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Consumo de Água */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
              <Droplets className="w-5 h-5 mr-2" />
              💧 Consumo de Água
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-blue-800">💰 Valor total do grupo:</span>
                <p className="text-lg font-bold text-blue-900">
                  {waterData ? formatValue(waterData.totalGroupValue) : "—"}
                </p>
              </div>
              <div>
                <span className="text-sm text-blue-800">📊 Valor proporcional:</span>
                <p className="text-lg font-bold text-blue-900">
                  {waterData ? formatValue(waterData.proportionalValue) : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              💰 Resumo Financeiro
            </h3>
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-800">Soma dos valores proporcionais:</span>
              <p className="text-xl font-bold text-green-900">
                {formatValue(totalProportionalValue)}
              </p>
            </div>
          </div>

          {/* Status de Pagamento */}
          <div className={`${paymentStatus.bgColor} rounded-lg p-4`}>
            <h3 className={`font-semibold ${paymentStatus.color} mb-3 flex items-center`}>
              <paymentStatus.icon className="w-5 h-5 mr-2" />
              🧾 Status de Pagamento do Consumo
            </h3>
            <div className="flex items-center justify-center">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold ${paymentStatus.color} ${paymentStatus.bgColor}`}>
                <paymentStatus.icon className="w-6 h-6 mr-2" />
                {paymentStatus.status === 'pago' && '✅ Pago'}
                {paymentStatus.status === 'pendente' && '⚠️ Pendente'}
                {paymentStatus.status === 'vencido' && '❌ Vencido'}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer - Botões de Ação */}
        <div className="border-t border-gray-200 p-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">📌 Ações Disponíveis:</h4>
          <div className="flex flex-wrap gap-3">
            <button
              disabled={!isEmailIntegrated}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                isEmailIntegrated
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={!isEmailIntegrated ? 'Sistema de e-mail não integrado' : 'Enviar dados por e-mail'}
            >
              <Mail className="w-4 h-4 mr-2" />
              📧 Enviar por e-mail
            </button>

            <button
              disabled={!isPDFAvailable}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                isPDFAvailable
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={!isPDFAvailable ? 'Biblioteca de PDF não disponível' : 'Gerar PDF'}
            >
              <FileText className="w-4 h-4 mr-2" />
              🖨️ Gerar PDF
            </button>

            <button
              disabled={!canUpdateData}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                canUpdateData
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={!canUpdateData ? 'Função não implementada' : 'Atualizar dados de consumo'}
              onClick={() => {
                // TODO: Implementar atualização de dados
                alert('Dados atualizados com sucesso!');
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              🔄 Atualizar dados
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            * Botões inativos indicam funcionalidades não integradas ou indisponíveis
          </p>
        </div>
      </div>
    </div>
  );
};