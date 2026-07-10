import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, ChevronDown, LayoutGrid } from "lucide-react";

export const Route = createFileRoute("/configuracion")({
  head: () => ({
    meta: [
      { title: "Configuración — Lotería La Garza" },
      { name: "description", content: "Ajusta tu experiencia en Lotería La Garza." },
    ],
  }),
  component: ConfiguracionPage,
});

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

function ConfiguracionPage() {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Orange header */}
      <header
        className="relative flex h-16 items-center px-4"
        style={{ background: "#F1592A" }}
      >
        <button
          type="button"
          aria-label="Volver"
          onClick={() => navigate({ to: "/menu" })}
          className="grid h-10 w-10 place-items-center rounded-full text-white transition active:scale-95"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="pointer-events-none absolute inset-x-0 text-center text-xl font-semibold text-white">
          Configuración
        </h1>
      </header>

      <main className="mx-auto w-full max-w-md divide-y divide-neutral-200 px-5">
        {/* Nombre */}
        <section className="py-5">
          <div className="flex items-center gap-3">
            <label className="relative flex-1">
              <span className="absolute -top-2 left-4 bg-white px-1 text-[11px] text-neutral-500">
                Nombre
              </span>
              <input
                type="text"
                value={settings.name}
                maxLength={30}
                onChange={(e) => update("name", e.target.value)}
                className="h-12 w-full rounded-full border border-neutral-300 bg-white px-4 text-base text-neutral-900 outline-none focus:border-neutral-400"
              />
            </label>
            <button
              type="button"
              onClick={saveName}
              aria-label="Guardar nombre"
              className="grid h-12 w-12 place-items-center rounded-lg text-[#1E88E5] transition active:scale-95"
            >
              <Save className="h-7 w-7" />
            </button>
          </div>
          <div className="mt-1 pr-16 text-right text-xs text-neutral-500">
            {settings.name.length}/30
          </div>
        </section>

        {/* Audio */}
        <RowToggle
          title="Audio"
          subtitle="Grita el nombre de las cartas"
          value={settings.audio}
          onChange={(v) => update("audio", v)}
        />

        {/* Voz del gritón */}
        <RowSelect
          title="Voz del gritón"
          subtitle={voiceLabel}
          right={<span className="text-3xl">{voiceEmoji}</span>}
          onClick={() => {
            const order: Settings["voice"][] = ["mujer", "hombre", "nino"];
            const idx = order.indexOf(settings.voice);
            update("voice", order[(idx + 1) % order.length]);
          }}
        />

        {/* Estilo de Baraja */}
        <RowSelect
          title="Estilo de Baraja"
          subtitle="Selecciona el estilo de baraja que usarás."
          right={
            <div
              className="grid h-14 w-11 place-items-center rounded-md text-2xl shadow-sm ring-1 ring-neutral-200"
              style={{
                background:
                  "linear-gradient(180deg, #FFE68A 0%, #F6C13B 45%, #E9E9E9 46%, #E9E9E9 100%)",
              }}
            >
              🐓
            </div>
          }
          onClick={() =>
            update("deckStyle", settings.deckStyle === "clasica" ? "moderna" : "clasica")
          }
        />

        <RowToggle
          title="Efectos de sonido"
          value={settings.sfx}
          onChange={(v) => update("sfx", v)}
        />

        <RowToggle
          title="Confetti"
          subtitle="Activa o desactiva el efecto de confetti al ganar una partida."
          value={settings.confetti}
          onChange={(v) => update("confetti", v)}
        />

        <RowToggle
          title="Vibración"
          value={settings.vibration}
          onChange={(v) => update("vibration", v)}
        />

        <RowToggle
          title="Modo clásico"
          subtitle="Permite unicamente mesas, tablas y modos 4x4"
          value={settings.classicMode}
          onChange={(v) => update("classicMode", v)}
        />

        {/* Vista de Tablas */}
        <section className="flex items-center justify-between py-5">
          <span className="text-base font-medium">Vista de Tablas</span>
          <button
            type="button"
            onClick={() =>
              update("tableView", settings.tableView === "rejilla" ? "lista" : "rejilla")
            }
            className="inline-flex items-center gap-2 text-base text-neutral-800"
          >
            <LayoutGrid className="h-5 w-5" />
            <span className="capitalize">{settings.tableView}</span>
            <ChevronDown className="h-4 w-4 text-neutral-500" />
          </button>
        </section>

        {/* Marcador */}
        <section className="py-5">
          <div className="mb-3 text-base font-medium">Marcador:</div>
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
                  className={`flex h-16 w-20 flex-col items-center justify-center gap-1 rounded-xl border text-xs transition ${
                    active
                      ? "border-[#F1592A] bg-[#FFF3EE] text-[#F1592A]"
                      : "border-neutral-200 bg-white text-neutral-700"
                  }`}
                >
                  <span className="text-2xl">{opt.visual}</span>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </section>

        <div className="h-8" />
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
    <section className="flex items-center gap-4 py-5">
      <div className="min-w-0 flex-1">
        <div className="text-base font-medium text-neutral-900">{title}</div>
        {subtitle && (
          <div className="mt-0.5 text-sm text-neutral-500">{subtitle}</div>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative h-8 w-14 shrink-0 rounded-full transition ${
          value ? "bg-[#34C759]" : "bg-neutral-300"
        }`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${
            value ? "left-7" : "left-1"
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
      className="flex w-full items-center gap-4 py-5 text-left transition active:opacity-80"
    >
      <div className="min-w-0 flex-1">
        <div className="text-base font-medium text-neutral-900">{title}</div>
        {subtitle && (
          <div className="mt-0.5 text-sm text-neutral-500">{subtitle}</div>
        )}
      </div>
      <div className="shrink-0">{right}</div>
    </button>
  );
}