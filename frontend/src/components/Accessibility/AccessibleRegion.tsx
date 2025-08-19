// Componente para corrigir problemas de landmark/region WCAG 2.1
import React from 'react';

interface AccessibleRegionProps {
  children: React.ReactNode;
  ariaLabel: string;
  role?: 'region' | 'banner' | 'navigation' | 'main' | 'contentinfo' | 'complementary';
  className?: string;
  id?: string;
}

export const AccessibleRegion: React.FC<AccessibleRegionProps> = ({
  children,
  ariaLabel,
  role = 'region',
  className = '',
  id
}) => {
  return (
    <section
      role={role}
      aria-label={ariaLabel}
      className={className}
      id={id}
    >
      {children}
    </section>
  );
};

// Componente específico para conteúdo principal
interface MainContentProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const MainContent: React.FC<MainContentProps> = ({
  children,
  title,
  className = ''
}) => {
  return (
    <main
      role="main"
      aria-label={title || 'Conteúdo principal'}
      className={`${className} focus:outline-none`}
      tabIndex={-1}
      id="main-content"
    >
      {title && (
        <h1 className="sr-only">{title}</h1>
      )}
      {children}
    </main>
  );
};

// Componente para navegação acessível
interface AccessibleNavProps {
  children: React.ReactNode;
  ariaLabel: string;
  className?: string;
}

export const AccessibleNav: React.FC<AccessibleNavProps> = ({
  children,
  ariaLabel,
  className = ''
}) => {
  return (
    <nav
      role="navigation"
      aria-label={ariaLabel}
      className={className}
    >
      {children}
    </nav>
  );
};