
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
      particleColor: "rgba(255, 255, 255, 0.7)",
      lineColor: "rgba(0, 128, 128, 0.3)", // Teal, semi-transparent
      particleAmount: 50,
      defaultRadius: 2,
      variantRadius: 1,
      defaultSpeed: 0.3,
      variantSpeed: 0.5,
      linkRadius: 200,
    };
    
    // Set initial canvas size
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

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = options.defaultRadius + Math.random() * options.variantRadius;
        this.vx = (Math.random() - 0.5) * options.defaultSpeed;
        this.vy = (Math.random() - 0.5) * options.defaultSpeed;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        if(ctx){
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = options.particleColor;
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

    const linkParticles = () => {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < options.linkRadius) {
                    if(ctx){
                        const opacity = 1 - (distance / options.linkRadius);
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(0, 128, 128, ${opacity * 0.5})`; // Dynamically adjust opacity
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }
    }
    
    const animate = () => {
        if(ctx){
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            linkParticles();
        }
        animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initial setup
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
