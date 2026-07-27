import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Settings,
  Info,
  LogOut,
  Search,
  Languages,
  Menu as MenuIcon,
  ChevronRight,
  LayoutGrid,
  PlusCircle,
  Users,
  Crown,
  Store,
  X,
  CheckCircle,
  Gift,
  Image as ImageIcon,
  Zap,
} from "lucide-react";
import { BrandBackground } from "@/components/BrandBackground";
import { PapelPicado, SarapeBand, Wordmark } from "@/components/Fiesta";
import { NameModal } from "@/components/NameModal";
import { CoinAnimation } from "@/components/CoinAnimation";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menú — Lotería La Garza" },
      { name: "description", content: "Elige tu modo de juego en Lotería La Garza." },
    ],
  }),
  component: MenuPage,
});

interface ActionCard {
  label: string;
  emoji: string;
  gradient: string;
  onClick?: () => void;
}

function MenuPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [name, setName] = useState("Invitado");
  const [editName, setEditName] = useState(false);
  const [coins, setCoins] = useState(500);
  const [isVIP, setIsVIP] = useState(false);
  const [activeModal, setActiveModal] = useState<"vip" | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("garza:name");
      if (stored) setName(stored);

      const storedCoins = localStorage.getItem("garza:coins");
      if (storedCoins) setCoins(parseInt(storedCoins));
      else localStorage.setItem("garza:coins", "500");

      const storedVIP = localStorage.getItem("garza:vip");
      if (storedVIP === "true") setIsVIP(true);
    } catch {
      /* ignore */
    }
  }, []);

  const actions: ActionCard[] = [
    { label: "Crear mesa", emoji: "🪅", gradient: "var(--gradient-card-pink)", onClick: () => navigate({ to: "/abrir-mesa" }) },
    { label: "Unirse a mesa pública", emoji: "🎺", gradient: "var(--gradient-card-teal)" },
    { label: "Mis barajas", emoji: "🌵", gradient: "var(--gradient-card-cyan)", onClick: () => navigate({ to: "/tablas" }) },
    { label: "Tienda", emoji: "🌶️", gradient: "var(--gradient-card-teal)", onClick: () => navigate({ to: "/tienda" }) },
    { label: "Conviértete en VIP", emoji: "👑", gradient: "var(--gradient-card-gold)", onClick: () => setActiveModal("vip") },
  ];

  return (
    <BrandBackground>
      <PapelPicado />
      <header className="relative z-30 flex items-center justify-between px-5 pt-16 animate-slide-up-soft">
        <button
          type="button"
          aria-label="Abrir menú"
          onClick={() => setSidebarOpen(true)}
          className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 backdrop-blur ring-1 ring-[color:var(--brand-gold)]/40 transition hover:bg-white/20 hover:scale-105 active:scale-95"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full ring-1 ring-[color:var(--brand-gold)] shadow-[0_0_10px_rgba(255,215,0,0.2)]">
            <CoinAnimation className="w-5 h-5 drop-shadow-md" />
            <span className="font-extrabold text-[color:var(--brand-gold)] tracking-wide">{coins}</span>
          </div>
          <button
            type="button"
            aria-label="Idioma"
            className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 backdrop-blur ring-1 ring-[color:var(--brand-gold)]/40 transition hover:bg-white/20 hover:scale-105 active:scale-95"
          >
            <Languages className="h-5 w-5" />
          </button>
        </div>

      </header>

      {/* Wordmark central en marco de talavera */}
      <section className="relative z-10 mt-5 flex flex-col items-center px-5">
        <div className="relative w-full max-w-md animate-pop-in">
          <div className="pointer-events-none absolute -inset-3 rounded-[2rem] opacity-60 blur-2xl" style={{ background: "radial-gradient(60% 60% at 50% 40%, var(--brand-pink), transparent 70%)" }} />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/20 bg-white/5 px-5 py-6 backdrop-blur-sm shadow-[var(--shadow-brand)]">
            <SarapeBand className="absolute inset-x-0 top-0" />
            <SarapeBand className="absolute inset-x-0 bottom-0" />
            <Wordmark size="md" />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEditName(true)}
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 ring-1 ring-[color:var(--brand-gold)]/40 transition hover:bg-white/20 animate-slide-up-soft"
          style={{ animationDelay: "0.25s" }}
        >
          👋 Hola, <span className="font-semibold text-white">{name}</span>
        </button>
      </section>

      <main className="relative z-10 mx-auto mt-7 w-full max-w-md space-y-7 px-5 pb-14">
        <CardStack title="Jugar" cards={actions} startDelay={0.3} />

        <button
          type="button"
          onClick={() => navigate({ to: "/configuracion" })}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[color:var(--brand-gold)]/30 bg-white/5 text-sm font-semibold text-white/90 backdrop-blur transition hover:bg-white/10 active:scale-[0.98] animate-slide-up-soft"
          style={{ animationDelay: "0.8s" }}
        >
          <Settings className="h-4 w-4" /> Configuración
        </button>

        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[color:var(--brand-gold)]/30 bg-white/5 text-sm font-semibold text-white/90 backdrop-blur transition hover:bg-white/10 active:scale-[0.98] animate-slide-up-soft"
          style={{ animationDelay: "0.9s" }}
        >
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </button>
      </main>

      {sidebarOpen && (
        <Sidebar name={name} onClose={() => setSidebarOpen(false)} onEditName={() => { setSidebarOpen(false); setEditName(true); }} />
      )}

      <NameModal
        open={editName}
        initial={name === "Invitado" ? "" : name}
        onClose={() => setEditName(false)}
        onSave={(value) => {
          setName(value);
          try {
            localStorage.setItem("garza:name", value);
          } catch {
            /* ignore */
          }
          setEditName(false);
        }}
      />

      {/* --- MODAL VIP --- */}
      {activeModal === "vip" && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-pop-in">
          <div className="bg-[color:var(--brand-navy-deep)] w-full max-w-sm rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(255,215,0,0.15)] flex flex-col border border-[color:var(--brand-gold)]/30 relative">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 p-6 text-center relative overflow-hidden">
              <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-black/50 hover:text-black transition-colors"><X className="w-6 h-6" /></button>
              <Crown className="w-16 h-16 text-black/80 mx-auto mb-2 drop-shadow-md" />
              <h3 className="text-black font-black text-2xl drop-shadow-sm uppercase tracking-wider">Garza VIP</h3>
              <p className="text-black/80 font-bold text-sm">La experiencia definitiva</p>
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-white/20 -skew-x-12 translate-x-[-150%] animate-[shimmer-x_3s_infinite]" />
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-5">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-[color:var(--brand-cyan)] shrink-0" />
                  <div>
                    <h4 className="text-white font-bold">Cero Anuncios</h4>
                    <p className="text-white/60 text-sm">Juega sin interrupciones molestas para siempre.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-[color:var(--brand-cyan)] shrink-0" />
                  <div>
                    <h4 className="text-white font-bold">Salas Premium</h4>
                    <p className="text-white/60 text-sm">Crea mesas donde ni tú ni tus amigos verán publicidad.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-[color:var(--brand-cyan)] shrink-0" />
                  <div>
                    <h4 className="text-white font-bold">Stickers Exclusivos</h4>
                    <p className="text-white/60 text-sm">Desbloquea el paquete animado VIP en el chat.</p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                {isVIP ? (
                  <button className="w-full py-4 rounded-xl bg-white/10 text-white font-black opacity-50 cursor-not-allowed">
                    ¡Ya eres VIP!
                  </button>
                ) : (
                  <button onClick={() => { setIsVIP(true); localStorage.setItem("garza:vip", "true"); setActiveModal(null); }} className="w-full py-4 rounded-xl bg-gradient-to-r from-[color:var(--brand-gold)] to-yellow-500 text-black font-black text-lg shadow-lg active:scale-95 transition-transform uppercase tracking-widest">
                    Suscribirse $4.99/mes
                  </button>
                )}
                <p className="text-center text-white/40 text-[10px] mt-3">Suscripción mensual, cancela cuando quieras.</p>
              </div>
            </div>
          </div>
        </div>
      )}



    </BrandBackground>
  );
}

function CardStack({ title, cards, startDelay = 0 }: { title: string; cards: ActionCard[]; startDelay?: number }) {
  return (
    <section>
      <h2
        className="mb-3 flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/70 animate-slide-up-soft"
        style={{ animationDelay: `${startDelay}s` }}
      >
        <span className="h-px w-6 bg-white/40" />
        {title}
        <span className="h-px flex-1 bg-white/15" />
      </h2>
      <div className="space-y-3">
        {cards.map((card, idx) => {
          return (
            <button
              key={card.label}
              type="button"
              onClick={card.onClick}
              className="group relative flex h-[76px] w-full items-center gap-4 overflow-hidden rounded-[20px] px-3 pr-5 text-left text-white shadow-[var(--shadow-card)] ring-1 ring-white/10 transition-transform duration-200 hover:-translate-y-1 active:translate-y-1 active:shadow-none animate-slide-up-soft border-b-[6px] border-black/30"
              style={{
                background: card.gradient,
                animationDelay: `${startDelay + 0.08 * (idx + 1)}s`,
              }}
            >
              {/* franja de sarape lateral */}
              <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-2 sarape-band animate-sarape-slide" />
              {/* glossy top highlight */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-3 top-1 h-3 rounded-full bg-white/20 blur-[2px]"
              />
              {/* shimmer sweep */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ animation: "shimmer-x 2.4s ease-in-out infinite" }}
              />
              <span className="relative grid h-[52px] w-[52px] shrink-0 place-items-center rounded-2xl bg-white/10 text-3xl shadow-inner ring-1 ring-white/30 transition group-hover:scale-110 group-hover:rotate-[-5deg] animate-bounce" style={{animationDuration: "3s"}}>
                <span className="drop-shadow-lg">{card.emoji}</span>
              </span>
              <span className="relative flex-1 text-[16px] font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] tracking-wide">
                {card.label}
              </span>
              <ChevronRight className="relative h-6 w-6 text-white/50 transition group-hover:text-white group-hover:translate-x-1" />
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Sidebar({
  name,
  onClose,
  onEditName,
}: {
  name: string;
  onClose: () => void;
  onEditName: () => void;
}) {
  const navigate = useNavigate();
  const items: { label: string; emoji: string; onClick?: () => void }[] = [
    { label: "Crear mesa", emoji: "🎲", onClick: () => { onClose(); navigate({ to: "/abrir-mesa" }); } },
    { label: "Unirse a mesa", emoji: "🌍", onClick: () => onClose() },
    { label: "Mis barajas", emoji: "🃏", onClick: () => { onClose(); navigate({ to: "/tablas" }); } },
    { label: "Tienda", emoji: "🏪", onClick: () => { onClose(); navigate({ to: "/tienda" }); } },
    { label: "VIP", emoji: "👑", onClick: () => { onClose(); /* Handle VIP from sidebar if needed, or redirect to a VIP page. For now just close */ } },
    { label: "Configuración", emoji: "⚙️", onClick: () => { onClose(); navigate({ to: "/configuracion" }); } },
  ];

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label="Cerrar menú"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-pop-in"
        style={{ animationDuration: "0.3s" }}
      />
      <aside
        className="absolute left-0 top-0 flex h-full w-[82%] max-w-xs flex-col bg-[color:var(--brand-navy-deep)] text-white shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-slide-in-left border-r border-white/10"
      >
        <div
          className="relative px-5 pb-6 pt-7 text-white border-b border-white/10"
          style={{ background: "var(--gradient-brand)" }}
        >
          <button
            type="button"
            onClick={onEditName}
            className="flex items-center gap-3 text-left w-full"
          >
            <div className="grid h-14 w-14 place-items-center rounded-full bg-white/10 ring-2 ring-[color:var(--brand-gold)] shadow-[0_0_15px_rgba(255,215,0,0.2)]">
              <span className="text-2xl font-black text-[color:var(--brand-gold)] drop-shadow-md">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="text-lg font-black tracking-wide drop-shadow-md">{name}</div>
              <div className="text-xs text-white/50 uppercase tracking-widest font-bold">Editar perfil</div>
            </div>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
          {items.map(({ label, emoji, onClick }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              className="group flex w-full items-center gap-4 px-4 py-3 text-left text-base font-bold text-white/90 transition-all hover:bg-white/10 hover:translate-x-1 rounded-2xl active:scale-95"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-black/30 text-2xl shadow-inner ring-1 ring-white/20 transition-transform group-hover:scale-110 group-hover:rotate-[-5deg]">
                <span className="drop-shadow-lg">{emoji}</span>
              </div>
              <span className="drop-shadow-sm">{label}</span>
            </button>
          ))}

          <div className="mt-2 flex items-center justify-between px-5 py-3 text-sm text-[color:var(--muted-foreground)]">
            <span className="inline-flex items-center gap-2">
              <Info className="h-4 w-4" /> Versión
            </span>
            <span>1.0.0</span>
          </div>
        </nav>

        <div className="border-t border-[color:var(--border)] p-3" />
      </aside>
    </div>
  );
}