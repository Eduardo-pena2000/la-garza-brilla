import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, LayoutGrid, Trash2, Pencil, Sparkles } from "lucide-react";
import { BrandBackground } from "@/components/BrandBackground";
import { PapelPicado } from "@/components/Fiesta";
import { DECK, getCard } from "@/lib/deck";

export const Route = createFileRoute("/tablas")({
  head: () => ({
    meta: [
      { title: "Mis tablas — Lotería La Garza" },
      { name: "description", content: "Administra tus tablas de Lotería La Garza." },
    ],
  }),
  component: TablasPage,
});

type Size = "4x4" | "5x5";

interface Tabla {
  id: string;
  size: Size;
  cards: number[]; // card indexes 1..54
  createdAt: number;
}

const STORAGE_KEY = "garza:tablas";

function loadTablas(): Tabla[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Tabla[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTablas(list: Tabla[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

function randomCards(size: Size): number[] {
  const total = size === "4x4" ? 16 : 25;
  const pool = Array.from({ length: 54 }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, total);
}

function TablasPage() {
  const navigate = useNavigate();
  const [size, setSize] = useState<Size>("4x4");
  const [tablas, setTablas] = useState<Tabla[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setTablas(loadTablas());
  }, []);

  const filtered = useMemo(
    () => tablas.filter((t) => t.size === size).sort((a, b) => b.createdAt - a.createdAt),
    [tablas, size],
  );

  function addTabla() {
    const next: Tabla = {
      id: crypto.randomUUID(),
      size,
      cards: randomCards(size),
      createdAt: Date.now(),
    };
    const updated = [next, ...tablas];
    setTablas(updated);
    saveTablas(updated);
  }

  function deleteTabla(id: string) {
    const updated = tablas.filter((t) => t.id !== id);
    setTablas(updated);
    saveTablas(updated);
    setSelected(null);
  }

  function shuffleTabla(id: string) {
    const updated = tablas.map((t) =>
      t.id === id ? { ...t, cards: randomCards(t.size) } : t,
    );
    setTablas(updated);
    saveTablas(updated);
  }

  const selectedTabla = tablas.find((t) => t.id === selected) ?? null;

  return (
    <BrandBackground>
      <PapelPicado count={7} />
      {/* Header */}
      <header className="relative z-30 flex items-center justify-between gap-3 px-4 pt-16">
        <button
          type="button"
          aria-label="Volver"
          onClick={() => navigate({ to: "/menu" })}
          className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 ring-1 ring-[color:var(--brand-gold)]/40 backdrop-blur transition hover:bg-white/20 active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex flex-col items-center leading-tight">
          <span className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--brand-gold)]">Colección</span>
          <h1 className="text-lg font-black uppercase tracking-wide drop-shadow-[0_3px_0_rgba(0,0,0,0.35)]">
            Mis tablas <span className="text-[color:var(--brand-cyan)]">({filtered.length})</span>
          </h1>
        </div>
        <button
          type="button"
          aria-label="Agregar tabla"
          onClick={addTabla}
          className="grid h-11 w-11 place-items-center rounded-2xl text-white shadow-[var(--shadow-card)] ring-1 ring-white/25 transition hover:-translate-y-0.5 active:scale-95"
          style={{ background: "var(--gradient-card-pink)" }}
        >
          <Plus className="h-5 w-5" />
        </button>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-md px-4 pb-24 pt-5">
        {/* Size toggle */}
        <div className="relative flex h-12 items-center rounded-full bg-white/10 p-1 ring-1 ring-white/15 backdrop-blur">
          <span
            aria-hidden
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full transition-all duration-300 ease-out"
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
              onClick={() => setSize(s)}
              className={`relative z-10 flex-1 rounded-full text-sm font-bold transition ${
                size === s ? "text-white" : "text-white/60"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Hint */}
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-xs text-white/85 ring-1 ring-white/15 backdrop-blur animate-slide-up-soft">
          <Sparkles className="h-4 w-4 text-[color:var(--brand-cyan)]" />
          Toca una tabla para editarla o eliminarla.
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <EmptyState size={size} onAdd={addTabla} />
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3">
            {filtered.map((t, idx) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelected(t.id)}
                className="group relative overflow-hidden rounded-2xl bg-white/95 p-2 text-left shadow-[var(--shadow-card)] ring-1 ring-white/30 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_32px_-12px_rgba(0,0,0,0.55)] active:scale-[0.98] animate-slide-up-soft"
                style={{ animationDelay: `${0.05 * idx}s` }}
              >
                <TablaPreview cards={t.cards} size={t.size} />
                <div className="mt-2 flex items-center justify-between px-1 text-[11px] font-semibold text-[color:var(--brand-navy-dark)]">
                  <span className="inline-flex items-center gap-1">
                    <LayoutGrid className="h-3 w-3" /> {t.size}
                  </span>
                  <span className="text-[color:var(--muted-foreground)]">
                    #{filtered.length - idx}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Floating add button */}
      <button
        type="button"
        onClick={addTabla}
        className="fixed bottom-6 left-1/2 z-20 flex h-14 -translate-x-1/2 items-center gap-2 rounded-full px-6 text-sm font-bold text-white shadow-[0_20px_35px_-12px_rgba(0,0,0,0.55)] ring-1 ring-white/25 transition hover:-translate-x-1/2 hover:-translate-y-1 active:scale-[0.98]"
        style={{ background: "var(--gradient-brand)" }}
      >
        <Plus className="h-5 w-5" /> Nueva tabla {size}
      </button>

      {selectedTabla && (
        <TablaSheet
          tabla={selectedTabla}
          onClose={() => setSelected(null)}
          onDelete={() => deleteTabla(selectedTabla.id)}
          onShuffle={() => shuffleTabla(selectedTabla.id)}
        />
      )}
    </BrandBackground>
  );
}

function TablaPreview({ cards, size }: { cards: number[]; size: Size }) {
  const cols = size === "4x4" ? 4 : 5;
  return (
    <div
      className="grid gap-[3px] overflow-hidden rounded-xl"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {cards.map((n, i) => (
        <CardTile key={i} n={n} />
      ))}
    </div>
  );
}

function CardTile({ n }: { n: number }) {
  const card = getCard(n);
  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-md">
      <img
        src={card?.image}
        alt={card?.name ?? `Carta ${n}`}
        loading="lazy"
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function EmptyState({ size, onAdd }: { size: Size; onAdd: () => void }) {
  return (
    <div className="mt-10 flex flex-col items-center rounded-3xl bg-white/5 px-6 py-10 text-center ring-1 ring-white/10 backdrop-blur animate-slide-up-soft">
      <div
        className="mb-4 grid h-16 w-16 place-items-center rounded-2xl text-white shadow-lg"
        style={{ background: "var(--gradient-brand)" }}
      >
        <LayoutGrid className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-bold">Aún no tienes tablas {size}</h3>
      <p className="mt-1 text-sm text-white/70">
        Crea tu primera tabla y comienza a jugar cuando quieras.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-5 flex h-12 items-center gap-2 rounded-full px-6 text-sm font-bold text-white shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 active:scale-[0.98]"
        style={{ background: "var(--gradient-card-pink)" }}
      >
        <Plus className="h-4 w-4" /> Crear tabla {size}
      </button>
    </div>
  );
}

function TablaSheet({
  tabla,
  onClose,
  onDelete,
  onShuffle,
}: {
  tabla: Tabla;
  onClose: () => void;
  onDelete: () => void;
  onShuffle: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />
      <div className="relative w-full max-w-md rounded-t-3xl bg-white p-5 text-[color:var(--brand-navy-dark)] shadow-2xl animate-slide-up-soft">
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-black/15" />
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
              Tabla {tabla.size}
            </div>
            <h3 className="text-lg font-extrabold">Vista previa</h3>
          </div>
        </div>

        <div className="mx-auto mt-4 max-w-[240px]">
          <TablaPreview cards={tabla.cards} size={tabla.size} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onShuffle}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl text-sm font-bold text-white shadow-[var(--shadow-card)] transition active:scale-[0.98]"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Pencil className="h-4 w-4" /> Regenerar
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[color:var(--brand-pink)]/10 text-sm font-bold text-[color:var(--brand-pink)] ring-1 ring-[color:var(--brand-pink)]/30 transition active:scale-[0.98]"
          >
            <Trash2 className="h-4 w-4" /> Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}