import React from 'react';
import { AlertTriangle, Edit, Trash2, User, Phone, Mail, Calendar } from 'lucide-react';

// Função para validar CPF (cópia da função original)
const isValidCPF = (cpf: string): boolean => {
  if (!cpf || cpf.trim() === '') return false;
  
  // Remove formatação
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verificações básicas
  if (cleanCPF.length !== 11) return false;
  if (cleanCPF === '00000000000') return false;
  if (/^(\d)\1+$/.test(cleanCPF)) return false; // Todos os dígitos iguais
  
  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit === 10 || digit === 11) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit === 10 || digit === 11) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
};

// Função para validar se o inquilino deve exibir botões de ação
const shouldShowActionButtons = (tenant: any): boolean => {
  return isValidCPF(tenant.cpf) && 
         tenant.status === 'active' && 
         tenant.propertyId && 
         tenant.propertyId.trim() !== '';
};

// Função para gerar avisos visuais
const getValidationWarnings = (tenant: any): string[] => {
  const warnings = [];
  
  if (!isValidCPF(tenant.cpf)) {
    if (!tenant.cpf || tenant.cpf.trim() === '') {
      warnings.push('CPF não informado');
    } else {
      warnings.push('CPF inválido');
    }
  }
  
  if (tenant.status !== 'active') {
    warnings.push('Status inativo');
  }
  
  if (!tenant.propertyId || tenant.propertyId.trim() === '') {
    warnings.push('Propriedade não vinculada');
  }
  
  return warnings;
};

// DADOS FOCADOS - Apenas casos que DEVEM mostrar botões
const focusedTenants = [
  {
    id: 'tenant-valid-1',
    name: 'Roberto Silva - DEVE MOSTRAR BOTÕES ✅',
    email: 'roberto@email.com',
    cpf: '111.444.777-35', // CPF VÁLIDO
    phone: '(11) 33333-3333',
    propertyId: 'prop-1',
    status: 'active',
    monthlyRent: 1800,
    deposit: 3600
  },
  {
    id: 'tenant-valid-2',
    name: 'Fernanda Costa - DEVE MOSTRAR BOTÕES ✅',
    email: 'fernanda@email.com',
    cpf: '390.533.447-05', // CPF VÁLIDO
    phone: '(11) 22222-2222',
    propertyId: 'prop-2',
    status: 'active',
    monthlyRent: 1700,
    deposit: 3400
  },
  {
    id: 'tenant-valid-3',
    name: 'Maria Santos - DEVE MOSTRAR BOTÕES ✅',
    email: 'maria.corrigida@email.com',
    cpf: '987.654.321-00', // CPF VÁLIDO
    phone: '(11) 11111-1111',
    propertyId: 'prop-3',
    status: 'active',
    monthlyRent: 1200,
    deposit: 2400
  },
  {
    id: 'tenant-invalid-1',
    name: 'João - NÃO DEVE MOSTRAR (CPF Inválido) ❌',
    email: 'joao@email.com',
    cpf: '123.456.789-01', // CPF INVÁLIDO
    phone: '(11) 99999-9999',
    propertyId: 'prop-1',
    status: 'active',
    monthlyRent: 1500,
    deposit: 3000
  }
];

const TenantCard = ({ tenant }: { tenant: any }) => {
  const showButtons = shouldShowActionButtons(tenant);
  const warnings = getValidationWarnings(tenant);

  // Análise detalhada para debug
  const cpfValid = isValidCPF(tenant.cpf);
  const statusActive = tenant.status === 'active';
  const hasProperty = tenant.propertyId && tenant.propertyId.trim() !== '';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      default: return 'Indefinido';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{tenant.name}</h3>
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tenant.status)}`}>
                {getStatusText(tenant.status)}
              </span>
            </div>
          </div>
        </div>

        {/* DEBUG - Análise detalhada da validação */}
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm font-medium text-gray-800 mb-2">🔍 Análise de Validação:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• CPF válido: <span className={cpfValid ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{cpfValid ? 'SIM ✅' : 'NÃO ❌'}</span></li>
            <li>• Status ativo: <span className={statusActive ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{statusActive ? 'SIM ✅' : 'NÃO ❌'}</span></li>
            <li>• Tem propriedade: <span className={hasProperty ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{hasProperty ? 'SIM ✅' : 'NÃO ❌'}</span></li>
            <li>• <strong>Resultado: {showButtons ? '🟢 DEVE MOSTRAR BOTÕES' : '🔴 NÃO DEVE MOSTRAR'}</strong></li>
          </ul>
        </div>

        {/* Avisos de validação */}
        {warnings.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">Avisos de validação:</p>
                <ul className="mt-1 text-sm text-yellow-700">
                  {warnings.map((warning, index) => (
                    <li key={index} className="ml-2">• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <Mail className="w-4 h-4 mr-2" />
            <span className="text-sm">{tenant.email}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Phone className="w-4 h-4 mr-2" />
            <span className="text-sm">{tenant.phone}</span>
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-4">
          <p>Propriedade: {tenant.propertyId || 'Não vinculada'}</p>
          <p>CPF: {tenant.cpf || 'Não informado'}</p>
          <p>Aluguel: R$ {tenant.monthlyRent.toLocaleString('pt-BR')}</p>
          <p>Calção: R$ {tenant.deposit.toLocaleString('pt-BR')}</p>
        </div>

        <div className="flex justify-end space-x-2">
          {showButtons ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-green-600 font-bold">✅ BOTÕES EXIBIDOS:</span>
              <button
                onClick={() => console.log('Editar', tenant.name)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Editar inquilino"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => console.log('Excluir', tenant.name)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Excluir inquilino"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-xs text-gray-500 italic">
              ❌ Ações indisponíveis: {warnings.join(', ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ValidationTestFocus = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🎯 TESTE FOCADO - Validação de Botões</h1>
          <p className="text-gray-600 mt-2">
            Foco apenas nos casos que DEVEM mostrar botões de ação
          </p>
          <p className="text-gray-500 mt-1 text-sm">
            Critério: CPF válido + Status ativo + Propriedade vinculada = BOTÕES VISÍVEIS
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {focusedTenants.map(tenant => (
            <TenantCard key={tenant.id} tenant={tenant} />
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-bold text-blue-900 mb-2">📊 Resumo da Validação:</h3>
          <p className="text-blue-800 text-sm">
            Se a lógica estiver correta, os 3 primeiros inquilinos devem exibir botões de Editar/Excluir, 
            e o último não deve mostrar (devido ao CPF inválido).
          </p>
        </div>
      </div>
    </div>
  );
};

export default ValidationTestFocus;