import React, { useEffect, useRef } from "react";

export interface ChestParticlesHandle {
  burst: (x: number, y: number, count?: number, color?: string) => void;
  celebrate: (count?: number) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  rotation: number;
  rotSpeed: number;
  shape: "spark" | "coin" | "confetti" | "mote";
}

export const ChestParticlesCanvas = React.forwardRef<ChestParticlesHandle, { className?: string }>(
  ({ className = "" }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);

    React.useImperativeHandle(ref, () => ({
      burst: (x: number, y: number, count = 35, color = "#fbbf24") => {
        const pList = particlesRef.current;
        const colors = [color, "#ffffff", "#fef08a", "#f59e0b", "#ec4899", "#38bdf8"];
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 8 + 3;
          pList.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 3,
            size: Math.random() * 6 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1,
            life: 0,
            maxLife: Math.random() * 40 + 35,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.25,
            shape: Math.random() > 0.4 ? "spark" : "coin",
          });
        }
      },
      celebrate: (count = 70) => {
        const pList = particlesRef.current;
        const canvas = canvasRef.current;
        const w = canvas?.width || 500;
        const colors = ["#f59e0b", "#ec4899", "#06b6d4", "#10b981", "#8b5cf6", "#fbbf24", "#ffffff"];

        for (let i = 0; i < count; i++) {
          pList.push({
            x: Math.random() * w,
            y: -20,
            vx: (Math.random() - 0.5) * 4,
            vy: Math.random() * 4 + 3,
            size: Math.random() * 8 + 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1,
            life: 0,
            maxLife: Math.random() * 120 + 80,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.15,
            shape: "confetti",
          });
        }
      },
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let animId: number;

      const resize = () => {
        const rect = canvas.parentElement?.getBoundingClientRect();
        if (rect) {
          canvas.width = rect.width;
          canvas.height = rect.height;
        }
      };
      resize();
      window.addEventListener("resize", resize);

      // Add ambient background floating motes
      const spawnAmbientMote = () => {
        if (particlesRef.current.length < 25 && Math.random() < 0.25) {
          particlesRef.current.push({
            x: Math.random() * canvas.width,
            y: canvas.height + 10,
            vx: (Math.random() - 0.5) * 0.8,
            vy: -(Math.random() * 1.2 + 0.6),
            size: Math.random() * 3.5 + 1.5,
            color: "#fbbf24",
            alpha: 0.7,
            life: 0,
            maxLife: Math.random() * 140 + 100,
            rotation: 0,
            rotSpeed: 0,
            shape: "mote",
          });
        }
      };

      const loop = () => {
        animId = requestAnimationFrame(loop);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        spawnAmbientMote();

        const pList = particlesRef.current;
        for (let i = pList.length - 1; i >= 0; i--) {
          const p = pList[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life++;
          p.rotation += p.rotSpeed;

          // Physics depending on shape
          if (p.shape === "spark") {
            p.vy += 0.18; // gravity
            p.vx *= 0.96; // air drag
            p.alpha = Math.max(0, 1 - p.life / p.maxLife);
          } else if (p.shape === "coin") {
            p.vy += 0.22;
            p.vx *= 0.97;
            p.alpha = Math.max(0, 1 - p.life / p.maxLife);
          } else if (p.shape === "confetti") {
            p.vy += 0.05;
            p.vx += Math.sin(p.life * 0.1) * 0.15; // wobble
            p.alpha = Math.max(0, 1 - p.life / p.maxLife);
          } else {
            // ambient mote
            p.alpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.75;
          }

          if (p.life >= p.maxLife || p.y > canvas.height + 40 || p.alpha <= 0) {
            pList.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);

          if (p.shape === "spark") {
            // Glowing star spark
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            const s = p.size;
            ctx.moveTo(0, -s);
            ctx.lineTo(s * 0.3, -s * 0.3);
            ctx.lineTo(s, 0);
            ctx.lineTo(s * 0.3, s * 0.3);
            ctx.lineTo(0, s);
            ctx.lineTo(-s * 0.3, s * 0.3);
            ctx.lineTo(-s, 0);
            ctx.lineTo(-s * 0.3, -s * 0.3);
            ctx.closePath();
            ctx.fill();
          } else if (p.shape === "coin") {
            // Shiny gold coin
            ctx.fillStyle = "#fbbf24";
            ctx.strokeStyle = "#d97706";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else if (p.shape === "confetti") {
            // Rotating confetti strip
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size, -p.size * 0.5, p.size * 2, p.size);
          } else {
            // Ambient soft glowing mote
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }
      };

      loop();

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener("resize", resize);
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        className={`pointer-events-none absolute inset-0 z-30 ${className}`}
      />
    );
  }
);
ChestParticlesCanvas.displayName = "ChestParticlesCanvas";
