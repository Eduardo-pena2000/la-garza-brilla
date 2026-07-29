import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { User } from "lucide-react";
import { BrandBackground } from "@/components/BrandBackground";
import { BrandLogo } from "@/components/BrandLogo";
import { BrandTitle } from "@/components/BrandTitle";
import { NameModal } from "@/components/NameModal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lotería La Garza — Iniciar sesión" },
      { name: "description", content: "Juega Lotería La Garza online con amigos. Inicia sesión y disfruta." },
      { property: "og:title", content: "Lotería La Garza" },
      { property: "og:description", content: "Juega Lotería La Garza online con amigos." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [askName, setAskName] = useState(false);

  return (
    <BrandBackground>
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-6 pb-10 pt-16">
        <BrandLogo size={220} />

        <div className="mt-8 flex w-full flex-col gap-3">
          <button
            type="button"
            className="group relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-white text-[15px] font-semibold text-[color:var(--brand-navy-dark)] shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-10px_rgba(0,0,0,0.5)] active:scale-[0.98] animate-slide-up-soft"
            style={{ animationDelay: "0.45s" }}
            onClick={() => setAskName(true)}
          >
            <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ animation: "shimmer-x 2.4s ease-in-out infinite" }} />
            <GoogleIcon className="h-5 w-5" />
            Iniciar sesión con Google
          </button>
          <button
            type="button"
            className="relative flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-black text-[15px] font-semibold text-white shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-10px_rgba(0,0,0,0.6)] active:scale-[0.98] animate-slide-up-soft"
            style={{ animationDelay: "0.55s" }}
            onClick={() => setAskName(true)}
          >
            <AppleIcon className="h-5 w-5" />
            Iniciar sesión con Apple
          </button>
          <button
            type="button"
            className="relative flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/10 text-[15px] font-semibold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/15 active:scale-[0.98] animate-slide-up-soft"
            style={{ animationDelay: "0.65s" }}
            onClick={() => setAskName(true)}
          >
            <User className="h-5 w-5" />
            Entrar como invitado
          </button>
        </div>

        <p className="mt-auto pt-10 text-center text-xs text-white/60 animate-slide-up-soft" style={{ animationDelay: "0.85s" }}>
          Al usar la aplicación aceptas nuestros{" "}
          <span className="underline">Términos de uso</span> y{" "}
          <span className="underline">Política de privacidad</span>
        </p>
        <p className="mt-2 text-[11px] text-white/40">Versión 1.0.0</p>
      </main>

      <NameModal
        open={askName}
        onClose={() => setAskName(false)}
        onSave={(name) => {
          try {
            localStorage.setItem("garza:name", name);
          } catch {
            /* ignore */
          }
          setAskName(false);
          navigate({ to: "/menu" });
        }}
      />
    </BrandBackground>
  );
}

function GoogleIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.2 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 43.5c5.1 0 9.8-2 13.3-5.2l-6.1-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.1-11.3-7.5l-6.5 5C9.5 39 16.2 43.5 24 43.5z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4.1 5.2l6.1 5.2c-.4.4 6.7-4.9 6.7-14.4 0-1.2-.1-2.4-.4-3.5z"/>
    </svg>
  );
}

function AppleIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M16.365 1.43c0 1.14-.46 2.23-1.21 3.03-.82.88-2.16 1.56-3.27 1.47-.13-1.1.42-2.27 1.16-3.03.83-.86 2.24-1.5 3.32-1.47zM20.5 17.07c-.56 1.28-.82 1.86-1.54 3-1 1.6-2.41 3.6-4.16 3.6-1.55 0-1.95-1-4.05-1-2.1.01-2.54 1.02-4.1 1.01-1.75-.02-3.08-1.83-4.08-3.43-2.79-4.49-3.08-9.76-1.36-12.56C2.42 5.7 4.45 4.5 6.36 4.5c1.86 0 3.04 1.02 4.58 1.02 1.5 0 2.41-1.02 4.57-1.02 1.69 0 3.49.92 4.74 2.5-4.17 2.28-3.5 8.23.25 10.07z"/>
    </svg>
  );
}