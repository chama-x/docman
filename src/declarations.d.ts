// This file contains declarations for modules that TypeScript can't resolve

// React Router DOM
declare module 'react-router-dom' {
  export interface LinkProps {
    to: string;
    className?: string;
    children?: React.ReactNode;
    [key: string]: unknown;
  }
  
  export const Link: React.FC<LinkProps>;
  export const Outlet: React.FC;
  export const BrowserRouter: React.FC<{ children: React.ReactNode }>;
  export const Routes: React.FC<{ children: React.ReactNode }>;
  export interface RouteProps {
    path?: string;
    index?: boolean;
    element: React.ReactElement;
    children?: React.ReactNode;
  }
  export const Route: React.FC<RouteProps>;
}

// Test libraries
declare module 'vitest' {
  export const expect: {
    extend: (matchers: Record<string, unknown>) => void;
    [key: string]: unknown;
  };
  export const afterEach: (fn: () => void) => void;
}

declare module '@testing-library/react' {
  export const cleanup: () => void;
}

declare module '@testing-library/jest-dom' {
  const matchers: Record<string, unknown>;
  export default matchers;
} 