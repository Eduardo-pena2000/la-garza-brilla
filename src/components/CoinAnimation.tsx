export function CoinAnimation({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <img 
        src="/shine_rotate-3.svg" 
        alt="Moneda" 
        className="absolute w-[200%] h-[200%] max-w-none object-contain top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-sm pointer-events-none" 
      />
    </div>
  );
}
