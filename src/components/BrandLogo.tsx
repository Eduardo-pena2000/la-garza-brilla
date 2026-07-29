
interface BrandLogoProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

export function BrandLogo({ size = 160, className = "" }: BrandLogoProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src="/logo-garza.png?v=2"
        alt="Lotería La Garza"
        width={size}
        height={size}
        className="relative object-contain"
      />
    </div>
  );
}