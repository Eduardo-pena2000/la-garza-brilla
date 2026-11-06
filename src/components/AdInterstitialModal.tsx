import { useState, useEffect } from "react";
import { X, Volume2, VolumeX, Crown, ExternalLink, Sparkles, Play } from "lucide-react";
import { CoinAnimation } from "@/components/CoinAnimation";

interface AdInterstitialModalProps {
  open: boolean;
  onFinished: () => void;
  onGoVip?: () => void;
}

export function AdInterstitialModal({ open, onFinished, onGoVip }: AdInterstitialModalProps) {
  const [timeLeft, setTimeLeft] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    if (!open) {
      setTimeLeft(5);
      setCanSkip(false);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#181230] via-[#0f0b20] to-[#080512] border-2 border-white/20 p-5 text-white shadow-2xl flex flex-col overflow-hidden">
        
        {/* Top Ad Notice Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="bg-amber-400 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded shadow-sm">
              Anuncio
            </span>
            <span className="text-[10px] text-white/60">
              Pausa entre rondas
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMuted(!muted)}
              className="p-1.5 rounded-full bg-white/10 text-white/70 hover:text-white"
            >
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            {canSkip ? (
              <button
                onClick={onFinished}
                className="px-3 py-1 rounded-full bg-white text-slate-950 font-black text-xs hover:bg-white/90 active:scale-95 transition shadow"
              >
                Saltar anuncio ✕
              </button>
            ) : (
              <span className="text-xs font-bold text-white/70 px-2 py-0.5 rounded-full bg-white/10">
                Saltar en {timeLeft}s
              </span>
            )}
          </div>
        </div>

        {/* Ad Creative (Promo Lotería La Garza Store / VIP) */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-amber-600/30 via-purple-700/30 to-blue-900/30 border border-white/10 p-5 text-center flex flex-col items-center justify-center my-2 min-h-[220px]">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center mb-3 shadow-[0_0_25px_rgba(245,158,11,0.5)]">
            <Crown className="w-9 h-9 fill-current" />
          </div>

          <h4 className="text-lg font-black text-white leading-tight">
            ¿Cansado de los anuncios?
          </h4>
          <p className="text-xs text-amber-200 mt-1 max-w-[240px] leading-relaxed">
            Las <strong>Salas VIP</strong> son 100% libres de publicidad para ti y para todos tus amigos invitados.
          </p>

          <div className="mt-4 flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full border border-amber-400/40 text-[11px] text-amber-300 font-bold">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>0 Anuncios entre rondas garantizado</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 space-y-2">
          {canSkip ? (
            <button
              onClick={onFinished}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[color:var(--brand-cyan)] to-blue-600 text-white font-black text-sm active:scale-95 transition shadow-lg flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              Continuar a la siguiente ronda
            </button>
          ) : (
            <div className="w-full py-3 rounded-2xl bg-white/10 text-white/60 font-bold text-xs text-center">
              El juego continuará en unos segundos...
            </div>
          )}

          {onGoVip && (
            <button
              onClick={onGoVip}
              className="w-full py-2 text-xs font-bold text-amber-300 hover:text-amber-200 transition text-center flex items-center justify-center gap-1"
            >
              <Crown className="w-3 h-3 fill-current" /> Conoce las Salas VIP sin anuncios
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
