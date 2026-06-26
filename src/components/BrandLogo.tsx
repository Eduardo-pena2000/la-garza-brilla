import logoAsset from "@/assets/logo-garza.jpg.asset.json";

interface BrandLogoProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

export function BrandLogo({ size = 160, className = "", glow = true }: BrandLogoProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {glow && (
        <div
          aria-hidden
          className="absolute inset-0 rounded-[28%] blur-2xl opacity-60"
          style={{ background: "radial-gradient(circle at 50% 50%, var(--brand-cyan), transparent 65%)" }}
        />
      )}
      <img
        src={logoAsset.url}
        alt="Lotería La Garza"
        width={size}
        height={size}
        className="relative rounded-[24%] shadow-[var(--shadow-brand)] ring-1 ring-white/10"
      />
    </div>
  );
}