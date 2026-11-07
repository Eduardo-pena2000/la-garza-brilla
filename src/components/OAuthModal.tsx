import { useState } from "react";
import { X, Loader2, ArrowRight } from "lucide-react";
import { loginWithOAuth, type UserAccount } from "@/lib/auth";

interface OAuthModalProps {
  open: boolean;
  provider: "google" | "apple" | null;
  onClose: () => void;
  onSuccess: (user: UserAccount) => void;
}

export function OAuthModal({ open, provider, onClose, onSuccess }: OAuthModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open || !provider) return null;

  const isGoogle = provider === "google";
  const defaultDomain = isGoogle ? "@gmail.com" : "@icloud.com";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Por favor ingresa tu correo electrónico.");
      return;
    }
    if (!cleanEmail.includes("@")) {
      cleanEmail = `${cleanEmail}${defaultDomain}`;
    }
    const cleanName = name.trim();
    if (!cleanName) {
      setError("Por favor ingresa tu nombre de jugador.");
      return;
    }

    setLoading(true);
    try {
      const user = await loginWithOAuth(provider, cleanEmail, cleanName);
      onSuccess(user);
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 via-[color:var(--brand-navy-dark)] to-slate-950 border border-white/20 shadow-2xl p-6 text-white animate-pop-in overflow-hidden"
        style={{
          boxShadow: isGoogle
            ? "0 20px 50px rgba(0,0,0,0.8), 0 0 40px rgba(66,133,244,0.2)"
            : "0 20px 50px rgba(0,0,0,0.8), 0 0 40px rgba(255,255,255,0.15)",
        }}
      >
        {/* Glow ambient background elements */}
        <div
          className={`absolute -top-16 -right-16 w-36 h-36 ${
            isGoogle ? "bg-blue-500/20" : "bg-white/10"
          } rounded-full blur-3xl pointer-events-none`}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 flex items-center justify-center transition active:scale-95 disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center mb-5">
          <div
            className={`w-14 h-14 rounded-2xl ${
              isGoogle ? "bg-white shadow-lg shadow-blue-500/20" : "bg-black border border-white/20 shadow-lg"
            } flex items-center justify-center mb-3`}
          >
            {isGoogle ? (
              <svg className="w-7 h-7" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            ) : (
              <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.86c.62-.75 1.04-1.8 0.92-2.86-.9.04-1.98.6-2.62 1.35-.57.65-.97 1.72-.83 2.76 1 .08 2.02-.5 2.53-1.25z" />
              </svg>
            )}
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400">
            {isGoogle ? "Cuenta Google" : "Apple ID"}
          </span>
          <h2 className="text-xl font-game font-bold tracking-tight mt-0.5">
            {isGoogle ? "Iniciar con Google" : "Iniciar con Apple"}
          </h2>
          <p className="text-xs text-white/70 mt-1 max-w-xs">
            {isGoogle
              ? "Conecta tu cuenta de Google para guardar tus partidas, monedas y compras en la nube."
              : "Conecta tu Apple ID para sincronizar tu perfil y compras en todos tus dispositivos."}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-xs text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              {isGoogle ? "Correo de Google" : "Correo o Apple ID"}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isGoogle ? "ejemplo@gmail.com" : "ejemplo@icloud.com"}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              Tu nombre de jugador
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="¿Cómo quieres que te llamen en la partida?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:border-cyan-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition active:scale-95 shadow-lg ${
              isGoogle
                ? "bg-white text-slate-950 hover:bg-white/90 shadow-white/10"
                : "bg-white text-black hover:bg-white/90 shadow-white/10"
            }`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
            ) : (
              <>
                <span>Continuar</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

