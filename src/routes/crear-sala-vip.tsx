import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Crown,
  Calendar,
  Clock,
  Users,
  Trophy,
  Plus,
  Trash2,
  Lock,
  Sparkles,
  ArrowLeft,
  Share2,
  Check,
  Shield,
  CircleDot,
  LayoutGrid,
  Zap,
  X,
  UserPlus,
  ExternalLink,
  ChevronRight,
  Sliders,
  DollarSign,
  Info,
  ShieldCheck
} from "lucide-react";
import { BrandBackground } from "@/components/BrandBackground";
import { VipSubscriptionModal } from "@/components/VipSubscriptionModal";
import { ref, push, set, onValue, remove, update } from "firebase/database";
import { database } from "@/lib/firebase";
import { checkVipStatus } from "@/lib/purchases";
import { getCurrentUser, encodeEmailKey } from "@/lib/auth";

export const Route = createFileRoute("/crear-sala-vip")({
  head: () => ({
    meta: [
      { title: "Panel Administrativo Sala VIP — Lotería La Garza" },
      { name: "description", content: "Administra y programa torneos y salas VIP de Lotería La Garza." },
    ],
  }),
  component: CrearSalaVipPage,
});

type Size = "4x4" | "5x5";
type Mode = "normal" | "pozo" | "esquinas" | "sieteLoco" | "modoX";

interface VipRound {
  id: string;
  roundNum: number;
  title: string;
  mode: Mode;
  prize: string;
}

interface RegisteredPlayer {
  id: string;
  name: string;
  status: "registrado" | "confirmado";
  addedAt: number;
}

const MODES: { id: Mode; label: string; hint: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "normal", label: "Normal", hint: "Tradicional: línea, cuadro chico, 4 esquinas o llena", icon: Trophy },
  { id: "pozo", label: "Pozo", hint: "Centro de la tabla", icon: CircleDot },
  { id: "esquinas", label: "4 Esquinas", hint: "Las 4 esquinas", icon: LayoutGrid },
  { id: "sieteLoco", label: "7 Loco", hint: "7 cartas marcadas", icon: Zap },
  { id: "modoX", label: "Modo X", hint: "Diagonal en X", icon: X },
];

const QUICK_PRIZES = ["$500 MXN", "$1,000 MXN", "$2,500 MXN", "1,000 Monedas", "5,000 Monedas", "Trofeo Especial"];

function CrearSalaVipPage() {
  const navigate = useNavigate();
  const [isVip, setIsVip] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"crear" | "mis-salas">("crear");

  // Host info
  const [hostName, setHostName] = useState("Anfitrión VIP");

  // Room config state
  const [roomName, setRoomName] = useState("");
  const [isScheduled, setIsScheduled] = useState(true);
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [scheduledTime, setScheduledTime] = useState("20:00");
  const [maxPlayers, setMaxPlayers] = useState(16);
  const [whitelistOnly, setWhitelistOnly] = useState(true);
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [size, setSize] = useState<Size>("4x4");
  const [perPlayer, setPerPlayer] = useState(2);

  // Registered players list
  const [newPlayerName, setNewPlayerName] = useState("");
  const [registeredPlayers, setRegisteredPlayers] = useState<RegisteredPlayer[]>([]);

  // Rounds configuration
  const [rounds, setRounds] = useState<VipRound[]>([
    { id: "1", roundNum: 1, title: "Ronda 1: Apertura", mode: "normal", prize: "$500 MXN" },
    { id: "2", roundNum: 2, title: "Ronda 2: Desafío Pozo", mode: "pozo", prize: "$1,000 MXN" },
    { id: "3", roundNum: 3, title: "Gran Final VIP", mode: "esquinas", prize: "$2,000 MXN" },
  ]);

  // Loading & Submission
  const [submitting, setSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    const isSessionActive = typeof window !== "undefined" && sessionStorage.getItem("garza:session_active") === "true";
    const storedName = typeof window !== "undefined" ? localStorage.getItem("garza:name") : null;
    const hasValidName = Boolean(storedName && storedName.trim().length > 0 && storedName !== "Jugador" && storedName !== "Invitado");
    if (!user?.email && (!isSessionActive || !hasValidName)) {
      navigate({ to: "/", search: { redirect: "/crear-sala-vip" } });
    }
  }, [navigate]);

  // My VIP rooms list
  const [myVipRooms, setMyVipRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Check VIP status (Firebase RTDB como fuente de verdad, localStorage como cache offline)
  useEffect(() => {
    const checkStatus = () => {
      try {
        const vipStored = localStorage.getItem("garza:vip");
        const nameStored = localStorage.getItem("garza:name");
        setIsVip(vipStored === "true");
        if (nameStored) setHostName(nameStored);
      } catch {
        /* ignore */
      }

      // Re-verificar contra Firebase RTDB / RevenueCat
      const user = getCurrentUser();
      const userId = user?.email ? encodeEmailKey(user.email) : undefined;
      checkVipStatus(userId).then((active) => {
        setIsVip(active);
      }).catch(() => {});
    };

    checkStatus();
    window.addEventListener("garza:vip-updated", checkStatus);
    return () => window.removeEventListener("garza:vip-updated", checkStatus);
  }, []);

  // Fetch host's VIP rooms from Firebase
  useEffect(() => {
    const mesasRef = ref(database, "mesas");
    const unsubscribe = onValue(mesasRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.values(data)
          .filter((m: any) => m.isVip && m.host === hostName)
          .sort((a: any, b: any) => b.createdAt - a.createdAt);
        setMyVipRooms(list);
      } else {
        setMyVipRooms([]);
      }
      setLoadingRooms(false);
    });
    return () => unsubscribe();
  }, [hostName]);

  // Add registered player
  const handleAddPlayer = () => {
    const trimmed = newPlayerName.trim();
    if (!trimmed) return;
    if (registeredPlayers.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      alert("Este jugador ya está registrado.");
      return;
    }
    if (registeredPlayers.length >= maxPlayers) {
      alert(`Has alcanzado la capacidad máxima de ${maxPlayers} jugadores.`);
      return;
    }

    setRegisteredPlayers((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        name: trimmed,
        status: "registrado",
        addedAt: Date.now(),
      },
    ]);
    setNewPlayerName("");
  };

  const handleRemovePlayer = (id: string) => {
    setRegisteredPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  // Rounds management
  const handleAddRound = () => {
    const nextNum = rounds.length + 1;
    setRounds((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        roundNum: nextNum,
        title: `Ronda ${nextNum}`,
        mode: "normal",
        prize: "$500 MXN",
      },
    ]);
  };

  const handleRemoveRound = (id: string) => {
    if (rounds.length <= 1) {
      alert("Debe haber al menos 1 ronda en la sala.");
      return;
    }
    setRounds((prev) =>
      prev
        .filter((r) => r.id !== id)
        .map((r, idx) => ({ ...r, roundNum: idx + 1, title: r.title.startsWith("Ronda") ? `Ronda ${idx + 1}` : r.title }))
    );
  };

  const handleUpdateRound = (id: string, field: keyof VipRound, value: any) => {
    setRounds((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  // Submit VIP Room Creation
  const handleCreateVipRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) {
      alert("Por favor ingresa un nombre para la Sala VIP.");
      return;
    }
    if (rounds.length === 0) {
      alert("Debes configurar al menos una ronda.");
      return;
    }

    setSubmitting(true);
    try {
      const newMesaRef = push(ref(database, "mesas"));
      const mesaId = newMesaRef.key;
      if (!mesaId) throw new Error("No se pudo generar ID");

      const vipMesaData = {
        id: mesaId,
        name: roomName.trim(),
        isVip: true,
        host: hostName,
        hostVip: true,
        status: isScheduled ? "programada" : "abierta",
        isScheduled,
        scheduledDate: isScheduled ? scheduledDate : null,
        scheduledTime: isScheduled ? scheduledTime : null,
        maxPlayers,
        whitelistOnly,
        registeredPlayers,
        rounds,
        currentRound: 1,
        mode: rounds[0]?.mode || "normal",
        size,
        perPlayer,
        cost: 0,
        locked: hasPassword,
        password: hasPassword ? password : "",
        tablaIds: [],
        players: {
          [hostName]: {
            name: hostName,
            role: "host",
            ready: true,
            tablesCount: perPlayer,
            isVip: true,
          },
        },
        prizePool: 0,
        createdAt: Date.now(),
      };

      await set(newMesaRef, vipMesaData);

      try {
        localStorage.setItem(`garza:host:${mesaId}`, "true");
        sessionStorage.setItem(`garza:host:${mesaId}`, "true");
      } catch {}

      setSuccessModal({ id: mesaId, name: roomName.trim() });
    } catch (err) {
      console.error(err);
      alert("Error al crear la sala VIP. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete VIP room
  const handleDeleteRoom = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta sala VIP?")) return;
    try {
      await remove(ref(database, `mesas/${id}`));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <BrandBackground>
      <div className="flex min-h-[100dvh] flex-col font-sans relative z-10 text-white pb-28">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between bg-[#0a0718]/90 px-4 pt-12 pb-4 backdrop-blur-md border-b border-amber-400/20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate({ to: "/menu" })}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white/80 ring-1 ring-white/20 transition hover:bg-white/20 hover:text-white active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 fill-current" /> Panel de Control
              </span>
              <h1 className="text-lg font-black text-white tracking-tight">Sala VIP La Garza</h1>
            </div>
          </div>

          {/* VIP Badge */}
          {isVip ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400/20 to-yellow-500/20 border border-amber-400/40 text-amber-300 text-xs font-black">
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span>VIP ACTIVO</span>
            </div>
          ) : (
            <button
              onClick={() => setShowVipModal(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black shadow-[0_0_15px_rgba(251,191,36,0.5)] active:scale-95 transition"
            >
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span>ACTIVAR VIP</span>
            </button>
          )}
        </header>

        {/* Lock Screen if not VIP */}
        {!isVip ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto my-auto">
            <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-amber-700 shadow-[0_0_40px_rgba(245,158,11,0.5)] ring-4 ring-yellow-200/40">
              <Lock className="h-12 w-12 text-slate-950" />
            </div>

            <span className="inline-block px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
              Función Exclusiva para Miembros
            </span>

            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-yellow-400">
              Panel Administrativo de Salas VIP
            </h2>

            <p className="mt-3 text-sm text-white/70 leading-relaxed">
              La creación y gestión de salas VIP, programación por fecha y hora, registro de invitados y rondas con premios está reservada para suscriptores VIP.
            </p>

            <button
              onClick={() => setShowVipModal(true)}
              className="mt-8 w-full max-w-xs py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-base shadow-[0_0_30px_rgba(245,158,11,0.6)] active:scale-95 transition flex items-center justify-center gap-2"
            >
              <Crown className="w-5 h-5 fill-current" />
              Desbloquear con VIP ($99 MXN)
            </button>
          </div>
        ) : (
          /* VIP Admin Dashboard */
          <main className="flex-1 px-4 pt-4 max-w-2xl mx-auto w-full">
            {/* Tabs Selector */}
            <div className="flex rounded-2xl bg-white/[0.06] p-1.5 border border-white/10 mb-6">
              <button
                onClick={() => setActiveTab("crear")}
                className={`flex-1 py-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 ${
                  activeTab === "crear"
                    ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-lg"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <Sliders className="w-4 h-4" />
                Nueva Sala VIP
              </button>
              <button
                onClick={() => setActiveTab("mis-salas")}
                className={`flex-1 py-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 ${
                  activeTab === "mis-salas"
                    ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-lg"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <Trophy className="w-4 h-4" />
                Mis Salas Programadas ({myVipRooms.length})
              </button>
            </div>

            {/* TAB 1: CREAR SALA VIP */}
            {activeTab === "crear" && (
              <form onSubmit={handleCreateVipRoom} className="space-y-6">
                {/* VIP Ad-Free Guarantee Banner */}
                <div className="rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-transparent border border-emerald-400/40 p-3.5 flex items-center gap-3 shadow-md">
                  <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 block">
                      Garantía Sala VIP • 0 Anuncios
                    </span>
                    <span className="text-xs font-bold text-white">
                      Partidas 100% libres de publicidad para ti y para todos los invitados de tu sala.
                    </span>
                  </div>
                </div>

                {/* Section 1: Info General */}
                <section className="rounded-3xl bg-white/[0.04] p-5 border border-amber-400/20 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />

                  <h3 className="text-sm font-black uppercase tracking-wider text-amber-300 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> 1. Nombre y Configuración General
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-white/70 mb-1.5">
                        Nombre de la Sala / Torneo VIP
                      </label>
                      <input
                        type="text"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        placeholder="Ej. Torneo Estelar La Garza 2026"
                        required
                        className="w-full rounded-2xl bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 border border-white/15 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-white/70 mb-1.5">Tamaño de Tabla</label>
                        <div className="flex gap-2">
                          {(["4x4", "5x5"] as Size[]).map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setSize(s)}
                              className={`flex-1 py-2.5 rounded-xl font-black text-xs border transition ${
                                size === s
                                  ? "bg-amber-400 text-slate-950 border-amber-300"
                                  : "bg-white/5 border-white/10 text-white/70"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-white/70 mb-1.5">Tablas por Jugador</label>
                        <div className="flex gap-1.5">
                          {[1, 2, 4, 8].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setPerPlayer(n)}
                              className={`flex-1 py-2.5 rounded-xl font-black text-xs border transition ${
                                perPlayer === n
                                  ? "bg-amber-400 text-slate-950 border-amber-300"
                                  : "bg-white/5 border-white/10 text-white/70"
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 2: Programación (Día y Hora) */}
                <section className="rounded-3xl bg-white/[0.04] p-5 border border-amber-400/20 shadow-xl relative">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> 2. Programación (Día y Hora)
                    </h3>
                    <label className="flex items-center gap-2 text-xs font-bold text-white/80 cursor-pointer">
                      <span>Programada</span>
                      <input
                        type="checkbox"
                        checked={isScheduled}
                        onChange={(e) => setIsScheduled(e.target.checked)}
                        className="rounded accent-amber-400 h-4 w-4"
                      />
                    </label>
                  </div>

                  {isScheduled ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-white/70 mb-1.5 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-amber-400" /> Fecha del Evento
                          </label>
                          <input
                            type="date"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                            required={isScheduled}
                            className="w-full rounded-2xl bg-white/10 px-4 py-2.5 text-sm text-white border border-white/15 focus:outline-none focus:border-amber-400 [color-scheme:dark]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-white/70 mb-1.5 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-400" /> Hora de Inicio
                          </label>
                          <input
                            type="time"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            required={isScheduled}
                            className="w-full rounded-2xl bg-white/10 px-4 py-2.5 text-sm text-white border border-white/15 focus:outline-none focus:border-amber-400 [color-scheme:dark]"
                          />
                        </div>
                      </div>

                      <div className="rounded-2xl bg-amber-400/10 border border-amber-400/20 p-3 text-xs text-amber-200 flex items-center gap-2">
                        <Info className="w-4 h-4 shrink-0 text-amber-400" />
                        <span>
                          La sala estará en espera hasta el <strong>{scheduledDate}</strong> a las <strong>{scheduledTime} hrs</strong>. Los jugadores podrán pre-registrarse y ver la cuenta regresiva.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-white/60">
                      La sala se abrirá inmediatamente al crearla.
                    </p>
                  )}
                </section>

                {/* Section 3: Registro de Jugadores & Capacidad */}
                <section className="rounded-3xl bg-white/[0.04] p-5 border border-amber-400/20 shadow-xl relative">
                  <h3 className="text-sm font-black uppercase tracking-wider text-amber-300 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" /> 3. Jugadores & Registro de Invitados
                  </h3>

                  <div className="space-y-4">
                    {/* Capacidad máxima */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-white/70">
                          Número máximo de jugadores en la sala
                        </label>
                        <span className="text-sm font-black text-amber-300">{maxPlayers} Jugadores</span>
                      </div>
                      <div className="flex gap-2">
                        {[4, 8, 12, 16, 24, 32].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setMaxPlayers(num)}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                              maxPlayers === num
                                ? "bg-amber-400 text-slate-950 border-amber-300 font-black"
                                : "bg-white/5 border-white/10 text-white/70"
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Whitelist toggle */}
                    <div className="flex items-center justify-between rounded-2xl bg-white/[0.03] p-3 border border-white/10">
                      <div>
                        <div className="text-xs font-black text-white">Restringir solo a pre-registrados</div>
                        <div className="text-[11px] text-white/60">Solo las personas anotadas en la lista podrán ingresar.</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={whitelistOnly}
                        onChange={(e) => setWhitelistOnly(e.target.checked)}
                        className="rounded accent-amber-400 h-5 w-5"
                      />
                    </div>

                    {/* Add Player Input */}
                    <div>
                      <label className="block text-xs font-bold text-white/70 mb-1.5">
                        Registrar Jugador (Nombre o Apodo)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newPlayerName}
                          onChange={(e) => setNewPlayerName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddPlayer();
                            }
                          }}
                          placeholder="Nombre del jugador invitado..."
                          className="flex-1 rounded-2xl bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/40 border border-white/15 focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={handleAddPlayer}
                          className="px-4 py-2.5 rounded-2xl bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 active:scale-95 transition"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Añadir</span>
                        </button>
                      </div>
                    </div>

                    {/* Registered Players List */}
                    {registeredPlayers.length > 0 && (
                      <div className="space-y-2 mt-3">
                        <div className="flex justify-between items-center text-[11px] font-bold text-white/60">
                          <span>Invitados Registrados ({registeredPlayers.length} de {maxPlayers})</span>
                          <button
                            type="button"
                            onClick={() => setRegisteredPlayers([])}
                            className="text-red-400 hover:underline"
                          >
                            Limpiar lista
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                          {registeredPlayers.map((player) => (
                            <div
                              key={player.id}
                              className="flex items-center justify-between rounded-xl bg-white/[0.06] px-3 py-2 border border-white/10 text-xs"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 font-black flex items-center justify-center text-[10px] shrink-0">
                                  {player.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-bold text-white truncate">{player.name}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemovePlayer(player.id)}
                                className="text-white/40 hover:text-red-400 transition ml-2"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Section 4: Rondas y Premios */}
                <section className="rounded-3xl bg-white/[0.04] p-5 border border-amber-400/20 shadow-xl relative">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
                      <Trophy className="w-4 h-4" /> 4. Rondas y Premios
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddRound}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold hover:bg-amber-400/20 transition active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" /> Añadir Ronda
                    </button>
                  </div>

                  <p className="text-xs text-white/60 mb-4">
                    Configura cada ronda con su modo de juego y el premio que ganará quien cante lotería.
                  </p>

                  <div className="space-y-3">
                    {rounds.map((round, idx) => (
                      <div
                        key={round.id}
                        className="rounded-2xl bg-white/[0.03] p-4 border border-white/10 space-y-3 relative group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-black">
                              {round.roundNum}
                            </span>
                            Ronda {round.roundNum}
                          </span>
                          {rounds.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveRound(round.id)}
                              className="text-white/40 hover:text-red-400 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Round Title */}
                          <div>
                            <label className="block text-[11px] font-bold text-white/60 mb-1">Título de la Ronda</label>
                            <input
                              type="text"
                              value={round.title}
                              onChange={(e) => handleUpdateRound(round.id, "title", e.target.value)}
                              placeholder={`Ej. Ronda ${round.roundNum}`}
                              className="w-full rounded-xl bg-white/10 px-3 py-2 text-xs text-white border border-white/10 focus:outline-none focus:border-amber-400"
                            />
                          </div>

                          {/* Round Mode */}
                          <div>
                            <label className="block text-[11px] font-bold text-white/60 mb-1">Modo de Juego</label>
                            <select
                              value={round.mode}
                              onChange={(e) => handleUpdateRound(round.id, "mode", e.target.value as Mode)}
                              className="w-full rounded-xl bg-[#140f2b] px-3 py-2 text-xs text-white border border-white/10 focus:outline-none focus:border-amber-400"
                            >
                              {MODES.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.label} ({m.hint})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Round Prize */}
                        <div>
                          <label className="block text-[11px] font-bold text-white/60 mb-1">
                            Premio de esta Ronda
                          </label>
                          <input
                            type="text"
                            value={round.prize}
                            onChange={(e) => handleUpdateRound(round.id, "prize", e.target.value)}
                            placeholder="Ej. $1,000 MXN o 2,000 Monedas"
                            className="w-full rounded-xl bg-white/10 px-3 py-2 text-xs text-white border border-white/10 focus:outline-none focus:border-amber-400 mb-2"
                          />
                          {/* Quick prize suggestions */}
                          <div className="flex flex-wrap gap-1.5">
                            {QUICK_PRIZES.map((qp) => (
                              <button
                                key={qp}
                                type="button"
                                onClick={() => handleUpdateRound(round.id, "prize", qp)}
                                className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/70 hover:text-amber-300 hover:border-amber-400/30 transition"
                              >
                                {qp}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Section 5: Seguridad y Clave */}
                <section className="rounded-3xl bg-white/[0.04] p-5 border border-amber-400/20 shadow-xl relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-white">Contraseña de Acceso</h4>
                      <p className="text-xs text-white/60">Protege tu sala para que solo entren con clave.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={hasPassword}
                      onChange={(e) => setHasPassword(e.target.checked)}
                      className="rounded accent-amber-400 h-5 w-5"
                    />
                  </div>

                  {hasPassword && (
                    <div className="mt-3">
                      <input
                        type="text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Ingresa la contraseña..."
                        className="w-full rounded-2xl bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/40 border border-white/15 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  )}
                </section>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-base shadow-[0_0_35px_rgba(245,158,11,0.6)] hover:shadow-[0_0_50px_rgba(245,158,11,0.8)] active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Crown className="w-5 h-5 fill-current" />
                  {submitting ? "Creando Sala VIP..." : "Crear y Publicar Sala VIP"}
                </button>
              </form>
            )}

            {/* TAB 2: MIS SALAS PROGRAMADAS */}
            {activeTab === "mis-salas" && (
              <div className="space-y-4">
                {loadingRooms ? (
                  <div className="text-center py-12 text-white/60 text-sm">Cargando salas VIP...</div>
                ) : myVipRooms.length === 0 ? (
                  <div className="text-center py-16 px-4 rounded-3xl bg-white/[0.03] border border-white/10">
                    <Crown className="w-12 h-12 text-amber-400/40 mx-auto mb-3" />
                    <h3 className="text-lg font-black text-white">No tienes salas VIP creadas</h3>
                    <p className="text-xs text-white/60 mt-1 max-w-xs mx-auto">
                      Utiliza la pestaña "Nueva Sala VIP" para programar tu primer torneo con rondas y premios.
                    </p>
                    <button
                      onClick={() => setActiveTab("crear")}
                      className="mt-5 px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs active:scale-95 transition"
                    >
                      Crear mi primera sala
                    </button>
                  </div>
                ) : (
                  myVipRooms.map((room) => (
                    <div
                      key={room.id}
                      className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-5 border border-amber-400/30 shadow-xl relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase">
                              👑 SALA VIP
                            </span>
                            <span className="text-[11px] font-bold text-white/60">
                              Código: <strong className="text-white">{room.id.slice(0, 6).toUpperCase()}</strong>
                            </span>
                          </div>
                          <h3 className="text-lg font-black text-white mt-1">{room.name}</h3>
                        </div>

                        <button
                          onClick={() => handleDeleteRoom(room.id)}
                          className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                          title="Eliminar sala"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Scheduled Info */}
                      {room.isScheduled && room.scheduledDate && (
                        <div className="rounded-2xl bg-amber-400/10 border border-amber-400/20 p-3 mb-3 flex items-center gap-3 text-xs text-amber-200">
                          <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>
                            Programada para el <strong>{room.scheduledDate}</strong> a las <strong>{room.scheduledTime} hrs</strong>
                          </span>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                        <div className="rounded-xl bg-white/5 p-2 border border-white/5">
                          <div className="text-[10px] font-bold uppercase text-white/50">Capacidad</div>
                          <div className="text-sm font-black text-white">{room.maxPlayers || 16} máx</div>
                        </div>
                        <div className="rounded-xl bg-white/5 p-2 border border-white/5">
                          <div className="text-[10px] font-bold uppercase text-white/50">Invitados</div>
                          <div className="text-sm font-black text-amber-300">
                            {room.registeredPlayers?.length || 0}
                          </div>
                        </div>
                        <div className="rounded-xl bg-white/5 p-2 border border-white/5">
                          <div className="text-[10px] font-bold uppercase text-white/50">Rondas</div>
                          <div className="text-sm font-black text-white">{room.rounds?.length || 1}</div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const code = room.id.slice(0, 6).toUpperCase();
                            const shareUrl = `${window.location.origin}/mesa/${room.id}`;
                            if (navigator.share) {
                              navigator.share({
                                title: `Sala VIP: ${room.name}`,
                                text: `¡Estás invitado a la Sala VIP "${room.name}" de Lotería La Garza! Código: ${code}`,
                                url: shareUrl,
                              });
                            } else {
                              navigator.clipboard.writeText(shareUrl);
                              alert("Enlace copiado al portapapeles.");
                            }
                          }}
                          className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          Compartir Invitación
                        </button>
                        <button
                          onClick={() => navigate({ to: "/mesa/$id", params: { id: room.id } })}
                          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition active:scale-95"
                        >
                          Abrir Lobby VIP
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </main>
        )}

        {/* Modal on successful creation */}
        {successModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#181232] to-[#0a0718] p-6 text-center border-2 border-amber-400 text-white shadow-[0_0_50px_rgba(245,158,11,0.4)]">
              <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(245,158,11,0.7)]">
                <Crown className="w-9 h-9 fill-current" />
              </div>

              <h3 className="text-xl font-black text-amber-300">¡Sala VIP Creada!</h3>
              <p className="text-xs text-white/70 mt-1">
                La sala <strong>"{successModal.name}"</strong> está lista y registrada en el sistema.
              </p>

              <div className="my-4 rounded-2xl bg-white/5 border border-amber-400/30 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                  Código de Invitación VIP
                </span>
                <span className="text-2xl font-black tracking-widest text-white">
                  {successModal.id.slice(0, 6).toUpperCase()}
                </span>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => navigate({ to: "/mesa/$id", params: { id: successModal.id } })}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-sm active:scale-95 transition shadow-lg"
                >
                  Ir al Lobby de la Sala VIP
                </button>
                <button
                  onClick={() => {
                    setSuccessModal(null);
                    setActiveTab("mis-salas");
                  }}
                  className="w-full py-2.5 text-xs text-white/70 hover:text-white transition"
                >
                  Ver mis Salas Programadas
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vip Subscription Modal */}
        <VipSubscriptionModal
          open={showVipModal}
          onClose={() => setShowVipModal(false)}
          onSuccess={() => {
            setIsVip(true);
            setShowVipModal(false);
          }}
        />
      </div>
    </BrandBackground>
  );
}
