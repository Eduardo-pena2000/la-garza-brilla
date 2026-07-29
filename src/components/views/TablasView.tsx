import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, LayoutGrid, Trash2, Pencil, Sparkles, CheckCircle, Pointer } from "lucide-react";
import { DECK, getCard } from "@/lib/deck";

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

export function TablasView({ onBack, navigateToMenu }: { onBack?: () => void, navigateToMenu?: () => void }) {
  const [tablas, setTablas] = useState<Tabla[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [creationMode, setCreationMode] = useState<"none" | "choose" | "custom">("none");
  const [editingId, setEditingId] = useState<string | null>(null);

  const isTutorial = tablas.length === 0;

  useEffect(() => {
    setTablas(loadTablas());
  }, []);

  const filtered = useMemo(
    () => tablas.filter((t) => t.size === "4x4").sort((a, b) => b.createdAt - a.createdAt),
    [tablas],
  );

  function addTabla(cards?: number[]) {
    const isFirst = tablas.length === 0;
    const next: Tabla = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36),
      size: "4x4",
      cards: cards || randomCards("4x4"),
      createdAt: Date.now(),
    };
    const updated = [next, ...tablas];
    setTablas(updated);
    saveTablas(updated);

    if (isFirst && navigateToMenu) {
      setTimeout(() => navigateToMenu(), 100);
    }
    window.dispatchEvent(new Event("garza:tablas-updated"));
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
    <div className="flex flex-col h-full font-sans relative overflow-x-hidden overflow-y-auto text-white pt-5">
      {isTutorial && (
        <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm pointer-events-auto transition-all duration-500" />
      )}

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between gap-3 px-4">
        {!isTutorial && onBack ? (
          <button
            type="button"
            aria-label="Volver"
            onClick={onBack}
            className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur transition hover:bg-white/20 active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : (
          <div className="w-11 h-11" />
        )}
        <div className="flex flex-col items-center leading-tight">
          <span className="text-[11px] uppercase tracking-[0.22em] text-white/60">Colección</span>
          <h1 className="text-lg font-extrabold">
            Mis tablas <span className="text-[color:var(--brand-cyan)]">({filtered.length})</span>
          </h1>
        </div>
        <button
          type="button"
          aria-label="Agregar tabla"
          onClick={() => setCreationMode("choose")}
          className="grid h-11 w-11 place-items-center rounded-2xl text-white shadow-[var(--shadow-card)] ring-1 ring-white/25 transition hover:-translate-y-0.5 active:scale-95"
          style={{ background: "var(--gradient-card-pink)" }}
        >
          <Plus className="h-5 w-5" />
        </button>
      </header>

      <main className="relative mx-auto w-full max-w-md px-4 pb-28 pt-5">
        {/* Hint */}
        <div className={`mt-4 flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-xs text-white/85 ring-1 ring-white/15 backdrop-blur animate-slide-up-soft ${isTutorial ? "opacity-30 pointer-events-none" : ""}`}>
          <Sparkles className="h-4 w-4 text-[color:var(--brand-cyan)]" />
          Toca una tabla para editarla o eliminarla.
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <EmptyState onAdd={() => setCreationMode("choose")} isTutorial={isTutorial && creationMode === "none"} />
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
      {!isTutorial && (
        <div className="sticky bottom-24 left-0 right-0 z-20 flex justify-center pointer-events-none pb-4 shrink-0">
          <button
            type="button"
            onClick={() => setCreationMode("choose")}
            className="flex h-14 items-center gap-2 rounded-full px-6 text-sm font-bold text-white shadow-[0_20px_35px_-12px_rgba(0,0,0,0.55)] ring-1 ring-white/25 transition hover:-translate-y-1 active:scale-[0.98] pointer-events-auto"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Plus className="h-5 w-5" /> Nueva tabla
          </button>
        </div>
      )}

      {selectedTabla && (
        <TablaSheet
          tabla={selectedTabla}
          onClose={() => setSelected(null)}
          onDelete={() => deleteTabla(selectedTabla.id)}
          onEdit={() => { 
            setEditingId(selectedTabla.id); 
            setSelected(null); 
            setTimeout(() => setCreationMode("custom"), 50);
          }}
        />
      )}

      {/* Creation Mode Chooser */}
      {creationMode === "choose" && (
        <div className={`fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-pop-in z-[60]`}>
          <div className="bg-[color:var(--brand-navy-deep)] w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-white/10 flex flex-col gap-4 relative">
            {isTutorial && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 animate-bounce flex flex-col items-center gap-1">
                <div className="bg-[color:var(--brand-cyan)] text-[color:var(--brand-navy-deep)] text-[11px] font-black uppercase px-3 py-1 rounded-full shadow-lg whitespace-nowrap">¡Elige una opción!</div>
                <Pointer className="w-8 h-8 text-[color:var(--brand-cyan)] drop-shadow-[0_0_8px_rgba(0,255,255,0.8)] rotate-180" />
              </div>
            )}
            <h3 className="text-xl font-bold text-center text-white mb-2">Crear nueva tabla</h3>
            <button onClick={() => { addTabla(); setCreationMode("none"); }} className="w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white font-bold flex flex-col items-center gap-1 border border-white/10">
              <Sparkles className="w-6 h-6 text-[color:var(--brand-cyan)]" />
              Generar aleatoria
            </button>
            <button onClick={() => setCreationMode("custom")} className="w-full py-4 rounded-xl hover:opacity-90 active:scale-95 transition-all text-[color:var(--brand-navy-deep)] font-bold flex flex-col items-center gap-1 shadow-lg" style={{ background: "var(--gradient-card-gold)" }}>
              <LayoutGrid className="w-6 h-6" />
              Crear personalizada
            </button>
            {!isTutorial && (
              <button onClick={() => setCreationMode("none")} className="mt-2 text-white/50 text-sm font-bold p-2">Cancelar</button>
            )}
          </div>
        </div>
      )}

      {creationMode === "custom" && (
        <CustomTablaModal
          initialCards={editingId ? tablas.find(t => t.id === editingId)?.cards : []}
          onClose={() => { setCreationMode("none"); setEditingId(null); }}
          onSave={(cards) => { 
            if (editingId) {
              const updated = tablas.map(t => t.id === editingId ? { ...t, cards } : t);
              setTablas(updated);
              saveTablas(updated);
            } else {
              addTabla(cards); 
            }
            setCreationMode("none"); 
            setEditingId(null);
            setSelected(null);
          }}
        />
      )}
    </div>
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

function EmptyState({ onAdd, isTutorial = false }: { onAdd: () => void; isTutorial?: boolean }) {
  return (
    <div className={`mt-10 flex flex-col items-center rounded-3xl px-6 py-10 text-center ring-1 ring-white/10 animate-slide-up-soft ${isTutorial ? "z-[70] relative bg-[color:var(--brand-navy)]/80 ring-2 ring-[color:var(--brand-cyan)] shadow-[0_0_30px_rgba(0,255,255,0.2)]" : "bg-white/5 backdrop-blur"}`}>
      <div
        className="mb-4 grid h-16 w-16 place-items-center rounded-2xl text-white shadow-lg"
        style={{ background: "var(--gradient-brand)" }}
      >
        <LayoutGrid className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-bold">{isTutorial ? "¡Bienvenido a Lotería La Garza!" : "Aún no tienes tablas"}</h3>
      <p className="mt-1 text-sm text-white/70">
        {isTutorial ? "Para comenzar a jugar, necesitas crear tu primera baraja." : "Crea tu primera tabla y comienza a jugar cuando quieras."}
      </p>
      
      <div className="relative mt-5">
        {isTutorial && (
          <div className="absolute -left-12 top-1/2 -translate-y-1/2 z-50 animate-bounce-slow flex flex-col items-center gap-1">
            <div className="bg-[color:var(--brand-cyan)] text-[color:var(--brand-navy-deep)] text-[10px] font-black uppercase px-2 py-1 rounded-full shadow-lg whitespace-nowrap">Crear baraja</div>
            <Pointer className="w-8 h-8 text-[color:var(--brand-cyan)] drop-shadow-[0_0_8px_rgba(0,255,255,0.8)] rotate-90" />
          </div>
        )}
        <button
          type="button"
          onClick={onAdd}
          className={`flex h-12 items-center gap-2 rounded-full px-6 text-sm font-bold text-white shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 active:scale-[0.98] ${isTutorial ? "ring-2 ring-white ring-offset-2 ring-offset-[color:var(--brand-navy-deep)] shadow-[0_0_20px_rgba(255,255,255,0.4)]" : ""}`}
          style={{ background: "var(--gradient-card-pink)" }}
        >
          <Plus className="h-4 w-4" /> Crear tabla
        </button>
      </div>
    </div>
  );
}

function TablaSheet({
  tabla,
  onClose,
  onDelete,
  onEdit,
}: {
  tabla: Tabla;
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 cursor-default z-0"
      />
      <div className="relative z-10 w-full max-w-md rounded-t-3xl bg-white p-5 pb-28 text-[color:var(--brand-navy-dark)] shadow-2xl animate-slide-up-soft">
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

        <div className="mt-5 grid grid-cols-2 gap-3 relative z-20">
          <button
            type="button"
            onClick={onEdit}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl text-sm font-bold text-white shadow-[var(--shadow-card)] transition hover:opacity-90"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Pencil className="h-4 w-4" /> Editar
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[color:var(--brand-pink)]/10 text-sm font-bold text-[color:var(--brand-pink)] ring-1 ring-[color:var(--brand-pink)]/30 transition hover:bg-[color:var(--brand-pink)]/20"
          >
            <Trash2 className="h-4 w-4" /> Borrar
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomTablaModal({ onClose, onSave, initialCards = [] }: { onClose: () => void; onSave: (cards: number[]) => void; initialCards?: number[] }) {
  const [selected, setSelected] = useState<number[]>(initialCards);

  const toggleCard = (n: number) => {
    if (selected.includes(n)) {
      setSelected(selected.filter(x => x !== n));
    } else {
      if (selected.length < 16) {
        setSelected([...selected, n]);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-[color:var(--brand-navy-deep)] animate-slide-up-soft">
      <header className="flex items-center justify-between px-4 py-4 bg-black/20 border-b border-white/10 shrink-0">
        <button onClick={onClose} className="p-2 text-white/70 hover:text-white"><ArrowLeft className="w-6 h-6" /></button>
        <h2 className="text-white font-bold text-lg">Personalizada</h2>
        <button 
          onClick={() => onSave(selected)}
          disabled={selected.length !== 16}
          className="px-3 py-1.5 rounded-full text-xs font-bold text-white disabled:opacity-50 disabled:bg-white/10 transition-all shadow-md"
          style={{ background: selected.length === 16 ? "var(--gradient-brand)" : undefined }}
        >
          {selected.length === 16 ? "Guardar" : `${selected.length}/16`}
        </button>
      </header>

      <div className="p-4 flex flex-col items-center shrink-0 border-b border-white/5">
        <p className="text-white/60 text-sm mb-3 font-semibold text-center">Toca las cartas abajo para agregarlas</p>
        <div className="grid grid-cols-4 gap-1.5 w-full max-w-[280px]">
          {Array.from({ length: 16 }).map((_, i) => {
            const cardNum = selected[i];
            return (
              <div key={i} onClick={() => cardNum && toggleCard(cardNum)} className="aspect-[3/4] bg-white/10 rounded-lg overflow-hidden border border-white/5 relative">
                {cardNum && (
                  <>
                    <CardTile n={cardNum} />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Trash2 className="text-red-400 w-6 h-6" />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 pb-32">
          {DECK.map(c => (
            <button key={c.n} onClick={() => toggleCard(c.n)} className={`relative aspect-[3/4] rounded-lg overflow-hidden transition-all ${selected.includes(c.n) ? 'ring-2 ring-[color:var(--brand-cyan)] opacity-50 scale-95' : 'ring-1 ring-white/10 hover:ring-white/30'}`}>
              <CardTile n={c.n} />
              {selected.includes(c.n) && <div className="absolute inset-0 bg-[color:var(--brand-cyan)]/20 flex items-center justify-center backdrop-blur-[1px]"><CheckCircle className="w-6 h-6 text-white" /></div>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
