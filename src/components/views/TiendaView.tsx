import { useEffect, useState } from "react";
import { ChevronLeft, Gift, Crown, Zap, Image as ImageIcon, Star } from "lucide-react";
import { CoinAnimation } from "@/components/CoinAnimation";

export function TiendaView({ onBack }: { onBack?: () => void }) {
  const [coins, setCoins] = useState(0);
  const [ownedItems, setOwnedItems] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storedCoins = localStorage.getItem("garza:coins");
      if (storedCoins) setCoins(parseInt(storedCoins));
      else {
        localStorage.setItem("garza:coins", "500");
        setCoins(500);
      }

      const storedItems = localStorage.getItem("garza:owned");
      if (storedItems) setOwnedItems(JSON.parse(storedItems));
    } catch {
      /* ignore */
    }
  }, []);

  const buyItem = (id: string, price: number) => {
    if (coins >= price && !ownedItems.includes(id)) {
      const newCoins = coins - price;
      setCoins(newCoins);
      localStorage.setItem("garza:coins", newCoins.toString());
      
      const newItems = [...ownedItems, id];
      setOwnedItems(newItems);
      localStorage.setItem("garza:owned", JSON.stringify(newItems));
    }
  };

  return (
    <div className="flex flex-col h-full font-sans relative overflow-x-hidden text-white">
      {/* Background glow effects */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[color:var(--brand-cyan)]/20 to-transparent pointer-events-none" />
      
      {/* Header Fijo */}
      <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-[color:var(--brand-navy-deep)]/90 backdrop-blur-md border-b border-white/10 shadow-lg">
        {onBack ? (
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl bg-white/5 active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-7 h-7 text-white" />
          </button>
        ) : (
          <div className="w-11" />
        )}
        <h1 className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-[color:var(--brand-gold)] to-yellow-600 uppercase">
          La Tienda
        </h1>
        <div className="flex items-center gap-1.5 bg-black/60 px-4 py-2 rounded-full ring-2 ring-[color:var(--brand-gold)] shadow-[0_0_15px_rgba(255,215,0,0.3)]">
          <CoinAnimation className="w-6 h-6 -mt-0.5 drop-shadow-md" />
          <span className="font-extrabold text-[color:var(--brand-gold)] tracking-wide">{coins}</span>
        </div>
      </header>

      {/* Main Content (Scrollable) */}
      <main className="flex-1 overflow-y-auto pb-28 p-5 space-y-10">

        {/* SECTION: Comprar Monedas */}
        <section className="animate-slide-up-soft">
          <h2 className="flex items-center justify-center gap-2 text-sm font-black text-white/50 mb-4 tracking-[0.2em] uppercase">
            <span className="h-px w-8 bg-white/20" />
            Tesoros
            <span className="h-px w-8 bg-white/20" />
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { coins: 500, price: "$0.99", bonus: null, gradient: "from-green-500/20 to-emerald-700/40", ring: "ring-emerald-500/50" },
              { coins: 1200, price: "$1.99", bonus: "¡15% Extra!", gradient: "from-blue-500/20 to-indigo-700/40", ring: "ring-indigo-500/50" },
              { coins: 2500, price: "$3.99", bonus: "¡25% Extra!", gradient: "from-purple-500/20 to-fuchsia-700/40", ring: "ring-fuchsia-500/50" },
              { coins: 6500, price: "$9.99", bonus: "¡Mejor Valor!", gradient: "from-yellow-400/20 to-amber-700/40", ring: "ring-[color:var(--brand-gold)] shadow-[0_0_20px_rgba(255,215,0,0.3)]" },
            ].map((pack, idx) => (
              <button key={idx} className={`relative flex flex-col items-center justify-center p-4 rounded-3xl bg-gradient-to-br ${pack.gradient} ring-1 ${pack.ring} border-t-2 border-white/20 active:scale-95 transition-transform overflow-hidden group`}>
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                {pack.bonus && (
                  <span className="absolute top-0 left-0 w-full bg-red-600 text-[9px] font-black uppercase tracking-wider py-0.5 shadow-md z-10">{pack.bonus}</span>
                )}
                <CoinAnimation className={`w-12 h-12 mt-2 drop-shadow-xl ${pack.coins > 2000 ? 'animate-pulse' : ''}`} />
                <span className="font-black text-xl text-white drop-shadow-md mt-1">{pack.coins}</span>
                <span className="mt-2 bg-white text-black font-extrabold text-sm px-4 py-1.5 rounded-full shadow-lg">{pack.price}</span>
              </button>
            ))}
          </div>
        </section>

        {/* SECTION: Ofertas Especiales */}
        <section className="animate-slide-up-soft" style={{ animationDelay: "0.1s" }}>
          <h2 className="flex items-center justify-center gap-2 text-sm font-black text-amber-400 mb-4 tracking-[0.2em] uppercase drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]">
            <span className="h-px w-8 bg-amber-400/50" />
            Ofertas del Día
            <span className="h-px w-8 bg-amber-400/50" />
          </h2>
          <div className="relative rounded-3xl overflow-hidden ring-2 ring-[color:var(--brand-gold)] shadow-[0_10px_30px_rgba(255,215,0,0.2)] bg-gradient-to-br from-amber-600 to-yellow-900 border-t border-yellow-300">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
            <div className="absolute top-0 right-0 bg-red-600 text-white font-black text-[10px] uppercase px-4 py-1 rounded-bl-xl shadow-lg z-10 animate-pulse">¡Tiempo Limitado!</div>
            
            <div className="p-6 flex items-center gap-5 relative z-10">
              <div className="w-24 h-24 bg-black/40 rounded-2xl ring-2 ring-white/30 flex items-center justify-center shadow-inner relative overflow-hidden">
                <Crown className="w-12 h-12 text-yellow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.8)] animate-bounce-slow" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer-x_2s_infinite]" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-2xl text-white drop-shadow-lg leading-tight">Pase de Oro<br/>Temporada 1</h3>
                <p className="text-yellow-200 text-xs font-semibold mt-1">Marco + 50 Stickers VIP</p>
                <button 
                  onClick={() => buyItem("bundle_gold", 2000)}
                  disabled={ownedItems.includes("bundle_gold") || coins < 2000}
                  className={`mt-3 w-full py-2.5 rounded-xl font-black text-lg shadow-xl active:scale-95 transition-transform flex justify-center items-center gap-1 ${ownedItems.includes("bundle_gold") ? 'bg-black/40 text-white/50' : coins < 2000 ? 'bg-white/20 text-white/60' : 'bg-gradient-to-r from-yellow-300 to-[color:var(--brand-gold)] text-black'}`}
                >
                  {ownedItems.includes("bundle_gold") ? "¡ADQUIRIDO!" : <><CoinAnimation className="w-5 h-5 drop-shadow-sm" /> 2000</>}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: Paquetes de Stickers */}
        <section className="animate-slide-up-soft" style={{ animationDelay: "0.2s" }}>
          <h2 className="flex items-center justify-center gap-2 text-sm font-black text-white/50 mb-4 tracking-[0.2em] uppercase">
            <span className="h-px w-8 bg-white/20" />
            Stickers
            <span className="h-px w-8 bg-white/20" />
          </h2>
          <div className="grid gap-4">
            {[
              { id: 'st_mex', name: 'Paquete Norteño', icon: '🤠', price: 500, rarity: 'Común', color: 'from-blue-600 to-blue-900', ring: 'ring-blue-400' },
              { id: 'st_spicy', name: 'Reacciones Picantes', icon: '🌶️', price: 800, rarity: 'Raro', color: 'from-orange-500 to-red-800', ring: 'ring-orange-400' },
              { id: 'st_magic', name: 'Magia de Feria', icon: '✨', price: 1200, rarity: 'Épico', color: 'from-fuchsia-600 to-purple-900', ring: 'ring-fuchsia-400' },
            ].map(item => (
              <div key={item.id} className={`bg-gradient-to-br ${item.color} rounded-2xl p-4 flex items-center gap-4 ring-1 ${item.ring} shadow-lg relative overflow-hidden`}>
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-xl pointer-events-none" />
                <div className="w-16 h-16 bg-black/30 rounded-xl flex items-center justify-center shrink-0 border-b-2 border-white/20 text-3xl shadow-inner">
                  {item.icon}
                </div>
                <div className="flex-1 relative z-10">
                  <div className="text-[10px] font-black uppercase text-white/70 mb-0.5 tracking-wider">{item.rarity}</div>
                  <h4 className="text-white font-bold text-lg leading-none">{item.name}</h4>
                </div>
                <button 
                  onClick={() => buyItem(item.id, item.price)}
                  disabled={ownedItems.includes(item.id) || coins < item.price}
                  className={`px-5 py-2.5 rounded-xl font-black text-sm shrink-0 flex items-center gap-1 transition-transform relative z-10 shadow-md ${ownedItems.includes(item.id) ? 'bg-black/50 text-white/40' : coins < item.price ? 'bg-black/30 text-white/50 cursor-not-allowed' : 'bg-white text-black active:scale-95 hover:bg-gray-100'}`}
                >
                  {ownedItems.includes(item.id) ? 'TUYO' : <><CoinAnimation className="w-4 h-4 drop-shadow-sm" /> {item.price}</>}
                </button>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
