interface BrandLogoProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

export function BrandLogo({ size = 160, className = "" }: BrandLogoProps) {
  return (
    <img
      src="/logo-garza.png?v=3"
      alt="Lotería La Garza"
      width={size}
      height={size}
      className={`relative object-contain select-none pointer-events-none ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
