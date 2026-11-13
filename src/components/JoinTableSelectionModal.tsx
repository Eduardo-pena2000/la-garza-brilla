import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "@tanstack/react-router";
import { X, Check, Plus, LayoutGrid, Users, Trophy, Play, Clock, Sparkles } from "lucide-react";
import { ref, update } from "firebase/database";
import { database } from "@/lib/firebase";
import { getCard } from "@/lib/deck";
import { getThemedCard } from "@/lib/deckSkins";

type Size = "4x4" | "5x5";

interface Tabla {
  id: string;
  size: Size;
  cards: number[];
  createdAt: number;
}

const TABLAS_KEY = "garza:tablas";

function loadUserTablas(): Tabla[] {
  try {
    const raw = localStorage.getItem(TABLAS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUserTablas(tablas: Tabla[]) {
  try {
    localStorage.setItem(TABLAS_KEY, JSON.stringify(tablas));
    window.dispatchEvent(new Event("garza:tablas-updated"));
  } catch {}
}

function generateRandomCards(size: Size): number[] {
  const total = size === "4x4" ? 16 : 25;
  const pool = Array.from({ length: 54 }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, total);
}

interface JoinTableSelectionModalProps {
  open: boolean;
  mesa: any;
  onClose: () => void;
  onSuccess?: (selectedIds: string[]) => void;
}

export function JoinTableSelectionModal({
  open,
  mesa,
  onClose,
  onSuccess,
}: JoinTableSelectionModalProps) {
  const navigate = useNavigate();
  const [tablas, setTablas] = useState<Tabla[]>([]);
  const [desiredCount, setDesiredCount] = useState<number>(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isJoining, setIsJoining] = useState(false);

  const roomSize: Size = (mesa?.size as Size) || "4x4";
  const limit: number = Math.max(1, mesa?.perPlayer || 2);

  // Load user boards & initialize
  useEffect(() => {
    if (!open || !mesa) return;

    const userTablas = loadUserTablas();
    const matching = userTablas.filter((t) => t.size === roomSize);
    setTablas(userTablas);

    // Determine initial count: check if user already had a saved selection for this mesa
    let initialCount = Math.min(Math.max(1, matching.length), limit);
    let initialSelected: string[] = [];

    try {
      const saved = localStorage.getItem(`garza:selectedTablas:${mesa.id}`);
      if (saved) {
        const ids = JSON.parse(saved) as string[];
        const validIds = ids.filter((id) => matching.some((t) => t.id === id));
        if (validIds.length > 0 && validIds.length <= limit) {
          initialSelected = validIds;
          initialCount = validIds.length;
        }
      }
    } catch {}

    if (initialSelected.length === 0 && matching.length > 0) {
      // Pick first `initialCount` matching tables
      initialSelected = matching.slice(0, initialCount).map((t) => t.id);
    }

    setDesiredCount(initialCount);
    setSelectedIds(initialSelected);
    setIsJoining(false);
  }, [open, mesa, roomSize, limit]);

  const matchingTablas = useMemo(() => {
    return tablas.filter((t) => t.size === roomSize);
  }, [tablas, roomSize]);

  // Handle changing desired count
  function handleCountChange(count: number) {
    const validCount = Math.max(1, Math.min(limit, count));
    setDesiredCount(validCount);

    // Ensure we have enough matching tables created
    let currentMatching = matchingTablas;
    if (currentMatching.length < validCount) {
      const need = validCount - currentMatching.length;
      const newGenerated: Tabla[] = [];
      for (let i = 0; i < need; i++) {
        newGenerated.push({
          id: Math.random().toString(36).substring(2, 9),
          size: roomSize,
          cards: generateRandomCards(roomSize),
          createdAt: Date.now() + i,
        });
      }
      const updated = [...tablas, ...newGenerated];
      saveUserTablas(updated);
      setTablas(updated);
      currentMatching = updated.filter((t) => t.size === roomSize);
    }

    // Adjust selected IDs to match validCount
    setSelectedIds((prev) => {
      const currentValid = prev.filter((id) => currentMatching.some((t) => t.id === id));
      if (currentValid.length === validCount) return currentValid;
      if (currentValid.length > validCount) return currentValid.slice(0, validCount);

      // Need to select more
      const unselected = currentMatching.filter((t) => !currentValid.includes(t.id));
      const additions = unselected.slice(0, validCount - currentValid.length).map((t) => t.id);
      return [...currentValid, ...additions];
    });
  }

  // Toggle or swap table selection
  function handleToggleTabla(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        // Can't unselect if it's the only one left
        if (prev.length <= 1) return prev;
        return prev.filter((x) => x !== id);
      }
      // If we already reached desired count, swap the first with the newly clicked table
      if (prev.length >= desiredCount) {
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  }

  // Create another random table
  function handleGenerateExtraTabla() {
    const newTabla: Tabla = {
      id: Math.random().toString(36).substring(2, 9),
      size: roomSize,
      cards: generateRandomCards(roomSize),
      createdAt: Date.now(),
    };
    const updated = [newTabla, ...tablas];
    saveUserTablas(updated);
    setTablas(updated);

    // If still have room or swap, select the newly generated one
    setSelectedIds((prev) => {
      if (prev.length < desiredCount) {
        return [...prev, newTabla.id];
      }
      return [...prev.slice(1), newTabla.id];
    });
  }

  // Confirm and proceed to game or lobby
  async function handleConfirm() {
    if (!mesa) return;
    setIsJoining(true);

    const userName = localStorage.getItem("garza:name") || "Invitado";

    // 1. Save chosen tables for this mesa
    try {
      localStorage.setItem(`garza:selectedTablas:${mesa.id}`, JSON.stringify(selectedIds));
    } catch {}

    // 2. Register/Update player in Firebase
    try {
      const isGameInProgress = mesa.status === "en-juego";
      const isSpectator = isGameInProgress && mesa.host !== userName;
      const playerRef = ref(database, `mesas/${mesa.id}/players/${userName}`);
      await update(playerRef, {
        name: userName,
        role: mesa.host === userName ? "host" : (isSpectator ? "spectator" : "guest"),
        status: isSpectator ? "spectator" : "active",
        tablesCount: selectedIds.length,
        ready: true,
      });
    } catch (e) {
      console.warn("Could not register player state in Firebase", e);
    }

    if (onSuccess) {
      onSuccess(selectedIds);
    }

    // 3. Navigate depending on match status
    // If game is in progress -> directly to game (/mesa/$id/jugar)
    // If in lobby/waiting/scheduled -> to lobby (/mesa/$id)
    if (mesa.status === "en-juego") {
      navigate({ to: "/mesa/$id/jugar", params: { id: mesa.id } });
    } else {
      navigate({ to: "/mesa/$id", params: { id: mesa.id } });
    }

    onClose();
  }

  if (!open || !mesa) return null;

  const isGameInProgress = mesa.status === "en-juego";
  const isValidSelection = selectedIds.length === desiredCount && desiredCount > 0;

  // Options for table count: from 1 up to limit
  // e.g. limit 2 -> [1, 2]
  // limit 4 -> [1, 2, 4] or [1, 2, 3, 4]
  // limit 8 -> [1, 2, 4, 8]
  const countOptions = Array.from({ length: limit }, (_, i) => i + 1);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[color:var(--brand-navy-deep)] w-full max-w-md rounded-3xl p-5 ring-1 ring-white/15 shadow-2xl animate-pop-in border border-white/10 relative max-h-[90vh] flex flex-col"
      >
        {/* Close Button with large touch target */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition active:scale-95 touch-manipulation cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-3 pr-8">
          <div className="w-11 h-11 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30 shrink-0">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <span>Unirse a la sala</span>
              <span className="inline-block w-1 h-1 rounded-full bg-amber-400" />
              <span>{mesa.size}</span>
            </span>
            <h2 className="text-lg font-black text-white truncate leading-tight">{mesa.name}</h2>
          </div>
        </div>

        {/* Room Info Bar & Limit Badge */}
        <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-2xl bg-black/40 border border-white/5 mb-4 text-xs">
          {/* Límite de tablas */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 font-black">
            <Trophy className="w-3.5 h-3.5" />
            <span>Límite de sala: {limit} {limit === 1 ? "tabla" : "tablas"}</span>
          </div>

          {/* Status pill */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold ${
            isGameInProgress 
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
              : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
          }`}>
            <span className={`w-2 h-2 rounded-full ${isGameInProgress ? "bg-emerald-400 animate-pulse" : "bg-cyan-400"}`} />
            <span>{isGameInProgress ? "Partida en curso" : "En espera (Lobby)"}</span>
          </div>

          <div className="text-white/60 ml-auto flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>Host: <strong>{mesa.host}</strong></span>
          </div>
        </div>

        {/* Scrollable Content */}
        {matchingTablas.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center my-auto">
            <div className="w-16 h-16 rounded-3xl bg-amber-400/20 text-amber-300 flex items-center justify-center border-2 border-amber-400/40 mb-3 shadow-lg">
              <LayoutGrid className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-white mb-1">¡No tienes barajas creadas!</h3>
            <p className="text-xs text-white/60 mb-5 max-w-xs leading-relaxed">
              Esta sala requiere barajas de tamaño <strong className="text-amber-300">{roomSize}</strong>. Para jugar debes crear primero tu baraja en &ldquo;Mis Barajas&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate({ to: "/" });
              }}
              className="btn-gold px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Mi Primera Baraja</span>
            </button>
          </div>
        ) : (
          <div className="flex-1 pr-1 space-y-4 hide-scrollbar scroll-touch-y">
          {/* Step 1: Con cuántas tablas quieres jugar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-white/90">
                1. ¿Con cuántas tablas quieres jugar?
              </label>
              <span className="text-[11px] font-bold text-amber-300">
                Máx. {limit} {limit === 1 ? "tabla" : "tablas"}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {countOptions.map((n) => {
                const isSelected = desiredCount === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleCountChange(n)}
                    className={`py-2.5 px-2 rounded-2xl text-xs font-black transition-all flex flex-col items-center justify-center gap-0.5 border active:scale-95 ${
                      isSelected
                        ? "bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 border-amber-300 shadow-[0_4px_12px_rgba(251,191,36,0.35)] scale-100"
                        : "bg-white/5 hover:bg-white/10 text-white/80 border-white/10"
                    }`}
                  >
                    <span className="text-base leading-none">{n}</span>
                    <span className="text-[10px] font-bold opacity-80">{n === 1 ? "Tabla" : "Tablas"}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Selecciona tus tablas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-white/90 block">
                  2. Selecciona tus tablas
                </label>
                <span className="text-[11px] text-white/50">
                  Elige las {desiredCount} {desiredCount === 1 ? "tabla" : "tablas"} que usarás en la partida
                </span>
              </div>
              <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                selectedIds.length === desiredCount
                  ? "bg-amber-400/20 text-amber-300 border-amber-400/40"
                  : "bg-white/10 text-white/60 border-white/10"
              }`}>
                {selectedIds.length} / {desiredCount}
              </span>
            </div>

            {/* List of user boards */}
            <div className="grid grid-cols-2 gap-2.5">
              {matchingTablas.map((t, index) => {
                const isSelected = selectedIds.includes(t.id);
                // Pre-fetch 4 sample cards for preview thumbnail
                const previewCards = t.cards.slice(0, 4);

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleToggleTabla(t.id)}
                    className={`relative p-3 rounded-2xl border text-left transition-all active:scale-98 flex flex-col justify-between overflow-hidden group ${
                      isSelected
                        ? "bg-amber-400/15 border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.2)]"
                        : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="text-xs font-black text-white">
                        Tabla #{index + 1}
                      </span>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-amber-400 text-slate-950 shadow-sm"
                          : "border border-white/30 text-transparent"
                      }`}>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>

                    {/* Mini board preview (2x2 cards sample) */}
                    <div className="grid grid-cols-2 gap-1 w-full bg-black/40 p-1.5 rounded-xl border border-white/5">
                      {previewCards.map((cn, ci) => {
                        const card = getThemedCard(cn);
                        return (
                          <div
                            key={ci}
                            className="aspect-[3/4] rounded-lg overflow-hidden relative bg-white/5 border border-white/10"
                          >
                            {card?.image ? (
                              <img
                                src={card.image}
                                alt={card.name}
                                decoding="async"
                                onError={(e) => {
                                  if (card.fallbackImage && e.currentTarget.src !== card.fallbackImage) {
                                    e.currentTarget.src = card.fallbackImage;
                                  }
                                }}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-white/40">
                                {cn}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-white/50">
                      <span>{t.size}</span>
                      <span className="font-mono text-white/40">#{t.id.slice(0, 4)}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Extra button: generate new random tabla */}
            <button
              type="button"
              onClick={handleGenerateExtraTabla}
              className="w-full mt-2 py-2.5 px-3 rounded-2xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-98"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Crear otra tabla nueva ({roomSize})</span>
            </button>
          </div>
        </div>
        )}

        {/* Footer Actions */}
        {matchingTablas.length > 0 && (
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-col gap-2">
            {/* Destination notice */}
            <div className="text-center text-[11px] text-white/60">
              {isGameInProgress ? (
                <span className="text-purple-300 font-bold flex items-center justify-center gap-1.5 bg-purple-950/60 p-2 rounded-xl border border-purple-500/30">
                  <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                  <span>Partida en curso — entrarás como <strong>Espectador</strong> y jugarás en la siguiente ronda</span>
                </span>
              ) : (
                <span className="text-cyan-300 font-medium flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  La sala está en espera — ingresarás al lobby con los jugadores
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isJoining}
                className="flex-1 py-3.5 rounded-2xl bg-white/10 text-white/80 font-bold text-xs hover:bg-white/15 transition active:scale-95 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={!isValidSelection || isJoining}
                className="flex-[2] py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-[0_5px_20px_rgba(251,191,36,0.35)] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGameInProgress ? "Entrar como Espectador" : "Entrar al Lobby"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
