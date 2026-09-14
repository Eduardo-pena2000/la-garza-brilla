export function BrandTitle({ className = "" }: { className?: string }) {
  return (
    <h1 className={`brand-hero-title text-center relative z-20 ${className}`}>
      <span className="brand-hero-loteria">LOTERÍA</span>
      <span className="brand-hero-la-garza mt-3 block relative z-20">La Garza</span>
    </h1>
  );
}
