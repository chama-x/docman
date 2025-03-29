import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DepthButton, ScrollReveal } from '@components/ui';

/**
 * Animated floating particle for 404 background
 */
interface Particle {
  id: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  velocity: {
    x: number;
    y: number;
  };
  opacity: number;
}

/**
 * Enhanced 404 Not Found page component with fluid animations
 */
const NotFoundPage: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  
  // Generate background particles
  useEffect(() => {
    const generateParticles = () => {
      const newParticles: Particle[] = [];
      const colors = ['#E0E7FF', '#C7D2FE', '#A5B4FC', '#818CF8'];
      
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          radius: Math.random() * 4 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          velocity: {
            x: (Math.random() - 0.5) * 0.5,
            y: (Math.random() - 0.5) * 0.5
          },
          opacity: Math.random() * 0.5 + 0.1
        });
      }
      
      setParticles(newParticles);
    };

    generateParticles();
    
    // Regenerate particles on window resize
    window.addEventListener('resize', generateParticles);
    return () => window.removeEventListener('resize', generateParticles);
  }, []);
  
  // Animate particles
  useEffect(() => {
    if (particles.length === 0) return;
    
    const animateParticles = () => {
      setParticles(prevParticles => 
        prevParticles.map(particle => {
          // Update particle position
          let x = particle.x + particle.velocity.x;
          let y = particle.y + particle.velocity.y;
          
          // Wrap around edges
          if (x < 0) x = window.innerWidth;
          if (x > window.innerWidth) x = 0;
          if (y < 0) y = window.innerHeight;
          if (y > window.innerHeight) y = 0;
          
          return { ...particle, x, y };
        })
      );
    };
    
    const animationId = requestAnimationFrame(animateParticles);
    const interval = setInterval(animateParticles, 50);
    
    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(interval);
    };
  }, [particles]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[80vh] overflow-hidden">
      {/* Floating particles background */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.radius}px`,
            height: `${particle.radius}px`,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            transition: 'transform 0.5s ease',
          }}
        />
      ))}
      
      {/* Glowing overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 to-indigo-100/30 dark:from-gray-900/50 dark:to-indigo-950/50 z-0"></div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4">
        <ScrollReveal effect="fade" duration={1200}>
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-4">
            404
          </h1>
        </ScrollReveal>
        
        <ScrollReveal effect="slide-up" delay={200} duration={1000}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-6">
            Page Not Found
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <Link to="/">
            <DepthButton
              variant="accent"
              size="lg"
              enableMagnetic
              enableParticles
              startIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              }
            >
              Return Home
            </DepthButton>
          </Link>
        </ScrollReveal>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute -bottom-32 -right-20 w-80 h-80 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
    </div>
  );
};

export default NotFoundPage; 