
'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

const PlexusBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const options = {
      particleColor: "rgba(255, 255, 255, 0.8)",
      particleAmount: 100, // Increased for a denser starfield
      defaultRadius: 1.5,
      variantRadius: 1,
      defaultSpeed: 0.05, // Slower for a calmer effect
      variantSpeed: 0.1,
    };
    
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    };

    class Particle {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      opacity: number;
      opacitySpeed: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = options.defaultRadius + Math.random() * options.variantRadius;
        this.vx = (Math.random() - 0.5) * options.defaultSpeed;
        this.vy = (Math.random() - 0.5) * options.defaultSpeed;
        this.opacity = Math.random() * 0.5 + 0.2; // Start with random opacity
        this.opacitySpeed = (Math.random() - 0.5) * 0.01; // How fast it twinkles
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        // Twinkle effect
        this.opacity += this.opacitySpeed;
        if (this.opacity <= 0.1 || this.opacity >= 0.8) {
            this.opacitySpeed *= -1;
        }
      }

      draw() {
        if(ctx){
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.fill();
        }
      }
    }

    const initParticles = () => {
        particles = [];
        for (let i = 0; i < options.particleAmount; i++) {
            particles.push(new Particle());
        }
    }

    const animate = () => {
        if(ctx){
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
        }
        animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 bg-background">
         <canvas ref={canvasRef} className="w-full h-full opacity-50" />
         <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
    </div>
  );
};

export default PlexusBackground;
