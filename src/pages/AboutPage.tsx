import React, { useState } from 'react';
import { ScrollReveal, DepthButton, BreathingCard } from '@components/ui';

/**
 * About page component with interactive elements
 */
const AboutPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'team'>('overview');

  return (
    <div className="max-w-5xl mx-auto">
      <ScrollReveal effect="fade" duration={800}>
        <div className="mb-16 text-center">
          <h1 className="text-fluid-5xl font-bold mb-4 text-gradient-reveal">About CHX Template</h1>
          <p className="text-fluid-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A premium React template built with modern development principles
            and fluid animations.
          </p>
        </div>
      </ScrollReveal>

      {/* Tab navigation */}
      <div className="mb-12">
        <div className="flex justify-center border-b border-gray-200 dark:border-gray-700 space-x-8 overflow-x-auto">
          <TabButton 
            isActive={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </TabButton>
          <TabButton 
            isActive={activeTab === 'features'} 
            onClick={() => setActiveTab('features')}
          >
            Features
          </TabButton>
          <TabButton 
            isActive={activeTab === 'team'} 
            onClick={() => setActiveTab('team')}
          >
            Our Team
          </TabButton>
        </div>
      </div>

      {/* Tab content with animations */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <ScrollReveal effect="fade" key="overview">
            <div className="space-y-8">
              <BreathingCard style="minimal" className="p-8">
                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  CHX Template is dedicated to simplifying React development for developers of all skill levels. 
                  Our template helps developers, teams, and organizations efficiently build, 
                  scale, and deploy beautiful React applications with an intuitive architecture.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  We believe that development tools should enhance the developer experience, not complicate it. 
                  That's why we've built a template that's both powerful and easy to use, with fluid animations 
                  and thoughtful architecture that makes React development a pleasure.
                </p>
              </BreathingCard>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ScrollReveal effect="slide-right" delay={200}>
                  <BreathingCard style="glass" className="h-full p-8">
                    <h3 className="text-xl font-bold mb-4">Our Values</h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Developer-centered design</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Type safety and maintainability</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Performance and optimization</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Modern best practices</span>
                      </li>
                    </ul>
                  </BreathingCard>
                </ScrollReveal>

                <ScrollReveal effect="slide-left" delay={300}>
                  <BreathingCard style="depth" className="h-full p-8">
                    <h3 className="text-xl font-bold mb-4">Our Vision</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      We envision a future where managing educational documents is seamless and intuitive,
                      allowing institutions to focus on what truly matters: education and student success.
                    </p>
                  </BreathingCard>
                </ScrollReveal>
              </div>
            </div>
          </ScrollReveal>
        )}

        {activeTab === 'features' && (
          <ScrollReveal effect="fade" key="features">
            <h2 className="text-2xl font-bold mb-8">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Component Library', 
                  description: 'Beautifully designed, reusable UI components for rapid development',
                  icon: '🧩',
                  delay: 100
                },
                {
                  title: 'TypeScript Support', 
                  description: 'Full TypeScript integration with proper typing patterns',
                  icon: '📝',
                  delay: 200
                },
                {
                  title: 'Fluid Animations', 
                  description: 'Smooth, physics-based animations for an enhanced user experience',
                  icon: '✨',
                  delay: 300
                },
                {
                  title: 'Dark Mode', 
                  description: 'Built-in dark mode with system preference detection',
                  icon: '🌓',
                  delay: 400
                },
                {
                  title: 'Developer Tools', 
                  description: 'Pre-configured linting, formatting, and testing setup',
                  icon: '🛠️',
                  delay: 500
                },
                {
                  title: 'Responsive Design', 
                  description: 'Mobile-first approach with adaptive layouts',
                  icon: '📱',
                  delay: 600
                }
              ].map((feature, index) => (
                <ScrollReveal effect="slide-up" delay={feature.delay} key={index}>
                  <FeatureCard 
                    title={feature.title} 
                    description={feature.description}
                    icon={feature.icon}
                  />
                </ScrollReveal>
              ))}
            </div>
          </ScrollReveal>
        )}

        {activeTab === 'team' && (
          <ScrollReveal effect="fade" key="team">
            <h2 className="text-2xl font-bold mb-8">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Alex Johnson',
                  role: 'Founder & CEO',
                  description: 'Passionate about education technology and user experience.',
                  delay: 100
                },
                {
                  name: 'Maria Rodriguez',
                  role: 'Lead Designer',
                  description: 'Crafting beautiful, intuitive interfaces that delight users.',
                  delay: 200
                },
                {
                  name: 'David Chen',
                  role: 'Senior Developer',
                  description: 'Building robust, scalable solutions with cutting-edge technology.',
                  delay: 300
                }
              ].map((member, index) => (
                <ScrollReveal effect="slide-up" delay={member.delay} key={index}>
                  <TeamMemberCard 
                    name={member.name} 
                    role={member.role}
                    description={member.description}
                  />
                </ScrollReveal>
              ))}
            </div>
          </ScrollReveal>
        )}
      </div>

      {/* CTA Section */}
      <ScrollReveal effect="fade" delay={500} className="mt-20">
        <div className="glass-morphism p-10 rounded-2xl text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Join developers worldwide already using CHX Template for their projects.
          </p>
          <DepthButton 
            variant="accent" 
            size="lg"
            enableMagnetic
            enableParticles
          >
            Start Free Trial
          </DepthButton>
        </div>
      </ScrollReveal>
    </div>
  );
};

/**
 * Tab button component
 */
interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, children }) => {
  return (
    <button
      className={`py-3 px-4 font-medium transition-colors relative ${
        isActive 
          ? 'text-blue-600 dark:text-blue-400' 
          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
      }`}
      onClick={onClick}
    >
      {children}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
      )}
    </button>
  );
};

/**
 * Feature card component
 */
interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => {
  return (
    <BreathingCard style="glass" className="h-full p-6" enableHover>
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </BreathingCard>
  );
};

/**
 * Team member card component
 */
interface TeamMemberCardProps {
  name: string;
  role: string;
  description: string;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ name, role, description }) => {
  return (
    <BreathingCard style="depth" className="h-full p-6 text-center" enableHover>
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
        {name.split(' ').map(n => n[0]).join('')}
      </div>
      <h3 className="text-xl font-bold mb-1">{name}</h3>
      <div className="text-blue-600 dark:text-blue-400 mb-3 text-sm font-medium">{role}</div>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </BreathingCard>
  );
};

export default AboutPage;