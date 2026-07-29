import type { ReactNode } from "react";

const PAPEL_COLORS = [
  "var(--brand-pink)",
  "var(--brand-gold)",
  "var(--brand-teal)",
  "var(--brand-cyan)",
  "oklch(0.72 0.2 30)",
];

/** Guirnalda de papel picado animada */
export function PapelPicado({ count = 9, className = "" }: { count?: number; className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-between px-1 ${className}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-papel-sway"
          style={{ animationDelay: `${(i % 5) * 0.25}s`, animationDuration: `${3 + (i % 3) * 0.4}s` }}
        >
          <svg width="42" height="54" viewBox="0 0 46 60">
            <path d="M0 0 H46 V40 L23 58 L0 40 Z" fill={PAPEL_COLORS[i % PAPEL_COLORS.length]} opacity="0.85" />
            <circle cx="23" cy="16" r="6" fill="rgba(0,0,0,0.35)" />
            <circle cx="11" cy="28" r="3.2" fill="rgba(0,0,0,0.35)" />
            <circle cx="35" cy="28" r="3.2" fill="rgba(0,0,0,0.35)" />
            <circle cx="23" cy="34" r="3.6" fill="rgba(0,0,0,0.35)" />
          </svg>
        </div>
      ))}
    </div>
  );
}

/** Franja de sarape animada */
export function SarapeBand({ className = "", height = 6 }: { className?: string; height?: number }) {
  return (
    <span
      aria-hidden
      className={`block w-full sarape-band animate-sarape-slide ${className}`}
      style={{ height }}
    />
  );
}

/** Wordmark tipográfico "Lotería La Garza" (sin logo) */
export function Wordmark({ size = "lg", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const scale = size === "lg" ? 1 : size === "md" ? 0.68 : 0.46;
  return (
    <div className={`text-center ${className}`}>
      <p
        className="font-semibold uppercase tracking-[0.5em] text-[color:var(--brand-gold)]"
        style={{ fontSize: `${11 * (size === "sm" ? 0.85 : 1)}px` }}
      >
        Lotería
      </p>
      <h1 className="animate-wiggle-soft leading-[0.92]">
        <span
          className="block font-black uppercase tracking-tight text-white drop-shadow-[0_5px_0_rgba(0,0,0,0.35)]"
          style={{ fontSize: `${3.15 * scale}rem` }}
        >
          La
        </span>
        <span
          className="relative block font-black uppercase tracking-tight text-[color:var(--brand-cyan)] drop-shadow-[0_5px_0_rgba(0,0,0,0.35)]"
          style={{ fontSize: `${3.4 * scale}rem` }}
        >
          Garza
          <span aria-hidden className="pointer-events-none absolute inset-0 text-shine text-transparent">
            Garza
          </span>
        </span>
      </h1>
    </div>
  );
}

/** Encabezado de pantalla con marco tipo talavera y franja de sarape */
export function FiestaHeader({
  left,
  title,
  subtitle,
  right,
}: {
  left?: ReactNode;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <header className="relative z-30 overflow-hidden rounded-b-[28px] border-b border-white/15 shadow-[var(--shadow-brand)]" style={{ background: "var(--gradient-brand)" }}>
      <SarapeBand />
      <div className="flex items-center gap-3 px-4 py-4">
        {left}
        <div className="min-w-0 flex-1 text-center">
          <h1 className="truncate text-lg font-black uppercase tracking-wide text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.35)]">
            {title}
          </h1>
          {subtitle && <p className="truncate text-[11px] uppercase tracking-[0.25em] text-[color:var(--brand-gold)]">{subtitle}</p>}
        </div>
        {right ?? <span className="h-11 w-11" />}
      </div>
      <SarapeBand height={4} className="opacity-70" />
    </header>
  );
}

/** Botón redondo festivo para las cabeceras */
export function FiestaIconButton({
  children,
  onClick,
  label,
}: {
  children: ReactNode;
  onClick?: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 text-white ring-1 ring-[color:var(--brand-gold)]/40 backdrop-blur transition hover:bg-white/20 hover:scale-105 active:scale-95"
    >
      {children}
    </button>
  );
}