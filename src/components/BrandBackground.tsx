import type { ReactNode } from "react";

export function BrandBackground({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden text-white ${className}`}
      style={{ background: "var(--gradient-brand)" }}
    >
      {/* Decorative blurred orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-24 h-80 w-80 rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--brand-cyan)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--brand-pink)" }}
      />
      {/* Subtle dotted texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
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