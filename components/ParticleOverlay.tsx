import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Particle } from '../types';

export interface ParticleRef {
  explode: (x: number, y: number, color: string) => void;
}

const ParticleOverlay = forwardRef<ParticleRef>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  // Initialize with 0 to satisfy TypeScript requirements for useRef<number>
  const animationFrameId = useRef<number>(0);

  const createParticles = (x: number, y: number, color: string) => {
    // Increased particle count for a denser explosion
    const particleCount = 80;
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      // Increased speed and variance for a more explosive feel
      const speed = Math.random() * 10 + 3; 
      
      particles.current.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color: color,
        // Varied size for depth
        size: Math.random() * 4 + 1.5
      });
    }
  };

  useImperativeHandle(ref, () => ({
    explode: (x, y, color) => {
      createParticles(x, y, color);
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        
        // Update position
        p.x += p.vx;
        p.y += p.vy;
        
        // Physics: Friction (air resistance) to slow them down dramatically after the burst
        p.vx *= 0.92;
        p.vy *= 0.92;
        
        // Physics: Gravity
        p.vy += 0.3;

        // Decay: Random decay for organic fading
        p.life -= Math.random() * 0.02 + 0.015;

        if (p.life <= 0) {
          particles.current.splice(i, 1);
        } else {
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed top-0 left-0 w-full h-full z-50"
    />
  );
});

export default ParticleOverlay;