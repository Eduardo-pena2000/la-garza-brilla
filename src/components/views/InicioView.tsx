import { useEffect, useState } from "react";
import { Plus, Star, ChevronRight, Layers, Pointer, Menu, Users, Coins } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";
import cardsFan from "@/assets/cards-fan.png";
import trophy from "@/assets/trophy.png";
import featureJoin from "@/assets/feature-join.png";
import featureDecks from "@/assets/feature-decks.png";
import featureShop from "@/assets/feature-shop.png";
import avatarJuan from "@/assets/avatar-juan.png";
import avatarSofia from "@/assets/avatar-sofia.png";
import avatarAlex from "@/assets/avatar-alex.png";
import avatarFer from "@/assets/avatar-fer.png";
import colMuertos from "@/assets/col-muertos.jpg";
import colMexico from "@/assets/col-mexico.jpg";
import colAnimales from "@/assets/col-animales.jpg";
import colVintage from "@/assets/col-vintage.jpg";
import { NameModal } from "@/components/NameModal";

export function InicioView({ 
  onNavigateTienda, 
  onNavigateTablas,
  onOpenSidebar,
  onOpenPlayModal
}: { 
  onNavigateTienda: () => void;
  onNavigateTablas: () => void;
  onOpenSidebar: () => void;
}) {
  const navigate = useNavigate();
  const [name, setName] = useState("Invitado");
  const [coins, setCoins] = useState(500);
  const [isVIP, setIsVIP] = useState(false);
  const [isTutorial, setIsTutorial] = useState(false);
  const [publicMesas, setPublicMesas] = useState<any[]>([]);

  useEffect(() => {
    const mesasRef = ref(database, "mesas");
    const unsubscribe = onValue(mesasRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const publicList = Object.values(data)
          .filter((m: any) => m.status === "abierta" && !m.locked)
          .sort((a: any, b: any) => b.createdAt - a.createdAt)
          .slice(0, 4); // Limit to latest 4
        setPublicMesas(publicList);
      } else {
        setPublicMesas([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadState = () => {
      try {
        const stored = localStorage.getItem("garza:name");
        if (stored) setName(stored);

        const storedCoins = localStorage.getItem("garza:coins");
        if (storedCoins) setCoins(parseInt(storedCoins));
        else localStorage.setItem("garza:coins", "500");

        const storedVIP = localStorage.getItem("garza:vip");
        if (storedVIP === "true") setIsVIP(true);
        
        const storedTablas = localStorage.getItem("garza:tablas");
        if (!storedTablas || JSON.parse(storedTablas).length === 0) {
          setIsTutorial(true);
        } else {
          setIsTutorial(false);
        }
      } catch {
        /* ignore */
      }
    };
    
    loadState();
    window.addEventListener("garza:tablas-updated", loadState);
    return () => window.removeEventListener("garza:tablas-updated", loadState);
  }, []);

  const features = [
    { img: null, title: "Crear mesa", desc: "Inicia tu propia partida", onClick: () => navigate({ to: "/abrir-mesa" }) },
    { img: featureJoin, title: "Unirse a mesa", desc: "Entra a una mesa con código", onClick: () => navigate({ to: "/unirse" }) },
    { img: featureDecks, title: "Mis barajas", desc: "Administra tus barajas", onClick: onNavigateTablas },
    { img: featureShop, title: "Tienda", desc: "Compra monedas, barajas y más", onClick: onNavigateTienda },
  ];

  const friends = [
    { name: "Juan", img: avatarJuan },
    { name: "Sofía", img: avatarSofia },
    { name: "Alex", img: avatarAlex },
    { name: "Fer", img: avatarFer },
  ];

  const collections = [
    { name: "Día de Muertos", img: colMuertos, isNew: true },
    { name: "México Lindo", img: colMexico, isNew: true },
    { name: "Animales", img: colAnimales, isNew: false },
    { name: "Vintage", img: colVintage, isNew: false },
  ];

  return (
    <div className="flex flex-col mx-auto h-full w-full max-w-md pb-28 pt-5 overflow-y-auto overflow-x-hidden relative">
      {/* Overlay para el tutorial */}
      {isTutorial && (
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm pointer-events-auto" />
      )}

      {/* Top bar */}
      <header className="flex items-center justify-end px-4 relative z-10 shrink-0">
        <div className="surface-card flex items-center gap-2 rounded-full py-1.5 pr-1.5 pl-2">
          <span className="btn-gold flex size-8 items-center justify-center rounded-full">
            <Star className="size-4 fill-current" />
          </span>
          <span className="text-lg font-bold">{coins.toLocaleString()}</span>
          <span className="btn-gold flex size-8 items-center justify-center rounded-full cursor-pointer hover:scale-105 transition" onClick={onNavigateTienda}>
            <Plus className="size-5" />
          </span>
        </div>
      </header>

      {/* Logo */}
      <div className="relative mx-auto -mt-6 flex w-36 items-center justify-center z-10 shrink-0">
        <img
          src="/logo-garza.png?v=2"
          alt="Logo Lotería La Garza"
          width={1920}
          height={1920}
          className="relative w-36 h-36 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.55)]"
        />
      </div>

      {/* Hero */}
      <section className="relative px-4 z-10 shrink-0 mt-4">
        <img
          src={cardsFan}
          alt="Cartas de lotería"
          width={912}
          height={800}
          loading="lazy"
          className="pointer-events-none absolute -top-12 -right-2 w-56 drop-shadow-[0_12px_28px_rgba(0,0,0,0.5)]"
        />
        <h1 className="relative text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <span className="truncate max-w-[220px]">¡Hola, {name}!</span> <span aria-hidden className="shrink-0">👋</span>
        </h1>
        <p className="relative mt-2 max-w-[9rem] text-lg leading-tight text-muted-foreground">
          ¿Listo para cantar una partida?
        </p>

        {isTutorial && (
          <button
            onClick={() => navigate({ to: "/abrir-mesa" })}
            className="group relative flex w-full flex-col items-center justify-center overflow-hidden rounded-3xl p-6 shadow-2xl transition hover:shadow-3xl z-50 animate-pop-in border-2 border-[color:var(--brand-cyan)] bg-[color:var(--brand-navy)]"
          >
            <Layers className="size-6" />
            JUGAR AHORA
          </button>
        )}
        
        {!isTutorial && (
          <button 
            onClick={onOpenPlayModal}
            className="btn-gold relative mt-6 mb-4 flex w-[68%] items-center justify-center gap-3 rounded-full py-4 text-xl font-extrabold tracking-wide hover:scale-105 active:scale-95 transition"
          >
            <Layers className="size-6" />
            JUGAR AHORA
          </button>
        )}
      </section>

      {/* Features */}
      <section className="mt-4 grid grid-cols-4 gap-2 px-4 relative z-50 shrink-0">
        {features.map((f) => {
          const isTarget = isTutorial && f.title === "Mis barajas";
          return (
            <div key={f.title} className="relative">
              {isTarget && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-50 animate-bounce flex flex-col items-center gap-1">
                  <div className="bg-[color:var(--brand-cyan)] text-[color:var(--brand-navy-deep)] text-[10px] font-black uppercase px-2 py-1 rounded-full shadow-lg whitespace-nowrap">Haz clic aquí</div>
                  <Pointer className="w-8 h-8 text-[color:var(--brand-cyan)] drop-shadow-[0_0_8px_rgba(0,255,255,0.8)] rotate-180" />
                </div>
              )}
              <button
                onClick={f.onClick}
                className={`surface-card flex flex-col items-center gap-2 rounded-2xl px-2 py-3 text-center w-full h-full ${
                  isTarget ? "ring-4 ring-[color:var(--brand-cyan)] scale-105 shadow-[0_0_20px_rgba(0,255,255,0.5)]" : ""
                } ${isTutorial && !isTarget ? "opacity-30 pointer-events-none" : "hover:scale-105 active:scale-95 transition"}`}
              >
                {f.img ? (
                  <img
                    src={f.img}
                    alt=""
                    width={512}
                    height={512}
                    loading="lazy"
                    className="size-14 object-contain"
                  />
                ) : (
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-accent text-white">
                    <Plus className="size-8" />
                  </span>
                )}
                <span className="text-[11px] font-bold leading-tight">{f.title}</span>
              </button>
            </div>
          );
        })}
      </section>

      {/* Tournament */}
      <section className={`surface-card mx-4 mt-4 flex items-center gap-2 rounded-3xl p-3 relative z-10 shrink-0 ${isTutorial ? "opacity-30 pointer-events-none" : ""}`}>
        <img
          src={trophy}
          alt="Trofeo del torneo"
          width={600}
          height={600}
          loading="lazy"
          className="size-24 shrink-0 object-contain"
        />
        <div className="min-w-0 flex-1 text-center">
          <span className="inline-block rounded-full bg-accent px-3 py-1 text-[10px] font-bold tracking-wide text-white">
            TORNEO DE ESTA SEMANA
          </span>
          <p className="mt-1 text-lg font-extrabold">GRAN PREMIO</p>
          <p className="text-3xl leading-none font-extrabold text-[color:var(--gold)]">
            $5,000 <span className="text-sm">MXN</span>
          </p>
        </div>
        <div className="w-[5.5rem] shrink-0 text-center">
          <div className="rounded-2xl bg-secondary px-2 py-2">
            <p className="text-[10px] font-bold text-[color:var(--secondary-foreground)]">TERMINA EN</p>
            <p className="text-sm font-bold text-[color:var(--gold)]">2d 14h</p>
          </div>
          <button className="btn-gold mt-2 w-full rounded-full py-1.5 text-xs font-bold hover:scale-105 active:scale-95 transition">
            Participar
          </button>
        </div>
      </section>

      {/* Public Mesas */}
      <section className={`mt-5 relative z-10 shrink-0 mb-10 ${isTutorial ? "opacity-30 pointer-events-none" : ""}`}>
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="text-base font-bold text-white">Mesas públicas</h2>
          <button 
            onClick={() => navigate({ to: "/unirse" })}
            className="flex items-center gap-1 text-sm text-white/50 hover:text-white transition"
          >
            Ver todas <ChevronRight className="size-4" />
          </button>
        </div>
        
        {publicMesas.length > 0 ? (
          <div className="flex overflow-x-auto gap-3 px-4 pb-4 hide-scrollbar snap-x">
            {publicMesas.map((m) => {
              const playersCount = m.players ? Object.keys(m.players).length : 0;
              return (
                <button
                  key={m.id}
                  onClick={() => navigate({ to: "/mesa/$id", params: { id: m.id } })}
                  className="surface-card flex flex-col gap-2 rounded-2xl p-3 text-left transition active:scale-95 border border-white/5 w-48 shrink-0 snap-start shadow-[var(--shadow-card)]"
                >
                  <div className="flex items-start justify-between gap-1 w-full">
                    <span className="text-sm font-bold text-white leading-tight truncate">{m.name}</span>
                    <span className="flex items-center gap-1 rounded-full bg-[color:var(--brand-cyan)]/20 px-1.5 py-0.5 text-[9px] font-bold text-[color:var(--brand-cyan)] shrink-0">
                      <Users className="size-3" /> {playersCount}/4
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 text-[10px] text-white/60">
                    <span>Host: {m.host}</span>
                    <span>Modo: {m.mode === "normal" ? "Normal" : "Pozo"} ({m.size})</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between w-full pt-2 border-t border-white/5">
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[color:var(--brand-gold)]">
                      <Coins className="size-3" /> {m.cost} c/u
                    </span>
                    <span className="text-[9px] uppercase font-bold bg-white/10 px-2 py-1 rounded-full text-white/80">
                      Entrar
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-3 px-4">
            <div className="surface-card rounded-2xl p-4 text-center border border-white/5 border-dashed">
              <p className="text-sm font-bold text-white/60">No hay mesas públicas disponibles</p>
              <p className="text-xs text-white/40 mt-1">¡Crea una nueva partida e invita a tus amigos!</p>
            </div>
          </div>
        )}
      </section>

      {/* Collections */}
      <section className={`mt-5 relative z-10 shrink-0 pb-6 ${isTutorial ? "opacity-30 pointer-events-none" : ""}`}>
        <div className="flex items-center justify-between px-4">
          <h2 className="text-base font-bold">
            Nuevas colecciones <span aria-hidden>🔥</span>
          </h2>
          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-white transition">
            Ver todas <ChevronRight className="size-4" />
          </button>
        </div>
        <div className="mt-2 flex gap-3 overflow-x-auto px-4 snap-x">
          {collections.map((c) => (
            <div
              key={c.name}
              className="surface-card relative w-32 shrink-0 overflow-hidden rounded-2xl snap-start cursor-pointer hover:scale-[1.02] transition"
              onClick={onNavigateTienda}
            >
              {c.isNew && (
                <span className="absolute top-2 right-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white z-10 shadow-md">
                  NUEVA
                </span>
              )}
              <img
                src={c.img}
                alt={c.name}
                width={512}
                height={512}
                loading="lazy"
                className="h-28 w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
              <p className="absolute bottom-2 left-0 right-0 text-center text-xs font-bold text-white drop-shadow-md px-1">{c.name}</p>
            </div>
          ))}
        </div>
      </section>

      <NameModal />
    </div>
  );
}
