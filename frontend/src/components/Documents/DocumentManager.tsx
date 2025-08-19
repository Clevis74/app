import React, { useState, useMemo, useCallback } from 'react';
import { Plus, Edit, Trash2, FileText, Download, Upload, Search } from 'lucide-react';
import { Document, Property, Tenant } from '../../types';
import { DocumentForm } from './DocumentForm';
import { formatDate } from '../../utils/optimizedCalculations';
import { useRenderMonitor } from '../../utils/performanceMonitor';
import { useDebouncedCallback } from '../../utils/debounceUtils';

interface DocumentManagerProps {
  documents: Document[];
  properties: Property[];
  tenants: Tenant[];
  onAddDocument: (document: Omit<Document, 'id' | 'lastUpdated'>) => void;
  onUpdateDocument: (id: string, updates: Partial<Document>) => void;
  onDeleteDocument: (id: string) => void;
}

// Componente de card de documento memoizado
const DocumentCard = React.memo(({ 
  document, 
  linkedProperty, 
  linkedTenant,
  onEdit, 
  onDelete,
  onDownload
}: {
  document: Document;
  linkedProperty?: Property;
  linkedTenant?: Tenant;
  onEdit: (document: Document) => void;
  onDelete: (id: string) => void;
  onDownload: (document: Document) => void;
}) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'contract': return 'bg-blue-100 text-blue-800';
      case 'receipt': return 'bg-green-100 text-green-800';
      case 'invoice': return 'bg-yellow-100 text-yellow-800';
      case 'report': return 'bg-purple-100 text-purple-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'contract': return 'Contrato';
      case 'receipt': return 'Recibo';
      case 'invoice': return 'Fatura';
      case 'report': return 'Relatório';
      case 'other': return 'Outro';
      default: return 'Documento';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{document.title}</h3>
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(document.type)}`}>
                {getTypeText(document.type)}
              </span>
            </div>
          </div>
        </div>

        {document.description && (
          <p className="text-gray-600 text-sm mb-4">{document.description}</p>
        )}

        <div className="text-sm text-gray-500 mb-4 space-y-1">
          {linkedProperty && (
            <p>Propriedade: {linkedProperty.name}</p>
          )}
          {linkedTenant && (
            <p>Inquilino: {linkedTenant.name}</p>
          )}
          <p>Criado: {formatDate(document.createdAt)}</p>
          <p>Atualizado: {formatDate(document.lastUpdated)}</p>
          {document.filePath && (
            <p>Arquivo: {document.filePath.split('/').pop()}</p>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          {document.filePath && (
            <button
              onClick={() => onDownload(document)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Download do documento"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onEdit(document)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar documento"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(document.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Excluir documento"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

DocumentCard.displayName = 'DocumentCard';

const DocumentManager: React.FC<DocumentManagerProps> = ({
  documents,
  properties,
  tenants,
  onAddDocument,
  onUpdateDocument,
  onDeleteDocument
}) => {
  useRenderMonitor('DocumentManager');
  
  const [showForm, setShowForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Memoizar documentos filtrados
  const filteredDocuments = useMemo(() => {
    let filtered = documents;
    
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(doc => doc.type === filterType);
    }
    
    return filtered.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  }, [documents, searchTerm, filterType]);

  // Memoizar propriedades e inquilinos vinculados
  const linkedData = useMemo(() => {
    const propertyMap = new Map(properties.map(p => [p.id, p]));
    const tenantMap = new Map(tenants.map(t => [t.id, t]));
    return { propertyMap, tenantMap };
  }, [properties, tenants]);

  // Callbacks memoizados
  const handleAddDocument = useCallback((documentData: Omit<Document, 'id' | 'lastUpdated'>) => {
    onAddDocument(documentData);
    setShowForm(false);
  }, [onAddDocument]);

  const handleEditDocument = useCallback((document: Document) => {
    setEditingDocument(document);
    setShowForm(true);
  }, []);

  const handleUpdateDocument = useCallback((documentData: Omit<Document, 'id' | 'lastUpdated'>) => {
    if (editingDocument) {
      onUpdateDocument(editingDocument.id, documentData);
      setEditingDocument(null);
      setShowForm(false);
    }
  }, [editingDocument, onUpdateDocument]);

  const handleCancelForm = useCallback(() => {
    setShowForm(false);
    setEditingDocument(null);
  }, []);

  const handleDownload = useCallback((document: Document) => {
    // Implementar download do documento
    // Por enquanto, apenas simular o download
    console.log('Download documento:', document.title);
    alert(`Download iniciado: ${document.title}`);
  }, []);

  // Debounce para busca
  const debouncedSearch = useDebouncedCallback((term: string) => {
    setSearchTerm(term);
  }, 300);

  // Tipos de documento disponíveis
  const documentTypes = [
    { value: 'all', label: 'Todos os tipos' },
    { value: 'contract', label: 'Contratos' },
    { value: 'receipt', label: 'Recibos' },
    { value: 'invoice', label: 'Faturas' },
    { value: 'report', label: 'Relatórios' },
    { value: 'other', label: 'Outros' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Documentos</h2>
          <p className="text-gray-600 mt-1">
            {filteredDocuments.length} de {documents.length} documento{documents.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex space-x-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {documentTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar documentos..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Documento
          </button>
        </div>
      </div>

      {showForm && (
        <DocumentForm
          document={editingDocument}
          properties={properties}
          tenants={tenants}
          onSubmit={editingDocument ? handleUpdateDocument : handleAddDocument}
          onCancel={handleCancelForm}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((document) => {
          const linkedProperty = document.propertyId ? linkedData.propertyMap.get(document.propertyId) : undefined;
          const linkedTenant = document.tenantId ? linkedData.tenantMap.get(document.tenantId) : undefined;
          
          return (
            <DocumentCard
              key={document.id}
              document={document}
              linkedProperty={linkedProperty}
              linkedTenant={linkedTenant}
              onEdit={handleEditDocument}
              onDelete={onDeleteDocument}
              onDownload={handleDownload}
            />
          );
        })}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg">
            {searchTerm || filterType !== 'all' ? 'Nenhum documento encontrado' : 'Nenhum documento cadastrado'}
          </p>
          <p className="text-gray-400 mt-2">
            {searchTerm || filterType !== 'all' ? 'Tente ajustar os filtros de busca' : 'Comece adicionando seu primeiro documento'}
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentManager;