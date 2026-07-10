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
  ShieldOff,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { BrandBackground } from "@/components/BrandBackground";
import { NameModal } from "@/components/NameModal";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menú — Lotería La Garza" },
      { name: "description", content: "Elige tu modo de juego en Lotería La Garza." },
    ],
  }),
  component: MenuPage,
});

type IconType = React.ComponentType<{ className?: string }>;

interface ActionCard {
  label: string;
  icon: IconType;
  gradient: string;
  onClick?: () => void;
}

function MenuPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [name, setName] = useState("Invitado");
  const [editName, setEditName] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("garza:name");
      if (stored) setName(stored);
    } catch {
      /* ignore */
    }
  }, []);

  const actions: ActionCard[] = [
    { label: "Crear mesa", icon: PlusCircle, gradient: "var(--gradient-card-pink)", onClick: () => navigate({ to: "/abrir-mesa" }) },
    { label: "Unirse a mesa pública", icon: Users, gradient: "var(--gradient-card-teal)" },
    { label: "Mis barajas", icon: LayoutGrid, gradient: "var(--gradient-card-cyan)", onClick: () => navigate({ to: "/tablas" }) },
    { label: "Quitar publicidad", icon: ShieldOff, gradient: "var(--gradient-card-gold)" },
  ];

  return (
    <BrandBackground>
      <header className="relative z-10 flex items-center justify-between px-5 pt-5 animate-slide-up-soft">
        <button
          type="button"
          aria-label="Abrir menú"
          onClick={() => setSidebarOpen(true)}
          className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/15 transition hover:bg-white/20 hover:scale-105 active:scale-95"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Buscar"
            className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/15 transition hover:bg-white/20 hover:scale-105 active:scale-95"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Idioma"
            className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/15 transition hover:bg-white/20 hover:scale-105 active:scale-95"
          >
            <Languages className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Centered logo block */}
      <section className="relative z-10 mt-6 flex flex-col items-center px-6">
        <BrandLogo size={170} />
        <h1 className="mt-4 text-2xl font-extrabold tracking-wide animate-slide-up-soft" style={{ animationDelay: "0.15s" }}>
          Lotería <span className="text-[color:var(--brand-cyan)]">La Garza</span>
        </h1>
        <button
          type="button"
          onClick={() => setEditName(true)}
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 ring-1 ring-white/15 transition hover:bg-white/20 animate-slide-up-soft"
          style={{ animationDelay: "0.25s" }}
        >
          👋 Hola, <span className="font-semibold text-white">{name}</span>
        </button>
      </section>

      <main className="relative z-10 mx-auto mt-8 w-full max-w-md space-y-7 px-5 pb-10">
        <CardStack title="Jugar" cards={actions} startDelay={0.3} />

        <button
          type="button"
          onClick={() => navigate({ to: "/configuracion" })}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 text-sm font-semibold text-white/90 backdrop-blur transition hover:bg-white/10 active:scale-[0.98] animate-slide-up-soft"
          style={{ animationDelay: "0.8s" }}
        >
          <Settings className="h-4 w-4" /> Configuración
        </button>

        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 text-sm font-semibold text-white/90 backdrop-blur transition hover:bg-white/10 active:scale-[0.98] animate-slide-up-soft"
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
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              type="button"
              onClick={card.onClick}
              className="group relative flex h-16 w-full items-center gap-4 overflow-hidden rounded-full px-3 pr-5 text-left text-white shadow-[var(--shadow-card)] ring-1 ring-white/25 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-10px_rgba(0,0,0,0.55)] active:scale-[0.98] animate-slide-up-soft"
              style={{
                background: card.gradient,
                animationDelay: `${startDelay + 0.08 * (idx + 1)}s`,
              }}
            >
              {/* glossy top highlight */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-3 top-1 h-3 rounded-full bg-white/30 blur-[2px]"
              />
              {/* shimmer sweep */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ animation: "shimmer-x 2.4s ease-in-out infinite" }}
              />
              <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/95 text-[color:var(--brand-navy-deep)] shadow-inner ring-2 ring-white/60 transition group-hover:scale-105 group-hover:rotate-[-4deg]">
                <Icon className="h-5 w-5" />
              </span>
              <span className="relative flex-1 text-[15px] font-bold drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
                {card.label}
              </span>
              <ChevronRight className="relative h-5 w-5 text-white/85 transition group-hover:translate-x-1" />
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
  const items: { label: string; icon: IconType }[] = [
    { label: "Configuración", icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label="Cerrar menú"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      <aside
        className="absolute left-0 top-0 flex h-full w-[82%] max-w-xs flex-col bg-white text-[color:var(--brand-navy-dark)] shadow-2xl"
      >
        <div
          className="relative px-5 pb-6 pt-7 text-white"
          style={{ background: "var(--gradient-brand)" }}
        >
          <button
            type="button"
            onClick={onEditName}
            className="flex items-center gap-3 text-left"
          >
            <div className="grid h-14 w-14 place-items-center rounded-full bg-white/15 ring-2 ring-white/30">
              <span className="text-xl font-bold">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="text-base font-semibold">{name}</div>
              <div className="text-xs text-white/70">Editar perfil</div>
            </div>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {items.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm font-medium text-[color:var(--brand-navy-dark)] transition hover:bg-[color:var(--muted)]"
            >
              <Icon className="h-5 w-5 text-[color:var(--brand-navy-deep)]" />
              <span>{label}</span>
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