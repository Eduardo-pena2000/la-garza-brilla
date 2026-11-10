import logoGarza from "@/assets/logo-garza.png";

interface BrandLogoProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

export function BrandLogo({ size = 160, className = "" }: BrandLogoProps) {
  return (
    <img
      src={logoGarza}
      alt="Lotería La Garza"
      width={size}
      height={size}
      className={`relative object-contain select-none pointer-events-none ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
