import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PartyPopper, Mail } from "lucide-react";
import { BrandBackground } from "@/components/BrandBackground";
import { BrandLogo } from "@/components/BrandLogo";
import { NameModal } from "@/components/NameModal";
import { EmailAuthModal } from "@/components/EmailAuthModal";
import { OAuthModal } from "@/components/OAuthModal";
import { LegalNoticeModal, type LegalTab } from "@/components/LegalNoticeModal";
import { loginAsGuest, type UserAccount } from "@/lib/auth";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    return {
      redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    };
  },
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
  const search = Route.useSearch();
  const redirectTarget = search.redirect;

  const [askName, setAskName] = useState(false);
  const [openEmailAuth, setOpenEmailAuth] = useState(false);
  const [oauthProvider, setOauthProvider] = useState<"google" | "apple" | null>(null);
  const [legalModalTab, setLegalModalTab] = useState<LegalTab | null>(null);

  const handleAuthSuccess = (_user: UserAccount) => {
    if (redirectTarget) {
      window.location.href = redirectTarget;
    } else {
      navigate({ to: "/menu" });
    }
  };

  return (
    <BrandBackground>
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-6 pb-10 pt-20">
        <div className="mx-auto mb-6 flex items-center justify-center animate-pop-in">
          <BrandLogo size={224} />
        </div>
        
        <p className="mb-4 text-center text-[15px] leading-relaxed text-white/90 animate-slide-up-soft" style={{ animationDelay: "0.2s" }}>
          Crea tu mesa, invita a tus amigos y que gane el mejor.
        </p>

        {/* Banner de invitación cuando entra por un link de sala */}
        {redirectTarget && (
          <div className="w-full mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/25 via-yellow-500/20 to-amber-500/25 border-2 border-amber-400/60 backdrop-blur-md text-center animate-pop-in shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <div className="text-[11px] font-black uppercase tracking-widest text-amber-300 mb-0.5">
              ¡Te han invitado a una partida!
            </div>
            <p className="text-xs text-white/95 font-medium leading-snug">
              Inicia sesión o escribe tu nombre como invitado para unirte de inmediato a la mesa.
            </p>
          </div>
        )}

        <div className="mt-2 flex w-full flex-col gap-3">
          {/* Iniciar sesión con Correo y Contraseña */}
          <button
            type="button"
            className="group relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-[15px] font-bold text-slate-950 shadow-[0_10px_25px_-5px_rgba(245,158,11,0.5)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-8px_rgba(245,158,11,0.7)] active:scale-[0.98] animate-slide-up-soft"
            style={{ animationDelay: "0.35s" }}
            onClick={() => setOpenEmailAuth(true)}
          >
            <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ animation: "shimmer-x 2.4s ease-in-out infinite" }} />
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-black/10">
              <Mail className="h-5 w-5 text-slate-950 stroke-[2.5]" />
            </span>
            Iniciar sesión con Correo
          </button>

          {/* Iniciar sesión con Google */}
          <button
            type="button"
            className="group relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-white text-[15px] font-semibold text-[color:var(--brand-navy-dark)] shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-10px_rgba(0,0,0,0.5)] active:scale-[0.98] animate-slide-up-soft"
            style={{ animationDelay: "0.45s" }}
            onClick={() => setOauthProvider("google")}
          >
            <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ animation: "shimmer-x 2.4s ease-in-out infinite" }} />
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[color:var(--brand-navy-dark)]/5">
              <GoogleIcon className="h-5 w-5" />
            </span>
            Iniciar sesión con Google
          </button>

          {/* Iniciar sesión con Apple */}
          <button
            type="button"
            className="relative flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-black text-[15px] font-semibold text-white shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-10px_rgba(0,0,0,0.6)] active:scale-[0.98] animate-slide-up-soft"
            style={{ animationDelay: "0.55s" }}
            onClick={() => setOauthProvider("apple")}
          >
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10">
              <AppleIcon className="h-5 w-5" />
            </span>
            Iniciar sesión con Apple
          </button>

          {/* Entrar como invitado */}
          <button
            type="button"
            className="relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/15 bg-white/10 text-[15px] font-semibold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/15 active:scale-[0.98] animate-slide-up-soft"
            style={{ animationDelay: "0.65s" }}
            onClick={() => setAskName(true)}
          >
            <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 sarape-band animate-sarape-slide" />
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[color:var(--brand-gold)]/25">
              <PartyPopper className="h-5 w-5 text-[color:var(--brand-gold)]" />
            </span>
            Entrar como invitado
          </button>
        </div>

        <p className="mt-auto pt-8 text-center text-xs text-white/60 animate-slide-up-soft" style={{ animationDelay: "0.85s" }}>
          Al usar la aplicación aceptas nuestros{" "}
          <button
            type="button"
            onClick={() => setLegalModalTab("terminos")}
            className="underline hover:text-white transition font-medium"
          >
            Términos de uso
          </button>{" "}
          y{" "}
          <button
            type="button"
            onClick={() => setLegalModalTab("privacidad")}
            className="underline hover:text-white transition font-medium"
          >
            Política de privacidad
          </button>
        </p>
        <button
          type="button"
          onClick={() => setLegalModalTab("copyright")}
          className="mt-2 text-[11px] text-white/40 hover:text-white/70 transition"
        >
          © 2026 Lotería La Garza • Versión 1.0.0
        </button>
      </main>

      {/* Guest Name Modal */}
      <NameModal
        open={askName}
        onClose={() => setAskName(false)}
        onSave={(name) => {
          loginAsGuest(name);
          setAskName(false);
          if (redirectTarget) {
            window.location.href = redirectTarget;
          } else {
            navigate({ to: "/menu" });
          }
        }}
      />

      {/* Email and Password Authentication Modal */}
      <EmailAuthModal
        open={openEmailAuth}
        onClose={() => setOpenEmailAuth(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Google and Apple OAuth Modal */}
      <OAuthModal
        open={Boolean(oauthProvider)}
        provider={oauthProvider}
        onClose={() => setOauthProvider(null)}
        onSuccess={(user) => {
          setOauthProvider(null);
          handleAuthSuccess(user);
        }}
      />

      {/* Legal & Privacy Notice Modal */}
      <LegalNoticeModal
        open={Boolean(legalModalTab)}
        initialTab={legalModalTab || "privacidad"}
        onClose={() => setLegalModalTab(null)}
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
