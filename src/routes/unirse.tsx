import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { ArrowLeft, Users, Coins, Search, Lock, X, AlertCircle } from "lucide-react";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";
import { BrandBackground } from "@/components/BrandBackground";

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

  useEffect(() => {
    const mesasRef = ref(database, "mesas");
    const unsubscribe = onValue(mesasRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Obtenemos solo las mesas abiertas
        const activeList = Object.values(data)
          .filter((m: any) => m.status === "abierta")
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
      navigate({ to: "/mesa/$id", params: { id: mesa.id } });
    }
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMesa) return;
    
    if (passwordInput === selectedMesa.password) {
      navigate({ to: "/mesa/$id", params: { id: selectedMesa.id } });
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
                        {m.locked && <Lock className="w-4 h-4 text-[color:var(--brand-gold)]" />}
                      </span>
                      <span className="flex items-center gap-1 rounded-full bg-[color:var(--brand-cyan)]/20 px-2 py-1 text-[10px] font-bold text-[color:var(--brand-cyan)] shrink-0">
                        <Users className="size-3" /> {playersCount}/4
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-1 text-xs text-white/60 mt-1 relative z-10">
                      <span className="flex justify-between w-full">
                        <span>Anfitrión: <strong className="text-white/90">{m.host}</strong></span>
                        <span className="text-white/40 tracking-wider">#{m.id}</span>
                      </span>
                      <span>Modo: <strong className="text-white/90">{m.mode === "normal" ? "Normal" : "Pozo"}</strong> ({m.size})</span>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between w-full pt-3 border-t border-white/10 relative z-10">
                      <span className="flex items-center gap-1.5 text-sm font-bold text-[color:var(--brand-gold)]">
                        <Coins className="size-4" /> {m.cost} c/u
                      </span>
                      <span className={`text-xs uppercase font-bold px-4 py-1.5 rounded-full shadow-sm ${
                        m.locked 
                          ? "bg-white/10 text-white/80" 
                          : "bg-[color:var(--brand-cyan)]/90 text-[color:var(--brand-navy-deep)]"
                      }`}>
                        {m.locked ? "Desbloquear" : "Entrar"}
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
              <p className="text-sm text-white/50 mb-6">
                No hay mesas disponibles que coincidan con tu búsqueda o filtros.
              </p>
            </div>
          )}
        </main>

        {/* Password Modal */}
        {selectedMesa && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-[color:var(--brand-navy-deep)] w-full max-w-sm rounded-3xl p-6 ring-1 ring-white/10 shadow-2xl animate-pop-in border border-white/20 relative">
              <button 
                onClick={() => setSelectedMesa(null)}
                className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition active:scale-95"
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
                  className="w-full bg-[color:var(--brand-gold)] text-[color:var(--brand-navy-deep)] font-black py-4 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_5px_15px_rgba(255,215,0,0.3)] disabled:opacity-50 disabled:pointer-events-none mt-2"
                >
                  Entrar a la mesa
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </BrandBackground>
  );
}
