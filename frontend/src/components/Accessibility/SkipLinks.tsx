// Skip links para navegação acessível por teclado
import React from 'react';

export const SkipLinks: React.FC = () => {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="absolute top-0 left-0 z-50 px-4 py-2 bg-blue-600 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        onFocus={(e) => {
          e.target.classList.remove('sr-only');
        }}
        onBlur={(e) => {
          e.target.classList.add('sr-only');
        }}
      >
        Pular para o conteúdo principal
      </a>
      <a
        href="#navigation"
        className="absolute top-0 left-20 z-50 px-4 py-2 bg-blue-600 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ml-2"
        onFocus={(e) => {
          e.target.classList.remove('sr-only');
        }}
        onBlur={(e) => {
          e.target.classList.add('sr-only');
        }}
      >
        Pular para a navegação
      </a>
    </div>
  );
};