import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DepthButton, BreathingCard, FloatingCard, ScrollReveal } from '@components/ui';

/**
 * Home page component with advanced fluid animations and interactions
 */
const HomePage: React.FC = () => {
  // Track cursor position for global interactive effects
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  
  // Update cursor position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Calculate dynamic cursor distance effect
  const calculateDistance = (element: HTMLElement | null) => {
    if (!element) return 0;
    
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const dx = mousePosition.x - centerX;
    const dy = mousePosition.y - centerY;
    
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Calculate parallax effect for hero section
  const parallaxY = -scrollY * 0.2;
  
  return (
    <div className="relative">
      {/* Animated cursor overlay */}
      <div 
        className="fixed rounded-full pointer-events-none z-50 mix-blend-difference" 
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
          transform: 'translate(-50%, -50%)',
          width: '25px',
          height: '25px',
          backgroundColor: 'white',
          opacity: 0.6,
          transition: 'width 0.2s, height 0.2s, opacity 0.2s',
        }}
      />
      
      {/* Hero section with dynamic parallax */}
      <div 
        ref={heroRef}
        className="relative overflow-hidden min-h-[80vh] flex flex-col items-center justify-center text-center"
      >
        {/* Background gradient with parallax */}
        <div 
          className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950"
          style={{ transform: `translateY(${parallaxY}px)` }}
        >
          {/* Animated shapes */}
          <div className="absolute top-40 left-20 w-64 h-64 rounded-full bg-gradient-to-r from-pink-300 to-purple-300 dark:from-pink-700/30 dark:to-purple-700/30 blur-3xl opacity-20 animate-float" />
          <div className="absolute bottom-60 right-20 w-80 h-80 rounded-full bg-gradient-to-r from-blue-300 to-indigo-300 dark:from-blue-700/30 dark:to-indigo-700/30 blur-3xl opacity-20" style={{ animationDelay: '1s', animationDuration: '7s' }} />
        </div>
        
        <ScrollReveal effect="fade" duration={1200}>
          <h1 className="text-fluid-5xl font-bold tracking-tight mb-6 max-w-3xl mx-auto relative">
            <span className="text-gradient-reveal">CHX Template</span>
            <span className="block text-gray-800 dark:text-white text-fluid-4xl mt-2">Modern React Development</span>
          </h1>
        </ScrollReveal>

        <ScrollReveal effect="slide-up" delay={400} duration={1200} className="max-w-2xl">
          <p className="text-fluid-xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed">
            A beautifully designed React template with fluid animations,
            TypeScript support, and developer-friendly architecture.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <DepthButton 
              variant="accent" 
              size="lg"
              enableMagnetic
              enableParticles
              onClick={() => console.log('Get Started clicked')}
              endIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              }
            >
              Get Started
            </DepthButton>

            <Link to="/components">
              <DepthButton 
                variant="glass" 
                size="lg"
                enableMagnetic
              >
                Explore Components
              </DepthButton>
            </Link>
          </div>
        </ScrollReveal>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400 mb-2">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-gray-400 dark:border-gray-500 rounded-full flex justify-center p-1">
            <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse-down" />
          </div>
        </div>
      </div>

      {/* Features section with BreathingCards */}
      <ScrollReveal effect="fade" className="py-20">
        <div className="container-x">
          <h2 className="text-fluid-3xl font-bold text-center mb-16 relative">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              Key Features
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal effect="slide-up" delay={100}>
              <BreathingCard style="glass" borderRadius="xl" className="h-full p-8" enableParallax>
                <div className="flex flex-col items-center text-center h-full">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white mb-6 float-animation">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-4">Developer-Focused</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-auto">
                    Intuitive architecture crafted with a focus on developer experience, making development seamless and enjoyable.
                  </p>
                </div>
              </BreathingCard>
            </ScrollReveal>

            <ScrollReveal effect="slide-up" delay={200}>
              <BreathingCard style="depth" borderRadius="xl" className="h-full p-8" enableParallax>
                <div className="flex flex-col items-center text-center h-full">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white mb-6 float-animation" style={{ animationDelay: '0.5s' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-4">Fluid Animations</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-auto">
                    Smooth, responsive animations that enhance the user experience and provide visual feedback for interactions.
                  </p>
                </div>
              </BreathingCard>
            </ScrollReveal>

            <ScrollReveal effect="slide-up" delay={300}>
              <BreathingCard style="glow" borderRadius="xl" className="h-full p-8" enableParallax>
                <div className="flex flex-col items-center text-center h-full">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mb-6 float-animation" style={{ animationDelay: '1s' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-4">Modern Technology</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-auto">
                    Built with the latest React, TypeScript, and animation libraries for a performant and maintainable application.
                  </p>
                </div>
              </BreathingCard>
            </ScrollReveal>
          </div>
        </div>
      </ScrollReveal>

      {/* Interactive showcase section */}
      <div className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
        <div className="container-x">
          <ScrollReveal effect="fade">
            <h2 className="text-fluid-3xl font-bold text-center mb-16">
              Interactive Experience
            </h2>
            
            <div className="flex flex-col-reverse md:flex-row items-center gap-12">
              <div className="md:w-1/2">
                <ScrollReveal effect="slide-right" delay={200}>
                  <h3 className="text-fluid-2xl font-bold mb-4">Responsive Design</h3>
                  <p className="mb-6 text-gray-600 dark:text-gray-300">
                    Every component is designed to provide a seamless experience across all devices,
                    with fluid animations and micro-interactions that respond to user input.
                  </p>
                  <DepthButton 
                    variant="primary" 
                    shape="pill"
                    enableParticles
                  >
                    Learn More
                  </DepthButton>
                </ScrollReveal>
              </div>
              
              <div className="md:w-1/2">
                <ScrollReveal effect="slide-left" delay={300}>
                  <BreathingCard style="gradient" className="p-6 rounded-2xl shine-effect">
                    <div className="aspect-video rounded-lg bg-white/80 dark:bg-gray-800/80 p-6 flex flex-col items-center justify-center text-center">
                      <div className="text-5xl mb-4 text-blue-500">✨</div>
                      <h4 className="text-xl font-bold mb-2">Dynamic UI Elements</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Interactive components with depth, motion, and tactile feedback
                      </p>
                    </div>
                  </BreathingCard>
                </ScrollReveal>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Call to action */}
      <ScrollReveal effect="fade" delay={400} className="py-20">
        <div className="container-x">
          <div className="glass-morphism p-12 rounded-3xl text-center max-w-3xl mx-auto shine-effect">
            <h2 className="text-fluid-2xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Explore our component library to see how we've built fluid, interactive UI elements inspired by Apple's design philosophy.
            </p>
            <Link to="/components">
              <DepthButton 
                variant="accent" 
                size="lg" 
                enableMagnetic
                enableParticles
              >
                View Component Library
              </DepthButton>
            </Link>
          </div>
        </div>
      </ScrollReveal>
      
      {/* Dynamic cursor effect for design elements */}
      <div className="fixed bottom-4 right-4 text-xs text-gray-400 pointer-events-none">
        <div>X: {mousePosition.x} Y: {mousePosition.y}</div>
        <div>Scroll: {scrollY.toFixed(0)}px</div>
      </div>
    </div>
  );
};

export default HomePage; 