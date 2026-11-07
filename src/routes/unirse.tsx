import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Users, Coins, Search, Lock, X, AlertCircle, LayoutGrid, Crown, Calendar } from "lucide-react";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";
import { getCurrentUser } from "@/lib/auth";
import { BrandBackground } from "@/components/BrandBackground";
import { JoinTableSelectionModal } from "@/components/JoinTableSelectionModal";

export const Route = createFileRoute("/unirse")({
  component: LobbyBrowserPage,
});

function LobbyBrowserPage() {
  const navigate = useNavigate();
  const [mesas, setMesas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [tab, setTab] = useState<"todas" | "publicas" | "privadas">("todas");
  
  // Password Modal
  const [selectedMesa, setSelectedMesa] = useState<any>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Table Selection Modal
  const [pendingJoinMesa, setPendingJoinMesa] = useState<any>(null);

  useEffect(() => {
    const user = getCurrentUser();
    const isSessionActive = typeof window !== "undefined" && sessionStorage.getItem("garza:session_active") === "true";
    const storedName = typeof window !== "undefined" ? localStorage.getItem("garza:name") : null;
    const hasValidName = Boolean(storedName && storedName.trim().length > 0 && storedName !== "Jugador" && storedName !== "Invitado");
    if (!user?.email && (!isSessionActive || !hasValidName)) {
      navigate({ to: "/", search: { redirect: "/unirse" } });
    }
  }, [navigate]);

  useEffect(() => {
    const mesasRef = ref(database, "mesas");
    const unsubscribe = onValue(mesasRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Obtenemos salas activas (abiertas, en juego o programadas), ignorando partidas abandonadas
        const now = Date.now();
        const activeList = Object.values(data)
          .filter((m: any) => {
            if (!m || m.status === "terminada") return false;
            if (m.createdAt && now - m.createdAt > 4 * 3600 * 1000) return false;
            if (!m.players || Object.keys(m.players).length === 0) return false;
            return true;
          })
          .sort((a: any, b: any) => b.createdAt - a.createdAt);
        setMesas(activeList);
      } else {
        setMesas([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredMesas = useMemo(() => {
    return mesas.filter((m) => {
      // 1. Tab filter
      if (tab === "publicas" && m.locked) return false;
      if (tab === "privadas" && !m.locked) return false;
      
      // 2. Search filter
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const matchName = m.name?.toLowerCase().includes(query);
        const matchCode = m.id?.toLowerCase().includes(query);
        if (!matchName && !matchCode) return false;
      }
      
      return true;
    });
  }, [mesas, tab, searchQuery]);

  function handleMesaClick(mesa: any) {
    if (mesa.locked) {
      setSelectedMesa(mesa);
      setPasswordInput("");
      setPasswordError("");
    } else {
      // Abre modal para elegir cantidad y tablas antes de entrar
      setPendingJoinMesa(mesa);
    }
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMesa) return;
    
    if (passwordInput === selectedMesa.password) {
      const target = selectedMesa;
      setSelectedMesa(null);
      setPendingJoinMesa(target);
    } else {
      setPasswordError("Contraseña incorrecta");
    }
  }

  return (
    <BrandBackground>
      <div className="flex min-h-[100dvh] flex-col font-sans relative z-10">
        
        {/* Header */}
        <header className="sticky top-0 z-30 flex flex-col gap-3 bg-[color:var(--brand-navy-deep)]/90 pt-12 pb-4 px-4 backdrop-blur shadow-sm border-b border-white/5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate({ to: "/menu" })}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white/80 ring-1 ring-white/20 transition hover:bg-white/20 hover:text-white active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-black text-white tracking-tight">Explorar Mesas</h1>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por código o nombre..."
              className="w-full bg-black/30 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[color:var(--brand-cyan)] transition-colors"
            />
          </div>

          {/* Tabs */}
          <div className="flex bg-black/20 p-1 rounded-xl">
            {(["todas", "publicas", "privadas"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all capitalize ${
                  tab === t 
                    ? "bg-white/10 text-white shadow-sm" 
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 pb-12 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <span className="text-white/60 font-bold animate-pulse">Buscando mesas...</span>
            </div>
          ) : filteredMesas.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-slide-up-soft">
              {filteredMesas.map((m) => {
                const playersCount = m.players ? Object.keys(m.players).length : 0;
                const isGameInProgress = m.status === "en-juego";

                return (
                  <button
                    key={m.id}
                    onClick={() => handleMesaClick(m)}
                    className="surface-card flex flex-col gap-2 rounded-2xl p-4 text-left transition hover:scale-[1.02] active:scale-95 border border-white/10 shadow-[var(--shadow-card)] relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-start justify-between gap-2 w-full relative z-10">
                      <span className="text-lg font-bold text-white leading-tight truncate flex items-center gap-2">
                        {m.name} 
                        {m.isVip && <Crown className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />}
                        {m.locked && <Lock className="w-4 h-4 text-[color:var(--brand-gold)] shrink-0" />}
                      </span>
                      <span className="flex items-center gap-1 rounded-full bg-[color:var(--brand-cyan)]/20 px-2 py-1 text-[10px] font-bold text-[color:var(--brand-cyan)] shrink-0">
                        <Users className="size-3" /> {playersCount}/{m.maxPlayers || 4}
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-1 text-xs text-white/60 mt-1 relative z-10">
                      <span className="flex justify-between w-full">
                        <span>Anfitrión: <strong className="text-white/90">{m.host}</strong></span>
                        <span className="text-white/40 tracking-wider">#{m.id}</span>
                      </span>
                      <span>Modo: <strong className="text-white/90">{m.mode === "normal" ? "Normal" : "Pozo"}</strong> ({m.size})</span>
                    </div>

                    {/* Badge de Límite de Tablas y Estatus */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-1 relative z-10">
                      <span className="flex items-center gap-1 rounded-full bg-amber-400/15 border border-amber-400/30 px-2.5 py-0.5 text-[11px] font-black text-amber-300 shadow-sm">
                        <LayoutGrid className="size-3" /> Límite: {m.perPlayer || 2} {m.perPlayer === 1 ? "tabla" : "tablas"}
                      </span>
                      {m.status === "programada" ? (
                        <span className="flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                          <Calendar className="size-3 text-amber-400" /> {m.scheduledDate ? `${m.scheduledDate} ${m.scheduledTime || ""}` : "Programada"}
                        </span>
                      ) : isGameInProgress ? (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> En juego
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-full bg-cyan-500/15 border border-cyan-500/25 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                          <span className="size-1.5 rounded-full bg-cyan-400" /> En espera
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between w-full pt-2.5 border-t border-white/10 relative z-10">
                      <span className="flex items-center gap-1.5 text-sm font-bold text-[color:var(--brand-gold)]">
                        <Coins className="size-4" /> {m.cost} c/u
                      </span>
                      <span className={`text-xs uppercase font-bold px-4 py-1.5 rounded-full shadow-sm ${
                        m.locked 
                          ? "bg-white/10 text-white/80" 
                          : m.status === "programada"
                            ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                            : isGameInProgress
                              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                              : "bg-[color:var(--brand-cyan)]/90 text-[color:var(--brand-navy-deep)] font-black"
                      }`}>
                        {m.locked ? "Desbloquear" : m.status === "programada" ? "Lobby VIP" : isGameInProgress ? "Espectar / Unirse" : "Elegir tablas"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 mt-10 surface-card rounded-3xl border border-white/5 border-dashed animate-pop-in">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-white/30" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No se encontraron mesas</h3>
              <p className="text-sm text-white/50 mb-6 max-w-xs">
                No hay mesas activas en este momento. ¡Sé el primero en iniciar una partida!
              </p>
              <button
                onClick={() => navigate({ to: "/abrir-mesa" })}
                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-[color:var(--brand-cyan)] to-blue-600 text-white font-bold text-sm active:scale-95 transition shadow-lg"
              >
                Crear una mesa ahora
              </button>
            </div>
          )}
        </main>

        {/* Password Modal */}
        {selectedMesa && typeof document !== "undefined" && createPortal(
          <div 
            onClick={() => setSelectedMesa(null)}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-[color:var(--brand-navy-deep)] w-full max-w-sm rounded-3xl p-6 ring-1 ring-white/10 shadow-2xl animate-pop-in border border-white/20 relative"
            >
              <button 
                type="button"
                onClick={() => setSelectedMesa(null)}
                className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition active:scale-95 touch-manipulation cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-16 h-16 rounded-full bg-[color:var(--brand-gold)]/20 text-[color:var(--brand-gold)] flex items-center justify-center mx-auto mb-4 border border-[color:var(--brand-gold)]/30">
                <Lock className="w-8 h-8" />
              </div>
              
              <h2 className="text-xl font-black text-white text-center mb-1">Mesa Privada</h2>
              <p className="text-white/60 text-center text-sm mb-6">Ingresa la contraseña para entrar a <strong>{selectedMesa.name}</strong></p>
              
              <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Contraseña..."
                  autoFocus
                  className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 px-4 text-center text-xl font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-[color:var(--brand-gold)] transition-colors shadow-inner"
                />
                
                {passwordError && (
                  <div className="flex items-center justify-center gap-1.5 text-red-400 text-sm font-bold bg-red-500/10 py-2 rounded-lg animate-shake">
                    <AlertCircle className="w-4 h-4" />
                    {passwordError}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={passwordInput.trim().length === 0}
                  className="w-full bg-[color:var(--brand-gold)] text-[color:var(--brand-navy-deep)] font-black py-4 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_5px_15px_rgba(255,215,0,0.3)] disabled:opacity-50 disabled:pointer-events-none mt-2 touch-manipulation cursor-pointer"
                >
                  Entrar a la mesa
                </button>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* Modal de Selección de Tablas antes de unirse */}
        <JoinTableSelectionModal
          open={Boolean(pendingJoinMesa)}
          mesa={pendingJoinMesa}
          onClose={() => setPendingJoinMesa(null)}
        />
      </div>
    </BrandBackground>
  );
}
