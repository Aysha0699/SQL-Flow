'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  alpha: number;
  maxAlpha: number;
}

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // 1. Accessibility & Device Checks
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouch || prefersReducedMotion) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates
    let mouseX = -100;
    let mouseY = -100;
    let targetX = -100;
    let targetY = -100;
    let isHoveringInteractive = false;
    let isVisible = false;

    const particles: Particle[] = [];
    const maxParticles = 18;

    // Handle window resize
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    // Handle mouse move
    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      isVisible = true;

      // Check if hovering over interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest('button, a, textarea, input, select, [role="button"], .sql-interactive');
        isHoveringInteractive = Boolean(interactive);
      }
    };

    const handleMouseLeave = () => {
      isVisible = false;
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    // Animation Loop
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      if (isVisible) {
        // Smooth interpolation towards mouse position
        const lerpFactor = 0.35;
        mouseX += (targetX - mouseX) * lerpFactor;
        mouseY += (targetY - mouseY) * lerpFactor;

        // Spawn a trailing particle
        particles.push({
          x: mouseX,
          y: mouseY,
          size: isHoveringInteractive ? 5 : 3.5,
          alpha: 0.7,
          maxAlpha: 0.7
        });

        if (particles.length > maxParticles) {
          particles.shift();
        }

        // Draw trailing particles
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.alpha -= dt * 1.6;
          p.size = Math.max(0.5, p.size - dt * 4.5);

          if (p.alpha > 0.02) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            // #0047AB with fading alpha
            ctx.fillStyle = `rgba(0, 71, 171, ${p.alpha * 0.75})`;
            ctx.shadowColor = '#0047AB';
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.restore();
          }
        }

        // Clean up dead particles
        while (particles.length > 0 && particles[0].alpha <= 0.02) {
          particles.shift();
        }

        // Draw primary leading glow dot
        const leadRadius = isHoveringInteractive ? 6 : 4;
        const glowRadius = isHoveringInteractive ? 22 : 14;

        ctx.save();
        // Outer subtle blue halo
        const gradient = ctx.createRadialGradient(
          mouseX, mouseY, 0,
          mouseX, mouseY, glowRadius
        );
        gradient.addColorStop(0, isHoveringInteractive ? 'rgba(30, 107, 255, 0.45)' : 'rgba(0, 71, 171, 0.35)');
        gradient.addColorStop(0.5, 'rgba(0, 71, 171, 0.15)');
        gradient.addColorStop(1, 'rgba(0, 71, 171, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, leadRadius, 0, Math.PI * 2);
        ctx.fillStyle = isHoveringInteractive ? '#3884FF' : '#0047AB';
        ctx.shadowColor = '#1E6BFF';
        ctx.shadowBlur = isHoveringInteractive ? 12 : 8;
        ctx.fill();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 select-none"
      aria-hidden="true"
    />
  );
}
