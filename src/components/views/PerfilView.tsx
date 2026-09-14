import { useEffect, useState } from "react";
import { Save, ChevronDown, LayoutGrid, Settings as SettingsIcon } from "lucide-react";

const SETTINGS_KEY = "garza:settings";

interface Settings {
  name: string;
  audio: boolean;
  voice: "mujer" | "hombre" | "nino";
  deckStyle: "clasica" | "moderna";
  sfx: boolean;
  confetti: boolean;
  vibration: boolean;
  classicMode: boolean;
  tableView: "rejilla" | "lista";
  marker: "ficha" | "frijol" | "corazon";
}

const DEFAULTS: Settings = {
  name: "",
  audio: true,
  voice: "mujer",
  deckStyle: "clasica",
  sfx: true,
  confetti: false,
  vibration: true,
  classicMode: false,
  tableView: "rejilla",
  marker: "ficha",
};

export function PerfilView({ onNavigateTienda }: { onNavigateTienda?: () => void }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      const storedName = localStorage.getItem("garza:name") ?? "";
      const parsed = raw ? (JSON.parse(raw) as Partial<Settings>) : {};
      setSettings({ ...DEFAULTS, name: storedName, ...parsed });
    } catch {
      /* ignore */
    }
  }, []);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  function saveName() {
    try {
      localStorage.setItem("garza:name", settings.name.trim());
    } catch {
      /* ignore */
    }
  }

  const voiceEmoji =
    settings.voice === "mujer" ? "👩‍🎤" : settings.voice === "hombre" ? "🧔‍♂️" : "🧒";
  const voiceLabel =
    settings.voice === "mujer" ? "Mujer" : settings.voice === "hombre" ? "Hombre" : "Niño";

  return (
    <div className="flex flex-col h-full font-sans relative overflow-x-hidden overflow-y-auto text-white pt-5 pb-28">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-center px-4 shrink-0 pb-6">
        <div className="flex flex-col items-center leading-tight">
          <span className="text-[11px] uppercase tracking-[0.22em] text-white/60">Cuenta</span>
          <h1 className="text-xl font-extrabold flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-[color:var(--brand-cyan)]" /> Mi Perfil
          </h1>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-md px-5 space-y-2 relative z-10">
        
        <div className="bg-white/5 rounded-3xl p-5 border border-white/10 shadow-xl backdrop-blur-md">
          {/* Nombre */}
          <section className="mb-6">
            <div className="flex items-center gap-3">
              <label className="relative flex-1">
                <span className="absolute -top-2 left-4 bg-[color:var(--brand-navy-deep)] px-1 text-[11px] text-[color:var(--brand-cyan)] font-semibold">
                  Nombre
                </span>
                <input
                  type="text"
                  value={settings.name}
                  maxLength={30}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Tu nombre..."
                  className="h-12 w-full rounded-2xl border border-white/20 bg-black/20 px-4 text-base text-white outline-none focus:border-[color:var(--brand-cyan)] transition-colors"
                />
              </label>
              <button
                type="button"
                onClick={saveName}
                aria-label="Guardar nombre"
                className="grid h-12 w-12 place-items-center rounded-xl bg-[color:var(--brand-cyan)]/20 text-[color:var(--brand-cyan)] border border-[color:var(--brand-cyan)]/30 transition hover:bg-[color:var(--brand-cyan)]/30 active:scale-95 shadow-md"
              >
                <Save className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-1 pr-16 text-right text-xs text-white/40">
              {settings.name.length}/30
            </div>
          </section>

          <div className="h-px bg-white/10 w-full mb-4" />

          {/* Marcador */}
          <section className="py-2">
            <div className="mb-3 text-sm font-bold text-white/90">Ficha (Marcador):</div>
            <div className="flex items-center gap-3">
              {(
                [
                  { id: "ficha", label: "Ficha", visual: "🔴" },
                  { id: "frijol", label: "Frijol", visual: "🫘" },
                  { id: "corazon", label: "Corazón", visual: "❤️" },
                ] as const
              ).map((opt) => {
                const active = settings.marker === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => update("marker", opt.id)}
                    className={`flex h-16 w-full flex-col items-center justify-center gap-1 rounded-xl border text-xs font-bold transition shadow-md ${
                      active
                        ? "border-[color:var(--brand-cyan)] bg-[color:var(--brand-cyan)]/20 text-white"
                        : "border-white/10 bg-black/20 text-white/60 hover:bg-black/40"
                    }`}
                  >
                    <span className="text-2xl drop-shadow-md">{opt.visual}</span>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="bg-white/5 rounded-3xl p-5 border border-white/10 shadow-xl backdrop-blur-md mt-4">
          {/* Audio */}
          <RowToggle
            title="Audio"
            subtitle="Grita el nombre de las cartas"
            value={settings.audio}
            onChange={(v) => update("audio", v)}
          />

          <div className="h-px bg-white/10 w-full my-2" />

          {/* Voz del gritón */}
          <RowSelect
            title="Voz del gritón"
            subtitle={voiceLabel}
            right={<span className="text-3xl drop-shadow-md">{voiceEmoji}</span>}
            onClick={() => {
              const order: Settings["voice"][] = ["mujer", "hombre", "nino"];
              const idx = order.indexOf(settings.voice);
              const nextVoice = order[(idx + 1) % order.length];
              
              const isUnlocked = localStorage.getItem(`garza:unlocked:voice:${nextVoice}`) === "true" || nextVoice === "mujer";
              if (!isUnlocked) {
                 if (onNavigateTienda) onNavigateTienda();
              } else {
                 update("voice", nextVoice);
              }
            }}
          />

          <div className="h-px bg-white/10 w-full my-2" />

          <RowToggle
            title="Efectos de sonido"
            value={settings.sfx}
            onChange={(v) => update("sfx", v)}
          />
          
          <div className="h-px bg-white/10 w-full my-2" />

          <RowToggle
            title="Vibración"
            value={settings.vibration}
            onChange={(v) => update("vibration", v)}
          />
        </div>

        <div className="bg-white/5 rounded-3xl p-5 border border-white/10 shadow-xl backdrop-blur-md mt-4 mb-8">
          {/* Estilo de Baraja */}
          <RowSelect
            title="Estilo de Baraja"
            subtitle="Cartas clásicas o modernas"
            right={
              <div
                className="grid h-12 w-9 place-items-center rounded-md text-xl shadow-md border border-white/20"
                style={{
                  background:
                    "linear-gradient(180deg, #FFE68A 0%, #F6C13B 45%, #E9E9E9 46%, #E9E9E9 100%)",
                }}
              >
                🐓
              </div>
            }
            onClick={() => {
              const nextStyle = settings.deckStyle === "clasica" ? "moderna" : "clasica";
              const isUnlocked = localStorage.getItem(`garza:unlocked:deck:${nextStyle}`) === "true" || nextStyle === "clasica";
              if (!isUnlocked) {
                 if (onNavigateTienda) onNavigateTienda();
              } else {
                 update("deckStyle", nextStyle);
              }
            }}
          />
          
          <div className="h-px bg-white/10 w-full my-2" />

          <RowToggle
            title="Confetti"
            subtitle="Efecto visual al ganar"
            value={settings.confetti}
            onChange={(v) => update("confetti", v)}
          />

          <div className="h-px bg-white/10 w-full my-2" />

          <RowToggle
            title="Modo clásico"
            subtitle="Solo permite mesas de 4x4"
            value={settings.classicMode}
            onChange={(v) => update("classicMode", v)}
          />

          <div className="h-px bg-white/10 w-full my-2" />

          {/* Vista de Tablas */}
          <section className="flex items-center justify-between py-3">
            <span className="text-sm font-bold text-white/90">Vista de Tablas</span>
            <button
              type="button"
              onClick={() =>
                update("tableView", settings.tableView === "rejilla" ? "lista" : "rejilla")
              }
              className="inline-flex items-center gap-2 text-sm text-[color:var(--brand-cyan)] bg-[color:var(--brand-cyan)]/10 px-3 py-1.5 rounded-lg font-semibold"
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="capitalize">{settings.tableView}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </section>
        </div>

        {/* Cerrar sesión */}
        <button
          onClick={() => {
            localStorage.removeItem("garza:name");
            localStorage.removeItem("garza:vip");
            localStorage.removeItem("garza:coins");
            window.location.href = "/";
          }}
          className="w-full bg-red-500/20 text-red-400 border border-red-500/30 rounded-2xl py-4 font-bold active:scale-[0.98] transition-all hover:bg-red-500/30 mb-8"
        >
          Cerrar sesión
        </button>

      </main>
    </div>
  );
}

function RowToggle({
  title,
  subtitle,
  value,
  onChange,
}: {
  title: string;
  subtitle?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <section className="flex items-center gap-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-white/90">{title}</div>
        {subtitle && (
          <div className="mt-0.5 text-xs text-white/50 leading-tight">{subtitle}</div>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors border border-white/10 shadow-inner ${
          value ? "bg-[color:var(--brand-cyan)]" : "bg-black/40"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all ${
            value ? "left-6" : "left-1 opacity-60"
          }`}
        />
      </button>
    </section>
  );
}

function RowSelect({
  title,
  subtitle,
  right,
  onClick,
}: {
  title: string;
  subtitle?: string;
  right: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 py-3 text-left transition active:scale-[0.98] group"
    >
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-white/90 group-hover:text-white transition-colors">{title}</div>
        {subtitle && (
          <div className="mt-0.5 text-xs text-white/50 leading-tight">{subtitle}</div>
        )}
      </div>
      <div className="shrink-0">{right}</div>
    </button>
  );
}
