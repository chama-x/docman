import React, { useState } from 'react';
import { Button } from '@components/Button';
import { 
  Magnet, 
  FloatingCard, 
  ScrollReveal, 
  MorphButton 
} from '@components/ui';

/**
 * Components showcase page
 */
const ComponentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('morph-buttons');

  const Tab: React.FC<{ id: string, label: string }> = ({ id, label }) => (
    <button 
      className={`px-4 py-2 font-medium rounded-md transition-colors ${
        activeTab === id 
          ? 'bg-blue-600 text-white' 
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
      }`}
      onClick={() => setActiveTab(id)}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-12 pb-24">
      <ScrollReveal effect="fade">
        <div>
          <h1 className="text-3xl font-bold mb-6">Interactive Component Library</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-3xl">
            A showcase of custom fluid UI components designed with Apple-inspired aesthetics, intuitive interactions, 
            and performant animations using react-spring.
          </p>
        </div>
      </ScrollReveal>

      {/* Component Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
        <Tab id="morph-buttons" label="Morph Buttons" />
        <Tab id="floating-cards" label="Floating Cards" />
        <Tab id="magnet-effect" label="Magnet Effect" />
        <Tab id="scroll-reveal" label="Scroll Reveal" />
      </div>

      {/* Morph Buttons Section */}
      {activeTab === 'morph-buttons' && (
        <ScrollReveal effect="slide-up">
          <section>
            <h2 className="text-2xl font-bold mb-4">Morph Buttons</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Buttons that transform smoothly on hover and click, with subtle morphing effects inspired by Apple's fluid design principles.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Button Variants */}
              <div className="space-y-4 p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Button Variants</h3>
                <div className="flex flex-wrap gap-3">
                  <MorphButton variant="primary">Primary</MorphButton>
                  <MorphButton variant="secondary">Secondary</MorphButton>
                  <MorphButton variant="accent">Accent</MorphButton>
                  <MorphButton variant="outline">Outline</MorphButton>
                  <MorphButton variant="ghost">Ghost</MorphButton>
                  <MorphButton variant="glass">Glass</MorphButton>
                </div>
              </div>

              {/* Button Sizes */}
              <div className="space-y-4 p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Button Sizes</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <MorphButton variant="primary" size="sm">Small</MorphButton>
                  <MorphButton variant="primary" size="md">Medium</MorphButton>
                  <MorphButton variant="primary" size="lg">Large</MorphButton>
                  <MorphButton variant="primary" size="xl">Extra Large</MorphButton>
                </div>
              </div>

              {/* Button Shapes */}
              <div className="space-y-4 p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Button Shapes</h3>
                <div className="flex flex-wrap gap-3">
                  <MorphButton variant="primary" shape="rounded">Rounded</MorphButton>
                  <MorphButton variant="primary" shape="pill">Pill</MorphButton>
                  <MorphButton variant="primary" shape="square">Square</MorphButton>
                  <MorphButton variant="primary" shape="circle">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a7 7 0 100 14 7 7 0 000-14zm-9 7a9 9 0 1118 0 9 9 0 01-18 0z" clipRule="evenodd" />
                    </svg>
                  </MorphButton>
                </div>
              </div>

              {/* Button States */}
              <div className="space-y-4 p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Button States</h3>
                <div className="flex flex-wrap gap-3">
                  <MorphButton variant="primary" isLoading>Loading</MorphButton>
                  <MorphButton variant="primary" disabled>Disabled</MorphButton>
                </div>
              </div>

              {/* Button With Icons */}
              <div className="space-y-4 p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">With Icons</h3>
                <div className="flex flex-wrap gap-3">
                  <MorphButton 
                    variant="primary" 
                    startIcon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                      </svg>
                    }
                  >
                    Add Item
                  </MorphButton>
                  <MorphButton 
                    variant="accent" 
                    endIcon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    }
                  >
                    Continue
                  </MorphButton>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Usage Example</h3>
              <pre className="text-sm overflow-x-auto p-4 bg-white dark:bg-gray-900 rounded font-mono">
{`import { MorphButton } from '@components/ui';

<MorphButton
  variant="primary"
  size="lg"
  shape="rounded"
  onClick={() => console.log('clicked')}
>
  Click Me
</MorphButton>`}
              </pre>
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* Floating Cards Section */}
      {activeTab === 'floating-cards' && (
        <ScrollReveal effect="slide-up">
          <section>
            <h2 className="text-2xl font-bold mb-4">Floating Cards</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Interactive cards with 3D effects that respond to mouse movement with a floating sensation.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Default Floating Card */}
              <FloatingCard>
                <h3 className="text-lg font-semibold mb-2">Default Card</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Move your mouse over this card to see the default 3D floating effect.
                </p>
              </FloatingCard>
              
              {/* Glass Floating Card */}
              <FloatingCard backgroundStyle="glass">
                <h3 className="text-lg font-semibold mb-2">Glass Card</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  A card with a glass morphism effect that adds depth to your UI.
                </p>
              </FloatingCard>
              
              {/* Neu Floating Card */}
              <FloatingCard backgroundStyle="neu">
                <h3 className="text-lg font-semibold mb-2">Neumorphic Card</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Soft UI with a neumorphic design style for a tactile feel.
                </p>
              </FloatingCard>
              
              {/* Gradient Floating Card */}
              <FloatingCard backgroundStyle="gradient">
                <h3 className="text-lg font-semibold mb-2">Gradient Card</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  A subtle gradient background adds dimension to the card.
                </p>
              </FloatingCard>
              
              {/* Intense 3D Effect */}
              <FloatingCard maxRotation={15} maxLift={30} scale={1.05}>
                <h3 className="text-lg font-semibold mb-2">Enhanced 3D</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  More pronounced 3D effect with increased rotation and lift.
                </p>
              </FloatingCard>
              
              {/* Card with Content */}
              <FloatingCard backgroundStyle="glass">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Unlock advanced capabilities with our premium tier.
                  </p>
                  <MorphButton variant="accent" className="mt-4">Upgrade Now</MorphButton>
                </div>
              </FloatingCard>
            </div>
            
            <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Usage Example</h3>
              <pre className="text-sm overflow-x-auto p-4 bg-white dark:bg-gray-900 rounded font-mono">
{`import { FloatingCard } from '@components/ui';

<FloatingCard 
  backgroundStyle="glass"
  maxRotation={10}
  maxLift={15}
  scale={1.02}
>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</FloatingCard>`}
              </pre>
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* Magnet Effect Section */}
      {activeTab === 'magnet-effect' && (
        <ScrollReveal effect="slide-up">
          <section>
            <h2 className="text-2xl font-bold mb-4">Magnet Component</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              A component that creates a magnetic effect, pulling elements toward the cursor.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Default Magnet */}
              <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Default</h3>
                <div className="flex justify-center">
                  <Magnet>
                    <MorphButton variant="primary" size="lg">
                      Hover Me
                    </MorphButton>
                  </Magnet>
                </div>
              </div>
              
              {/* Strong Magnet */}
              <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Strong Effect</h3>
                <div className="flex justify-center">
                  <Magnet magnetStrength={1}>
                    <MorphButton variant="secondary" size="lg">
                      Strong Magnet
                    </MorphButton>
                  </Magnet>
                </div>
              </div>
              
              {/* Custom Content */}
              <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Custom Content</h3>
                <div className="flex justify-center">
                  <Magnet magnetStrength={3} padding={120}>
                    <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      Magnet
                    </div>
                  </Magnet>
                </div>
              </div>

              {/* Magnet with Card */}
              <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg md:col-span-3">
                <h3 className="text-lg font-semibold mb-3">Magnet with FloatingCard</h3>
                <div className="flex justify-center">
                  <Magnet padding={80} magnetStrength={4}>
                    <div className="w-64">
                      <FloatingCard backgroundStyle="glass" maxRotation={5} scale={1.01}>
                        <div className="text-center">
                          <h3 className="text-lg font-semibold mb-2">Combined Effects</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Magnetic attraction and 3D floating combined for a unique interactive experience.
                          </p>
                        </div>
                      </FloatingCard>
                    </div>
                  </Magnet>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Usage Example</h3>
              <pre className="text-sm overflow-x-auto p-4 bg-white dark:bg-gray-900 rounded font-mono">
{`import { Magnet } from '@components/ui';

<Magnet padding={50} magnetStrength={2}>
  <Button>Magnetic Button</Button>
</Magnet>`}
              </pre>
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* Scroll Reveal Section */}
      {activeTab === 'scroll-reveal' && (
        <section>
          <ScrollReveal effect="fade">
            <h2 className="text-2xl font-bold mb-4">Scroll Reveal Animations</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Animate elements as they enter the viewport with customizable entrance animations.
            </p>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ScrollReveal effect="slide-up" delay={100}>
              <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Slide Up</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Elements slide up into view as they enter the viewport.
                </p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal effect="slide-down" delay={200}>
              <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Slide Down</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Elements slide down into view as they enter the viewport.
                </p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal effect="slide-left" delay={300}>
              <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Slide Left</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Elements slide in from the right as they enter the viewport.
                </p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal effect="slide-right" delay={400}>
              <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Slide Right</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Elements slide in from the left as they enter the viewport.
                </p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal effect="zoom" delay={500}>
              <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Zoom</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Elements scale up from 80% to 100% as they enter the viewport.
                </p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal effect="flip-x" delay={600}>
              <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Flip X</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Elements flip around the X-axis as they enter the viewport.
                </p>
              </div>
            </ScrollReveal>
          </div>
          
          <ScrollReveal effect="fade" delay={800}>
            <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Usage Example</h3>
              <pre className="text-sm overflow-x-auto p-4 bg-white dark:bg-gray-900 rounded font-mono">
{`import { ScrollReveal } from '@components/ui';

<ScrollReveal 
  effect="slide-up"
  delay={200}
  duration={800}
  easing="gentle"
>
  <YourComponent />
</ScrollReveal>`}
              </pre>
            </div>
          </ScrollReveal>
        </section>
      )}
    </div>
  );
};

export default ComponentsPage; 