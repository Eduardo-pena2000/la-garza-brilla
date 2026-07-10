import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Pause,
  Play,
  Settings2,
  MessageCircle,
  Users,
  Volume2,
  VolumeX,
  Trophy,
  RotateCcw,
  Sparkles,
  Timer as TimerIcon,
} from "lucide-react";
import { BrandBackground } from "@/components/BrandBackground";

export const Route = createFileRoute("/mesa/$id/jugar")({
  head: () => ({
    meta: [
      { title: "Jugando — Lotería La Garza" },
      { name: "description", content: "Partida en curso de Lotería La Garza." },
    ],
  }),
  component: JugarPage,
});

type Size = "4x4" | "5x5";
type Mode = "clasico" | "relampago" | "chorro" | "lleno";

interface Tabla {
  id: string;
  size: Size;
  cards: number[];
  createdAt: number;
}

interface Mesa {
  id: string;
  name: string;
  mode: Mode;
  size: Size;
  perPlayer: number;
  tablaIds: string[];
  host: string;
  status: string;
}

const MESAS_KEY = "garza:mesas";
const TABLAS_KEY = "garza:tablas";

// Traditional Lotería deck (54 cards)
const DECK: { n: number; name: string; emoji: string }[] = [
  { n: 1, name: "El Gallo", emoji: "🐓" },
  { n: 2, name: "El Diablito", emoji: "😈" },
  { n: 3, name: "La Dama", emoji: "💃" },
  { n: 4, name: "El Catrín", emoji: "🎩" },
  { n: 5, name: "El Paraguas", emoji: "☂️" },
  { n: 6, name: "La Sirena", emoji: "🧜‍♀️" },
  { n: 7, name: "La Escalera", emoji: "🪜" },
  { n: 8, name: "La Botella", emoji: "🍾" },
  { n: 9, name: "El Barril", emoji: "🛢️" },
  { n: 10, name: "El Árbol", emoji: "🌳" },
  { n: 11, name: "El Melón", emoji: "🍈" },
  { n: 12, name: "El Valiente", emoji: "🗡️" },
  { n: 13, name: "El Gorrito", emoji: "🎓" },
  { n: 14, name: "La Muerte", emoji: "💀" },
  { n: 15, name: "La Pera", emoji: "🍐" },
  { n: 16, name: "La Bandera", emoji: "🚩" },
  { n: 17, name: "El Bandolón", emoji: "🪕" },
  { n: 18, name: "El Violoncello", emoji: "🎻" },
  { n: 19, name: "La Garza", emoji: "🦩" },
  { n: 20, name: "El Pájaro", emoji: "🐦" },
  { n: 21, name: "La Mano", emoji: "✋" },
  { n: 22, name: "La Bota", emoji: "🥾" },
  { n: 23, name: "La Luna", emoji: "🌙" },
  { n: 24, name: "El Cotorro", emoji: "🦜" },
  { n: 25, name: "El Borracho", emoji: "🍷" },
  { n: 26, name: "El Negrito", emoji: "🕺" },
  { n: 27, name: "El Corazón", emoji: "❤️" },
  { n: 28, name: "La Sandía", emoji: "🍉" },
  { n: 29, name: "El Tambor", emoji: "🥁" },
  { n: 30, name: "El Camarón", emoji: "🦐" },
  { n: 31, name: "Las Jaras", emoji: "🏹" },
  { n: 32, name: "El Músico", emoji: "🎺" },
  { n: 33, name: "La Araña", emoji: "🕷️" },
  { n: 34, name: "El Soldado", emoji: "💂" },
  { n: 35, name: "La Estrella", emoji: "⭐" },
  { n: 36, name: "El Cazo", emoji: "🍲" },
  { n: 37, name: "El Mundo", emoji: "🌎" },
  { n: 38, name: "El Apache", emoji: "🪶" },
  { n: 39, name: "El Nopal", emoji: "🌵" },
  { n: 40, name: "El Alacrán", emoji: "🦂" },
  { n: 41, name: "La Rosa", emoji: "🌹" },
  { n: 42, name: "La Calavera", emoji: "☠️" },
  { n: 43, name: "La Campana", emoji: "🔔" },
  { n: 44, name: "El Cantarito", emoji: "🏺" },
  { n: 45, name: "El Venado", emoji: "🦌" },
  { n: 46, name: "El Sol", emoji: "☀️" },
  { n: 47, name: "La Corona", emoji: "👑" },
  { n: 48, name: "La Chalupa", emoji: "🛶" },
  { n: 49, name: "El Pino", emoji: "🌲" },
  { n: 50, name: "El Pescado", emoji: "🐟" },
  { n: 51, name: "La Palma", emoji: "🌴" },
  { n: 52, name: "La Maceta", emoji: "🪴" },
  { n: 53, name: "El Arpa", emoji: "🎼" },
  { n: 54, name: "La Rana", emoji: "🐸" },
];

function loadMesa(id: string): Mesa | null {
  try {
    const raw = localStorage.getItem(MESAS_KEY);
    if (!raw) return null;
    const list = JSON.parse(raw) as Mesa[];
    return list.find((m) => m.id === id) ?? null;
  } catch {
    return null;
  }
}

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

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function speedFor(mode: Mode): number {
  switch (mode) {
    case "relampago":
      return 2500;
    case "chorro":
      return 3500;
    case "lleno":
      return 4500;
    default:
      return 4000;
  }
}

function checkWin(mode: Mode, size: Size, cards: number[], marked: Set<number>): boolean {
  const n = size === "4x4" ? 4 : 5;
  const grid = Array.from({ length: n }, (_, r) => cards.slice(r * n, (r + 1) * n));
  const isMarked = (c: number) => marked.has(c);

  if (mode === "lleno") {
    return cards.every(isMarked);
  }
  if (mode === "chorro") {
    return [grid[0][0], grid[0][n - 1], grid[n - 1][0], grid[n - 1][n - 1]].every(isMarked);
  }
  // clasico / relampago: any line
  for (let r = 0; r < n; r++) if (grid[r].every(isMarked)) return true;
  for (let c = 0; c < n; c++) if (grid.every((row) => isMarked(row[c]))) return true;
  if (grid.every((row, i) => isMarked(row[i]))) return true;
  if (grid.every((row, i) => isMarked(row[n - 1 - i]))) return true;
  return false;
}

function JugarPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const [mesa, setMesa] = useState<Mesa | null>(null);
  const [tabla, setTabla] = useState<Tabla | null>(null);
  const [loading, setLoading] = useState(true);

  const [deck, setDeck] = useState<number[]>([]);
  const [drawnIdx, setDrawnIdx] = useState(-1); // index into deck
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [paused, setPaused] = useState(true);
  const [muted, setMuted] = useState(false);
  const [won, setWon] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const m = loadMesa(id);
    setMesa(m);
    const tablas = loadTablas();
    if (m) {
      const first = tablas.find((t) => t.id === m.tablaIds[0]);
      setTabla(first ?? null);
    }
    setDeck(shuffle(DECK.map((c) => c.n)));
    setLoading(false);
  }, [id]);

  const drawn = drawnIdx >= 0 ? DECK.find((c) => c.n === deck[drawnIdx]) : null;
  const prev = drawnIdx > 0 ? DECK.find((c) => c.n === deck[drawnIdx - 1]) : null;

  const drawNext = useCallback(() => {
    setDrawnIdx((i) => {
      const next = i + 1;
      if (next >= deck.length) return i;
      return next;
    });
  }, [deck.length]);

  // auto draw
  useEffect(() => {
    if (paused || won || !mesa) return;
    const speed = speedFor(mesa.mode);
    timerRef.current = window.setTimeout(drawNext, speed);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [paused, drawnIdx, mesa, drawNext, won]);

  // win detection
  useEffect(() => {
    if (!mesa || !tabla) return;
    if (checkWin(mesa.mode, tabla.size, tabla.cards, marked)) {
      setWon(true);
      setPaused(true);
    }
  }, [marked, mesa, tabla]);

  function toggleMark(card: number) {
    if (won) return;
    // Only allow marking if it was actually drawn
    const drawnSet = new Set(deck.slice(0, drawnIdx + 1));
    if (!drawnSet.has(card)) return;
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(card)) next.delete(card);
      else next.add(card);
      return next;
    });
  }

  function restart() {
    setDeck(shuffle(DECK.map((c) => c.n)));
    setDrawnIdx(-1);
    setMarked(new Set());
    setWon(false);
    setPaused(true);
  }

  if (loading) {
    return (
      <BrandBackground>
        <div className="grid min-h-screen place-items-center text-white/70">Cargando…</div>
      </BrandBackground>
    );
  }

  if (!mesa || !tabla) {
    return (
      <BrandBackground>
        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 text-center">
          <h1 className="text-xl font-extrabold text-white">Mesa no disponible</h1>
          <p className="mt-2 text-sm text-white/70">No encontramos las tablas de esta partida.</p>
          <Link
            to="/menu"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-bold text-white shadow-[var(--shadow-card)] ring-1 ring-white/25"
            style={{ background: "var(--gradient-brand)" }}
          >
            Volver al menú
          </Link>
        </div>
      </BrandBackground>
    );
  }

  const drawnSet = new Set(deck.slice(0, drawnIdx + 1));
  const remaining = deck.length - (drawnIdx + 1);
  const progress = ((drawnIdx + 1) / deck.length) * 100;

  return (
    <BrandBackground>
      {/* Top toolbar */}
      <header className="relative z-10 flex items-center gap-2 px-4 pt-5">
        <button
          type="button"
          aria-label="Salir"
          onClick={() => navigate({ to: "/mesa/$id", params: { id: mesa.id } })}
          className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur transition hover:bg-white/20 active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="ml-1 flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-[11px] uppercase tracking-[0.22em] text-white/60">
            {mesa.name}
          </span>
          <span className="text-xs font-bold text-white/80">
            Cartas restantes: <span className="text-[color:var(--brand-cyan)]">{remaining}</span>
          </span>
        </div>
        <IconBtn label={muted ? "Activar sonido" : "Silenciar"} onClick={() => setMuted((v) => !v)}>
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </IconBtn>
        <IconBtn label="Jugadores">
          <Users className="h-4 w-4" />
        </IconBtn>
        <IconBtn label="Ajustes">
          <Settings2 className="h-4 w-4" />
        </IconBtn>
      </header>

      {/* Progress */}
      <div className="relative z-10 mx-auto mt-3 w-full max-w-md px-5">
        <div className="h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: "var(--gradient-brand)" }}
          />
        </div>
      </div>

      {/* Current card panel */}
      <section className="relative z-10 mx-auto mt-5 w-full max-w-md px-5">
        <div className="relative flex items-center gap-4 overflow-hidden rounded-3xl bg-white/8 p-4 ring-1 ring-white/15 shadow-[var(--shadow-card)] backdrop-blur">
          <div
            className="relative grid h-28 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl text-white ring-1 ring-white/25"
            style={{ background: "var(--gradient-brand)" }}
          >
            {drawn ? (
              <div key={drawn.n} className="animate-pop-in flex flex-col items-center">
                <span className="text-4xl leading-none">{drawn.emoji}</span>
                <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/80">
                  #{drawn.n}
                </span>
              </div>
            ) : (
              <Sparkles className="h-8 w-8 text-white/50" />
            )}
            <span
              aria-hidden
              className="absolute inset-0 animate-pulse-ring rounded-2xl ring-2 ring-[color:var(--brand-cyan)]"
            />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase tracking-[0.22em] text-white/50">
              Carta actual
            </span>
            <div className="truncate text-xl font-extrabold text-white">
              {drawn ? drawn.name : "Esperando…"}
            </div>
            {prev && (
              <div className="mt-1 flex items-center gap-1 text-[11px] text-white/50">
                <TimerIcon className="h-3 w-3" /> Anterior:{" "}
                <span className="text-white/70">
                  {prev.emoji} {prev.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Player tabla */}
      <main className="relative z-10 mx-auto w-full max-w-md px-5 pb-36 pt-5">
        <div className="mb-2 flex items-center justify-between px-1 text-[11px] uppercase tracking-wider text-white/60">
          <span>Tu tabla · {tabla.size}</span>
          <span>
            Marcadas <span className="text-white">{marked.size}</span>/{tabla.cards.length}
          </span>
        </div>
        <div
          className="rounded-3xl bg-white/5 p-3 ring-1 ring-white/10 backdrop-blur"
        >
          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${tabla.size === "4x4" ? 4 : 5}, minmax(0, 1fr))`,
            }}
          >
            {tabla.cards.map((c) => {
              const card = DECK.find((x) => x.n === c);
              const isMarked = marked.has(c);
              const isDrawn = drawnSet.has(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleMark(c)}
                  className={`relative aspect-[3/4] overflow-hidden rounded-xl text-center transition active:scale-95 ${
                    isMarked
                      ? "ring-2 ring-[color:var(--brand-gold)]"
                      : isDrawn
                      ? "ring-2 ring-[color:var(--brand-cyan)]/70 animate-pulse"
                      : "ring-1 ring-white/10"
                  }`}
                  style={{
                    background: isMarked
                      ? "var(--gradient-card-gold)"
                      : "linear-gradient(160deg, oklch(0.28 0.10 258), oklch(0.20 0.10 262))",
                  }}
                >
                  <div className="flex h-full flex-col items-center justify-center gap-0.5 p-1">
                    <span className="text-2xl leading-none">{card?.emoji}</span>
                    <span className="max-w-full truncate text-[9px] font-bold uppercase tracking-wider text-white/80">
                      {card?.name}
                    </span>
                  </div>
                  <span className="absolute right-1 top-1 text-[9px] font-bold text-white/50">
                    {c}
                  </span>
                  {isMarked && (
                    <span className="absolute inset-0 grid place-items-center">
                      <span
                        className="animate-pop-in grid h-10 w-10 place-items-center rounded-full bg-[color:var(--brand-pink)] text-white ring-4 ring-white/30 shadow-[var(--shadow-card)]"
                      >
                        ✓
                      </span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Bottom action bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[oklch(0.10_0.09_262)/.9] px-5 pb-5 pt-3 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-md items-center gap-3">
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition hover:bg-white/20 active:scale-95"
            aria-label={paused ? "Reanudar" : "Pausar"}
          >
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={drawNext}
            disabled={won || drawnIdx >= deck.length - 1}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-sm font-bold text-white shadow-[var(--shadow-card)] ring-1 ring-white/25 transition hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Sparkles className="h-4 w-4" />
            {drawnIdx < 0 ? "Cantar primera carta" : "Siguiente carta"}
          </button>
          <button
            type="button"
            aria-label="Chat"
            className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition hover:bg-white/20 active:scale-95"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
        </div>
      </div>

      {won && <WinOverlay mesaName={mesa.name} onRestart={restart} onExit={() => navigate({ to: "/mesa/$id", params: { id: mesa.id } })} />}
    </BrandBackground>
  );
}

function IconBtn({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-white/20 active:scale-95"
    >
      {children}
    </button>
  );
}

function WinOverlay({
  mesaName,
  onRestart,
  onExit,
}: {
  mesaName: string;
  onRestart: () => void;
  onExit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-[oklch(0.08_0.09_262)/.8] px-6 backdrop-blur-md">
      <div className="animate-slide-up-soft w-full max-w-sm overflow-hidden rounded-3xl bg-white/10 p-6 text-center ring-1 ring-white/20 shadow-[var(--shadow-card)] backdrop-blur-xl">
        <div
          className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl text-white shadow-[var(--shadow-card)]"
          style={{ background: "var(--gradient-card-gold)" }}
        >
          <Trophy className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-extrabold text-white">¡Lotería!</h3>
        <p className="mt-1 text-sm text-white/75">
          Ganaste en <span className="font-semibold text-white">{mesaName}</span>
        </p>
        <button
          type="button"
          onClick={onRestart}
          className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-bold text-white shadow-[var(--shadow-card)] ring-1 ring-white/25 transition hover:-translate-y-0.5 active:scale-[0.98]"
          style={{ background: "var(--gradient-brand)" }}
        >
          <RotateCcw className="h-4 w-4" /> Otra ronda
        </button>
        <button
          type="button"
          onClick={onExit}
          className="mt-2 h-11 w-full rounded-full text-sm font-semibold text-white/80 ring-1 ring-white/15 transition hover:bg-white/10"
        >
          Salir a la mesa
        </button>
      </div>
    </div>
  );
}