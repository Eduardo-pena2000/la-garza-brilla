import type { ReactNode } from "react";

export function BrandBackground({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden text-white animate-gradient-shift ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(160deg, oklch(0.34 0.14 258) 0%, oklch(0.18 0.12 262) 55%, oklch(0.10 0.09 262) 100%)",
      }}
    >
      {/* Floating decorative orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-24 h-80 w-80 rounded-full opacity-30 blur-3xl animate-float"
        style={{ background: "var(--brand-cyan)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full opacity-25 blur-3xl animate-float-lg"
        style={{ background: "var(--brand-pink)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -right-16 h-56 w-56 rounded-full opacity-20 blur-3xl animate-float"
        style={{ background: "var(--brand-gold)", animationDelay: "1.5s" }}
      />

      {/* Festive floating icons */}
      <FloatingIcons />

      {/* Subtle dotted texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function FloatingIcons() {
  // Lotería-inspired emoji confetti floating across the background
  const items = [
    { e: "🌵", top: "8%", left: "6%", size: 22, delay: "0s", dur: "5s" },
    { e: "🎺", top: "14%", right: "8%", size: 24, delay: "1.2s", dur: "6s" },
    { e: "🌶️", top: "42%", left: "4%", size: 20, delay: "0.6s", dur: "5.5s" },
    { e: "🎲", top: "58%", right: "6%", size: 22, delay: "1.8s", dur: "6.5s" },
    { e: "🪅", top: "72%", left: "10%", size: 24, delay: "0.9s", dur: "5.2s" },
    { e: "⭐", top: "28%", right: "16%", size: 18, delay: "2.1s", dur: "4.8s" },
    { e: "🌙", top: "82%", right: "14%", size: 20, delay: "0.3s", dur: "5.8s" },
    { e: "🌞", top: "22%", left: "20%", size: 18, delay: "1.5s", dur: "6.2s" },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 opacity-25">
      {items.map((it, i) => (
        <span
          key={i}
          className="absolute animate-float"
          style={{
            top: it.top,
            left: (it as { left?: string }).left,
            right: (it as { right?: string }).right,
            fontSize: it.size,
            animationDelay: it.delay,
            animationDuration: it.dur,
            filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))",
          }}
        >
          {it.e}
        </span>
      ))}
    </div>
  );
}