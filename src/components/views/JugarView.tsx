import { PlusCircle, Users, Layers, Crown, Sparkles, ChevronRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { VipSubscriptionModal } from "@/components/VipSubscriptionModal";

export function JugarView() {
  const navigate = useNavigate();
  const [isVip, setIsVip] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);

  useEffect(() => {
    const checkVip = () => {
      try {
        setIsVip(localStorage.getItem("garza:vip") === "true");
      } catch {}
    };
    checkVip();
    window.addEventListener("garza:vip-updated", checkVip);
    return () => window.removeEventListener("garza:vip-updated", checkVip);
  }, []);

  const blueGradient = "linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)";
  const goldGradient = "linear-gradient(135deg, #D97706 0%, #F59E0B 50%, #B45309 100%)";

  const handleVipClick = () => {
    navigate({ to: "/crear-sala-vip" });
  };

  return (
    <div className="flex flex-col h-full font-sans relative overflow-x-hidden text-white pt-5 pb-36 scroll-touch-y">
      {/* Background glow effects */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-500/20 to-transparent pointer-events-none" />

      {/* Header Fijo */}
      <header className="relative z-10 flex items-center justify-center px-4 shrink-0 pb-4">
        <div className="flex flex-col items-center leading-tight">
          <span className="text-[11px] uppercase tracking-[0.22em] text-white/60">Modos de Juego</span>
          <h1 className="text-xl font-extrabold flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" /> ¡A Jugar!
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 pb-32 space-y-4 relative z-10 w-full max-w-sm mx-auto">
        <div className="text-center mb-2">
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">
            ¿Cómo quieres jugar?
          </h2>
          <p className="text-xs text-white/60 mt-1">Elige una opción para comenzar tu partida</p>
        </div>

        <div className="grid gap-3.5 w-full">
          {/* VIP Host Panel Card - Same Art as InicioView */}
          <button
            onClick={handleVipClick}
            className="relative rounded-3xl p-5 bg-gradient-to-r from-[#211746] via-[#161033] to-[#2c1a11] border-2 border-amber-400/50 shadow-[0_10px_30px_rgba(245,158,11,0.25)] cursor-pointer hover:border-amber-400 active:scale-[0.98] transition-all overflow-hidden text-left group"
          >
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg ring-2 ring-amber-400/50 shrink-0 bg-gradient-to-br from-[#2a174d] to-[#120826] flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
                <img 
                  src="/images/icon-vip.png" 
                  alt="VIP Corona Real" 
                  className="w-full h-full object-contain scale-110 drop-shadow-[0_4px_12px_rgba(245,158,11,0.6)]"
                />
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                    {isVip ? "Panel de Anfitrión" : "Membresía Mensual"}
                  </span>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </div>
                <h3 className="font-black text-white text-xl leading-tight mt-0.5 truncate">
                  Crear Salas VIP & Torneos
                </h3>
                <p className="text-amber-100/80 text-xs mt-1 font-medium leading-snug">
                  Panel administrativo: programa día y hora, rondas con premios e invitados.
                </p>
              </div>
              <ChevronRight className="w-6 h-6 text-amber-300 shrink-0 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Standard Create Mesa */}
          <button 
            onClick={() => navigate({ to: "/abrir-mesa" })}
            className="flex items-center gap-4 p-5 rounded-3xl active:scale-95 transition-transform shadow-xl border-t-2 border-white/20 relative overflow-hidden group text-left"
            style={{ background: blueGradient }}
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="bg-black/20 p-4 rounded-2xl shrink-0 shadow-inner">
              <PlusCircle className="w-10 h-10 text-white drop-shadow-md" />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-white text-xl leading-tight">Crear mesa</h3>
              <p className="text-white/80 text-xs mt-1">Inicia tu propia partida y sé el gritón</p>
            </div>
          </button>

          {/* Join Mesa */}
          <button 
            onClick={() => navigate({ to: "/unirse" })}
            className="flex items-center gap-4 p-5 rounded-3xl active:scale-95 transition-transform shadow-xl border-t-2 border-white/20 relative overflow-hidden group text-left"
            style={{ background: blueGradient }}
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="bg-black/20 p-4 rounded-2xl shrink-0 shadow-inner">
              <Users className="w-10 h-10 text-white drop-shadow-md" />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-white text-xl leading-tight">Unirse a mesa</h3>
              <p className="text-white/80 text-xs mt-1">Entra con un código para jugar</p>
            </div>
          </button>
        </div>
      </main>

      {/* VIP Subscription Modal */}
      <VipSubscriptionModal
        open={showVipModal}
        onClose={() => setShowVipModal(false)}
        onSuccess={() => {
          setIsVip(true);
          setShowVipModal(false);
          navigate({ to: "/crear-sala-vip" });
        }}
      />
    </div>
  );
}
