import { PlusCircle, Users, Layers } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export function JugarView() {
  const navigate = useNavigate();

  const blueGradient = "linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)";

  return (
    <div className="flex flex-col h-full font-sans relative overflow-x-hidden overflow-y-auto text-white pt-5">
      {/* Background glow effects */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-500/20 to-transparent pointer-events-none" />

      {/* Header Fijo */}
      <header className="relative z-10 flex items-center justify-center px-4 shrink-0 pb-6">
        <div className="flex flex-col items-center leading-tight">
          <span className="text-[11px] uppercase tracking-[0.22em] text-white/60">Modos de Juego</span>
          <h1 className="text-xl font-extrabold flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" /> ¡A Jugar!
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 pb-32 space-y-6 relative z-10 w-full max-w-sm mx-auto">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">¿Cómo quieres jugar?</h2>
          <p className="text-sm text-white/60 mt-2">Elige una opción para comenzar tu partida</p>
        </div>

        <div className="grid gap-4 w-full">
          <button 
            onClick={() => navigate({ to: "/abrir-mesa" })}
            className="flex items-center gap-4 p-5 rounded-3xl active:scale-95 transition-transform shadow-xl border-t-2 border-white/20 relative overflow-hidden group"
            style={{ background: blueGradient }}
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="bg-black/20 p-4 rounded-2xl shrink-0 shadow-inner">
              <PlusCircle className="w-10 h-10 text-white drop-shadow-md" />
            </div>
            <div className="text-left flex-1">
              <h3 className="font-black text-white text-xl leading-tight">Crear mesa</h3>
              <p className="text-white/80 text-sm mt-1">Inicia tu propia partida y sé el gritón</p>
            </div>
          </button>

          <button 
            onClick={() => navigate({ to: "/unirse" })}
            className="flex items-center gap-4 p-5 rounded-3xl active:scale-95 transition-transform shadow-xl border-t-2 border-white/20 relative overflow-hidden group"
            style={{ background: blueGradient }}
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="bg-black/20 p-4 rounded-2xl shrink-0 shadow-inner">
              <Users className="w-10 h-10 text-white drop-shadow-md" />
            </div>
            <div className="text-left flex-1">
              <h3 className="font-black text-white text-xl leading-tight">Unirse a mesa</h3>
              <p className="text-white/80 text-sm mt-1">Entra con un código para jugar</p>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
