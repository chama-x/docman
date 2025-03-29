import { Helmet } from 'react-helmet-async';
import { LoginForm } from '@/components/Examples/LoginForm';
import { Button } from '@/components/Button';
import { useState } from 'react';

interface DemoSection {
  title: string;
  description: string;
  component: JSX.Element;
}

export function ComponentsDemo(): JSX.Element {
  const [activeSection, setActiveSection] = useState<string | null>('buttons');

  const demoSections: DemoSection[] = [
    {
      title: 'Buttons',
      description: 'Various button styles and variants for different use cases.',
      component: (
        <div className="flex flex-col space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="danger">Danger</Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary">Medium</Button>
            <Button variant="primary" size="lg">Large</Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" isLoading>Loading</Button>
            <Button variant="primary" disabled>Disabled</Button>
            <Button 
              variant="primary" 
              leftIcon={<span className="text-lg">👋</span>}
            >
              With Icon
            </Button>
          </div>
          <div className="w-64">
            <Button variant="primary" fullWidth>Full Width</Button>
          </div>
        </div>
      ),
    },
    {
      title: 'Forms',
      description: 'Form components with validation using React Hook Form and Zod.',
      component: (
        <div className="max-w-md">
          <LoginForm />
        </div>
      ),
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Component Demo - CHX Template</title>
      </Helmet>
      
      <h1 className="mb-8 text-3xl font-bold">Component Examples</h1>
      
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar navigation */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="sticky top-4 rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold">Components</h2>
            <ul className="space-y-1">
              {demoSections.map((section) => (
                <li key={section.title}>
                  <button
                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                      activeSection === section.title.toLowerCase()
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setActiveSection(section.title.toLowerCase())}
                  >
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Component display area */}
        <div className="flex-1">
          {demoSections
            .filter((section) => section.title.toLowerCase() === activeSection)
            .map((section) => (
              <div key={section.title} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h2 className="mb-2 text-2xl font-bold">{section.title}</h2>
                <p className="mb-6 text-gray-600 dark:text-gray-400">{section.description}</p>
                <div className="rounded-md border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
                  {section.component}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
} 