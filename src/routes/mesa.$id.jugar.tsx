import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft, Pause, Play, Settings2, MessageCircle, Users, RotateCcw,
  Timer as TimerIcon, Heart, Image as ImageIcon, Triangle, X, Send,
  Menu, Info, Trophy, Link as LinkIcon, Edit2, Share2, LayoutGrid, Check, CircleDot, Zap
} from "lucide-react";
import { DECK, getCard } from "@/lib/deck";
import { ref, onValue, update, push, set, onDisconnect } from "firebase/database";
import { database } from "@/lib/firebase";
import { BrandBackground } from "@/components/BrandBackground";
import { CoinAnimation } from "@/components/CoinAnimation";
import { MiniBoardIllustration } from "@/components/MiniBoardIllustration";
import { increment } from "firebase/database";

export const Route = createFileRoute("/mesa/$id/jugar")({
  component: JugarPage,
});

type Size = "4x4" | "5x5";
type Mode = "normal" | "pozo" | "esquinas" | "sieteLoco" | "modoX";

interface Tabla {
  id: string; size: Size; cards: number[]; createdAt: number;
}
interface Mesa {
  id: string; name: string; mode: Mode; size: Size; perPlayer: number; cost?: number;
  tablaIds: string[]; host: string; status: string; deck?: number[];
  drawnIdx?: number; players?: Record<string, any>; prizePool?: number; serverPaused?: boolean;
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

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function speedFor(mode: Mode): number {
  return 4000;
}

const MODE_META: Record<Mode, { label: string; hint: string; icon: React.ComponentType<{ className?: string }> }> = {
  normal: { label: "Normal", hint: "Llena la tabla o línea", icon: Trophy },
  pozo: { label: "Pozo", hint: "Grupo al centro", icon: CircleDot },
  esquinas: { label: "4 Esquinas", hint: "Las cuatro esquinas", icon: LayoutGrid },
  sieteLoco: { label: "7 Loco", hint: "Patrón de 7 cartas", icon: Zap },
  modoX: { label: "Modo X", hint: "Forma una X", icon: X },
};

function checkWin(mode: Mode, size: Size, cards: number[], isMarked: (c: number) => boolean): boolean {
  const n = size === "4x4" ? 4 : 5;
  const grid = Array.from({ length: n }, (_, r) => cards.slice(r * n, (r + 1) * n));

  if (mode === "normal") {
    if (cards.every(isMarked)) return true;
    for (let r = 0; r < n; r++) if (grid[r].every(isMarked)) return true;
    for (let c = 0; c < n; c++) if (grid.every((row) => isMarked(row[c]))) return true;
    if (grid.every((row, i) => isMarked(row[i]))) return true;
    if (grid.every((row, i) => isMarked(row[n - 1 - i]))) return true;
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
  const [paused, setPaused] = useState(true);
  
  const [settings, setSettings] = useState({
    audio: true, effects: true, confetti: true, vibration: true, marker: "/markers/ifrijol.png", voice: "default"
  });

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
  const [stickerTab, setStickerTab] = useState<"clasicos"|"gifs"|"cartas">("clasicos");
  
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

  const userName = typeof window !== "undefined" ? localStorage.getItem("garza:name") || "Jugador" : "Jugador";
  const isHost = (typeof window !== "undefined" && localStorage.getItem(`garza:host:${id}`) === "true") || mesa?.host === userName;

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
          const allTablas = loadTablas().filter(t => t.size === data.size);
          try {
            const savedSelected = localStorage.getItem(`garza:selectedTablas:${id}`);
            if (savedSelected) {
              const ids = JSON.parse(savedSelected) as string[];
              const selected = ids.map(tid => allTablas.find(t => t.id === tid)).filter(Boolean) as Tabla[];
              if (selected.length > 0) return selected;
            }
          } catch {}
          return allTablas.slice(0, data.perPlayer || 1);
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

    const playerRef = ref(database, `mesas/${id}/players/${userName}`);
    update(playerRef, {
      name: userName,
      role: isHost ? "host" : "guest",
    }).catch(() => {});
    
    const discRef = onDisconnect(playerRef);
    discRef.remove();

    return () => {
      unsubscribe(); unsubscribeChat(); discRef.cancel();
    };
  }, [id, isHost, userName]);

  const deck = mesa?.deck || [];
  const drawnIdx = mesa?.drawnIdx ?? -1;
  const isGameStarted = drawnIdx >= 0;

  const [showTutorial, setShowTutorial] = useState(false);
  useEffect(() => {
    if (drawnIdx === -1 && mesa?.status === "en-juego") {
      setShowTutorial(true);
    } else {
      setShowTutorial(false);
    }
  }, [drawnIdx, mesa?.status]);

  // Transition from tutorial to first card
  useEffect(() => {
    if (isHost && drawnIdx === -1 && mesa?.status === "en-juego") {
      const timer = setTimeout(() => {
        update(ref(database, `mesas/${id}`), { drawnIdx: 0 }).catch(() => {});
      }, speedFor(mesa.mode));
      return () => clearTimeout(timer);
    }
  }, [isHost, drawnIdx, mesa?.status, mesa?.mode, id]);

  const currentCard = deck[drawnIdx];
  useEffect(() => {
    if (currentCard !== undefined && settings.audio) {
      const basePath = settings.voice === "default" ? "/audio/cards" : `/audio/cards/${settings.voice}`;
      const audio = new Audio(`${basePath}/b${currentCard}.mp3`);
      audio.play().catch(() => {});
    }
  }, [currentCard, settings.audio, settings.voice]);

  const drawn = drawnIdx >= 0 ? getCard(deck[drawnIdx]) : null;

  useEffect(() => {
    if (drawnIdx === -1) {
      setWon(false);
      setWinDismissed(false);
      setMarked(new Set());
      setRoundPaid(false);
    }
  }, [drawnIdx]);

  useEffect(() => {
    if (drawnIdx === 0 && !roundPaid && tablasActivas.length > 0 && mesa) {
      const myCost = tablasActivas.length * (mesa.cost || 10);
      setCoins(prev => prev - myCost);
      setRoundPaid(true);
      update(ref(database, `mesas/${id}`), { prizePool: increment(myCost) }).catch(() => {});
    }
  }, [drawnIdx, roundPaid, tablasActivas.length, mesa?.cost, id]);

  useEffect(() => {
    if (!mesa || tablasActivas.length === 0 || winDismissed || won) return;
    const hasWin = tablasActivas.some(t => checkWin(mesa.mode, t.size, t.cards, (c) => marked.has(`${t.id}-${c}`)));
    if (hasWin) {
      setWon(true);
      
      // Award prize
      if (mesa.prizePool && mesa.prizePool > 0) {
         setCoins(prev => prev + mesa.prizePool!);
         update(ref(database, `mesas/${id}`), { prizePool: 0, serverPaused: true }).catch(() => {});
      } else {
         update(ref(database, `mesas/${id}`), { serverPaused: true }).catch(() => {});
      }

      if (isHost) setPaused(true);
      if (settings.effects) new Audio("/audio/effects/winner.mp3").play().catch(() => {});
      if (settings.vibration && navigator.vibrate) navigator.vibrate([500, 200, 500]);
    }
  }, [marked, mesa, tablasActivas, settings, winDismissed, won, isHost]);

  function toggleMark(tablaId: string, card: number) {
    if (won) return;
    const currentDrawnCard = deck[drawnIdx];
    if (currentDrawnCard !== card) return; // Sólo marcar si es la carta actual

    setMarked((prev) => {
      const markKey = `${tablaId}-${card}`;
      if (prev.has(markKey)) return prev; // No se puede retirar la marca

      const next = new Set(prev);
      next.add(markKey);
      if (settings.effects) new Audio("/audio/effects/pop.mp3").play().catch(() => {});
      if (settings.vibration && navigator.vibrate) navigator.vibrate(50);
      return next;
    });
  }

  // --- SCRATCH INTERACTION HANDLERS ---
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>, tablaId: string, c: number) => {
    e.currentTarget.setPointerCapture(e.pointerId);
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
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (interaction && interaction.uid === `${tablaId}-${c}`) {
      if (!interaction.isScratching) {
        toggleMark(tablaId, c);
      }
      setInteraction(null);
    }
  };
  // ------------------------------------


  async function restart() {
    if (!isHost || !mesa) return;
    const newDeck = shuffle(DECK.map((c) => c.n));
    await update(ref(database, `mesas/${id}`), { deck: newDeck, drawnIdx: -1, status: "abierta", serverPaused: false });
    setMarked(new Set());
    setWon(false);
    setWinDismissed(false);
    setPaused(true);
    setActiveModal(null);
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

  useEffect(() => {
    if (!isHost || !mesa || mesa.status !== "en-juego" || paused || won || mesa.serverPaused || drawnIdx < 0) return;
    if (!mesa.deck || mesa.deck.length === 0) return;
    
    const interval = setInterval(() => {
      if (drawnIdx < mesa.deck.length - 1) {
        update(ref(database, `mesas/${id}`), { drawnIdx: drawnIdx + 1 }).catch(() => {});
      } else {
        setPaused(true);
      }
    }, speedFor(mesa.mode));
    
    return () => clearInterval(interval);
  }, [isHost, mesa?.status, mesa?.serverPaused, mesa?.mode, paused, won, drawnIdx, mesa?.deck?.length, id]);

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

  const timeSecs = speedFor(mesa.mode) / 1000;
  const connectedPlayers = mesa.players ? Object.keys(mesa.players) : [mesa.host];

  return (
    <BrandBackground>
      <div className="flex flex-col min-h-[100dvh] font-sans relative overflow-hidden bg-white/5">
        
        {/* Modals & Overlays */}
          {activeModal === "exitConfirm" && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-[color:var(--brand-navy-deep)] w-full max-w-sm rounded-3xl p-6 ring-1 ring-white/10 shadow-2xl animate-pop-in border border-white/20 text-center">
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

        {/* Tutorial Overlay */}
        {showTutorial && (
          <div className="absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm animate-pop-in px-6 pb-20">
            <div className="relative mb-6">
              <div className="w-24 h-36 bg-white/20 shadow-2xl border-2 border-white/50 rotate-[-5deg] backdrop-blur-sm" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative animate-scratch-hand z-10 scale-125">
                  <div className="text-7xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">👇</div>
                  <CoinAnimation className="absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 drop-shadow-md rotate-[-15deg]" />
                </div>
              </div>
            </div>
            <h3 className="text-[color:var(--brand-gold)] font-black text-2xl uppercase tracking-widest mb-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Ritual de Suerte</h3>
            <p className="text-white font-bold text-lg leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center">
              Para marcar, presiona tu carta y<br/>
              <span className="text-[color:var(--brand-cyan)] text-2xl mt-1 block">mueve de lado a lado</span>
            </p>
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

        {/* WIN OVERLAY (Confetti Effect could be CSS animation applied here based on settings.confetti) */}
        {won && (
          <div className="absolute inset-0 z-50 bg-[color:var(--brand-navy-deep)]/80 flex items-center justify-center p-6 backdrop-blur-sm">
            {settings.confetti && <div className="absolute inset-0 pointer-events-none bg-[url('https://cdn-icons-png.flaticon.com/512/1795/1795325.png')] bg-[length:50px] animate-confetti-fall opacity-40"></div>}
            <div className="bg-[color:var(--brand-navy)] p-6 rounded-3xl shadow-2xl text-center border-2 border-[color:var(--brand-gold)] w-full max-w-sm animate-pop-in relative z-10 flex flex-col gap-3">
              <h2 className="text-5xl font-black text-[color:var(--brand-gold)] mb-2 drop-shadow-md">¡Lotería!</h2>
              <p className="text-white mb-2 font-medium">Has ganado la partida.</p>
              
              <div className="bg-white/5 rounded-2xl p-4 mb-2 border border-white/10">
                <span className="text-white/60 text-xs uppercase tracking-wider font-bold block mb-1">Premio Obtenido</span>
                <span className="text-[color:var(--brand-gold)] text-4xl font-black flex items-center justify-center gap-2">
                  🪙 {mesa?.prizePool || 0}
                </span>
              </div>
              
              <button  
                onClick={() => {
                  setWinDismissed(true);
                  update(ref(database, `mesas/${id}`), { serverPaused: false }).catch(() => {});
                  if (isHost) setPaused(false);
                }} 
                className="w-full bg-white/10 text-white font-black py-4 rounded-full text-lg hover:bg-white/20 active:scale-95 shadow-md transition-all border border-white/20"
              >
                Seguir jugando
              </button>
              
              {isHost && (
                <>
                  <div className="flex justify-between items-center bg-white/5 rounded-2xl p-4 border border-white/10 mb-4 animate-slide-up-soft">
                    <span className="text-white font-bold">Estado de la mesa</span>
                    <span className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/20">
                      {mesa?.status}
                    </span>
                  </div>
                  {mesa?.status === "abierta" && (
                    <button 
                      onClick={() => update(ref(database, `mesas/${id}`), { status: "en-juego" })}
                      className="w-full bg-[color:var(--brand-gold)] text-[color:var(--brand-navy-deep)] font-black py-4 rounded-full text-lg shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:scale-[1.02] active:scale-95 transition-all mb-4"
                    >
                      Comenzar Partida
                    </button>
                  )}
                </>
              )}
              
              <button onClick={() => navigate({ to: "/mesa/$id", params: { id: mesa.id } })} className="w-full bg-transparent text-white/50 font-bold py-2 mt-2 rounded-full text-sm hover:text-white active:scale-95 transition-colors">
                Salir de la mesa
              </button>
            </div>
          </div>
        )}

        {/* --- MODALS (Settings, Stickers, Tables, Modes, Chat) --- */}
        {activeModal && activeModal !== "menu" && (
          <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-[2px]">
            {/* Modal Container */}
            <div className={`bg-white w-full max-w-md rounded-3xl overflow-hidden flex flex-col animate-pop-in shadow-2xl max-h-[85vh]`}>
              
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
              <div className="overflow-y-auto flex-1 bg-[color:var(--brand-navy)]">
                
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
                    <div className="flex justify-around bg-[color:var(--brand-navy)] border-b border-white/10 font-bold text-white/50 shrink-0">
                      <button onClick={() => setStickerTab("clasicos")} className={`py-3 px-4 border-b-2 transition-colors ${stickerTab === 'clasicos' ? 'border-[color:var(--brand-cyan)] text-[color:var(--brand-cyan)]' : 'border-transparent hover:text-white'}`}>Clásicos</button>
                      <button onClick={() => setStickerTab("gifs")} className={`py-3 px-4 border-b-2 transition-colors ${stickerTab === 'gifs' ? 'border-[color:var(--brand-cyan)] text-[color:var(--brand-cyan)]' : 'border-transparent hover:text-white'}`}>GIFs</button>
                      <button onClick={() => setStickerTab("cartas")} className={`py-3 px-4 border-b-2 transition-colors ${stickerTab === 'cartas' ? 'border-[color:var(--brand-cyan)] text-[color:var(--brand-cyan)]' : 'border-transparent hover:text-white'}`}>Cartas</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 grid grid-cols-4 gap-4 auto-rows-max">
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
                          {connectedPlayers.map(p => (
                            <div key={p} className="flex items-center justify-between bg-white/10 p-3 rounded-xl border border-white/5">
                              <span className="text-white font-bold flex items-center gap-2"><Users className="w-4 h-4 text-[color:var(--brand-cyan)]" /> {p}</span>
                              {p === mesa.host && <span className="text-[10px] bg-[color:var(--brand-gold)] text-black px-2 py-0.5 rounded-full font-bold">ANFITRIÓN</span>}
                            </div>
                          ))}
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
                              placeholder="Mensaje..."
                              className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white text-sm outline-none focus:border-[color:var(--brand-cyan)]"
                            />
                            <button onClick={() => sendChat(chatInput)} className="w-10 h-10 rounded-full bg-[color:var(--brand-cyan)] flex items-center justify-center text-[color:var(--brand-navy-deep)] shrink-0 active:scale-95">
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {activeModal === "tablas" && (
                        <div className="flex flex-col gap-3">
                          {isGameStarted && <p className="text-[color:var(--brand-gold)] text-sm text-center mb-2 font-bold">No puedes cambiar de tablas durante una partida en curso.</p>}
                          <div className="grid grid-cols-2 gap-4">
                            {loadTablas().filter(t => t.size === mesa.size).map((t, idx) => {
                            const isActiva = tablasActivas.some(act => act.id === t.id);
                            return (
                              <button key={t.id} disabled={isGameStarted} onClick={() => { 
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
                                    const card = getCard(c);
                                    return (
                                      <div key={i} className="relative aspect-[3/4] ring-1 ring-white/10">
                                        <img
                                          src={card?.image}
                                          alt={card?.name ?? `Carta ${c}`}
                                          loading="lazy"
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
          
          <div className="flex flex-1 items-center gap-2 ml-2 text-[10px] font-bold">
            <div className="flex items-center gap-1 bg-black/40 rounded-full px-2 py-1 border border-white/10 shadow-inner">
              <span>🪙</span>
              <span className="text-[color:var(--brand-gold)]">{coins}</span>
            </div>
            <div className="flex items-center gap-1 bg-[color:var(--brand-gold)]/20 rounded-full px-2 py-1 border border-[color:var(--brand-gold)]/40">
              <span>🏆</span>
              <span className="text-[color:var(--brand-gold)]">{mesa?.prizePool || 0}</span>
            </div>
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

        <div className="h-12 bg-[color:var(--brand-navy)] flex items-center px-2 gap-2 overflow-x-auto shrink-0 z-30 relative shadow-md border-b border-white/5 hide-scrollbar">
          {["¡Espera!", "¡Estoy listo!", "¡Ok!", "¡Continúa!"].map((txt) => (
            <button key={txt} onClick={() => sendChat(txt)} className="whitespace-nowrap px-3 py-1.5 bg-[color:var(--brand-cyan)] text-[color:var(--brand-navy-deep)] text-xs font-bold rounded shadow-sm active:scale-95 transition-transform">
              {txt}
            </button>
          ))}
          <button onClick={() => sendChat("❤️")} className="p-1.5 shrink-0 active:scale-95">
            <Heart className="w-5 h-5 text-[color:var(--brand-pink)] fill-[color:var(--brand-pink)]" />
          </button>
          <button onClick={() => setActiveModal("stickers")} className="p-1.5 shrink-0 active:scale-95 bg-white/10 rounded shadow-sm border border-white/10">
            <ImageIcon className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* INLINE LIVE CHAT */}
        <div className="h-[72px] bg-black/20 shrink-0 border-b border-white/5 p-2 overflow-y-auto flex flex-col-reverse shadow-inner relative z-20">
          <div className="flex flex-col gap-1 w-full max-w-[800px] mx-auto">
            {chatMsgs.slice(-5).map((msg, idx) => (
              <div key={idx} className="text-[11px] leading-tight animate-fade-in-right">
                <span className="font-bold text-[color:var(--brand-cyan)]">{msg.sender}: </span>
                <span className="text-white/90">{msg.text}</span>
              </div>
            ))}
            {chatMsgs.length === 0 && (
              <div className="text-[11px] text-white/30 italic text-center w-full mt-4">No hay mensajes aún</div>
            )}
          </div>
        </div>

        {/* MAIN GAME BOARD */}
        <main className="flex-1 relative p-4 pt-4 pb-32 flex justify-center items-start overflow-y-auto z-10 w-full">
           <div className="w-full h-full flex flex-col items-center">
             
             {/* DECK CARD (Now inline, no longer overlaps) */}
             <div className="mb-6 flex flex-col items-center">
               <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-2">Carta actual</span>
               <div className="w-[80px] h-[120px] bg-white/10 p-1 shadow-2xl border border-[color:var(--brand-gold)] transform rotate-2 backdrop-blur-md rounded-lg relative">
                 <div className="w-full h-full relative">
                   {drawn ? (
                     <img src={drawn.image} alt={drawn.name} className="w-full h-full object-fill animate-pop-in rounded-sm" />
                   ) : (
                     <div className="w-full h-full bg-red-600 border border-red-800 flex flex-col items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] rounded-sm"></div>
                   )}
                 </div>
               </div>
             </div>
             <div className={`grid gap-2 w-full max-w-[800px] h-fit place-items-center mx-auto ${
               tablasActivas.length === 1 ? 'grid-cols-1 max-w-[360px]' :
               'grid-cols-2'
             }`}>
               {tablasActivas.map(tablaItem => (
                 <div key={tablaItem.id} className="bg-white/10 p-1.5 sm:p-2 shadow-2xl backdrop-blur-md w-full max-w-[360px] h-fit border border-white/20 relative">
                   <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[color:var(--brand-navy-deep)] px-3 py-0.5 rounded-full border border-[color:var(--brand-cyan)]/30 text-[10px] text-[color:var(--brand-cyan)] font-bold tracking-widest shadow-md">
                     TABLA {tablaItem.id.slice(0, 4).toUpperCase()}
                   </div>
                   <div className="grid gap-[2px] bg-white/20 border-2 border-white/10 mt-1" style={{ gridTemplateColumns: `repeat(${tablaItem.size === "4x4" ? 4 : 5}, minmax(0, 1fr))` }}>
                     {tablaItem.cards.map((c, idx) => {
                       const card = getCard(c);
                       const isMarked = marked.has(`${tablaItem.id}-${c}`);
                       // to uniquely identify the interaction, use tablaItem.id + c
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
                           <img src={card?.image} alt={card?.name ?? `Carta ${c}`} className="w-full h-full object-fill pointer-events-none" draggable={false} />
                           {isMarked && (
                             <span className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-[1px] pointer-events-none">
                               <img src={settings.marker} alt="Frijol" className="w-10 h-10 object-contain drop-shadow-lg animate-pop-in" draggable={false} />
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
                                   <span className="text-[40px] absolute top-3 left-4 z-20 drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)]">🤏🏽</span>
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
        </main>

        {/* CAMBIAR TABLAS / MODO BUTTONS */}
        <div className="bg-[color:var(--brand-navy-deep)] py-3 px-4 flex justify-between gap-4 border-t border-white/10 shrink-0 z-30 relative shadow-2xl">
          <button onClick={() => setActiveModal("tablas")} className="flex-1 py-2.5 rounded-full border-2 border-white/20 text-white font-bold text-sm flex items-center justify-center gap-2 active:bg-white/10 transition-colors">
            <RotateCcw className="w-4 h-4" strokeWidth={2.5} /> Cambiar Tablas
          </button>
          <button onClick={() => setActiveModal("modos")} className="flex-1 py-2.5 rounded-full border-2 border-[color:var(--brand-cyan)] text-[color:var(--brand-cyan)] font-bold text-sm flex items-center justify-center gap-2 active:bg-[color:var(--brand-cyan)]/10 transition-colors">
            <Triangle className="w-4 h-4 rotate-90" strokeWidth={2.5} /> Cambiar Modo
          </button>
        </div>

        {/* MAIN BOTTOM BAR */}
        <div className="bg-[color:var(--brand-navy)] px-4 py-3 flex items-center gap-3 shrink-0 z-30 border-t border-white/10 relative shadow-inner">
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-2.5 rounded-full border border-white/20 shadow-sm shrink-0">
            <TimerIcon className="w-4 h-4 text-white/80" />
            <span className="font-extrabold text-sm text-white">{timeSecs}s</span>
          </div>
          
          {isHost ? (
            <button onClick={() => setPaused(!paused)} className="bg-[color:var(--brand-cyan)] w-[42px] h-[42px] shrink-0 rounded-full flex items-center justify-center shadow-inner border border-[color:var(--brand-cyan)] active:scale-95 transition-transform">
              {paused ? <Play className="w-5 h-5 text-[color:var(--brand-navy-deep)] fill-[color:var(--brand-navy-deep)] ml-1" /> : <Pause className="w-5 h-5 text-[color:var(--brand-navy-deep)] fill-[color:var(--brand-navy-deep)]" />}
            </button>
          ) : (
             <div className="bg-white/5 w-[42px] h-[42px] shrink-0 rounded-full flex items-center justify-center border border-white/10 opacity-50">
              <Play className="w-5 h-5 text-white/40 fill-white/40 ml-1" />
            </div>
          )}

          <button 
            onClick={() => {
              if (isHost && drawnIdx < 0) {
                 update(ref(database, `mesas/${id}`), { status: "en-juego", serverPaused: false }).catch(() => {});
                 setPaused(false);
              }
            }}
            disabled={!isHost || mesa?.status === "en-juego"}
            className={`flex-1 text-[color:var(--brand-navy-deep)] font-extrabold py-3 rounded-full shadow-md text-sm sm:text-base tracking-wide transition-transform ${
              !isHost || mesa?.status === "en-juego" ? "bg-white/20 text-white/50 cursor-not-allowed" : "bg-[color:var(--brand-gold)] shadow-[0_0_15px_rgba(255,215,0,0.4)] active:scale-95"
            }`}
          >
            {isHost ? (mesa?.status !== "en-juego" ? "INICIAR" : "Corre y se va corriendo") : "Esperando al anfitrión"}
          </button>
        </div>

      </div>
    </BrandBackground>
  );
}
