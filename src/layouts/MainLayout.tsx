import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import ThemeSwitcher from '@components/ThemeSwitcher';
import { FullLogo } from '@components/Logo';
import { MorphButton, ScrollReveal } from '@components/ui';

/**
 * Main layout component with header, content area, and footer
 */
const MainLayout: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Add scroll listener to apply header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeNavClass = "text-ch-accent-600 dark:text-ch-accent-400 font-medium";
  const navItemClass = "relative px-1 py-2 transition-colors duration-200";
  const navLinkClass = "hover:text-ch-accent-600 dark:hover:text-ch-accent-400 text-gray-700 dark:text-gray-300 font-medium";

  // Active indicator styling
  const NavItem: React.FC<{ to: string, label: string }> = ({ to, label }) => {
    const isActive = location.pathname === to || 
      (to !== '/' && location.pathname.startsWith(to));
    
    return (
      <div className={navItemClass}>
        <Link to={to} className={isActive ? activeNavClass : navLinkClass}>
          {label}
        </Link>
        {isActive && (
          <div className="absolute -bottom-px left-0 right-0 h-0.5 bg-ch-accent-500 dark:bg-ch-accent-400 rounded-full" />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 backdrop-blur-md
          ${isScrolled 
            ? 'bg-white/80 dark:bg-ch-x-900/80 shadow-sm border-b border-gray-200/70 dark:border-ch-x-800/70' 
            : 'bg-white dark:bg-ch-x-900 border-b border-transparent'}`}
      >
        <div className="container-x">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <Link to="/" aria-label="Home" className="block hover:opacity-80 transition-opacity">
                <FullLogo size="md" />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8 items-center">
              <div className="flex space-x-6 items-center">
                <NavItem to="/" label="Home" />
                <NavItem to="/about" label="About" />
                <NavItem to="/components" label="Components" />
              </div>
              <ThemeSwitcher />
            </nav>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-4">
              <ThemeSwitcher />
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 dark:text-gray-300 focus:outline-none"
                aria-label="Toggle menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-60' : 'max-h-0'}`}>
          <div className="container-x py-4 border-t border-gray-200 dark:border-ch-x-800">
            <nav className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-ch-accent-600 dark:hover:text-ch-accent-400 py-2">
                Home
              </Link>
              <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-ch-accent-600 dark:hover:text-ch-accent-400 py-2">
                About
              </Link>
              <Link to="/components" className="text-gray-700 dark:text-gray-300 hover:text-ch-accent-600 dark:hover:text-ch-accent-400 py-2">
                Components
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="container-x py-6">
          <ScrollReveal effect="fade" duration={800}>
            <Outlet />
          </ScrollReveal>
        </div>
      </main>

      <footer className="bg-gray-50 dark:bg-ch-x-800 border-t border-gray-200 dark:border-ch-x-700 mt-16">
        <div className="container-x py-10">
          <div className="flex flex-col md:flex-row md:justify-between items-center">
            <div className="mb-6 md:mb-0">
              <FullLogo size="sm" />
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                A modern document management system
              </p>
            </div>
            <div className="md:text-right">
              <p className="text-center md:text-right text-gray-500 dark:text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} School Docs. All rights reserved.
              </p>
              <div className="mt-4 flex space-x-4 justify-center md:justify-end">
                <a href="https://github.com" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors" target="_blank" rel="noopener noreferrer">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="https://twitter.com" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors" target="_blank" rel="noopener noreferrer">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout; 