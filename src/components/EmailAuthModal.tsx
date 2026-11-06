import { useState } from "react";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  X,
  Sparkles,
  Crown,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import {
  loginWithEmail,
  registerWithEmail,
  type UserAccount,
} from "@/lib/auth";

interface EmailAuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (user: UserAccount) => void;
}

export function EmailAuthModal({ open, onClose, onSuccess }: EmailAuthModalProps) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (tab === "login") {
        const user = await loginWithEmail(email, password);
        setSuccessMessage(`¡Bienvenido de vuelta, ${user.name}!`);
        setTimeout(() => {
          onSuccess(user);
        }, 600);
      } else {
        const user = await registerWithEmail(email, password, name);
        setSuccessMessage(`¡Cuenta creada exitosamente! Bienvenido, ${user.name}`);
        setTimeout(() => {
          onSuccess(user);
        }, 600);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Ocurrió un error inesperado al procesar tu solicitud.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 via-[color:var(--brand-navy-dark)] to-slate-950 border border-white/20 shadow-2xl p-6 text-white animate-pop-in overflow-hidden"
        style={{
          boxShadow: "0 20px 50px rgba(0,0,0,0.8), 0 0 40px rgba(6,182,212,0.15)",
        }}
      >
        {/* Glow ambient background elements */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 flex items-center justify-center transition active:scale-95 disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-2">
            <Mail className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400">
            Lotería La Garza
          </span>
          <h2 className="text-xl font-game font-bold tracking-tight mt-0.5">
            {tab === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
          </h2>
          <p className="text-xs text-white/70 mt-1 max-w-xs">
            {tab === "login"
              ? "Accede a tu cuenta oficial y sincroniza tu botín en la nube"
              : "Regístrate para guardar tu botín, monedas y rango VIP"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 bg-black/40 p-1 rounded-2xl border border-white/10 mb-4">
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              tab === "login"
                ? "bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-md font-black"
                : "text-white/70 hover:text-white"
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("register");
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              tab === "register"
                ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md font-black"
                : "text-white/70 hover:text-white"
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Feedback / Error banner */}
        {errorMessage && (
          <div className="mb-4 rounded-xl bg-red-500/20 border border-red-500/40 p-3 flex items-start gap-2.5 text-red-200 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-xl bg-emerald-500/20 border border-emerald-400/40 p-3 flex items-center gap-2 text-emerald-200 text-xs animate-bounce-gentle">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="leading-snug">{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {tab === "register" && (
            <div>
              <label className="block text-[11px] font-semibold text-white/80 mb-1">
                Nombre de jugador
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Eduardo (Jeff)"
                  maxLength={30}
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-black/40 border border-white/15 text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-white/80 mb-1">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full h-11 pl-10 pr-3 rounded-xl bg-black/40 border border-white/15 text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-white/80 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Al menos 6 caracteres"
                className="w-full h-11 pl-10 pr-10 rounded-xl bg-black/40 border border-white/15 text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full mt-4 h-12 rounded-xl font-game text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all disabled:opacity-60 ${
              tab === "login"
                ? "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-amber-500/25"
                : "bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 font-black shadow-cyan-500/25"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <span>{tab === "login" ? "Entrar al Juego" : "Crear mi Cuenta"}</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </>
            )}
          </button>
        </form>

        {/* Footer switch prompt */}
        <div className="mt-4 text-center">
          {tab === "login" ? (
            <p className="text-xs text-white/60">
              ¿No tienes una cuenta aún?{" "}
              <button
                type="button"
                onClick={() => {
                  setTab("register");
                  setErrorMessage(null);
                }}
                className="text-cyan-400 font-bold underline hover:text-cyan-300"
              >
                Crear cuenta
              </button>
            </p>
          ) : (
            <p className="text-xs text-white/60">
              ¿Ya tienes cuenta registrada?{" "}
              <button
                type="button"
                onClick={() => {
                  setTab("login");
                  setErrorMessage(null);
                }}
                className="text-amber-400 font-bold underline hover:text-amber-300"
              >
                Iniciar sesión
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
