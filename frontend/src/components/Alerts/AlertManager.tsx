import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle, X, Calendar, DollarSign, Zap, Droplets } from 'lucide-react';
import { Property } from '../../types';

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  createdAt: Date;
  resolved?: boolean;
  propertyId?: string;
  category?: 'payment' | 'maintenance' | 'contract' | 'energy' | 'water' | 'system';
}

interface AlertManagerProps {
  alerts: Alert[];
  properties: Property[];
  onResolveAlert: (id: string) => void;
  onDeleteAlert: (id: string) => void;
}

const AlertCard = React.memo(({ 
  alert, 
  property, 
  onResolve, 
  onDelete 
}: {
  alert: Alert;
  property?: Property;
  onResolve: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getAlertIcon = (category?: string) => {
    switch (category) {
      case 'payment': return DollarSign;
      case 'maintenance': return AlertTriangle;
      case 'contract': return Calendar;
      case 'energy': return Zap;
      case 'water': return Droplets;
      default: return AlertTriangle;
    }
  };

  const Icon = getAlertIcon(alert.category);

  return (
    <div className={`border rounded-lg p-4 ${getAlertTypeColor(alert.type)} ${alert.resolved ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium">{alert.title}</h3>
            <p className="text-sm mt-1 opacity-90">{alert.message}</p>
            {property && (
              <p className="text-xs mt-2 opacity-75">
                Propriedade: {property.name}
              </p>
            )}
            <p className="text-xs mt-1 opacity-75">
              {new Date(alert.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {!alert.resolved && (
            <button
              onClick={() => onResolve(alert.id)}
              className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
              title="Resolver alerta"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(alert.id)}
            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
            title="Excluir alerta"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

AlertCard.displayName = 'AlertCard';

const AlertManager: React.FC<AlertManagerProps> = ({
  alerts,
  properties,
  onResolveAlert,
  onDeleteAlert
}) => {
  // Criar mapa de propriedades para lookup rápido
  const propertyMap = useMemo(() => {
    return new Map(properties.map(p => [p.id, p]));
  }, [properties]);

  // Filtrar e organizar alertas
  const { unresolvedAlerts, resolvedAlerts } = useMemo(() => {
    const unresolved = alerts.filter(a => !a.resolved).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const resolved = alerts.filter(a => a.resolved).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return { unresolvedAlerts: unresolved, resolvedAlerts: resolved };
  }, [alerts]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Central de Alertas</h2>
        <p className="text-gray-600 mt-1">
          {unresolvedAlerts.length} alerta{unresolvedAlerts.length !== 1 ? 's' : ''} pendente{unresolvedAlerts.length !== 1 ? 's' : ''} • {resolvedAlerts.length} resolvido{resolvedAlerts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Alertas Pendentes */}
      {unresolvedAlerts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
            Alertas Pendentes ({unresolvedAlerts.length})
          </h3>
          <div className="space-y-3">
            {unresolvedAlerts.map(alert => (
              <AlertCard
                key={alert.id}
                alert={alert}
                property={alert.propertyId ? propertyMap.get(alert.propertyId) : undefined}
                onResolve={onResolveAlert}
                onDelete={onDeleteAlert}
              />
            ))}
          </div>
        </div>
      )}

      {/* Alertas Resolvidos */}
      {resolvedAlerts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
            Alertas Resolvidos ({resolvedAlerts.length})
          </h3>
          <div className="space-y-3">
            {resolvedAlerts.slice(0, 5).map(alert => (
              <AlertCard
                key={alert.id}
                alert={alert}
                property={alert.propertyId ? propertyMap.get(alert.propertyId) : undefined}
                onResolve={onResolveAlert}
                onDelete={onDeleteAlert}
              />
            ))}
            {resolvedAlerts.length > 5 && (
              <p className="text-sm text-gray-500 text-center py-2">
                ... e mais {resolvedAlerts.length - 5} alerta{resolvedAlerts.length - 5 !== 1 ? 's' : ''} resolvido{resolvedAlerts.length - 5 !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      )}

      {alerts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-gray-500 text-lg">Nenhum alerta no momento</p>
          <p className="text-gray-400 mt-2">Tudo está funcionando perfeitamente!</p>
        </div>
      )}
    </div>
  );
};

export default AlertManager;