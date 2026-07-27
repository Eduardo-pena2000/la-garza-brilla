import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Users,
  Zap,
  Trophy,
  Timer,
  Lock,
  LockOpen,
  Eye,
  EyeOff,
  LayoutGrid,
  Sparkles,
  PlusCircle,
  PartyPopper,
  AlertCircle,
} from "lucide-react";
import { BrandBackground } from "@/components/BrandBackground";
import { PapelPicado } from "@/components/Fiesta";
import { getCard } from "@/lib/deck";
import { ref, push, set } from "firebase/database";
import { database } from "@/lib/firebase";

export const Route = createFileRoute("/abrir-mesa")({
  head: () => ({
    meta: [
      { title: "Abrir mesa — Lotería La Garza" },
      { name: "description", content: "Configura y abre una nueva mesa de Lotería La Garza." },
    ],
  }),
  component: AbrirMesaPage,
});

type Size = "4x4" | "5x5";
type Mode = "clasico" | "relampago" | "chorro" | "lleno";

interface Tabla {
  id: string;
  size: Size;
  cards: number[];
  createdAt: number;
}

const TABLAS_KEY = "garza:tablas";
const MESAS_KEY = "garza:mesas";
const NAME_KEY = "garza:name";

function loadTablas(): Tabla[] {
  try {
    const raw = localStorage.getItem(TABLAS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Tabla[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const STEPS = ["Nombre", "Modo", "Tablas", "Acceso", "Elegir"] as const;

const MODES: { id: Mode; label: string; hint: string; icon: React.ComponentType<{ className?: string }>; gradient: string }[] = [
  { id: "clasico", label: "Clásico", hint: "Cuatro en línea, columna, fila o diagonal.", icon: Trophy, gradient: "var(--gradient-card-cyan)" },
  { id: "relampago", label: "Relámpago", hint: "Ronda rápida, cartas más veloces.", icon: Zap, gradient: "var(--gradient-card-pink)" },
  { id: "chorro", label: "Chorro", hint: "Cuatro esquinas para ganar.", icon: Sparkles, gradient: "var(--gradient-card-gold)" },
  { id: "lleno", label: "Tabla llena", hint: "Rellena toda la tabla para ganar.", icon: LayoutGrid, gradient: "var(--gradient-card-teal)" },
];

function AbrirMesaPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const [name, setName] = useState("");
  const [mode, setMode] = useState<Mode>("clasico");
  const [size, setSize] = useState<Size>("4x4");
  const [perPlayer, setPerPlayer] = useState(2);
  const [locked, setLocked] = useState(false);
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [tablas, setTablas] = useState<Tabla[]>([]);
  const [hostName, setHostName] = useState<string>("");
  const [createdMesa, setCreatedMesa] = useState<null | { name: string; id: string }>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setTablas(loadTablas());
    try {
      setHostName(localStorage.getItem(NAME_KEY) ?? "");
    } catch {
      /* ignore */
    }
  }, []);

  const filteredTablas = useMemo(() => tablas.filter((t) => t.size === size), [tablas, size]);

  const canNext = useMemo(() => {
    if (step === 0) return name.trim().length >= 2;
    if (step === 3) return !locked || password.trim().length >= 3;
    if (step === 4) return selected.length === perPlayer;
    return true;
  }, [step, name, locked, password, selected, perPlayer]);

  function next() {
    if (!canNext) return;
    if (step < STEPS.length - 1) setStep(step + 1);
    else finish();
  }

  function back() {
    if (step === 0) navigate({ to: "/menu" });
    else setStep(step - 1);
  }

  async function finish() {
    if (selected.length !== perPlayer) {
      setError(`Selecciona ${perPlayer} tabla${perPlayer === 1 ? "" : "s"} para continuar.`);
      return;
    }
    const orderedTablas = selected
      .map((id) => tablas.find((t) => t.id === id))
      .filter((t): t is Tabla => Boolean(t));
    if (orderedTablas.length !== perPlayer) {
      setError("Alguna tabla ya no existe. Vuelve al paso anterior.");
      return;
    }

    try {
      const newMesaRef = push(ref(database, "mesas"));
      const mesaId = newMesaRef.key;
      
      if (!mesaId) throw new Error("No key generated");

      const mesa = {
        id: mesaId,
        name: name.trim(),
        mode,
        size,
        perPlayer,
        locked,
        password: locked ? password : "",
        tablaIds: selected,
        host: hostName || "Anfitrión",
        players: hostName ? [{ name: hostName, role: "host" as const }] : [],
        status: "abierta" as const,
        createdAt: Date.now(),
      };

      await set(newMesaRef, mesa);
      setError("");
      setCreatedMesa({ id: mesa.id, name: mesa.name });
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con el servidor para guardar la mesa.");
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= perPlayer) return [...prev.slice(1), id];
      return [...prev, id];
    });
  }

  return (
    <BrandBackground>
      <PapelPicado count={7} />
      <header className="relative z-30 flex items-center justify-between gap-3 px-4 pt-16">
        <button
          type="button"
          aria-label="Volver"
          onClick={back}
          className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 ring-1 ring-[color:var(--brand-gold)]/40 backdrop-blur transition hover:bg-white/20 active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex flex-col items-center leading-tight">
          <span className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--brand-gold)]">
            Paso {step + 1} de {STEPS.length}
          </span>
          <h1 className="text-lg font-black uppercase tracking-wide drop-shadow-[0_3px_0_rgba(0,0,0,0.35)]">
            {STEPS[step]} <span className="text-[color:var(--brand-cyan)]">·</span>{" "}
            <span className="text-white/80">Abrir mesa</span>
          </h1>
        </div>
        <div className="h-11 w-11" />
      </header>

      {/* Stepper */}
      <div className="relative z-10 mx-auto mt-4 flex w-full max-w-md items-center gap-1 px-5">
        {STEPS.map((_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15"
          >
            <span
              className="block h-full rounded-full transition-all duration-500"
              style={{
                width: i <= step ? "100%" : "0%",
                background: "var(--gradient-brand)",
              }}
            />
          </span>
        ))}
      </div>

      <main className="relative z-10 mx-auto w-full max-w-md px-5 pb-32 pt-6">
        {step === 0 && (
          <StepName name={name} onChange={setName} />
        )}
        {step === 1 && (
          <StepMode mode={mode} onChange={setMode} />
        )}
        {step === 2 && (
          <StepTablas
            size={size}
            onSize={setSize}
            perPlayer={perPlayer}
            onPerPlayer={setPerPlayer}
          />
        )}
        {step === 3 && (
          <StepAccess
            locked={locked}
            onLocked={setLocked}
            password={password}
            onPassword={setPassword}
            showPwd={showPwd}
            onShowPwd={setShowPwd}
          />
        )}
        {step === 4 && (
          <StepSelectTablas
            tablas={filteredTablas}
            perPlayer={perPlayer}
            selected={selected}
            onToggle={toggleSelect}
            size={size}
            onGoTablas={() => navigate({ to: "/tablas" })}
          />
        )}

      {step === 4 && error && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl bg-[color:var(--brand-pink)/.15] px-4 py-3 text-sm text-white ring-1 ring-[color:var(--brand-pink)/.4]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--brand-pink)]" />
          <span>{error}</span>
        </div>
      )}
      </main>

      {createdMesa && (
        <SuccessOverlay
          mesaName={createdMesa.name}
          host={hostName || "Anfitrión"}
          onGoMesa={() => navigate({ to: "/mesa/$id", params: { id: createdMesa.id } })}
          onClose={() => navigate({ to: "/menu" })}
        />
      )}

      {/* Bottom action bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[oklch(0.10_0.09_262)/.85] px-5 pb-5 pt-3 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-md items-center gap-3">
          <button
            type="button"
            onClick={back}
            className="h-12 flex-1 rounded-full bg-white/10 text-sm font-semibold text-white/85 ring-1 ring-white/15 transition hover:bg-white/15 active:scale-[0.98]"
          >
            {step === 0 ? "Cancelar" : "Atrás"}
          </button>
          <button
            type="button"
            onClick={next}
            disabled={!canNext}
            className="flex h-12 flex-[1.4] items-center justify-center gap-2 rounded-full text-sm font-bold text-white shadow-[var(--shadow-card)] ring-1 ring-white/25 transition hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
            style={{ background: "var(--gradient-brand)" }}
          >
            {step === STEPS.length - 1 ? (
              <>
                <Check className="h-4 w-4" /> Crear mesa
              </>
            ) : (
              <>
                Continuar <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </BrandBackground>
  );
}

function SuccessOverlay({
  mesaName,
  host,
  onClose,
  onGoMesa,
}: {
  mesaName: string;
  host: string;
  onClose: () => void;
  onGoMesa: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-[oklch(0.08_0.09_262)/.75] px-6 backdrop-blur-md">
      <div className="animate-slide-up-soft w-full max-w-sm overflow-hidden rounded-3xl bg-white/10 p-6 text-center ring-1 ring-white/20 shadow-[var(--shadow-card)] backdrop-blur-xl">
        <div
          className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl text-white shadow-[var(--shadow-card)]"
          style={{ background: "var(--gradient-brand)" }}
        >
          <PartyPopper className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-extrabold text-white">¡Mesa creada!</h3>
        <p className="mt-1 text-sm text-white/75">
          <span className="font-semibold text-white">{mesaName}</span>
          <br />
          Anfitrión: <span className="text-[color:var(--brand-cyan)]">{host}</span>
        </p>
        <button
          type="button"
          onClick={onGoMesa}
          className="mt-5 h-12 w-full rounded-full text-sm font-bold text-white shadow-[var(--shadow-card)] ring-1 ring-white/25 transition hover:-translate-y-0.5 active:scale-[0.98]"
          style={{ background: "var(--gradient-brand)" }}
        >
          Entrar a la mesa
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 h-11 w-full rounded-full text-sm font-semibold text-white/80 ring-1 ring-white/15 transition hover:bg-white/10"
        >
          Ir al menú
        </button>
      </div>
    </div>
  );
}

function StepName({ name, onChange }: { name: string; onChange: (v: string) => void }) {
  return (
    <div className="animate-slide-up-soft">
      <SectionTitle icon={Users} title="Nombre de la mesa" hint="Cómo verán los demás jugadores tu partida." />
      <div className="mt-4 rounded-3xl bg-white/10 p-1 ring-1 ring-white/15 backdrop-blur">
        <input
          value={name}
          onChange={(e) => onChange(e.target.value)}
          maxLength={28}
          placeholder="Ej. La mesa de los compas"
          className="h-14 w-full rounded-[22px] bg-transparent px-5 text-base font-semibold text-white placeholder:text-white/40 focus:outline-none"
        />
      </div>
      <div className="mt-2 flex justify-end px-1 text-[11px] text-white/50">{name.length}/28</div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {["Sábado en familia", "Reto rápido", "Con los primos", "Cumpleaños"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className="rounded-2xl bg-white/5 px-3 py-3 text-left text-xs font-medium text-white/80 ring-1 ring-white/10 transition hover:bg-white/10"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepMode({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className="animate-slide-up-soft">
      <SectionTitle icon={Timer} title="Modo de juego" hint="Elige cómo se decide el ganador." />
      <div className="mt-4 space-y-3">
        {MODES.map((m) => {
          const Icon = m.icon;
          const active = m.id === mode;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(m.id)}
              className={`relative flex w-full items-center gap-4 overflow-hidden rounded-2xl px-3 py-3 text-left ring-1 transition ${
                active
                  ? "ring-white/60 shadow-[var(--shadow-card)]"
                  : "ring-white/10 bg-white/5 hover:bg-white/10"
              }`}
              style={active ? { background: m.gradient } : undefined}
            >
              <span
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ring-2 ${
                  active
                    ? "bg-white/95 text-[color:var(--brand-navy-deep)] ring-white/60"
                    : "bg-white/10 text-white ring-white/20"
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <div className={`text-[15px] font-bold ${active ? "text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]" : "text-white"}`}>
                  {m.label}
                </div>
                <div className={`text-[12px] ${active ? "text-white/85" : "text-white/60"}`}>
                  {m.hint}
                </div>
              </div>
              {active && (
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white/95 text-[color:var(--brand-navy-deep)]">
                  <Check className="h-4 w-4" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepTablas({
  size,
  onSize,
  perPlayer,
  onPerPlayer,
}: {
  size: Size;
  onSize: (s: Size) => void;
  perPlayer: number;
  onPerPlayer: (n: number) => void;
}) {
  return (
    <div className="animate-slide-up-soft">
      <SectionTitle icon={LayoutGrid} title="Tablas por jugador" hint="Tamaño de la tabla y cuántas repartir." />

      <div className="mt-4 relative flex h-12 items-center rounded-full bg-white/10 p-1 ring-1 ring-white/15 backdrop-blur">
        <span
          aria-hidden
          className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full transition-all duration-300"
          style={{
            left: size === "4x4" ? 4 : "calc(50% + 0px)",
            background: "var(--gradient-brand)",
            boxShadow: "0 8px 20px -8px rgba(0,0,0,0.5)",
          }}
        />
        {(["4x4", "5x5"] as Size[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSize(s)}
            className={`relative z-10 flex-1 rounded-full text-sm font-bold transition ${
              size === s ? "text-white" : "text-white/60"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-3xl bg-white/5 p-5 ring-1 ring-white/10">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold text-white/80">Tablas por jugador</span>
          <span className="text-3xl font-extrabold text-white">{perPlayer}</span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => onPerPlayer(Math.max(1, perPlayer - 1))}
            className="h-11 w-11 rounded-full bg-white/10 text-lg font-bold text-white ring-1 ring-white/15 transition hover:bg-white/20 active:scale-95"
          >
            −
          </button>
          <div className="relative flex-1">
            <div className="h-2 rounded-full bg-white/10" />
            <div
              className="absolute inset-y-0 left-0 h-2 rounded-full"
              style={{ width: `${((perPlayer - 1) / 5) * 100}%`, background: "var(--gradient-brand)" }}
            />
            <div className="mt-2 flex justify-between text-[10px] text-white/50">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <span key={n}>{n}</span>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onPerPlayer(Math.min(6, perPlayer + 1))}
            className="h-11 w-11 rounded-full bg-white/10 text-lg font-bold text-white ring-1 ring-white/15 transition hover:bg-white/20 active:scale-95"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

function StepAccess({
  locked,
  onLocked,
  password,
  onPassword,
  showPwd,
  onShowPwd,
}: {
  locked: boolean;
  onLocked: (v: boolean) => void;
  password: string;
  onPassword: (v: string) => void;
  showPwd: boolean;
  onShowPwd: (v: boolean) => void;
}) {
  return (
    <div className="animate-slide-up-soft">
      <SectionTitle icon={Lock} title="Acceso a la mesa" hint="Elige quién puede entrar." />

      <div className="mt-4 grid grid-cols-2 gap-3">
        <AccessOption
          active={!locked}
          onClick={() => onLocked(false)}
          icon={LockOpen}
          label="Pública"
          hint="Cualquiera puede unirse."
        />
        <AccessOption
          active={locked}
          onClick={() => onLocked(true)}
          icon={Lock}
          label="Privada"
          hint="Requiere contraseña."
        />
      </div>

      {locked && (
        <div className="mt-5 rounded-3xl bg-white/10 p-1 ring-1 ring-white/15 backdrop-blur animate-slide-up-soft">
          <div className="relative">
            <input
              value={password}
              onChange={(e) => onPassword(e.target.value)}
              type={showPwd ? "text" : "password"}
              maxLength={16}
              placeholder="Contraseña de la mesa"
              className="h-14 w-full rounded-[22px] bg-transparent px-5 pr-14 text-base font-semibold text-white placeholder:text-white/40 focus:outline-none"
            />
            <button
              type="button"
              aria-label={showPwd ? "Ocultar" : "Mostrar"}
              onClick={() => onShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white/80 ring-1 ring-white/15 hover:bg-white/20"
            >
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AccessOption({
  active,
  onClick,
  icon: Icon,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl px-4 py-4 text-left ring-1 transition ${
        active
          ? "ring-white/60 shadow-[var(--shadow-card)]"
          : "ring-white/10 bg-white/5 hover:bg-white/10"
      }`}
      style={active ? { background: "var(--gradient-brand)" } : undefined}
    >
      <span
        className={`grid h-10 w-10 place-items-center rounded-full ${
          active ? "bg-white/95 text-[color:var(--brand-navy-deep)]" : "bg-white/10 text-white"
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="mt-3 text-[15px] font-bold text-white">{label}</div>
      <div className={`text-[11px] ${active ? "text-white/85" : "text-white/55"}`}>{hint}</div>
    </button>
  );
}

function StepSelectTablas({
  tablas,
  perPlayer,
  selected,
  onToggle,
  size,
  onGoTablas,
}: {
  tablas: Tabla[];
  perPlayer: number;
  selected: string[];
  onToggle: (id: string) => void;
  size: Size;
  onGoTablas: () => void;
}) {
  return (
    <div className="animate-slide-up-soft">
      <SectionTitle
        icon={LayoutGrid}
        title="Selecciona tus tablas"
        hint={`Elige ${perPlayer} tabla${perPlayer === 1 ? "" : "s"} de ${size}.`}
      />

      <div className="mt-3 flex items-center justify-between px-1 text-xs">
        <span className="text-white/70">
          Seleccionadas{" "}
          <span className="font-bold text-white">
            {selected.length}/{perPlayer}
          </span>
        </span>
        <button
          type="button"
          onClick={onGoTablas}
          className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 font-semibold text-white/85 ring-1 ring-white/15 hover:bg-white/20"
        >
          <PlusCircle className="h-3.5 w-3.5" /> Nueva
        </button>
      </div>

      {tablas.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-3xl bg-white/5 px-6 py-10 text-center ring-1 ring-white/10 backdrop-blur">
          <div
            className="mb-4 grid h-16 w-16 place-items-center rounded-2xl text-white shadow-lg"
            style={{ background: "var(--gradient-brand)" }}
          >
            <LayoutGrid className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold">No tienes tablas {size}</h3>
          <p className="mt-1 text-sm text-white/70">Crea al menos {perPlayer} para continuar.</p>
          <button
            type="button"
            onClick={onGoTablas}
            className="mt-4 flex h-11 items-center gap-2 rounded-full px-5 text-sm font-bold text-white shadow-[var(--shadow-card)]"
            style={{ background: "var(--gradient-card-pink)" }}
          >
            <PlusCircle className="h-4 w-4" /> Ir a Mis tablas
          </button>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {tablas.map((t) => {
            const active = selected.includes(t.id);
            const order = selected.indexOf(t.id) + 1;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onToggle(t.id)}
                className={`relative overflow-hidden rounded-2xl p-2 text-left ring-1 transition ${
                  active
                    ? "ring-[color:var(--brand-cyan)] shadow-[0_18px_32px_-12px_rgba(0,0,0,0.55)]"
                    : "ring-white/20 bg-white/95 hover:-translate-y-0.5"
                }`}
                style={active ? { background: "var(--gradient-brand)" } : undefined}
              >
                <MiniGrid cards={t.cards} size={t.size} />
                <div className="mt-2 flex items-center justify-between px-1 text-[11px] font-semibold">
                  <span className={active ? "text-white" : "text-[color:var(--brand-navy-dark)]"}>
                    {t.size}
                  </span>
                  {active && (
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-[color:var(--brand-navy-deep)]">
                      {order}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MiniGrid({ cards, size }: { cards: number[]; size: Size }) {
  const cols = size === "4x4" ? 4 : 5;
  return (
    <div
      className="grid gap-[3px] overflow-hidden rounded-xl"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {cards.map((n, i) => {
        const card = getCard(n);
        return (
          <div key={i} className="relative aspect-[3/4] overflow-hidden rounded-md">
            <img
              src={card?.image}
              alt={card?.name ?? `Carta ${n}`}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        );
      })}
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  hint: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white shadow-[var(--shadow-card)]"
        style={{ background: "var(--gradient-brand)" }}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <h2 className="text-lg font-extrabold text-white">{title}</h2>
        <p className="text-xs text-white/65">{hint}</p>
      </div>
    </div>
  );
}