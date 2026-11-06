export function CoinAnimation({ className = "" }: { className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img 
        src="/images/peso_mexicano.png" 
        alt="Peso Mexicano" 
        className="w-full h-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" 
      />
    </div>
  );
}
