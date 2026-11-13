import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import {
  ArrowLeft, Pause, Play, Settings2, MessageCircle, Users, RotateCcw,
  Timer as TimerIcon, Heart, Image as ImageIcon, Triangle, X, Send,
  Menu, Info, Trophy, Link as LinkIcon, Edit2, Share2, LayoutGrid, Check, CircleDot, Zap, Crown, ShieldCheck,
  ChevronLeft, ChevronRight, Sparkles, ChevronUp, History
} from "lucide-react";
import logoGarza from "@/assets/logo-garza.png";
import { DECK, getCard } from "@/lib/deck";
import { ref, onValue, update, push, set, onDisconnect, remove } from "firebase/database";
import { database } from "@/lib/firebase";
import { BrandBackground } from "@/components/BrandBackground";
import { CoinAnimation } from "@/components/CoinAnimation";
import { MiniBoardIllustration } from "@/components/MiniBoardIllustration";
import { increment } from "firebase/database";
import { AdInterstitialModal } from "@/components/AdInterstitialModal";
import { getEquippedMarker, getOwnedItemIds } from "@/lib/loot";
import { SPECIAL_STICKERS, SPECIAL_EMOJIS } from "@/lib/chests";
import { getEquippedDeckSkin, getThemedCard, type ThemedCard } from "@/lib/deckSkins";
import { getCurrentUser } from "@/lib/auth";

export const Route = createFileRoute("/mesa/$id/jugar")({
  component: JugarPage,
});

type Size = "4x4" | "5x5";
type Mode = "normal" | "pozo" | "esquinas" | "sieteLoco" | "modoX";

interface Tabla {
  id: string; size: Size; cards: number[]; createdAt: number;
}
export interface MesaWinner {
  name: string;
  isBot?: boolean;
  prize: number;
  reason?: "loteria" | "random_finish";
  timestamp: number;
}
export interface PlayerGameSession {
  name: string;
  role: "host" | "guest" | "spectator";
  status?: "active" | "disconnected" | "spectator";
  botActive?: boolean;
  disconnectedAt?: number;
  tablas?: Tabla[];
  marked?: string[];
  lastActive?: number;
}
interface Mesa {
  id: string; name: string; mode: Mode; size: Size; perPlayer: number; cost?: number;
  tablaIds: string[]; host: string; status: string; deck?: number[];
  drawnIdx?: number; players?: Record<string, PlayerGameSession>; prizePool?: number; serverPaused?: boolean;
  speed?: number;
  winner?: MesaWinner;
  nextRoundAt?: number;
  isVip?: boolean; isScheduled?: boolean; scheduledDate?: string; scheduledTime?: string;
  rounds?: any[]; currentRound?: number;
  whitelistOnly?: boolean; registeredPlayers?: { name: string }[];
  hostLeft?: boolean;
}
interface ChatMsg {
  id: string; text: string; sender: string; timestamp: number;
}

const TABLAS_KEY = "garza:tablas";

function loadTablas(): Tabla[] {
  try {
    const raw = localStorage.getItem(TABLAS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Tabla[];
  } catch { return []; }
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

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const SPEED_OPTIONS = [2, 3, 4, 5, 6, 8];

function speedFor(mesa?: { speed?: number } | null): number {
  return (mesa?.speed && mesa.speed >= 1 ? mesa.speed : 4) * 1000;
}

const MODE_META: Record<Mode, { label: string; hint: string; icon: React.ComponentType<{ className?: string }> }> = {
  normal: { label: "Normal", hint: "Línea, cuadro chico, 4 esquinas o llena", icon: Trophy },
  pozo: { label: "Pozo", hint: "Grupo al centro", icon: CircleDot },
  esquinas: { label: "4 Esquinas", hint: "Las cuatro esquinas", icon: LayoutGrid },
  sieteLoco: { label: "7 Loco", hint: "Patrón de 7 cartas", icon: Zap },
  modoX: { label: "Modo X", hint: "Forma una X", icon: X },
};

function checkWin(mode: Mode, size: Size, cards: number[], isMarked: (c: number) => boolean): boolean {
  const n = size === "4x4" ? 4 : 5;
  const grid = Array.from({ length: n }, (_, r) => cards.slice(r * n, (r + 1) * n));

  if (mode === "normal") {
    // 1. Tabla llena (todas las cartas)
    if (cards.every(isMarked)) return true;

    // 2. Líneas horizontales (cualquier fila)
    for (let r = 0; r < n; r++) if (grid[r].every(isMarked)) return true;

    // 3. Líneas verticales (cualquier columna / chorro)
    for (let c = 0; c < n; c++) if (grid.every((row) => isMarked(row[c]))) return true;

    // 4. Diagonales (ambas esquinas cruzadas)
    if (grid.every((row, i) => isMarked(row[i]))) return true;
    if (grid.every((row, i) => isMarked(row[n - 1 - i]))) return true;

    // 5. Cuatro esquinas tradicionales
    if ([grid[0][0], grid[0][n - 1], grid[n - 1][0], grid[n - 1][n - 1]].every(isMarked)) return true;

    // 6. Cuadro chico (cualquier bloque contiguo 2x2 en la tabla, ej. centro o esquinas)
    for (let r = 0; r < n - 1; r++) {
      for (let c = 0; c < n - 1; c++) {
        if ([grid[r][c], grid[r][c + 1], grid[r + 1][c], grid[r + 1][c + 1]].every(isMarked)) {
          return true;
        }
      }
    }

    return false;
  }
  if (mode === "pozo") {
    if (n === 4) return [grid[1][1], grid[1][2], grid[2][1], grid[2][2]].every(isMarked);
    return [grid[1][1], grid[1][2], grid[1][3], grid[2][1], grid[2][2], grid[2][3], grid[3][1], grid[3][2], grid[3][3]].every(isMarked);
  }
  if (mode === "esquinas") {
    return [grid[0][0], grid[0][n - 1], grid[n - 1][0], grid[n - 1][n - 1]].every(isMarked);
  }
  if (mode === "sieteLoco") {
    // Implementación temporal, puedes definir una forma específica si lo prefieres
    return cards.filter(isMarked).length >= 7; 
  }
  if (mode === "modoX") {
    const diag1 = grid.every((row, i) => isMarked(row[i]));
    const diag2 = grid.every((row, i) => isMarked(row[n - 1 - i]));
    return diag1 && diag2;
  }
  return false;
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-green-500' : 'bg-gray-300'}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
    </button>
  );
}

function JugarPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const [mesa, setMesa] = useState<Mesa | null>(null);
  const [tablasActivas, setTablasActivas] = useState<Tabla[]>([]);
  const [loading, setLoading] = useState(true);
  const [won, setWon] = useState(false);
  const [winDismissed, setWinDismissed] = useState(false);
  const [roundPaid, setRoundPaid] = useState(false);
  
  const [coins, setCoins] = useState(() => {
    if (typeof window === "undefined") return 1000;
    const c = localStorage.getItem("garza:coins");
    return c ? parseInt(c, 10) : 1000;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("garza:coins", coins.toString());
    }
  }, [coins]);

  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (mesa) {
      if (mesa.serverPaused !== undefined) {
        setPaused(mesa.serverPaused);
      } else if (mesa.status === "en-juego") {
        setPaused(false);
      }
    }
  }, [mesa?.serverPaused, mesa?.status]);

  const [settings, setSettings] = useState(() => {
    try {
      const eq = getEquippedMarker();
      return {
        audio: true,
        effects: true,
        confetti: true,
        vibration: true,
        marker: eq?.image || eq?.emoji || "/markers/ifrijol.png",
        voice: "default",
      };
    } catch {
      return {
        audio: true,
        effects: true,
        confetti: true,
        vibration: true,
        marker: "/markers/ifrijol.png",
        voice: "default",
      };
    }
  });

  useEffect(() => {
    const applyMarker = () => {
      try {
        const marker = getEquippedMarker();
        if (marker.image) {
          setSettings((prev) => ({ ...prev, marker: marker.image! }));
        } else if (marker.emoji) {
          setSettings((prev) => ({ ...prev, marker: marker.emoji }));
        }
      } catch {}
    };
    applyMarker();
    window.addEventListener("garza:marker-updated", applyMarker);
    return () => window.removeEventListener("garza:marker-updated", applyMarker);
  }, []);

  const [deckSkin, setDeckSkin] = useState(() => getEquippedDeckSkin());

  useEffect(() => {
    const handleDeckUpdate = () => {
      setDeckSkin(getEquippedDeckSkin());
    };
    window.addEventListener("garza:deck-updated", handleDeckUpdate);
    return () => window.removeEventListener("garza:deck-updated", handleDeckUpdate);
  }, []);

  const VOICES = [
    { id: "default", name: "Clásica", icon: "\uD83D\uDC69\u200D\uD83C\uDFA4" },
    { id: "1", name: "Voz 1", icon: "\uD83D\uDC68\u200D\uD83C\uDFA4" },
    { id: "2", name: "Voz 2", icon: "\uD83D\uDC69\u200D\uD83C\uDFA4" },
    { id: "3", name: "Voz 3", icon: "\uD83D\uDC68\u200D\uD83C\uDFA4" },
    { id: "5", name: "Voz 4", icon: "\uD83D\uDC69\u200D\uD83C\uDFA4" },
    { id: "6", name: "Voz 5", icon: "\uD83D\uDC68\u200D\uD83C\uDFA4" },
    { id: "7", name: "Voz 6", icon: "\uD83D\uDC69\u200D\uD83C\uDFA4" },
    { id: "8", name: "Voz 7", icon: "\uD83D\uDC68\u200D\uD83C\uDFA4" },
    { id: "9", name: "Voz 8", icon: "\uD83D\uDC69\u200D\uD83C\uDFA4" },
  ];

  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([]);
  const [floatingMsg, setFloatingMsg] = useState<{ text: string; sender: string; isSticker: boolean } | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [stickerTab, setStickerTab] = useState<"botin" | "clasicos" | "gifs" | "cartas">("botin");
  
  // Scratch Interaction
  const [interaction, setInteraction] = useState<{
    uid: string;
    startX: number;
    startY: number;
    curX: number;
    curY: number;
    isScratching: boolean;
  } | null>(null);

  // Modals state
  const [activeModal, setActiveModal] = useState<"chat"|"players"|"settings"|"tablas"|"modos"|"stickers"|"menu"|"exitConfirm"|null>(null);
  const [showAd, setShowAd] = useState(false);
  const [pendingActionAfterAd, setPendingActionAfterAd] = useState<(() => void) | null>(null);

  const TABLAS_PER_PAGE = 4;
  const [activePageIndex, setActivePageIndex] = useState(0);
  const boardsSliderRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // Verificación de identidad: si entra por enlace sin cuenta ni nombre, redirigir a inicio
  const user = getCurrentUser();
  const storedName = typeof window !== "undefined" ? localStorage.getItem("garza:name") : null;
  const isSessionActive = typeof window !== "undefined" && sessionStorage.getItem("garza:session_active") === "true";
  const hasValidIdentity = Boolean(
    (user && user.email) ||
    (isSessionActive && storedName && storedName.trim().length > 0 && storedName !== "Jugador" && storedName !== "Invitado")
  );

  useEffect(() => {
    if (!hasValidIdentity) {
      navigate({
        to: "/",
        search: { redirect: `/mesa/${id}/jugar` },
      });
    }
  }, [hasValidIdentity, id, navigate]);

  const userName = (user?.name || storedName || "Jugador").trim();
  const isHost = Boolean(
    typeof window !== "undefined" &&
    (sessionStorage.getItem(`garza:host:${id}`) === "true" || localStorage.getItem(`garza:host:${id}`) === "true") &&
    mesa?.host === userName
  );
  const cardAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioPoolRef = useRef<Map<number, HTMLAudioElement>>(new Map());

  // Chunk active boards into pages of 4 (e.g. 8 tablas -> Page 1: 4, Page 2: 4)
  const pages = useMemo(() => {
    if (tablasActivas.length === 0) return [];
    if (tablasActivas.length <= TABLAS_PER_PAGE) return [tablasActivas];
    const chunks: Tabla[][] = [];
    for (let i = 0; i < tablasActivas.length; i += TABLAS_PER_PAGE) {
      chunks.push(tablasActivas.slice(i, i + TABLAS_PER_PAGE));
    }
    return chunks;
  }, [tablasActivas]);

  const handleBoardsScroll = () => {
    if (!boardsSliderRef.current) return;
    const { scrollLeft, clientWidth } = boardsSliderRef.current;
    if (clientWidth > 0) {
      const idx = Math.round(scrollLeft / clientWidth);
      if (idx !== activePageIndex && idx >= 0 && idx < pages.length) {
        setActivePageIndex(idx);
      }
    }
  };

  const scrollToPage = (idx: number) => {
    if (!boardsSliderRef.current) return;
    const width = boardsSliderRef.current.clientWidth;
    boardsSliderRef.current.scrollTo({
      left: width * idx,
      behavior: "smooth"
    });
    setActivePageIndex(idx);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
    
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0 && activePageIndex < pages.length - 1) {
        scrollToPage(activePageIndex + 1);
      } else if (deltaX > 0 && activePageIndex > 0) {
        scrollToPage(activePageIndex - 1);
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  useEffect(() => {
    const mesaRef = ref(database, `mesas/${id}`);
    const unsubscribe = onValue(mesaRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMesa(data as Mesa);
        if (isHost && !data.deck) {
          const newDeck = shuffle(DECK.map((c) => c.n));
          update(mesaRef, { deck: newDeck, drawnIdx: -1 });
        }
        
        // Initialize boards if not loaded yet
        setTablasActivas(prev => {
          if (prev.length > 0) return prev;
          const remoteTablas = data.players?.[userName]?.tablas;
          if (remoteTablas && Array.isArray(remoteTablas) && remoteTablas.length > 0) {
            return remoteTablas;
          }
          let allTablas = loadTablas().filter(t => t.size === data.size);
          const count = data.perPlayer || 2;
          if (allTablas.length < count) {
            const need = count - allTablas.length;
            const generated: Tabla[] = [];
            for (let i = 0; i < need; i++) {
              generated.push({
                id: Math.random().toString(36).substring(2, 9),
                size: data.size,
                cards: randomCards(data.size),
                createdAt: Date.now() + i,
              });
            }
            try {
              const fullStored = loadTablas();
              localStorage.setItem("garza:tablas", JSON.stringify([...fullStored, ...generated]));
            } catch {}
            allTablas = [...allTablas, ...generated];
          }
          try {
            const savedSelected = localStorage.getItem(`garza:selectedTablas:${id}`);
            if (savedSelected) {
              const ids = JSON.parse(savedSelected) as string[];
              const selected = ids.map(tid => allTablas.find(t => t.id === tid)).filter(Boolean) as Tabla[];
              if (selected.length >= 1 && selected.length <= count) return selected;
            }
          } catch {}
          return allTablas.slice(0, Math.min(2, count));
        });

      } else {
        setMesa(null);
      }
      setLoading(false);
    });

    const chatRef = ref(database, `mesas/${id}/chat`);
    const unsubscribeChat = onValue(chatRef, (snapshot) => {
      const msgs = snapshot.val();
      if (msgs) {
        const msgList = Object.values(msgs) as ChatMsg[];
        msgList.sort((a, b) => a.timestamp - b.timestamp);
        setChatMsgs(msgList);
        const last = msgList[msgList.length - 1];
        if (Date.now() - last.timestamp < 3000) {
          const isSticker = last.text.startsWith("[STICKER:") && last.text.endsWith("]");
          setFloatingMsg({ text: last.text, sender: last.sender, isSticker });
          setTimeout(() => setFloatingMsg(null), 3000);
        }
      }
    });

    return () => {
      unsubscribe();
      unsubscribeChat();
    };
  }, [id, isHost, userName]);

  const deck = mesa?.deck || [];
  const drawnIdx = mesa?.drawnIdx ?? -1;
  const isGameStarted = drawnIdx >= 0;
  const isGameActive = Boolean(mesa && mesa.status === "en-juego" && drawnIdx >= 0 && !mesa.winner);

  // Determinar si entra como espectador:
  // 1. Si no ha iniciado la baraja o ya hay ganador, nadie es espectador (todos juegan)
  // 2. Si la sala tiene whitelist y no está incluido
  // 3. Si la ronda YA está en curso (isGameActive) y el usuario entra nuevo sin haber estado en el lobby
  const isSpectator = useMemo(() => {
    if (!mesa) return false;
    // Si la ronda terminó o no ha iniciado la baraja, nadie es espectador (todos son jugadores)
    if (drawnIdx < 0 || Boolean(mesa.winner)) {
      return false;
    }
    if (isHost) return false;

    if (mesa.whitelistOnly && mesa.registeredPlayers) {
      const allowed = mesa.registeredPlayers.some(
        (p) => p.name.trim().toLowerCase() === userName.trim().toLowerCase()
      );
      if (!allowed) return true;
    }

    const wasInLobby = typeof window !== "undefined" && (
      sessionStorage.getItem(`garza:registered:${id}`) === "true" ||
      localStorage.getItem(`garza:registered:${id}`) === "true"
    );

    // Si ya estaba en la sala antes de iniciar o ya jugó la ronda previa, es jugador activo
    if (wasInLobby) {
      return false;
    }

    const userPlayer = mesa.players?.[userName];
    if (userPlayer?.role === "spectator" || userPlayer?.status === "spectator") {
      return true;
    }

    const hadActiveSession = Boolean(userPlayer && userPlayer.status === "active");
    if (!wasInLobby && !hadActiveSession && isGameActive) {
      return true;
    }
    return false;
  }, [mesa, userName, isHost, drawnIdx, id, isGameActive]);

  // Transición automática: al terminar la ronda o entre rondas, los espectadores se promueven a jugadores activos
  useEffect(() => {
    if (!id || !userName) return;
    if (drawnIdx < 0 || Boolean(mesa?.winner)) {
      try {
        localStorage.setItem(`garza:registered:${id}`, "true");
        sessionStorage.setItem(`garza:registered:${id}`, "true");
      } catch {}

      const userPlayer = mesa?.players?.[userName];
      if (userPlayer && (userPlayer.role === "spectator" || userPlayer.status === "spectator")) {
        update(ref(database, `mesas/${id}/players/${userName}`), {
          role: isHost ? "host" : "guest",
          status: "active",
        }).catch(() => {});
      }
    }
  }, [drawnIdx, mesa?.winner, id, userName, isHost, mesa?.players]);

  // Keep-alive presence & bot registration: si el jugador se desconecta, el bot toma el control
  useEffect(() => {
    if (!id || !userName || tablasActivas.length === 0) return;

    const playerRef = ref(database, `mesas/${id}/players/${userName}`);

    // Si el bot marcó cartas mientras el usuario estaba fuera, restaurarlas localmente:
    const remoteMarks = mesa?.players?.[userName]?.marked;
    if (remoteMarks && Array.isArray(remoteMarks) && remoteMarks.length > 0) {
      setMarked((prev) => {
        const next = new Set(prev);
        remoteMarks.forEach((m) => next.add(m));
        return next;
      });
    }

    update(playerRef, {
      name: userName,
      role: isSpectator ? "spectator" : (isHost ? "host" : "guest"),
      status: isSpectator ? "spectator" : "active",
      botActive: false,
      tablas: tablasActivas.map((t) => ({ id: t.id, size: t.size, cards: t.cards, createdAt: t.createdAt })),
      lastActive: Date.now(),
    }).catch(() => {});

    // IMPORTANTE: Al desconectarse, NO eliminar al jugador. Marcarlo como desconectado para que el bot juegue por él.
    const discRef = onDisconnect(playerRef);
    discRef.update({
      status: "disconnected",
      botActive: true,
      disconnectedAt: Date.now(),
    });

    return () => {
      discRef.cancel();
    };
  }, [id, userName, isHost, tablasActivas, isSpectator]);

  // Elección del active caller (Host Failover):
  // Si el host se desconecta, el primer invitado conectado toma el control de avanzar las cartas
  const activeCallerName = useMemo(() => {
    if (!mesa?.players) return isHost ? userName : null;
    const playersArr = Object.values(mesa.players);
    if (playersArr.length === 0) return isHost ? userName : null;

    const activePlayers = playersArr.filter((p) => p.status !== "disconnected");
    if (activePlayers.length > 0) {
      const activeHost = activePlayers.find((p) => p.role === "host" || p.name === mesa.host);
      if (activeHost) return activeHost.name;
      // Host desconectado: el primer invitado activo toma el relevo automáticamente
      activePlayers.sort((a, b) => a.name.localeCompare(b.name));
      return activePlayers[0].name;
    }

    // Fallback si todos están desconectados
    const hostFallback = playersArr.find((p) => p.role === "host" || p.name === mesa.host);
    return hostFallback ? hostFallback.name : playersArr[0].name;
  }, [mesa?.players, mesa?.host, isHost, userName]);

  const isCaller = userName === activeCallerName;

  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const timeSecs = mesa?.speed && mesa.speed >= 1 ? mesa.speed : 4;

  const handleSetSpeed = (newSpeed: number) => {
    if (!isHost) return;
    update(ref(database, `mesas/${id}`), { speed: newSpeed }).catch(() => {});
    setShowSpeedMenu(false);
  };

  const handleCycleSpeed = () => {
    if (!isHost) return;
    const current = mesa?.speed && mesa.speed >= 1 ? mesa.speed : 4;
    const currentIdx = SPEED_OPTIONS.indexOf(current);
    const nextSpeed = currentIdx === -1 ? 4 : SPEED_OPTIONS[(currentIdx + 1) % SPEED_OPTIONS.length];
    handleSetSpeed(nextSpeed);
  };

  const handleStartGame = () => {
    if (!isHost && !isCaller) return;
    if (drawnIdx < 0) {
      const newDeck = mesa?.deck && mesa.deck.length > 0 ? mesa.deck : shuffle(DECK.map((c) => c.n));
      update(ref(database, `mesas/${id}`), {
        status: "en-juego",
        serverPaused: false,
        deck: newDeck,
        drawnIdx: 0,
      }).catch(() => {});
      setPaused(false);
    }
  };

  // Desbloqueo robusto del contexto de audio en Safari/iOS en la primera interacción táctil
  useEffect(() => {
    const unlock = () => {
      try {
        if (!cardAudioRef.current) {
          cardAudioRef.current = new Audio();
        }
        cardAudioRef.current.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
        const p = cardAudioRef.current.play();
        if (p !== undefined) {
          p.then(() => {
            if (cardAudioRef.current) {
              cardAudioRef.current.pause();
              cardAudioRef.current.currentTime = 0;
            }
          }).catch(() => {});
        }
      } catch {}
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("touchstart", unlock, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  // Pre-carga anticipada de audios de las próximas 8 cartas para evitar desfase en iOS/móvil
  useEffect(() => {
    if (!deck || deck.length === 0 || !settings.audio) return;
    const start = Math.max(0, drawnIdx);
    const nextBatch = deck.slice(start, start + 8);
    const basePath = settings.voice === "default" ? "/audio/cards" : `/audio/cards/${settings.voice}`;
    nextBatch.forEach((c) => {
      if (!audioPoolRef.current.has(c)) {
        try {
          const pre = new Audio(`${basePath}/b${c}.mp3`);
          pre.preload = "auto";
          audioPoolRef.current.set(c, pre);
        } catch {}
      }
    });
  }, [deck, drawnIdx, settings.audio, settings.voice]);

  // Reproducción de audio en tiempo real y sincronizada (optimizada para iOS y baja latencia)
  const currentCard = deck[drawnIdx];
  useEffect(() => {
    if (currentCard !== undefined && settings.audio && drawnIdx >= 0) {
      const basePath = settings.voice === "default" ? "/audio/cards" : `/audio/cards/${settings.voice}`;
      const audioUrl = `${basePath}/b${currentCard}.mp3`;

      let player = cardAudioRef.current;
      if (!player) {
        player = new Audio();
        cardAudioRef.current = player;
      }

      try {
        player.pause();
      } catch {}
      player.src = audioUrl;
      player.currentTime = 0;
      const playPromise = player.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          try {
            const fallback = new Audio(audioUrl);
            fallback.play().catch(() => {});
          } catch {}
        });
      }
    }
  }, [currentCard, drawnIdx, settings.audio, settings.voice]);

  const drawn = drawnIdx >= 0 ? getThemedCard(deck[drawnIdx], deckSkin.id) : null;

  // Historial de todas las cartas voceadas en la partida actual
  const calledCards = useMemo(() => {
    if (drawnIdx < 0 || !deck || deck.length === 0) return [];
    const list: ThemedCard[] = [];
    const count = Math.min(drawnIdx + 1, deck.length);
    for (let i = 0; i < count; i++) {
      const card = getThemedCard(deck[i], deckSkin.id);
      if (card) list.push(card);
    }
    return list;
  }, [deck, drawnIdx, deckSkin.id]);

  const historyScrollRef = useRef<HTMLDivElement>(null);
  const [previewHistoryCard, setPreviewHistoryCard] = useState<ThemedCard | null>(null);

  // Auto-scroll del historial para mantener siempre a la vista la última carta voceada
  useEffect(() => {
    if (historyScrollRef.current) {
      const el = historyScrollRef.current;
      requestAnimationFrame(() => {
        el.scrollTo({
          left: el.scrollWidth,
          behavior: "smooth",
        });
      });
    }
  }, [drawnIdx]);

  useEffect(() => {
    if (drawnIdx === -1) {
      setWon(false);
      setWinDismissed(false);
      setMarked(new Set());
      setRoundPaid(false);
    }
  }, [drawnIdx]);

  useEffect(() => {
    if (drawnIdx === 0 && !roundPaid && tablasActivas.length > 0 && mesa && !isSpectator) {
      const myCost = tablasActivas.length * (mesa.cost || 10);
      setCoins(prev => prev - myCost);
      setRoundPaid(true);
      update(ref(database, `mesas/${id}`), { prizePool: increment(myCost) }).catch(() => {});
    }
  }, [drawnIdx, roundPaid, tablasActivas.length, mesa?.cost, id, isSpectator]);

  useEffect(() => {
    if (!mesa || tablasActivas.length === 0 || winDismissed || won || mesa.winner || isSpectator) return;
    const hasWin = tablasActivas.some(t => checkWin(mesa.mode, t.size, t.cards, (c) => marked.has(`${t.id}-${c}`)));
    if (hasWin) {
      setWon(true);
      const prize = mesa.prizePool || 0;
      update(ref(database, `mesas/${id}`), {
        winner: {
          name: userName,
          isBot: false,
          prize,
          reason: "loteria",
          timestamp: Date.now(),
        },
        nextRoundAt: Date.now() + 60000,
        prizePool: 0,
        serverPaused: true,
        status: "terminada",
      }).catch(() => {});

      if (prize > 0) {
        setCoins(prev => prev + prize);
      }

      if (isHost) setPaused(true);
      if (settings.effects) new Audio("/audio/effects/winner.mp3").play().catch(() => {});
      if (settings.vibration && navigator.vibrate) navigator.vibrate([500, 200, 500]);
    }
  }, [marked, mesa, tablasActivas, settings, winDismissed, won, isHost, userName, id, isSpectator]);

  function toggleMark(tablaId: string, card: number) {
    if (won || mesa?.winner || isSpectator) return;
    const currentDrawnCard = deck[drawnIdx];
    if (currentDrawnCard !== card) return; // Sólo marcar si es la carta actual

    setMarked((prev) => {
      const markKey = `${tablaId}-${card}`;
      if (prev.has(markKey)) return prev; // No se puede retirar la marca

      const next = new Set(prev);
      next.add(markKey);

      // Sincronizar marcas en Firebase para que si se desconecta, el bot conozca el progreso
      update(ref(database, `mesas/${id}/players/${userName}`), {
        marked: Array.from(next),
      }).catch(() => {});

      if (settings.effects) new Audio("/audio/effects/pop.mp3").play().catch(() => {});
      if (settings.vibration && navigator.vibrate) navigator.vibrate(50);
      return next;
    });
  }

  // --- SCRATCH INTERACTION HANDLERS ---
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>, tablaId: string, c: number) => {
    if (e.pointerType === "mouse") {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setInteraction({ uid: `${tablaId}-${c}`, startX: x, startY: y, curX: x, curY: y, isScratching: false });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>, tablaId: string, c: number) => {
    if (!interaction || interaction.uid !== `${tablaId}-${c}`) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const dx = x - interaction.startX;
    const dy = y - interaction.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    const isScratching = interaction.isScratching || dist > 10;
    setInteraction(prev => prev ? { ...prev, curX: x, curY: y, isScratching } : null);

    if (isScratching && settings.vibration && navigator.vibrate) {
      if (Math.random() > 0.6) navigator.vibrate(5);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>, tablaId: string, c: number) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    if (interaction && interaction.uid === `${tablaId}-${c}`) {
      toggleMark(tablaId, c);
      setInteraction(null);
    }
  };
  // ------------------------------------


  async function doRestart() {
    if (!mesa) return;
    if (!isHost && !isCaller) return;

    // Si algún jugador se desconectó y nunca regresó durante la ronda, se desconecta de la sala
    if (mesa.players) {
      let activeCount = 0;
      for (const [pName, pData] of Object.entries<any>(mesa.players)) {
        if (pData.status === "disconnected") {
          remove(ref(database, `mesas/${id}/players/${pName}`)).catch(() => {});
        } else {
          activeCount++;
          if (pData.role === "spectator" || pData.status === "spectator") {
            // Los espectadores pasan a ser jugadores activos para la nueva ronda
            update(ref(database, `mesas/${id}/players/${pName}`), {
              role: "guest",
              status: "active",
              marked: [],
            }).catch(() => {});
          } else {
            update(ref(database, `mesas/${id}/players/${pName}`), { marked: [] }).catch(() => {});
          }
        }
      }

      if (activeCount === 0) {
        remove(ref(database, `mesas/${id}`)).catch(() => {});
        return;
      }
    }

    // Avanzar de ronda si es torneo/sala VIP con varias rondas
    let nextRound = mesa.currentRound || 1;
    let nextMode = mesa.mode;
    if (mesa.rounds && Array.isArray(mesa.rounds)) {
      if (nextRound < mesa.rounds.length) {
        nextRound += 1;
        nextMode = mesa.rounds[nextRound - 1]?.mode || mesa.mode;
      }
    }

    const newDeck = shuffle(DECK.map((c) => c.n));
    await update(ref(database, `mesas/${id}`), {
      deck: newDeck,
      drawnIdx: -1,
      status: "en-juego",
      serverPaused: true,
      winner: null,
      nextRoundAt: null,
      currentRound: nextRound,
      mode: nextMode,
    });
    setMarked(new Set());
    setWon(false);
    setWinDismissed(false);
    setPaused(true);
    setActiveModal(null);
  }

  async function restart() {
    if (!mesa) return;
    if (!isHost && !isCaller) return;
    // VIP rooms have 0 ads for EVERYONE in the room
    if (mesa.isVip) {
      await doRestart();
    } else {
      if (showAd) {
        setPendingActionAfterAd(() => () => doRestart());
      } else {
        await doRestart();
      }
    }
  }

  function sendChat(text: string) {
    if (!text.trim()) return;
    const chatRef = push(ref(database, `mesas/${id}/chat`));
    set(chatRef, { id: chatRef.key, text: text.trim(), sender: userName, timestamp: Date.now() });
    setChatInput("");
    if (activeModal === "stickers") setActiveModal(null);
  }

  async function handleChangeMode(newMode: Mode) {
    if (!isHost || isGameStarted) return;
    const mesaRef = ref(database, `mesas/${id}`);
    await update(mesaRef, { mode: newMode });
    setActiveModal(null);
  }

  function handleInvite() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: 'Lotería La Garza', text: `¡Únete a mi mesa de Lotería!`, url });
    } else {
      navigator.clipboard.writeText(url);
      alert("Enlace copiado al portapapeles.");
    }
    setActiveModal(null);
  }

  // Motor de cartas y resolución de partida automática (Resiliente a desconexión del host)
  useEffect(() => {
    if (!isCaller || !mesa || mesa.status !== "en-juego" || paused || won || mesa.serverPaused || drawnIdx < 0) return;
    if (!mesa.deck || mesa.deck.length === 0 || mesa.winner) return;
    
    const intervalMs = speedFor(mesa);

    const interval = setInterval(() => {
      if (drawnIdx < (mesa.deck?.length || 0) - 1) {
        update(ref(database, `mesas/${id}`), { drawnIdx: drawnIdx + 1 }).catch(() => {});
      } else {
        // La baraja terminó: dar un ganador al azar si nadie cantó victoria
        if (!mesa.winner) {
          const playersList = Object.values(mesa.players || {});
          if (playersList.length > 0) {
            const randomWinner = playersList[Math.floor(Math.random() * playersList.length)];
            const prize = mesa.prizePool || 0;
            update(ref(database, `mesas/${id}`), {
              winner: {
                name: randomWinner.name,
                isBot: randomWinner.status === "disconnected",
                prize,
                reason: "random_finish",
                timestamp: Date.now(),
              },
              nextRoundAt: Date.now() + 60000,
              prizePool: 0,
              serverPaused: true,
              status: "terminada",
            }).catch(() => {});
          } else {
            setPaused(true);
          }
        } else {
          setPaused(true);
        }
      }
    }, intervalMs);
    
    return () => clearInterval(interval);
  }, [isCaller, mesa?.status, mesa?.serverPaused, mesa?.mode, mesa?.speed, paused, won, drawnIdx, mesa?.deck?.length, mesa?.winner, mesa?.players, mesa?.prizePool, id]);

  // Limpieza automática de la mesa si el anfitrión se fue o ya no quedan jugadores humanos
  useEffect(() => {
    if (!isCaller || !mesa || (mesa.status !== "terminada" && !mesa.winner)) return;

    const hostPlayer = mesa.players?.[mesa.host];
    const isHostGone = Boolean(mesa.hostLeft || !hostPlayer || hostPlayer.status === "disconnected");
    const activeHumanPlayers = Object.values(mesa.players || {}).filter(
      (p: any) => p.status === "active" && !p.isBot && p.role !== "spectator"
    );

    if (isHostGone || activeHumanPlayers.length === 0) {
      // 5 segundos de cortesía para mostrar la celebración del ganador y luego eliminar la mesa
      const timer = setTimeout(() => {
        remove(ref(database, `mesas/${id}`)).catch(() => {});
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isCaller, mesa?.status, mesa?.winner, mesa?.players, mesa?.host, mesa?.hostLeft, id]);

  // Bot automático: juega por los invitados o anfitriones desconectados mientras se reconectan
  useEffect(() => {
    if (!isCaller || !mesa || mesa.status !== "en-juego" || mesa.serverPaused || !mesa.deck || drawnIdx < 0 || mesa.winner) return;
    const card = mesa.deck[drawnIdx];
    if (!card || !mesa.players) return;

    Object.values(mesa.players).forEach((player: PlayerGameSession) => {
      if (player.status !== "disconnected" && !player.botActive) return;
      if (!player.tablas || !Array.isArray(player.tablas) || player.tablas.length === 0) return;

      const playerMarkedSet = new Set<string>(player.marked || []);
      let changed = false;

      player.tablas.forEach((t) => {
        if (t.cards && t.cards.includes(card)) {
          const markKey = `${t.id}-${card}`;
          if (!playerMarkedSet.has(markKey)) {
            playerMarkedSet.add(markKey);
            changed = true;
          }
        }
      });

      if (changed) {
        const nextArr = Array.from(playerMarkedSet);
        update(ref(database, `mesas/${id}/players/${player.name}`), {
          marked: nextArr,
        }).catch(() => {});

        // Verificar si la computadora completó la tabla ganadora para el usuario ausente
        const botWon = player.tablas.some((t) =>
          checkWin(mesa.mode, t.size, t.cards, (c) => playerMarkedSet.has(`${t.id}-${c}`))
        );

        if (botWon && !mesa.winner) {
          const prize = mesa.prizePool || 0;
          update(ref(database, `mesas/${id}`), {
            winner: {
              name: player.name,
              isBot: true,
              prize,
              reason: "loteria",
              timestamp: Date.now(),
            },
            nextRoundAt: Date.now() + 60000,
            prizePool: 0,
            serverPaused: true,
            status: "terminada",
          }).catch(() => {});
        }
      }
    });
  }, [drawnIdx, isCaller, mesa, id]);

  // Notificaciones de desconexión y reconexión en vivo
  const prevStatusesRef = useRef<Record<string, string>>({});
  const [connectionToast, setConnectionToast] = useState<{ msg: string; type: "disconnect" | "reconnect" } | null>(null);

  useEffect(() => {
    if (!mesa?.players) return;
    const prev = prevStatusesRef.current;
    Object.entries(mesa.players).forEach(([pName, pData]: [string, any]) => {
      if (pName === userName) return;
      const prevStatus = prev[pName];
      const currentStatus = pData.status;
      if (prevStatus === "active" && currentStatus === "disconnected") {
        setConnectionToast({
          msg: `⚡ ${pName} se ha desconectado. La computadora jugará por él hasta que regrese.`,
          type: "disconnect",
        });
        setTimeout(() => setConnectionToast(null), 4500);
      } else if (prevStatus === "disconnected" && currentStatus === "active") {
        setConnectionToast({
          msg: `🎮 ${pName} se ha reconectado a la partida.`,
          type: "reconnect",
        });
        setTimeout(() => setConnectionToast(null), 4500);
      }
      prev[pName] = currentStatus;
    });
  }, [mesa?.players, userName]);

  // Listener universal de ganador para premiar y festejar en todos los clientes
  const [awardedWinnerTimestamp, setAwardedWinnerTimestamp] = useState<number | null>(null);

  useEffect(() => {
    const currentWinner = mesa?.winner;
    if (!currentWinner) return;
    if (awardedWinnerTimestamp === currentWinner.timestamp) return;

    setAwardedWinnerTimestamp(currentWinner.timestamp);

    // Si el jugador local resultó ganador (por bot o al azar) y no ha cobrado
    if (currentWinner.name === userName && currentWinner.prize > 0 && !won) {
      setCoins((prev) => prev + currentWinner.prize);
      if (settings.effects) new Audio("/audio/effects/winner.mp3").play().catch(() => {});
      if (settings.vibration && navigator.vibrate) navigator.vibrate([500, 200, 500]);
    } else if (currentWinner.name !== userName) {
      if (settings.effects) new Audio("/audio/effects/winner.mp3").play().catch(() => {});
    }
  }, [mesa?.winner, userName, won, awardedWinnerTimestamp, settings.effects, settings.vibration]);

  // Mostrar anuncio entre rondas automáticamente en salas regulares (cero anuncios en VIP)
  const lastAdTimestampRef = useRef<number>(0);
  useEffect(() => {
    if (!mesa?.winner || mesa?.isVip) return;
    const ts = mesa.winner.timestamp || 1;
    if (lastAdTimestampRef.current !== ts) {
      lastAdTimestampRef.current = ts;
      const timer = setTimeout(() => {
        setShowAd(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [mesa?.winner, mesa?.isVip]);

  // Contador de 60s para iniciar la siguiente ronda automáticamente
  const [secondsLeft, setSecondsLeft] = useState<number>(60);

  useEffect(() => {
    if (!mesa?.winner || !mesa?.nextRoundAt) {
      setSecondsLeft(60);
      return;
    }

    const checkTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((mesa.nextRoundAt! - now) / 1000));
      setSecondsLeft(diff);

      if (diff <= 0 && isCaller) {
        doRestart();
      }
    };

    checkTimer();
    const timer = setInterval(checkTimer, 500);
    return () => clearInterval(timer);
  }, [mesa?.winner, mesa?.nextRoundAt, isCaller]);

  // Tabla resumen de ganadores del 1º hasta el último puesto
  const leaderboard = useMemo(() => {
    if (!mesa?.players) return [];
    const playersList = Object.values(mesa.players);
    if (playersList.length === 0) return [];

    const winnerName = mesa.winner?.name;
    const isVipRound = Boolean(mesa.isVip && mesa.rounds && mesa.currentRound);
    const roundPrize = isVipRound
      ? (mesa.rounds?.[(mesa.currentRound || 1) - 1]?.prize || `${mesa.winner?.prize || 0} 🪙`)
      : `${mesa.winner?.prize || 0} 🪙`;

    const totalCells = mesa.size === "5x5" ? 25 : 16;

    const evaluated = playersList.map((p) => {
      const pMarks = new Set(p.marked || []);
      let bestCount = 0;
      if (p.tablas && Array.isArray(p.tablas)) {
        p.tablas.forEach((t) => {
          const matched = t.cards.filter((c) => pMarks.has(`${t.id}-${c}`)).length;
          if (matched > bestCount) bestCount = matched;
        });
      }
      const isWinner = p.name === winnerName;
      return {
        name: p.name,
        isWinner,
        isLocal: p.name === userName,
        isBot: Boolean(p.status === "disconnected" || p.botActive),
        bestCount: isWinner ? totalCells : bestCount,
        totalCells,
      };
    });

    evaluated.sort((a, b) => {
      if (a.isWinner) return -1;
      if (b.isWinner) return 1;
      if (b.bestCount !== a.bestCount) return b.bestCount - a.bestCount;
      return a.name.localeCompare(b.name);
    });

    return evaluated.map((item, idx) => ({
      ...item,
      rank: idx + 1,
      prizeText: item.isWinner ? roundPrize : "—",
    }));
  }, [mesa?.players, mesa?.winner, mesa?.isVip, mesa?.rounds, mesa?.currentRound, mesa?.size, userName]);

  if (loading) return <BrandBackground><div className="grid min-h-[100dvh] place-items-center text-white">Cargando...</div></BrandBackground>;
  
  if (!mesa || tablasActivas.length === 0) {
    return (
      <BrandBackground>
        <div className="flex flex-col min-h-[100dvh] items-center justify-center p-6 text-center">
          <LayoutGrid className="w-16 h-16 text-white/50 mb-4" />
          <h2 className="text-2xl font-black text-white mb-2">Tablas no disponibles</h2>
          <p className="text-white/70 mb-8 max-w-sm">
            {!mesa 
              ? "No se pudo cargar la mesa."
              : `No tienes tablas guardadas del tamaño requerido (${mesa.size}). Ve al menú principal y crea una.`}
          </p>
          <button 
            onClick={() => navigate({ to: "/menu" })}
            className="w-full max-w-xs bg-white/10 text-white font-bold py-4 rounded-full text-lg hover:bg-white/20 active:scale-95 shadow-md border border-white/20 transition-all"
          >
            Ir al menú principal
          </button>
        </div>
      </BrandBackground>
    );
  }

  const connectedPlayers = mesa.players ? Object.keys(mesa.players) : [mesa.host];

  return (
    <BrandBackground>
      <div className="flex flex-col min-h-[100dvh] font-sans relative overflow-hidden bg-white/5">
        
        {/* Modals & Overlays */}
          {activeModal === "exitConfirm" && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-[color:var(--brand-navy-deep)] w-full max-w-sm rounded-3xl p-6 ring-1 ring-white/10 shadow-2xl animate-modal-in border border-white/20 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                  <ArrowLeft className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-black text-white mb-2">
                  {isHost ? "¿Abandonar la mesa?" : "¿Abandonar la partida?"}
                </h2>
                <p className="text-white/70 mb-6 text-sm">
                  {isHost 
                    ? "Si abandonas la partida ahora, perderás tus monedas invertidas de esta ronda. El servidor seguirá sacando las cartas automáticamente para los demás jugadores hasta que termine la ronda."
                    : "Si abandonas la partida ahora, perderás tu progreso en las tablas y las monedas que invertiste en esta ronda."}
                </p>
                
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      const otherPlayers = Object.keys(mesa?.players || {}).filter((p) => p !== userName);
                      if (isHost) {
                        if (otherPlayers.length === 0) {
                          remove(ref(database, `mesas/${id}`)).catch(() => {});
                        } else {
                          update(ref(database, `mesas/${id}`), {
                            hostLeft: true,
                          }).catch(() => {});
                          remove(ref(database, `mesas/${id}/players/${userName}`)).catch(() => {});
                        }
                      } else {
                        remove(ref(database, `mesas/${id}/players/${userName}`)).catch(() => {});
                      }
                      try {
                        localStorage.removeItem(`garza:host:${id}`);
                        sessionStorage.removeItem(`garza:host:${id}`);
                        localStorage.removeItem(`garza:registered:${id}`);
                        sessionStorage.removeItem(`garza:registered:${id}`);
                        localStorage.removeItem(`garza:selectedTablas:${id}`);
                      } catch {}
                      setActiveModal(null);
                      navigate({ to: "/menu" });
                    }}
                    className="w-full bg-red-500 text-white font-bold py-3.5 rounded-xl hover:bg-red-600 active:scale-95 transition-all shadow-md"
                  >
                    Sí, abandonar partida
                  </button>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="w-full bg-white/10 text-white font-bold py-3.5 rounded-xl hover:bg-white/20 active:scale-95 transition-all"
                  >
                    Cancelar y seguir jugando
                  </button>
                </div>
              </div>
            </div>
          )}



        {/* Floating Messages Overlay */}
        {floatingMsg && !activeModal && (
          <div className="absolute top-32 left-1/2 -translate-x-1/2 z-40 bg-[color:var(--brand-navy)] px-4 py-2 rounded-2xl shadow-xl border border-[color:var(--brand-cyan)] animate-bounce text-white flex flex-col items-center">
            <span className="font-bold text-[color:var(--brand-gold)] text-xs mb-1">{floatingMsg.sender}:</span>
            {floatingMsg.isSticker ? (
              <img src={floatingMsg.text.replace('[STICKER:', '').replace(']', '').startsWith('/') ? floatingMsg.text.replace('[STICKER:', '').replace(']', '') : `/stickers/${floatingMsg.text.replace('[STICKER:', '').replace(']', '')}`} className="w-24 h-24 object-contain" alt="sticker" />
            ) : (
              <span>{floatingMsg.text}</span>
            )}
          </div>
        )}

        {/* TABLA DE GANADORES Y RESUMEN DE LA RONDA CON CONTADOR AUTOMÁTICO */}
        {(won || Boolean(mesa?.winner)) && !winDismissed && (
          <div className="absolute inset-0 z-50 bg-[color:var(--brand-navy-deep)]/90 flex items-center justify-center p-3 sm:p-4 backdrop-blur-md animate-fade-in">
            {settings.confetti && <div className="absolute inset-0 pointer-events-none bg-[url('https://cdn-icons-png.flaticon.com/512/1795/1795325.png')] bg-[length:50px] animate-confetti-fall opacity-35" />}
            
            <div className="bg-gradient-to-b from-[color:var(--brand-navy)] via-[color:var(--brand-navy-deep)] to-slate-950 p-4 sm:p-5 rounded-3xl shadow-2xl border-2 border-[color:var(--brand-gold)] w-full max-w-md animate-modal-in relative z-10 flex flex-col gap-3 max-h-[92vh] overflow-hidden">
              
              {/* Header */}
              <div className="text-center shrink-0">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-wider mb-1">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Resumen de la Ronda {mesa?.currentRound ? `#${mesa.currentRound}` : ""}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[color:var(--brand-gold)] drop-shadow-md">
                  {mesa?.winner?.reason === "random_finish" ? "¡Fin de Partida!" : "¡Lotería!"}
                </h2>
                <p className="text-white/80 text-xs mt-0.5">
                  Ganador: <strong className="text-[color:var(--brand-cyan)] font-extrabold">{mesa?.winner?.name || "Jugador"}</strong>
                  {mesa?.winner?.isBot && <span className="text-amber-300 ml-1 font-bold">(🤖 Computadora)</span>}
                  {mesa?.winner?.reason === "random_finish" && <span className="block text-[11px] text-white/50 mt-0.5">Baraja agotada — Ganador asignado al azar</span>}
                </p>
              </div>

              {/* Leaderboard Table / Resumen de Ganadores */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2 hide-scrollbar min-h-[140px] max-h-[300px]">
                <div className="text-[10px] font-black text-white/50 uppercase tracking-wider flex items-center justify-between px-2 pb-1 border-b border-white/10">
                  <span>Puesto & Jugador</span>
                  <span>Premio</span>
                </div>

                {leaderboard.map((entry) => {
                  const isGold = entry.rank === 1;
                  const isSilver = entry.rank === 2;
                  const isBronze = entry.rank === 3;
                  
                  return (
                    <div
                      key={entry.name}
                      className={`flex items-center justify-between p-2.5 rounded-2xl transition-all border ${
                        isGold
                          ? "bg-gradient-to-r from-amber-500/25 via-yellow-500/15 to-transparent border-amber-400/60 shadow-md shadow-amber-500/15"
                          : entry.isLocal
                          ? "bg-cyan-500/15 border-cyan-400/40"
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      {/* Left: Rank & Player info */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          isGold
                            ? "bg-gradient-to-br from-amber-300 to-yellow-500 text-slate-950 shadow-md"
                            : isSilver
                            ? "bg-slate-300 text-slate-900"
                            : isBronze
                            ? "bg-amber-700/80 text-amber-100"
                            : "bg-white/10 text-white/70"
                        }`}>
                          {isGold ? "🥇" : isSilver ? "🥈" : isBronze ? "🥉" : `#${entry.rank}`}
                        </div>

                        <div className="truncate">
                          <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                            <span className="truncate">{entry.name}</span>
                            {entry.isLocal && (
                              <span className="text-[9px] bg-cyan-400/20 text-cyan-300 px-1.5 py-0.2 rounded font-black border border-cyan-400/40 shrink-0">
                                Tú
                              </span>
                            )}
                            {entry.isBot && (
                              <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded font-black border border-amber-400/40 shrink-0">
                                🤖 Bot
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-white/50 flex items-center gap-1 mt-0.5">
                            {entry.isWinner ? (
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <Check className="w-3 h-3" /> ¡Lotería!
                              </span>
                            ) : (
                              <span>{entry.bestCount} de {entry.totalCells} cartas</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Prize Column */}
                      <div className="shrink-0 pl-2">
                        {entry.isWinner ? (
                          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-lg shadow-amber-500/30">
                            <CoinAnimation className="w-3.5 h-3.5" />
                            <span>{entry.prizeText}</span>
                          </span>
                        ) : (
                          <span className="text-white/30 text-xs font-bold px-2">
                            {entry.prizeText}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* VIP 0-Ads Notice vs Standard Notice */}
              {mesa?.isVip ? (
                <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Sala VIP: Cero anuncios entre rondas</span>
                </div>
              ) : null}

              {/* Auto Countdown & Control Bar */}
              <div className="shrink-0 flex flex-col gap-2 pt-1 border-t border-white/10">
                {/* Countdown Timer Display */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs">
                  <div className="flex items-center gap-2 text-white/80 font-bold">
                    <TimerIcon className="w-4 h-4 text-amber-400 animate-spin" />
                    <span>Siguiente ronda automática:</span>
                  </div>
                  <span className="font-black text-sm text-[color:var(--brand-gold)] font-mono">
                    {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, "0")}
                  </span>
                </div>

                {/* Host Start Immediately button */}
                {isHost ? (
                  <button
                    onClick={restart}
                    className="w-full py-3 px-4 rounded-full font-black text-sm bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95 hover:brightness-105 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Comenzar Siguiente Ronda Ya</span>
                  </button>
                ) : (
                  <div className="text-center text-[11px] text-white/50 py-0.5 font-semibold animate-pulse">
                    Comenzará al terminar el tiempo o si el anfitrión le da comenzar.
                  </div>
                )}

                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      const otherPlayers = Object.keys(mesa?.players || {}).filter((p) => p !== userName);
                      if (isHost && otherPlayers.length === 0) {
                        remove(ref(database, `mesas/${id}`)).catch(() => {});
                      } else {
                        remove(ref(database, `mesas/${id}/players/${userName}`)).catch(() => {});
                      }
                      navigate({ to: "/menu" });
                    }}
                    className="flex-1 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-bold transition active:scale-95 text-center"
                  >
                    Salir al Menú
                  </button>
                  <button
                    onClick={() => navigate({ to: "/mesa/$id", params: { id: mesa.id } })}
                    className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-xs font-bold transition active:scale-95 border border-white/10 text-center"
                  >
                    Salir a la sala
                  </button>
                  <button
                    onClick={() => setWinDismissed(true)}
                    className="py-2 px-2.5 rounded-xl bg-transparent hover:bg-white/5 text-white/40 hover:text-white text-xs font-medium transition text-center"
                  >
                    Ver cartas
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* --- MODALS (Settings, Stickers, Tables, Modes, Chat) --- */}
        {activeModal && activeModal !== "menu" && (
          <div 
            onClick={() => setActiveModal(null)}
            className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
          >
            {/* Modal Container */}
            <div 
              onClick={(e) => e.stopPropagation()}
              className={`bg-white w-full max-w-md rounded-3xl overflow-hidden flex flex-col animate-modal-in shadow-2xl max-h-[85vh]`}
            >
              
              {/* Default Brand Header for others */}
              {["chat", "players", "tablas", "modos", "settings", "stickers"].includes(activeModal) && (
                <div className="bg-[color:var(--brand-navy-deep)] p-4 flex items-center justify-between border-b border-white/10 shrink-0">
                  <h3 className="text-white font-bold text-lg capitalize">
                    {activeModal === "chat" ? "Chat de Mesa" : 
                     activeModal === "settings" ? "Configuración" : 
                     activeModal === "stickers" ? "Enviar Sticker" : activeModal}
                  </h3>
                  <button onClick={() => setActiveModal(null)} className="text-white/50 hover:text-white"><X className="w-6 h-6" /></button>
                </div>
              )}

              {/* Modal Body */}
              <div className="flex-1 bg-[color:var(--brand-navy)] scroll-touch-y">
                
                {/* SETTINGS UI */}
                {activeModal === "settings" && (
                  <div className="flex flex-col text-white font-medium p-2">
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                      <div>
                        <p className="font-bold text-[color:var(--brand-cyan)]">Audio</p>
                        <p className="text-xs text-white/50">Grita el nombre de las cartas</p>
                      </div>
                      <ToggleSwitch checked={settings.audio} onChange={(v) => setSettings({...settings, audio: v})} />
                    </div>
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                      <div>
                        <p className="font-bold text-[color:var(--brand-cyan)]">Voz del gritón</p>
                        <select 
                          className="text-xs text-white/70 bg-[color:var(--brand-navy-deep)] border border-white/10 rounded px-2 py-1 outline-none mt-1"
                          value={settings.voice}
                          onChange={(e) => setSettings({...settings, voice: e.target.value})}
                        >
                          {VOICES
                            .filter(v => v.id === "default" || localStorage.getItem(`garza:unlocked:voice:${v.id}`) === "true")
                            .map(v => <option key={v.id} value={v.id}>{v.name}</option>)
                          }
                        </select>
                      </div>
                      <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-lg border border-white/10">
                        {VOICES.find(v => v.id === settings.voice)?.icon}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                      <p className="font-bold text-[color:var(--brand-cyan)]">Efectos de sonido</p>
                      <ToggleSwitch checked={settings.effects} onChange={(v) => setSettings({...settings, effects: v})} />
                    </div>
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                      <div>
                        <p className="font-bold text-[color:var(--brand-cyan)]">Confetti</p>
                        <p className="text-xs text-white/50">Lluvia visual al ganar.</p>
                      </div>
                      <ToggleSwitch checked={settings.confetti} onChange={(v) => setSettings({...settings, confetti: v})} />
                    </div>
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                      <p className="font-bold text-[color:var(--brand-cyan)]">Vibración</p>
                      <ToggleSwitch checked={settings.vibration} onChange={(v) => setSettings({...settings, vibration: v})} />
                    </div>
                    <div className="flex items-center justify-between p-4">
                      <p className="font-bold text-[color:var(--brand-cyan)]">Vista de Tablas</p>
                      <select className="bg-[color:var(--brand-navy-deep)] text-white/70 border border-white/10 rounded px-2 py-1 outline-none">
                        <option>Rejilla</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* STICKERS UI */}
                {activeModal === "stickers" && (
                  <div className="flex flex-col h-[60vh] bg-[color:var(--brand-navy-deep)]">
                    <div className="flex justify-around bg-[color:var(--brand-navy)] border-b border-white/10 font-bold text-white/50 shrink-0 text-xs">
                      <button onClick={() => setStickerTab("botin")} className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1 ${stickerTab === 'botin' ? 'border-amber-400 text-amber-300 font-black' : 'border-transparent hover:text-white'}`}>🎒 Mi Botín</button>
                      <button onClick={() => setStickerTab("clasicos")} className={`py-3 px-3 border-b-2 transition-colors ${stickerTab === 'clasicos' ? 'border-[color:var(--brand-cyan)] text-[color:var(--brand-cyan)]' : 'border-transparent hover:text-white'}`}>Clásicos</button>
                      <button onClick={() => setStickerTab("gifs")} className={`py-3 px-3 border-b-2 transition-colors ${stickerTab === 'gifs' ? 'border-[color:var(--brand-cyan)] text-[color:var(--brand-cyan)]' : 'border-transparent hover:text-white'}`}>GIFs</button>
                      <button onClick={() => setStickerTab("cartas")} className={`py-3 px-3 border-b-2 transition-colors ${stickerTab === 'cartas' ? 'border-[color:var(--brand-cyan)] text-[color:var(--brand-cyan)]' : 'border-transparent hover:text-white'}`}>Cartas</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 grid grid-cols-4 gap-3 auto-rows-max">
                      {stickerTab === "botin" && (
                        <>
                          <div className="col-span-4 text-[11px] font-game text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <span>✨</span> Stickers Especiales de Cofres
                          </div>
                          {SPECIAL_STICKERS.map((stk) => (
                            <button
                              key={`botin-${stk.id}`}
                              onClick={() => stk.image && sendChat(`[STICKER:${stk.image}]`)}
                              className="aspect-square bg-gradient-to-b from-white/10 to-white/5 hover:bg-white/20 rounded-2xl transition-all active:scale-95 flex flex-col items-center justify-center p-2 border border-amber-400/30 shadow-md group"
                            >
                              {stk.image ? (
                                <img src={stk.image} className="w-12 h-12 object-contain drop-shadow-md group-hover:scale-110 transition-transform" loading="lazy" alt={stk.title} />
                              ) : (
                                <span className="text-3xl">{stk.emoji}</span>
                              )}
                              <span className="text-[9px] font-game text-white/80 mt-1 truncate max-w-full">{stk.title}</span>
                            </button>
                          ))}

                          <div className="col-span-4 text-[11px] font-game text-cyan-300 uppercase tracking-wider mt-3 mb-1 flex items-center gap-1">
                            <span>💬</span> Reacciones Rápidas de Emojis
                          </div>
                          {["🪅", "🔥", "👑", "🍀", "⚡", "🌮", "🎺", "💎", "✨", "❤️", "💀", "😎"].map((em, idx) => (
                            <button
                              key={`emoji-${idx}`}
                              onClick={() => sendChat(em)}
                              className="aspect-square bg-white/5 hover:bg-white/20 rounded-2xl transition-colors active:scale-95 flex items-center justify-center text-3xl border border-white/10 shadow-sm"
                            >
                              {em}
                            </button>
                          ))}
                        </>
                      )}
                      {stickerTab === "clasicos" && Array.from({length: 76}).map((_, i) => (
                        <button key={`clasico-${i}`} onClick={() => sendChat(`[STICKER:${i}.png]`)} className="aspect-square bg-white/5 hover:bg-white/20 rounded-xl transition-colors active:scale-95 flex items-center justify-center p-2 border border-white/10">
                          <img src={`/stickers/${i}.png`} className="w-full h-full object-contain drop-shadow-sm" loading="lazy" alt={`Sticker ${i}`} />
                        </button>
                      ))}
                      {stickerTab === "gifs" && (
                        <button onClick={() => sendChat(`[STICKER:manoarriba.gif]`)} className="aspect-square bg-white/5 hover:bg-white/20 rounded-xl transition-colors active:scale-95 flex items-center justify-center p-2 border border-white/10">
                          <img src={`/stickers/manoarriba.gif`} className="w-full h-full object-contain drop-shadow-sm" loading="lazy" alt="Mano Arriba" />
                        </button>
                      )}
                      {stickerTab === "cartas" && DECK.map((c) => (
                        <button key={`carta-${c.n}`} onClick={() => sendChat(`[STICKER:${c.image}]`)} className="aspect-[1/1.55] bg-transparent hover:bg-white/10 transition-colors active:scale-95 flex items-center justify-center p-1 border border-white/5">
                          <img src={c.image} className="w-full h-full object-fill drop-shadow-md" loading="lazy" alt={c.name} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* OTHER MODALS (Chat, Players, Tablas, Modos) remain with dark brand theme */}
                {["chat", "players", "tablas", "modos"].includes(activeModal) && (
                   <div className="p-4 h-full min-h-[300px]">
                      {activeModal === "players" && (
                        <div className="flex flex-col gap-2">
                          {connectedPlayers.map((p) => {
                            const pData = mesa.players?.[p];
                            const isDisconnected = pData?.status === "disconnected";
                            const isPlayerSpectator = pData?.role === "spectator" || pData?.status === "spectator";
                            return (
                              <div key={p} className="flex items-center justify-between bg-white/10 p-3 rounded-xl border border-white/5">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                    isDisconnected ? "bg-amber-400 animate-pulse" : isPlayerSpectator ? "bg-purple-400" : "bg-emerald-400"
                                  }`} />
                                  <span className="text-white font-bold truncate flex items-center gap-1.5">
                                    <Users className="w-4 h-4 text-[color:var(--brand-cyan)] shrink-0" />
                                    <span>{p}</span>
                                    {p === userName && <span className="text-[10px] text-white/50">(Tú)</span>}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {isPlayerSpectator && (
                                    <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-400/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                      👀 Espectador
                                    </span>
                                  )}
                                  {isDisconnected && !isPlayerSpectator && (
                                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                      🤖 Bot jugando
                                    </span>
                                  )}
                                  {p === mesa.host && (
                                    <span className="text-[10px] bg-[color:var(--brand-gold)] text-black px-2 py-0.5 rounded-full font-bold">
                                      ANFITRIÓN
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {activeModal === "chat" && (
                        <div className="flex flex-col h-[400px]">
                          <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2 hide-scrollbar">
                            {chatMsgs.length === 0 && <p className="text-white/50 text-center text-sm mt-10">No hay mensajes aún.</p>}
                            {chatMsgs.map(msg => {
                              const isMe = msg.sender === userName;
                              const isSticker = msg.text.startsWith("[STICKER:") && msg.text.endsWith("]");
                              return (
                              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <span className="text-[10px] text-white/40 mb-0.5 px-1">{msg.sender}</span>
                                {isSticker ? (
                                   <img src={msg.text.replace('[STICKER:', '').replace(']', '').startsWith('/') ? msg.text.replace('[STICKER:', '').replace(']', '') : `/stickers/${msg.text.replace('[STICKER:', '').replace(']', '')}`} className="w-20 h-20 object-contain drop-shadow-md" />
                                ) : (
                                  <div className={`px-3 py-2 rounded-2xl max-w-[85%] text-sm shadow-sm ${
                                    isMe ? 'bg-[color:var(--brand-cyan)] text-[color:var(--brand-navy-deep)] rounded-tr-none font-medium' : 'bg-white/15 text-white rounded-tl-none border border-white/5'
                                  }`}>
                                    {msg.text}
                                  </div>
                                )}
                              </div>
                            )})}
                          </div>
                          <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                            <input 
                              type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && sendChat(chatInput)}
                              placeholder="Escribe un mensaje..."
                              autoFocus
                              className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white text-sm outline-none focus:border-[color:var(--brand-cyan)] transition"
                            />
                            <button onClick={() => sendChat(chatInput)} className="w-10 h-10 rounded-full bg-[color:var(--brand-cyan)] flex items-center justify-center text-[color:var(--brand-navy-deep)] shrink-0 active:scale-95">
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {activeModal === "tablas" && (
                        isGameActive ? (
                          <div className="p-6 text-center text-amber-300 font-bold">
                            No puedes cambiar de tablas mientras la partida está en curso.
                          </div>
                        ) : (
                        <div className="flex flex-col gap-3">
                          {/* Quick selection of count: 1, 2, 4, 8 */}
                          <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-2xl border border-white/10 mb-1">
                            <span className="text-xs font-bold text-white/80">Cantidad de tablas:</span>
                            <div className="flex gap-1.5">
                              {[1, 2, 4, 8].map(qty => (
                                <button
                                  key={qty}
                                  type="button"
                                  onClick={() => {
                                    let allTablas = loadTablas().filter(t => t.size === mesa.size);
                                    if (allTablas.length < qty) {
                                      const need = qty - allTablas.length;
                                      const generated: Tabla[] = [];
                                      for (let i = 0; i < need; i++) {
                                        generated.push({
                                          id: Math.random().toString(36).substring(2, 9),
                                          size: mesa.size,
                                          cards: randomCards(mesa.size),
                                          createdAt: Date.now() + i,
                                        });
                                      }
                                      try {
                                        const full = loadTablas();
                                        localStorage.setItem("garza:tablas", JSON.stringify([...full, ...generated]));
                                      } catch {}
                                      allTablas = [...allTablas, ...generated];
                                    }
                                    const picked = allTablas.slice(0, qty);
                                    setTablasActivas(picked);
                                    setMarked(new Set());
                                    setActivePageIndex(0);
                                    try {
                                      localStorage.setItem(`garza:selectedTablas:${id}`, JSON.stringify(picked.map(p => p.id)));
                                    } catch {}
                                    setActiveModal(null);
                                  }}
                                  className={`px-2.5 py-1 rounded-xl text-xs font-black border transition ${
                                    tablasActivas.length === qty
                                      ? "bg-amber-400 text-slate-950 border-amber-300 shadow"
                                      : "bg-white/10 text-white/70 border-white/10 hover:bg-white/20"
                                  }`}
                                >
                                  {qty} {qty === 1 ? "tabla" : "tablas"}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            {loadTablas().filter(t => t.size === mesa.size).map((t, idx) => {
                            const isActiva = tablasActivas.some(act => act.id === t.id);
                            return (
                              <button key={t.id} onClick={() => { 
                                  // toggle this table
                                  let newActive = [...tablasActivas];
                                  if (isActiva) {
                                    // If perPlayer is 1, we don't let them uncheck to 0, they must just tap another.
                                    if (mesa.perPlayer > 1) {
                                      newActive = newActive.filter(act => act.id !== t.id);
                                    }
                                  } else {
                                    if (newActive.length < mesa.perPlayer) {
                                      newActive.push(t);
                                    } else {
                                      // If at max capacity, replace the first one
                                      newActive = [...newActive.slice(1), t];
                                    }
                                  }
                                  if (newActive.length > 0) {
                                    setTablasActivas(newActive);
                                    setMarked(new Set());
                                    // Auto close if we reached the required amount
                                    if (newActive.length === mesa.perPlayer) {
                                      setActiveModal(null);
                                    }
                                  }
                                }}
                                className={`relative flex flex-col items-center rounded-3xl p-3 ring-1 transition-all ${!isGameStarted && 'active:scale-[0.98]'} ${isGameStarted ? 'opacity-50 cursor-not-allowed' : ''} ${
                                  isActiva
                                    ? "bg-[color:var(--brand-cyan)]/10 ring-[color:var(--brand-cyan)] shadow-[0_0_15px_rgba(0,255,255,0.2)] scale-[1.02]"
                                    : "bg-white/5 ring-white/10 hover:bg-white/10"
                                }`}
                              >
                                <div className="mb-2 flex w-full items-center justify-between">
                                  <span className="text-[11px] font-bold uppercase tracking-widest text-white/50">
                                    Tabla {idx + 1}
                                  </span>
                                  <div
                                    className={`grid h-5 w-5 place-items-center rounded-full border ${
                                      isActiva
                                        ? "border-[color:var(--brand-cyan)] bg-[color:var(--brand-cyan)] text-[color:var(--brand-navy-deep)]"
                                        : "border-white/20 bg-black/20"
                                    }`}
                                  >
                                    {isActiva && <Check className="h-3 w-3" />}
                                  </div>
                                </div>
                                <div
                                  className="grid gap-1 w-full"
                                  style={{ gridTemplateColumns: `repeat(${t.size === "4x4" ? 4 : 5}, minmax(0, 1fr))` }}
                                >
                                  {t.cards.map((c, i) => {
                                    const card = getThemedCard(c, deckSkin.id);
                                    return (
                                      <div key={i} className="relative aspect-[3/4] ring-1 ring-white/10">
                                        <img
                                          src={card?.image}
                                          alt={card?.name ?? `Carta ${c}`}
                                          decoding="async"
                                          onError={(e) => {
                                            if (card?.fallbackImage && e.currentTarget.src !== card.fallbackImage) {
                                              e.currentTarget.src = card.fallbackImage;
                                            }
                                          }}
                                          className="h-full w-full object-cover"
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              </button>
                            );
                          })}
                          {loadTablas().filter(t => t.size === mesa.size).length === 0 && (
                            <div className="col-span-2 text-center text-white/50 py-4">
                              No tienes tablas de tamaño {mesa.size}.
                            </div>
                          )}
                          </div>
                        </div>
                        )
                      )}

                      {activeModal === "modos" && (
                        <div className="flex flex-col gap-3">
                          {!isHost ? (
                            <p className="text-white/70 text-center font-bold">Solo el anfitrión decide.</p>
                          ) : isGameStarted ? (
                            <p className="text-[color:var(--brand-gold)] text-center font-bold">No puedes cambiar de modo durante una partida en curso.</p>
                          ) : (
                            (Object.entries(MODE_META) as [Mode, typeof MODE_META[Mode]][]).map(([modeKey, meta]) => (
                              <button
                                key={modeKey}
                                onClick={() => handleChangeMode(modeKey)}
                                className={`w-full flex items-center gap-4 rounded-2xl p-4 text-left transition-all ${mesa.mode === modeKey ? 'bg-white/10 ring-2 ring-[color:var(--brand-cyan)] shadow-md' : 'bg-white/5 ring-1 ring-white/10 hover:bg-white/10 active:scale-95'}`}
                              >
                                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${mesa.mode === modeKey ? 'bg-[color:var(--brand-cyan)] text-[color:var(--brand-navy-deep)]' : 'bg-white/10 text-white'}`}>
                                  <meta.icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-bold text-white text-base">{meta.label}</div>
                                  <div className="text-xs text-white/60">{meta.hint}</div>
                                </div>
                                <MiniBoardIllustration mode={modeKey as Mode} active={mesa.mode === modeKey} />
                              </button>
                            ))
                          )}
                        </div>
                      )}
                   </div>
                )}
              </div>
              
              {/* Modals Bottom Button Area (Settings & Stickers) */}
              {(activeModal === "settings" || activeModal === "stickers") && (
                <div className="p-4 bg-[color:var(--brand-navy-deep)] flex justify-center border-t border-white/10 shrink-0">
                  <button onClick={() => setActiveModal(null)} className={`w-3/4 py-3 rounded-full text-white font-black shadow-md active:scale-95 transition-colors ${activeModal === 'settings' ? 'bg-[color:var(--brand-cyan)] text-[color:var(--brand-navy-deep)]' : 'bg-white/10 hover:bg-white/20'}`}>
                    {activeModal === "settings" ? "Cerrar" : "Cancelar"}
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

        {/* --- MENU DROPDOWN --- */}
        {activeModal === "menu" && (
          <>
            <div className="absolute inset-0 z-40 bg-transparent" onClick={() => setActiveModal(null)} />
            <div className="absolute top-14 right-2 z-50 bg-[color:var(--brand-navy-deep)] rounded-xl shadow-2xl py-2 w-56 border border-white/10 animate-slide-up-soft origin-top-right">
               <button onClick={() => { restart(); setActiveModal(null); }} className="w-full text-left px-4 py-3 hover:bg-white/10 flex items-center gap-3 text-white font-bold border-b border-white/5 transition-colors">
                 <RotateCcw className="w-5 h-5 text-[color:var(--brand-gold)]" /> Nueva partida
               </button>
               <button onClick={handleInvite} className="w-full text-left px-4 py-3 hover:bg-white/10 flex items-center gap-3 text-white font-bold border-b border-white/5 transition-colors">
                 <LinkIcon className="w-5 h-5 text-[color:var(--brand-cyan)]" /> Invitar amigos
               </button>
               <button onClick={() => { setActiveModal(null); /* Marcador modal in future */ }} className="w-full text-left px-4 py-3 hover:bg-white/10 flex items-center gap-3 text-white/80 font-bold border-b border-white/5 transition-colors">
                 <Edit2 className="w-5 h-5 text-white/50" /> Marcador
               </button>
               <button onClick={() => { setActiveModal(null); }} className="w-full text-left px-4 py-3 hover:bg-white/10 flex items-center gap-3 text-white/80 font-bold border-b border-white/5 transition-colors">
                 <Trophy className="w-5 h-5 text-[color:var(--brand-gold)] opacity-70" /> Ganadores
               </button>
               <button onClick={() => { setActiveModal(null); }} className="w-full text-left px-4 py-3 hover:bg-white/10 flex items-center gap-3 text-white/80 font-bold transition-colors">
                 <Info className="w-5 h-5 text-[color:var(--brand-cyan)] opacity-70" /> Info de la mesa
               </button>
            </div>
          </>
        )}

        {/* TOP HEADER */}
        <header className="h-14 bg-[color:var(--brand-navy-deep)] flex items-center justify-between px-3 shrink-0 z-30 relative shadow-md">
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-1.5 sarape-band animate-sarape-slide" />
          <button onClick={() => setActiveModal("exitConfirm")} className="p-2 -ml-2 text-white/80 active:scale-95 hover:text-white transition">
            <ArrowLeft className="w-6 h-6" strokeWidth={2.5} />
          </button>

        {/* Floating Disconnect/Reconnect notification */}
        {connectionToast && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-sm px-3.5 py-2.5 rounded-2xl bg-slate-900/95 border border-amber-400/40 text-amber-200 text-xs font-bold text-center shadow-2xl backdrop-blur animate-fade-in flex items-center justify-center gap-2">
            <span>{connectionToast.msg}</span>
          </div>
        )}
          
          <div className="flex flex-1 items-center gap-2 ml-2 text-[10px] font-bold">
            <div className="flex items-center gap-1.5 bg-black/50 rounded-full px-2.5 py-1 border border-white/10 shadow-inner">
              <CoinAnimation className="w-4 h-4" />
              <span className="text-[color:var(--brand-gold)] font-extrabold text-xs">{coins.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 bg-[color:var(--brand-gold)]/20 rounded-full px-2 py-1 border border-[color:var(--brand-gold)]/40">
              <span>🏆</span>
              <span className="text-[color:var(--brand-gold)]">{mesa?.prizePool || 0}</span>
            </div>
            {mesa?.isVip && (
              <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400/25 to-yellow-500/25 rounded-full px-2 py-0.5 border border-amber-400/50 text-[9px] text-amber-300 font-black shadow-sm">
                <Crown className="w-2.5 h-2.5 fill-current" />
                <span>VIP {mesa.rounds ? `R${mesa.currentRound || 1}/${mesa.rounds.length}` : ""}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-[color:var(--brand-cyan)]">
            <button onClick={isHost ? restart : undefined} className="active:scale-95 hover:text-white transition hidden sm:block">
              <RotateCcw className="w-6 h-6" strokeWidth={2.5} />
            </button>
            <button onClick={() => setActiveModal("players")} className="active:scale-95 hover:text-white transition relative">
              <Users className="w-6 h-6" strokeWidth={2.5} />
              <span className="absolute -top-1.5 -right-2 bg-[color:var(--brand-pink)] text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-[color:var(--brand-navy-deep)]">{connectedPlayers.length}</span>
            </button>
            <button onClick={() => setActiveModal("settings")} className="active:scale-95 hover:text-white transition">
              <Settings2 className="w-6 h-6" strokeWidth={2.5} />
            </button>
            <button onClick={() => setActiveModal("chat")} className="relative active:scale-95 hover:text-white transition">
              <MessageCircle className="w-6 h-6" strokeWidth={2.5} />
              {chatMsgs.length > 0 && <span className="absolute -top-1 -right-1 bg-[color:var(--brand-pink)] flex items-center justify-center text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 border-2 border-[color:var(--brand-navy-deep)]">{chatMsgs.length > 9 ? '9+' : chatMsgs.length}</span>}
            </button>
            <button onClick={() => setActiveModal(activeModal === "menu" ? null : "menu")} className="active:scale-95 hover:text-white transition">
              <Menu className="w-6 h-6" strokeWidth={2.5} />
            </button>
          </div>
        </header>

        {/* Spectator Mode Top Banner */}
        {isSpectator && (
          <div className="w-full bg-gradient-to-r from-purple-950 via-indigo-900 to-purple-950 border-b border-purple-400/40 px-3.5 py-2 flex items-center justify-between text-xs text-purple-200 z-20 shadow-lg backdrop-blur">
            <div className="flex items-center gap-2 font-medium">
              <span className="text-base animate-bounce">👀</span>
              <span>
                <strong className="text-white font-black">Modo Espectador:</strong> Observando ronda en curso. Comenzarás a jugar automáticamente en la siguiente ronda (cuando haya Lotería).
              </span>
            </div>
            <span className="shrink-0 text-[10px] bg-purple-400/25 text-purple-200 px-2.5 py-1 rounded-full border border-purple-400/40 font-black uppercase tracking-wider ml-2">
              Próxima ronda
            </span>
          </div>
        )}

        {/* HISTORIAL DE CARTAS VOCEADAS (DESFILE SUPERIOR DE CARTAS QUE YA SALIERON) */}
        <section
          aria-label="Historial de cartas voceadas"
          className="w-full max-w-[800px] mx-auto px-3 pt-1.5 pb-0.5 z-20 shrink-0 relative"
        >
          <div className="flex items-center gap-2 bg-black/45 border border-white/10 rounded-2xl px-2.5 py-1.5 backdrop-blur-md shadow-md relative">
            {/* Badge contador de cartas voceadas */}
            <div
              className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-white/15 text-[10px] font-bold text-amber-300"
              title="Total de cartas voceadas en esta partida"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-black text-xs text-amber-400">{calledCards.length}</span>
              <span className="text-white/50 text-[9px] uppercase tracking-wider hidden xs:inline">Voceadas</span>
            </div>

            {/* Preview flotante al tocar una carta */}
            {previewHistoryCard && (
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-30 px-3 py-1 bg-slate-900/95 border border-amber-400/60 rounded-full shadow-2xl text-[11px] font-black text-amber-300 backdrop-blur animate-fade-in pointer-events-none flex items-center gap-1.5 whitespace-nowrap">
                <span>Carta #{previewHistoryCard.n}:</span>
                <span className="text-white">{previewHistoryCard.name}</span>
              </div>
            )}

            {/* Tira / carrusel horizontal de cartas que van desfilando */}
            {calledCards.length > 0 ? (
              <div
                ref={historyScrollRef}
                className="flex-1 flex items-center gap-1.5 overflow-x-auto hide-scrollbar scroll-smooth py-0.5"
              >
                {calledCards.map((card, idx) => {
                  const isLatest = idx === calledCards.length - 1;
                  return (
                    <button
                      key={`${card.n}-${idx}`}
                      type="button"
                      onClick={() => {
                        setPreviewHistoryCard(card);
                        setTimeout(() => {
                          setPreviewHistoryCard((prev) => (prev?.n === card.n ? null : prev));
                        }, 2500);
                      }}
                      className={`relative shrink-0 rounded-[3px] overflow-hidden transition-all duration-300 cursor-pointer ${
                        isLatest
                          ? "w-[34px] sm:w-[38px] h-[50px] sm:h-[56px] border-2 border-amber-400 ring-2 ring-amber-400/50 scale-105 shadow-[0_0_12px_rgba(245,158,11,0.7)] z-10 animate-pop-in"
                          : "w-[30px] sm:w-[34px] h-[44px] sm:h-[50px] border border-white/40 opacity-85 hover:opacity-100 hover:border-white hover:scale-105"
                      } bg-white shadow-sm flex flex-col justify-between`}
                      title={`#${card.n} ${card.name}`}
                    >
                      <img
                        src={card.image}
                        alt={card.name}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          if (card.fallbackImage && e.currentTarget.src !== card.fallbackImage) {
                            e.currentTarget.src = card.fallbackImage;
                          }
                        }}
                        className="w-full h-full object-fill pointer-events-none select-none"
                      />
                      {/* Número de la carta en la esquina superior */}
                      <span className="absolute top-0 right-0 px-1 py-0.2 bg-black/80 text-[7.5px] font-black text-white leading-none rounded-bl-sm pointer-events-none">
                        {card.n}
                      </span>
                      {/* Badge 'Última' para la más reciente */}
                      {isLatest && (
                        <span className="absolute bottom-0 inset-x-0 bg-amber-500 text-[6.5px] font-black text-black text-center uppercase tracking-tighter leading-none py-0.5 pointer-events-none">
                          Última
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 text-[10px] text-white/40 italic py-1 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400/40 animate-ping" />
                <span>Las cartas voceadas desfilarán aquí conforme salgan...</span>
              </div>
            )}
          </div>
        </section>

        {/* TOP DASHBOARD: CHAT ARRIBA A LA IZQUIERDA | BARAJA A VOCEAR ARRIBA A LA DERECHA */}
        <section aria-label="Panel de juego" className="w-full max-w-[800px] mx-auto px-3 pt-2 pb-1 grid grid-cols-[1fr_auto] gap-2.5 shrink-0 z-20">
          
          {/* CHAT DE JUEGO (ARRIBA A LA IZQUIERDA - CLIC DIRECTO PARA ABRIR Y ESCRIBIR) */}
          <div 
            onClick={() => setActiveModal("chat")}
            className="flex flex-col justify-between bg-black/35 hover:bg-black/45 active:scale-[0.99] border border-white/10 hover:border-cyan-400/40 rounded-2xl p-2 shadow-inner h-[116px] overflow-hidden backdrop-blur-md cursor-pointer transition select-none group"
            title="Toca para abrir el chat y escribir"
          >
            {/* Header with quick sticker/reaction tools */}
            <div className="flex items-center justify-between pb-1 border-b border-white/10 text-[10px] shrink-0">
              <div className="flex items-center gap-1.5 font-bold text-white/90">
                <MessageCircle className="w-3.5 h-3.5 text-[color:var(--brand-cyan)]" />
                <span>Chat de juego</span>
                {chatMsgs.length > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); sendChat("❤️"); }} 
                  className="p-1 rounded-full hover:bg-white/10 active:scale-90 text-[color:var(--brand-pink)] transition"
                  title="Enviar corazón"
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveModal("stickers"); }} 
                  className="p-1 rounded-full hover:bg-white/10 active:scale-90 text-white/70 hover:text-white transition"
                  title="Enviar Stickers"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveModal("chat"); }} 
                  className="text-[9px] font-bold text-[color:var(--brand-cyan)] group-hover:underline ml-0.5"
                >
                  Abrir
                </button>
              </div>
            </div>

            {/* Live messages feed */}
            <div className="flex-1 overflow-y-auto space-y-1 py-1 pr-1 flex flex-col-reverse hide-scrollbar">
              {chatMsgs.slice(-4).map((msg, idx) => (
                <div key={idx} className="text-[10px] leading-tight flex items-start gap-1">
                  <span className="font-bold text-[color:var(--brand-cyan)] shrink-0 truncate max-w-[70px]">
                    {msg.sender}:
                  </span>
                  <span className="text-white/90 truncate flex-1">{msg.text}</span>
                </div>
              ))}
              {chatMsgs.length === 0 && (
                <div className="text-[10px] text-white/40 italic py-1 group-hover:text-white/70 transition-colors">
                  Toca aquí para escribir en el chat...
                </div>
              )}
            </div>

            {/* Quick response chips at bottom */}
            <div className="flex items-center gap-1 pt-1 overflow-x-auto hide-scrollbar shrink-0">
              {["¡Buenas!", "¡Listo!", "¡Ok!", "¡Corre!"].map((txt) => (
                <button 
                  key={txt} 
                  onClick={(e) => { e.stopPropagation(); sendChat(txt); }} 
                  className="px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-[9px] font-bold text-white/90 border border-white/10 whitespace-nowrap transition"
                >
                  {txt}
                </button>
              ))}
            </div>
          </div>

          {/* BARAJA A VOCEAR (ARRIBA A LA DERECHA - BARAJA VOLTEADA HASTA DARLE CLIC A CORRE Y SE VA) */}
          <div 
            onClick={isHost && drawnIdx < 0 ? handleStartGame : undefined}
            className={`w-[84px] sm:w-[94px] h-[116px] shrink-0 p-1 flex items-center justify-center relative select-none transition-transform ${
              drawnIdx < 0 && isHost ? "cursor-pointer hover:scale-[1.03] active:scale-95" : ""
            }`}
            title={drawnIdx < 0 && isHost ? "Toca para iniciar partida (¡Corre y se va!)" : undefined}
          >
            {drawn ? (
              <div className="relative w-full h-full overflow-hidden border-2 border-amber-400 bg-gradient-to-b from-[#1d123d] via-[#120a2a] to-[#0a0518] shadow-[0_4px_20px_rgba(245,158,11,0.25)] rounded-sm">
                <img 
                  src={drawn.image} 
                  alt={drawn.name} 
                  decoding="async"
                  onError={(e) => {
                    if (drawn.fallbackImage && e.currentTarget.src !== drawn.fallbackImage) {
                      e.currentTarget.src = drawn.fallbackImage;
                    }
                  }}
                  className="w-full h-full object-fill animate-pop-in" 
                />
                {drawn.mascot && (
                  <span className="absolute top-0.5 right-0.5 px-1.5 py-0.5 rounded-full bg-black/75 border border-white/20 text-[10px] shadow-md z-10 animate-pop-in">
                    {drawn.mascot}
                  </span>
                )}
              </div>
            ) : (
              /* BARAJA VOLTEADA (DORSO TRADICIONAL DE LA BARAJA MEXICANA CON EFECTO MAZO DE CARTAS) */
              <div 
                className="relative w-full h-full rounded-md overflow-hidden flex flex-col items-center justify-between p-1.5 text-center transition-all group"
                style={{
                  background: "linear-gradient(135deg, #7f1d1d 0%, #450a0a 45%, #2b0307 100%)",
                  boxShadow: "2px 2px 0px #b45309, 4px 4px 0px #78350f, 6px 6px 0px #451a03, 0 8px 16px rgba(0,0,0,0.6)",
                  border: "2px solid #f59e0b",
                }}
              >
                {/* Filigree textured lattice watermark */}
                <div 
                  className="absolute inset-0 opacity-25 pointer-events-none"
                  style={{
                    backgroundImage: "radial-gradient(rgba(245, 158, 11, 0.4) 1px, transparent 1px)",
                    backgroundSize: "6px 6px",
                  }}
                />

                {/* Inner decorative golden border frame */}
                <div className="absolute inset-1 border border-amber-400/40 rounded-sm pointer-events-none" />

                {/* Top header */}
                <div className="relative z-10 pt-0.5 pointer-events-none">
                  <span className="text-[7.5px] font-black uppercase tracking-[0.2em] text-amber-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] block leading-none">
                    LOTERÍA
                  </span>
                </div>

                {/* Central Medallion with Garza Logo */}
                <div className="relative z-10 w-11 h-11 rounded-full bg-black/60 border border-amber-400/80 p-1 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] pointer-events-none">
                  <img 
                    src={logoGarza} 
                    alt="La Garza" 
                    className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                  />
                </div>

                {/* Bottom title & status */}
                <div className="relative z-10 pb-0.5 pointer-events-none">
                  <span className="text-[7px] font-extrabold uppercase tracking-[0.15em] text-amber-200/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] block leading-none">
                    LA GARZA
                  </span>
                  <span className="text-[6.5px] font-black uppercase text-amber-400/90 tracking-wide block mt-0.5 leading-none animate-pulse">
                    {isHost ? "▶ INICIAR" : "EN ESPERA"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* MAIN GAME BOARD */}
        <main className="flex-1 relative px-2 py-1.5 pb-6 flex flex-col justify-start items-center z-10 w-full scroll-touch-y">
           
           {/* Pagination Header (Only if more than 4 tables) */}
           {pages.length > 1 && (
             <div className="w-full max-w-[800px] flex items-center justify-between px-3 py-1.5 mb-2 rounded-full bg-black/40 border border-white/10 text-xs font-bold text-white shrink-0 shadow-md backdrop-blur-md">
               <button
                 type="button"
                 onClick={() => scrollToPage(Math.max(0, activePageIndex - 1))}
                 disabled={activePageIndex === 0}
                 className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 disabled:opacity-20 disabled:pointer-events-none transition flex items-center gap-1 text-[11px] text-amber-300 font-extrabold"
               >
                 <ChevronLeft className="w-3.5 h-3.5" />
                 <span>Anteriores</span>
               </button>

               <div className="flex items-center gap-2">
                 <span className="text-[10px] text-white/90 font-black tracking-wider uppercase">
                   Tablas {activePageIndex * TABLAS_PER_PAGE + 1} - {Math.min((activePageIndex + 1) * TABLAS_PER_PAGE, tablasActivas.length)} de {tablasActivas.length}
                 </span>
                 <div className="flex items-center gap-1.5">
                   {pages.map((_, pIdx) => (
                     <button
                       key={pIdx}
                       type="button"
                       onClick={() => scrollToPage(pIdx)}
                       aria-label={`Ir a página ${pIdx + 1}`}
                       className={`transition-all rounded-full ${
                         activePageIndex === pIdx
                           ? "w-4 h-1.5 bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.7)]"
                           : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"
                       }`}
                     />
                   ))}
                 </div>
               </div>

               <button
                 type="button"
                 onClick={() => scrollToPage(Math.min(pages.length - 1, activePageIndex + 1))}
                 disabled={activePageIndex === pages.length - 1}
                 className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 disabled:opacity-20 disabled:pointer-events-none transition flex items-center gap-1 text-[11px] text-amber-300 font-extrabold"
               >
                 <span>Siguientes</span>
                 <ChevronRight className="w-3.5 h-3.5" />
               </button>
             </div>
           )}

           {/* Swipeable / Slideable Pages Container */}
           <div
             ref={boardsSliderRef}
             onScroll={handleBoardsScroll}
             onTouchStart={handleTouchStart}
             onTouchEnd={handleTouchEnd}
             className="flex w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar scroll-touch-x"
             style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none", msOverflowStyle: "none" }}
           >
             {pages.map((pageTablas, pageIndex) => (
               <div
                 key={pageIndex}
                 className="w-full shrink-0 snap-center px-1 flex flex-col items-center justify-start"
               >
                 <div
                   className={`grid gap-2 w-full max-w-[800px] h-fit place-items-center mx-auto ${
                     pageTablas.length === 1 ? 'grid-cols-1 max-w-[360px]' : 'grid-cols-2'
                   }`}
                 >
                   {pageTablas.map((tablaItem) => (
                     <div
                       key={tablaItem.id}
                       className="bg-white/10 p-1.5 sm:p-2 shadow-2xl backdrop-blur-md w-full max-w-[360px] h-fit border-2 border-white/20 relative"
                     >
                       <div
                         className="grid gap-[2px] bg-white/20 border-2 border-white/10 overflow-hidden mt-0.5"
                         style={{ gridTemplateColumns: `repeat(${tablaItem.size === "4x4" ? 4 : 5}, minmax(0, 1fr))` }}
                       >
                         {tablaItem.cards.map((c, idx) => {
                           const card = getThemedCard(c, deckSkin.id);
                           const isMarked = marked.has(`${tablaItem.id}-${c}`);
                           const uid = `${tablaItem.id}-${c}-${idx}`;
                           return (
                             <button
                               key={uid}
                               type="button"
                               onPointerDown={(e) => handlePointerDown(e, tablaItem.id, c)}
                               onPointerMove={(e) => handlePointerMove(e, tablaItem.id, c)}
                               onPointerUp={(e) => handlePointerUp(e, tablaItem.id, c)}
                               onPointerCancel={(e) => handlePointerUp(e, tablaItem.id, c)}
                               className="relative aspect-[1/1.55] bg-white w-full overflow-hidden active:scale-95 transition-transform touch-none select-none"
                             >
                               <img
                                 src={card?.image}
                                 alt={card?.name ?? `Carta ${c}`}
                                 decoding="async"
                                 onError={(e) => {
                                   if (card?.fallbackImage && e.currentTarget.src !== card.fallbackImage) {
                                     e.currentTarget.src = card.fallbackImage;
                                   }
                                 }}
                                 className="w-full h-full object-fill pointer-events-none"
                                 draggable={false}
                               />
                               {isMarked && (
                                 <span className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-[1px] pointer-events-none">
                                   {settings.marker.startsWith("/") || settings.marker.startsWith("http") ? (
                                     <img
                                       src={settings.marker}
                                       alt="Marcador"
                                       className="w-10 h-10 object-contain drop-shadow-lg animate-pop-in"
                                       draggable={false}
                                     />
                                   ) : (
                                     <span className="text-3xl drop-shadow-lg animate-pop-in select-none">
                                       {settings.marker}
                                     </span>
                                   )}
                                 </span>
                               )}

                               {/* Scratching Ritual Visual */}
                               {interaction?.uid === `${tablaItem.id}-${c}` && interaction.isScratching && (
                                 <div
                                   className="absolute z-20 pointer-events-none drop-shadow-2xl flex flex-col items-center justify-center animate-scratch-hand"
                                   style={{ left: interaction.curX, top: interaction.curY }}
                                 >
                                   <div className="relative flex items-center justify-center">
                                     <CoinAnimation className="w-12 h-12 drop-shadow-lg z-10" />
                                     <span className="text-[40px] absolute top-3 left-4 z-20 drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)]">
                                       🤏🏽
                                     </span>
                                   </div>
                                 </div>
                               )}
                             </button>
                           );
                         })}
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             ))}
           </div>
        </main>

        {/* CAMBIAR TABLAS / MODO BUTTONS — SOLO DISPONIBLE ANTES DE EMPEZAR LA RONDA O AL TERMINAR */}
        {!isGameActive && (
          <div className="bg-[color:var(--brand-navy-deep)] py-2.5 px-4 flex justify-between gap-3 border-t border-white/10 shrink-0 z-30 relative shadow-2xl">
            <button
              type="button"
              onClick={() => setActiveModal("tablas")}
              className="flex-1 py-2.5 rounded-full border-2 border-white/20 text-white font-bold text-sm flex items-center justify-center gap-2 active:bg-white/10 transition-colors"
            >
              <RotateCcw className="w-4 h-4" strokeWidth={2.5} /> Cambiar Tablas
            </button>
            {isHost && drawnIdx < 0 && (
              <button
                type="button"
                onClick={() => setActiveModal("modos")}
                className="flex-1 py-2.5 rounded-full border-2 border-[color:var(--brand-cyan)] text-[color:var(--brand-cyan)] font-bold text-sm flex items-center justify-center gap-2 active:bg-[color:var(--brand-cyan)]/10 transition-colors"
              >
                <Triangle className="w-4 h-4 rotate-90" strokeWidth={2.5} /> Cambiar Modo
              </button>
            )}
          </div>
        )}

        {/* MAIN BOTTOM BAR — SOLO VISIBLE PARA EL HOST */}
        {isHost && (
          <div className="bg-[color:var(--brand-navy)] px-4 py-3 flex items-center gap-3 shrink-0 z-30 border-t border-white/10 relative shadow-inner">
            
            {/* Speed Selector Button (Segundero configurable por el host) */}
            <div className="relative shrink-0">
              {showSpeedMenu && (
                <div 
                  className="absolute bottom-full mb-3 left-0 bg-[color:var(--brand-navy-deep)]/95 border-2 border-amber-400/80 p-2 rounded-2xl shadow-2xl backdrop-blur-md z-50 flex items-center gap-1.5 animate-pop-in"
                >
                  <div className="text-[10px] font-black uppercase tracking-wider text-amber-300 px-1 border-r border-white/10 shrink-0">
                    Segundos
                  </div>
                  {SPEED_OPTIONS.map((sec) => {
                    const isSelected = timeSecs === sec;
                    return (
                      <button
                        key={sec}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetSpeed(sec);
                        }}
                        className={`w-9 h-9 rounded-xl font-black text-xs transition active:scale-90 flex items-center justify-center cursor-pointer ${
                          isSelected
                            ? "bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.6)] ring-2 ring-white scale-105"
                            : "bg-white/10 hover:bg-white/20 text-white border border-white/15"
                        }`}
                      >
                        {sec}s
                      </button>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                onClick={handleCycleSpeed}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-full border shadow-md shrink-0 transition active:scale-95 cursor-pointer ${
                  showSpeedMenu
                    ? "bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                    : "bg-amber-400/15 hover:bg-amber-400/25 border-amber-400/40 text-amber-300"
                }`}
                title="Toca para cambiar los segundos de intervalo entre cartas"
              >
                <TimerIcon className="w-4 h-4 text-current" />
                <span className="font-extrabold text-sm">{timeSecs}s</span>
              </button>
            </div>
            
            <button
              type="button"
              onClick={() => {
                if (drawnIdx < 0) {
                  handleStartGame();
                } else {
                  const nextPaused = !paused;
                  setPaused(nextPaused);
                  update(ref(database, `mesas/${id}`), { serverPaused: nextPaused }).catch(() => {});
                }
              }}
              className="bg-[color:var(--brand-cyan)] w-[42px] h-[42px] shrink-0 rounded-full flex items-center justify-center shadow-inner border border-[color:var(--brand-cyan)] active:scale-95 transition-transform cursor-pointer"
              title={paused || drawnIdx < 0 ? "Comenzar a vocear cartas" : "Pausar"}
            >
              {paused || drawnIdx < 0 ? (
                <Play className="w-5 h-5 text-[color:var(--brand-navy-deep)] fill-[color:var(--brand-navy-deep)] ml-1" />
              ) : (
                <Pause className="w-5 h-5 text-[color:var(--brand-navy-deep)] fill-[color:var(--brand-navy-deep)]" />
              )}
            </button>

            <button 
              type="button"
              onClick={handleStartGame}
              disabled={mesa?.status === "en-juego" && drawnIdx >= 0}
              className={`flex-1 text-[color:var(--brand-navy-deep)] font-extrabold py-3 rounded-full shadow-md text-sm sm:text-base tracking-wide transition-transform ${
                mesa?.status === "en-juego" && drawnIdx >= 0
                  ? "bg-white/20 text-white/50 cursor-not-allowed"
                  : "bg-[color:var(--brand-gold)] shadow-[0_0_20px_rgba(255,215,0,0.5)] animate-pulse active:scale-95 cursor-pointer"
              }`}
            >
              {drawnIdx < 0 ? "¡CORRE Y SE VA CORRIENDO!" : "Corre y se va corriendo..."}
            </button>
          </div>
        )}

        {/* Ad Interstitial Modal (ONLY shown for regular rooms, strictly bypassed for VIP rooms) */}
        {!mesa?.isVip && (
          <AdInterstitialModal
            open={showAd}
            onFinished={() => {
              setShowAd(false);
              if (pendingActionAfterAd) {
                pendingActionAfterAd();
                setPendingActionAfterAd(null);
              }
            }}
            onGoVip={() => {
              setShowAd(false);
              navigate({ to: "/crear-sala-vip" });
            }}
          />
        )}

      </div>
    </BrandBackground>
  );
}
