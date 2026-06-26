import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Settings,
  Layers,
  Compass,
  Ban,
  Trophy,
  BarChart3,
  Star,
  Link2,
  Facebook,
  Trash2,
  Info,
  LogOut,
  Search,
  Languages,
  Menu as MenuIcon,
  ChevronRight,
  LayoutGrid,
  PlusCircle,
  Users,
  WifiOff,
  Gamepad2,
  Dices,
  ShieldOff,
  HeadphonesIcon,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
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

  const primaryActions: ActionCard[] = [
    { label: "Mis tablas", icon: LayoutGrid, gradient: "var(--gradient-card-cyan)" },
    { label: "Abrir mesa", icon: PlusCircle, gradient: "var(--gradient-card-pink)" },
    { label: "Mesas Públicas", icon: Users, gradient: "var(--gradient-card-teal)" },
    { label: "Jugar Offline", icon: WifiOff, gradient: "var(--gradient-card-cyan)" },
  ];

  const secondaryActions: ActionCard[] = [
    { label: "Baraja Lotería", icon: Gamepad2, gradient: "var(--gradient-card-gold)" },
    { label: "Bingo Online", icon: Dices, gradient: "var(--gradient-card-pink)" },
    { label: "Quitar Publicidad", icon: ShieldOff, gradient: "var(--gradient-card-gold)" },
    { label: "¿Necesitas ayuda?", icon: HeadphonesIcon, gradient: "var(--gradient-card-teal)" },
  ];

  return (
    <div
      className="relative min-h-screen w-full text-white"
      style={{ background: "var(--gradient-brand)" }}
    >
      {/* decorative */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-40"
        style={{
          background:
            "radial-gradient(60% 70% at 50% 0%, var(--brand-cyan) 0%, transparent 70%)",
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-5 pt-5">
        <button
          type="button"
          aria-label="Abrir menú"
          onClick={() => setSidebarOpen(true)}
          className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/15 transition active:scale-95"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Buscar"
            className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/15 transition active:scale-95"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Idioma"
            className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/15 transition active:scale-95"
          >
            <Languages className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Centered logo block */}
      <section className="relative z-10 mt-6 flex flex-col items-center px-6">
        <BrandLogo size={170} />
        <h1 className="mt-4 text-xl font-bold tracking-wide">
          Lotería <span className="text-[color:var(--brand-cyan)]">La Garza</span>
        </h1>
        <button
          type="button"
          onClick={() => setEditName(true)}
          className="mt-1 text-sm text-white/70 hover:text-white"
        >
          Hola, <span className="font-semibold text-white">{name}</span>
        </button>
      </section>

      <main className="relative z-10 mx-auto mt-8 w-full max-w-md space-y-6 px-5 pb-10">
        <CardStack title="Jugar" cards={primaryActions} />
        <CardStack title="Más" cards={secondaryActions} />

        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 text-sm font-semibold text-white/90 backdrop-blur transition active:scale-[0.98]"
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
    </div>
  );
}

function CardStack({ title, cards }: { title: string; cards: ActionCard[] }) {
  return (
    <section>
      <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
        {title}
      </h2>
      <div className="space-y-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              type="button"
              onClick={card.onClick}
              className="group flex h-16 w-full items-center gap-4 rounded-2xl bg-white/8 px-3 text-left ring-1 ring-white/10 backdrop-blur transition active:scale-[0.99] hover:bg-white/12"
            >
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white shadow-[var(--shadow-card)]"
                style={{ background: card.gradient }}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="flex-1 text-[15px] font-semibold">{card.label}</span>
              <ChevronRight className="h-5 w-5 text-white/50 transition group-hover:translate-x-0.5 group-hover:text-white/80" />
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
    { label: "Barajas Personalizadas", icon: Layers },
    { label: "Explorador de Modos", icon: Compass },
    { label: "Usuarios bloqueados", icon: Ban },
    { label: "Historial", icon: Trophy },
    { label: "Clasificación", icon: BarChart3 },
    { label: "Logros", icon: Star },
    { label: "Unir por link", icon: Link2 },
    { label: "Síguenos en Facebook", icon: Facebook },
    { label: "Eliminar cuenta", icon: Trash2 },
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

        <div className="border-t border-[color:var(--border)] p-3">
          <button
            type="button"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--brand-gold)] text-sm font-semibold text-[color:var(--brand-navy-dark)] shadow-sm active:scale-[0.98]"
          >
            <Star className="h-4 w-4" /> Calificar App
          </button>
        </div>
      </aside>
    </div>
  );
}