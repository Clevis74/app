// Componente de acessibilidade para corrigir problemas WCAG 2.1
import React from 'react';

interface AccessibleListProps {
  items: Array<{
    id: string;
    label: string;
    isActive?: boolean;
    onClick?: () => void;
    icon?: React.ComponentType<any>;
    badge?: string;
  }>;
  ariaLabel: string;
  className?: string;
}

export const AccessibleList: React.FC<AccessibleListProps> = ({ 
  items, 
  ariaLabel, 
  className = "" 
}) => {
  return (
    <div role="list" aria-label={ariaLabel} className={className}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div 
            key={item.id}
            role="listitem"
            className={`flex items-center p-3 rounded-lg transition-colors ${
              item.isActive 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-800 hover:bg-gray-100'
            }`}
          >
            {Icon && (
              <Icon 
                className="w-5 h-5 mr-3 flex-shrink-0" 
                aria-hidden="true" 
              />
            )}
            
            <button
              onClick={item.onClick}
              className={`flex-1 text-left font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded ${
                item.isActive ? 'text-white' : 'text-gray-800'
              }`}
              aria-current={item.isActive ? 'page' : undefined}
            >
              {item.label}
            </button>
            
            {item.badge && (
              <span 
                className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                  item.badge === 'new' 
                    ? 'bg-green-100 text-green-800' 
                    : item.badge === 'critical'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
                aria-label={`Status: ${item.badge}`}
              >
                {item.badge}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};