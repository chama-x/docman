import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@contexts/index';
import { MainLayout } from '@layouts/index';
import { HomePage, AboutPage, NotFoundPage, ComponentsPage } from '@pages/index';
import { ComponentsDemo } from '@/pages/ComponentsDemo';

/**
 * Main application component
 */
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="components" element={<ComponentsDemo />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
};

export default App;
