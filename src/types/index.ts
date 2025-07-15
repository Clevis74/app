export interface Property {
  id: string;
  name: string;
  address: string;
  type: 'apartment' | 'house' | 'commercial';
  purchasePrice: number;
  rentValue: number;
  tenant?: Tenant;
  status: 'rented' | 'vacant' | 'maintenance';
  createdAt: Date;
}

export interface Tenant {
  id: string;
  propertyId: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  startDate: Date;
  agreedPaymentDate?: Date;
  monthlyRent: number;
  deposit: number; // Será renomeado para "Calção" na interface
  paymentMethod?: 'À vista' | 'A prazo';
  installments?: '2x' | '3x';
  depositPaidInstallments?: boolean[];
  formalizedContract?: boolean;
  status: 'active' | 'inactive';
}

export interface Transaction {
  id: string;
  propertyId: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: Date;
  recurring?: {
    frequency: 'monthly' | 'quarterly' | 'yearly';
    nextDate: Date;
  };
}

export interface Alert {
  id: string;
  type: 'rent_due' | 'contract_expiring' | 'maintenance' | 'tax_due';
  propertyId: string;
  message: string;
  date: Date;
  priority: 'low' | 'medium' | 'high';
  resolved: boolean;
}

export interface Document {
  id: string;
  type: 'Contrato de locação' | 'Comprovante de pagamento' | 'RG' | 'CPF' | 'Laudo técnico' | 'Outros';
  issueDate: Date;
  hasValidity: boolean;
  validityDate?: Date;
  fileName?: string;
  fileUrl?: string;
  observations: string;
  propertyId: string;
  tenantId?: string;
  status: 'Válido' | 'Expirado' | 'Pendente' | 'Revisão';
  contractSigned: boolean;
  lastUpdated: Date;
}

export interface SharedPropertyConsumption {
  id: string;
  name: string; // Ex: 802-Ca 01
  currentReading: number; // kWh atual
  previousReading: number; // kWh anterior
  monthlyConsumption: number; // Calculado automaticamente
  hasMeter: boolean; // Se possui medidor
  proportionalValue: number; // Valor em R$ proporcional
  proportionalConsumption: number; // kWh proporcional
  groupId: string; // Identificador do grupo
  isResidualReceiver: boolean; // Se recebe o valor residual
}

export interface EnergyBill {
  id: string;
  date: Date;
  observations: string;
  isPaid: boolean;
  createdAt: Date;
  lastUpdated: Date;
  // Campos do grupo individualizado
  groupId: string;
  groupName: string;
  totalGroupValue: number; // Valor total da conta do grupo em R$
  totalGroupConsumption: number; // Consumo total do grupo em kWh
  propertiesInGroup: SharedPropertyConsumption[]; // Propriedades deste grupo
}
export interface EnergyGroup {
  id: string;
  name: string;
  properties: string[]; // IDs das propriedades
  residualReceiver: string; // ID da propriedade que recebe o residual
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  occupancyRate: number;
  totalProperties: number;
  rentedProperties: number;
  monthlyROI: number;
}