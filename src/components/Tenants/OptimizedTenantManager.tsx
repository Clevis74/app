import React, { useState, useMemo, useCallback } from 'react';
import { Plus, Edit, Trash2, User, Phone, Mail, Calendar, AlertTriangle } from 'lucide-react';
import { Tenant } from '../../types';
import { TenantForm } from './TenantForm';
import { formatDate, formatCurrency } from '../../utils/optimizedCalculations';
import { useRenderMonitor } from '../../utils/performanceMonitor';
import { useDebouncedCallback } from '../../utils/debounceUtils';

// Função para validar CPF
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
const shouldShowActionButtons = (tenant: Tenant): boolean => {
  return isValidCPF(tenant.cpf) && 
         tenant.status === 'active' && 
         tenant.propertyId && 
         tenant.propertyId.trim() !== '';
};

// Função para gerar avisos visuais
const getValidationWarnings = (tenant: Tenant): string[] => {
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

interface OptimizedTenantManagerProps {
  tenants: Tenant[];
  properties: any[];
  showValues: boolean;
  onAddTenant: (tenant: Omit<Tenant, 'id'>) => void;
  onUpdateTenant: (id: string, tenant: Partial<Tenant>) => void;
  onDeleteTenant: (id: string) => void;
}

// Componente de card de inquilino memoizado
const TenantCard = React.memo(({ 
  tenant, 
  linkedProperty, 
  showValues, 
  onEdit, 
  onDelete 
}: {
  tenant: Tenant;
  linkedProperty: any;
  showValues: boolean;
  onEdit: (tenant: Tenant) => void;
  onDelete: (id: string) => void;
}) => {
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

  // Verificar se deve mostrar botões de ação
  const showButtons = shouldShowActionButtons(tenant);
  const warnings = getValidationWarnings(tenant);

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
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="text-sm">Início: {formatDate(tenant.startDate)}</span>
          </div>
          {tenant.agreedPaymentDate && (
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-sm">Pagamento: {formatDate(tenant.agreedPaymentDate)}</span>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-500 mb-4">
          <p>Propriedade: {linkedProperty?.name || 'Não vinculada'}</p>
          {tenant.cpf && <p>CPF: {tenant.cpf}</p>}
          <p>Aluguel: {showValues ? formatCurrency(tenant.monthlyRent) : '****'}</p>
          <p>Calção: {showValues ? formatCurrency(tenant.deposit) : '****'}</p>
          {tenant.paymentMethod && (
            <p>Pagamento: {tenant.paymentMethod}{tenant.installments && tenant.paymentMethod === 'A prazo' ? ` (${tenant.installments})` : ''}</p>
          )}
          {tenant.depositPaidInstallments && (
            <p>Calção pago: {tenant.depositPaidInstallments.filter(Boolean).length}/{tenant.depositPaidInstallments.length} parcelas</p>
          )}
          {tenant.formalizedContract !== undefined && (
            <p>Contrato: {tenant.formalizedContract ? 'Formalizado' : 'Não formalizado'}</p>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          {showButtons ? (
            <>
              <button
                onClick={() => onEdit(tenant)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Editar inquilino"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(tenant.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Excluir inquilino"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="text-xs text-gray-500 italic">
              Ações indisponíveis: {warnings.join(', ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

TenantCard.displayName = 'TenantCard';

export const OptimizedTenantManager: React.FC<OptimizedTenantManagerProps> = ({
  tenants,
  properties,
  showValues,
  onAddTenant,
  onUpdateTenant,
  onDeleteTenant
}) => {
  useRenderMonitor('TenantManager');
  
  const [showForm, setShowForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Memoizar inquilinos filtrados
  const filteredTenants = useMemo(() => {
    if (!searchTerm) return tenants;
    
    return tenants.filter(tenant => 
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.phone.includes(searchTerm)
    );
  }, [tenants, searchTerm]);

  // Memoizar propriedades vinculadas
  const linkedProperties = useMemo(() => {
    const propertyMap = new Map(properties.map(p => [p.id, p]));
    return propertyMap;
  }, [properties]);

  // Callbacks memoizados
  const handleAddTenant = useCallback((tenantData: Omit<Tenant, 'id'>) => {
    onAddTenant(tenantData);
    setShowForm(false);
  }, [onAddTenant]);

  const handleEditTenant = useCallback((tenant: Tenant) => {
    setEditingTenant(tenant);
    setShowForm(true);
  }, []);

  const handleUpdateTenant = useCallback((tenantData: Omit<Tenant, 'id'>) => {
    if (editingTenant) {
      onUpdateTenant(editingTenant.id, tenantData);
      setEditingTenant(null);
      setShowForm(false);
    }
  }, [editingTenant, onUpdateTenant]);

  const handleCancelForm = useCallback(() => {
    setShowForm(false);
    setEditingTenant(null);
  }, []);

  // Debounce para busca
  const debouncedSearch = useDebouncedCallback((term: string) => {
    setSearchTerm(term);
  }, 300);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Inquilinos</h2>
          <p className="text-gray-600 mt-1">
            {filteredTenants.length} de {tenants.length} inquilino{tenants.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Buscar inquilinos..."
            onChange={(e) => debouncedSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Inquilino
          </button>
        </div>
      </div>

      {showForm && (
        <TenantForm
          tenant={editingTenant}
          properties={properties}
          onSubmit={editingTenant ? handleUpdateTenant : handleAddTenant}
          onCancel={handleCancelForm}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTenants.map((tenant) => {
          const linkedProperty = linkedProperties.get(tenant.propertyId);
          return (
            <TenantCard
              key={tenant.id}
              tenant={tenant}
              linkedProperty={linkedProperty}
              showValues={showValues}
              onEdit={handleEditTenant}
              onDelete={onDeleteTenant}
            />
          );
        })}
      </div>

      {filteredTenants.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm ? 'Nenhum inquilino encontrado' : 'Nenhum inquilino cadastrado'}
          </p>
          <p className="text-gray-400 mt-2">
            {searchTerm ? 'Tente ajustar sua busca' : 'Comece adicionando seu primeiro inquilino'}
          </p>
        </div>
      )}
    </div>
  );
};