
interface BrandLogoProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

export function BrandLogo({ size = 160, className = "", glow = true }: BrandLogoProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center animate-pop-in ${className}`}
      style={{ width: size, height: size }}
    >
      {glow && (
        <>
          <div
            aria-hidden
            className="absolute inset-0 rounded-[28%] blur-2xl opacity-70 animate-float"
            style={{ background: "radial-gradient(circle at 50% 50%, var(--brand-cyan), transparent 65%)" }}
          />
          <div
            aria-hidden
            className="absolute inset-0 rounded-[28%] ring-2 ring-white/40 animate-pulse-ring"
          />
        </>
      )}
      <img
        src="/logo-garza.jpg"
        alt="Lotería La Garza"
        width={size}
        height={size}
        className="relative rounded-[24%] shadow-[var(--shadow-brand)] ring-1 ring-white/10 animate-float"
        style={{ animationDuration: "5s" }}
      />
    </div>
  );
}