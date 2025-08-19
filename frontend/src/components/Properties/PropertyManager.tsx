import React, { useState, useMemo, useCallback } from 'react';
import { Plus, Edit, Trash2, Building, MapPin } from 'lucide-react';
import { Property } from '../../types';
import { PropertyForm } from './PropertyForm';
import { formatCurrency } from '../../utils/optimizedCalculations';
import { useRenderMonitor } from '../../utils/performanceMonitor';
import { useDebouncedCallback } from '../../utils/debounceUtils';

interface PropertyManagerProps {
  properties: Property[];
  showValues: boolean;
  onAddProperty: (property: Omit<Property, 'id' | 'createdAt'>) => void;
  onUpdateProperty: (id: string, updates: Partial<Property>) => void;
  onDeleteProperty: (id: string) => void;
}

// Componente de card de propriedade memoizado
const PropertyCard = React.memo(({ 
  property, 
  showValues, 
  onEdit, 
  onDelete 
}: {
  property: Property;
  showValues: boolean;
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'rented': return 'bg-green-100 text-green-800';
      case 'vacant': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'rented': return 'Alugada';
      case 'vacant': return 'Vaga';
      case 'maintenance': return 'Manutenção';
      default: return 'Indefinido';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <Building className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{property.name}</h3>
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(property.status)}`}>
                {getStatusText(property.status)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="text-sm">{property.address}</span>
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-4">
          <p>Tipo: {property.type === 'apartment' ? 'Apartamento' : property.type === 'house' ? 'Casa' : 'Outro'}</p>
          <p>Preço de compra: {showValues ? formatCurrency(property.purchasePrice) : '****'}</p>
          <p>Valor do aluguel: {showValues ? formatCurrency(property.rentValue) : '****'}</p>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={() => onEdit(property)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar propriedade"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(property.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Excluir propriedade"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

PropertyCard.displayName = 'PropertyCard';

const PropertyManager: React.FC<PropertyManagerProps> = ({
  properties,
  showValues,
  onAddProperty,
  onUpdateProperty,
  onDeleteProperty
}) => {
  useRenderMonitor('PropertyManager');
  
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Memoizar propriedades filtradas
  const filteredProperties = useMemo(() => {
    if (!searchTerm) return properties;
    
    return properties.filter(property => 
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [properties, searchTerm]);

  // Callbacks memoizados
  const handleAddProperty = useCallback((propertyData: Omit<Property, 'id' | 'createdAt'>) => {
    onAddProperty(propertyData);
    setShowForm(false);
  }, [onAddProperty]);

  const handleEditProperty = useCallback((property: Property) => {
    setEditingProperty(property);
    setShowForm(true);
  }, []);

  const handleUpdateProperty = useCallback((propertyData: Omit<Property, 'id' | 'createdAt'>) => {
    if (editingProperty) {
      onUpdateProperty(editingProperty.id, propertyData);
      setEditingProperty(null);
      setShowForm(false);
    }
  }, [editingProperty, onUpdateProperty]);

  const handleCancelForm = useCallback(() => {
    setShowForm(false);
    setEditingProperty(null);
  }, []);

  // Debounce para busca
  const debouncedSearch = useDebouncedCallback((term: string) => {
    setSearchTerm(term);
  }, 300);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Propriedades</h2>
          <p className="text-gray-600 mt-1">
            {filteredProperties.length} de {properties.length} propriedade{properties.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Buscar propriedades..."
            onChange={(e) => debouncedSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Propriedade
          </button>
        </div>
      </div>

      {showForm && (
        <PropertyForm
          property={editingProperty}
          onSubmit={editingProperty ? handleUpdateProperty : handleAddProperty}
          onCancel={handleCancelForm}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            showValues={showValues}
            onEdit={handleEditProperty}
            onDelete={onDeleteProperty}
          />
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm ? 'Nenhuma propriedade encontrada' : 'Nenhuma propriedade cadastrada'}
          </p>
          <p className="text-gray-400 mt-2">
            {searchTerm ? 'Tente ajustar sua busca' : 'Comece adicionando sua primeira propriedade'}
          </p>
        </div>
      )}
    </div>
  );
};

export default PropertyManager;