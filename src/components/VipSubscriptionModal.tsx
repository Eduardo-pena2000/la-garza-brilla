import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Crown, Sparkles, Check, X, Shield, Trophy, Users, Calendar, Coins, ShieldCheck, ArrowRight, RotateCcw } from "lucide-react";
import { CoinAnimation } from "@/components/CoinAnimation";
import { useNavigate } from "@tanstack/react-router";
import { Capacitor } from "@capacitor/core";
import {
  purchaseVip,
  getVipOffering,
  restorePurchases,
  checkVipStatus,
  type PurchaseResult,
} from "@/lib/purchases";
import { getCurrentUser, encodeEmailKey } from "@/lib/auth";
import type { PurchasesPackage } from "@revenuecat/purchases-capacitor";

interface VipSubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function VipSubscriptionModal({ open, onClose, onSuccess }: VipSubscriptionModalProps) {
  const navigate = useNavigate();
  const [isVip, setIsVip] = useState(false);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [justPurchased, setJustPurchased] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [vipPackage, setVipPackage] = useState<PurchasesPackage | null>(null);
  const [storePrice, setStorePrice] = useState<string>("$99 MXN / mes");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsVip(localStorage.getItem("garza:vip") === "true");
    }

    const user = getCurrentUser();
    const userId = user?.email ? encodeEmailKey(user.email) : undefined;
    checkVipStatus(userId).then((active) => {
      setIsVip(active);
    }).catch(() => {});

    // Cargar precio real de la tienda (solo en nativo)
    if (Capacitor.isNativePlatform()) {
      getVipOffering().then((pkg) => {
        if (pkg) {
          setVipPackage(pkg);
          setStorePrice(pkg.product.priceString + " / mes");
        }
      });
    }
  }, [open]);

  // Lock body scroll when modal is open to avoid background scroll chaining on mobile
  useEffect(() => {
    if (open) {
      const originalStyle = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [open]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  const getUserId = () => {
    const user = getCurrentUser();
    return user?.email ? encodeEmailKey(user.email) : "guest";
  };

  const handleSubscribe = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      let result: PurchaseResult;
      if (Capacitor.isNativePlatform() && vipPackage) {
        // Compra real via App Store / Play Store
        result = await purchaseVip(getUserId(), vipPackage);
      } else {
        // Simulación en web/dev
        result = await purchaseVip(getUserId(), {} as PurchasesPackage);
      }

      if (result.success) {
        setIsVip(true);
        setJustPurchased(true);
        if (onSuccess) onSuccess();
      } else if (!result.cancelled) {
        setErrorMsg(result.error ?? "No se pudo completar la suscripción. Intenta de nuevo.");
      }
      // Si canceló, no mostramos error
    } catch (e) {
      setErrorMsg("Error inesperado. Intenta de nuevo.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    setErrorMsg(null);
    try {
      const restored = await restorePurchases(getUserId());
      if (restored) {
        setIsVip(true);
        setJustPurchased(true);
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg("No se encontró ninguna compra anterior para restaurar.");
      }
    } catch {
      setErrorMsg("Error al restaurar compras. Intenta de nuevo.");
    } finally {
      setRestoring(false);
    }
  };

  const perks = [
    {
      icon: ShieldCheck,
      title: "100% Libre de Anuncios para Todos",
      desc: "Nadie en tu sala VIP verá publicidad. Cero anuncios entre rondas tanto para ti como para cualquier invitado que se una.",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/30",
    },
    {
      icon: Crown,
      title: "Panel Administrativo de Salas VIP",
      desc: "Crea eventos exclusivos, programa día y hora, y gestiona todo desde tu panel de anfitrión.",
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      border: "border-amber-400/30",
    },
    {
      icon: Users,
      title: "Registro de Jugadores (Whitelist)",
      desc: "Pre-registra a tus amigos o invitados especiales y limita el acceso solo a los autorizados.",
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "border-blue-400/30",
    },
    {
      icon: Trophy,
      title: "Múltiples Rondas con Premios",
      desc: "Configura partidas de varias rondas con premios personalizados y modos de juego por ronda.",
      color: "text-yellow-300",
      bg: "bg-yellow-300/10",
      border: "border-yellow-300/30",
    },
    {
      icon: Calendar,
      title: "Programación de Partidas",
      desc: "Define fecha y hora exacta para tus torneos con sala de espera dedicada.",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/30",
    },
    {
      icon: Sparkles,
      title: "Marco Dorado & 50 Stickers VIP",
      desc: "Insignia VIP dorada exclusiva en tu perfil y acceso a toda la colección de stickers.",
      color: "text-fuchsia-400",
      bg: "bg-fuchsia-400/10",
      border: "border-fuchsia-400/30",
    },
  ];

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md max-h-[92dvh] sm:max-h-[88vh] rounded-t-[32px] sm:rounded-3xl bg-gradient-to-b from-[#181335] via-[#0f0b22] to-[#07050f] text-white shadow-[0_0_60px_rgba(234,179,8,0.35)] border-t sm:border-2 border-amber-400/40 flex flex-col overflow-hidden animate-slide-up-soft"
      >
        {/* Glow Effects in background */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* ======================================================== */}
        {/* FIXED HEADER: ALWAYS VISIBLE WITH GENEROUS CLOSE BUTTON */}
        {/* ======================================================== */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#181335]/95 backdrop-blur-md relative z-20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700 shadow-[0_0_20px_rgba(245,158,11,0.5)] ring-2 ring-yellow-200/50">
              <Crown className="h-6 w-6 text-slate-950 fill-current drop-shadow" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                  VIP PASS
                </span>
                <Sparkles className="w-3 h-3 text-amber-400" />
              </div>
              <h2 className="text-base font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 truncate">
                Suscripción VIP La Garza
              </h2>
            </div>
          </div>

          {/* Close button with large 44x44px touch target */}
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-white/90 hover:text-white transition touch-manipulation cursor-pointer border border-white/10"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5 stroke-[2.5]" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* SCROLLABLE BODY: ALL PERKS WITH MOMENTUM SCROLLING */}
        {/* ======================================================== */}
        <div
          className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 scroll-touch-y"
          style={{ scrollbarWidth: "none" }}
        >
          <p className="text-xs text-white/70 leading-relaxed">
            Desbloquea el panel administrativo completo para crear, programar y gestionar torneos y salas privadas sin publicidad.
          </p>

          {/* Status if already active */}
          {isVip && (
            <div className="rounded-2xl bg-emerald-500/15 border border-emerald-400/40 p-3.5 text-center">
              <div className="flex items-center justify-center gap-2 text-emerald-300 font-extrabold text-sm">
                <Shield className="h-4 w-4" />
                ¡Tu Membresía VIP está Activa!
              </div>
              <p className="text-[11px] text-emerald-200/80 mt-1">
                Tienes acceso ilimitado a crear salas VIP y gestionar tus torneos programados.
              </p>
            </div>
          )}

          {/* Perks list */}
          <div className="space-y-2.5">
            {perks.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-2xl bg-white/[0.04] p-3 border border-white/5 transition hover:border-amber-400/30 hover:bg-white/[0.07]"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${p.bg} border ${p.border} ${p.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black text-white/95 leading-tight flex items-center gap-1.5">
                      {p.title}
                    </h4>
                    <p className="text-[11px] text-white/60 leading-snug mt-0.5">
                      {p.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Welcome Bonus Callout */}
          <div className="rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-transparent border border-amber-400/30 p-3.5 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300">
              <CoinAnimation className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                Bono Inmediato
              </div>
              <div className="text-xs font-bold text-white">
                +2,000 Monedas de bienvenida con tu suscripción
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* FIXED FOOTER: CTA BUTTON IS PERMANENTLY ACCESSIBLE */}
        {/* ======================================================== */}
        <div className="shrink-0 p-4 border-t border-white/10 bg-[#0d0a1c]/95 backdrop-blur-md relative z-20 pb-[max(16px,env(safe-area-inset-bottom))]">
          <div className="flex items-baseline justify-between mb-3 px-1">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 block">Plan Mensual</span>
              <span className="text-2xl font-black text-amber-300">$99 MXN</span>
              <span className="text-xs text-white/60"> / mes</span>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                Cancela cuando quieras
              </span>
            </div>
          </div>

          {isVip ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate({ to: "/crear-sala-vip" });
                }}
                className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm text-center shadow-[0_0_25px_rgba(245,158,11,0.5)] active:scale-[0.98] transition flex items-center justify-center gap-2 touch-manipulation cursor-pointer"
              >
                <span>Ir al Panel de Salas VIP</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 text-xs text-white/60 hover:text-white transition text-center touch-manipulation cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Botón de compra principal */}
              <button
                type="button"
                onClick={handleSubscribe}
                disabled={loading || restoring}
                className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-base shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:shadow-[0_0_35px_rgba(245,158,11,0.7)] active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50 touch-manipulation cursor-pointer"
              >
                {loading ? (
                  <span>Procesando pago...</span>
                ) : (
                  <>
                    <Crown className="w-5 h-5 fill-current" />
                    <span>Suscribirme — {storePrice}</span>
                  </>
                )}
              </button>

              {/* Restaurar compras (requerido por Apple) */}
              <button
                type="button"
                onClick={handleRestore}
                disabled={loading || restoring}
                className="w-full py-2.5 text-xs text-white/50 hover:text-white/80 transition text-center touch-manipulation cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-30"
              >
                <RotateCcw className="w-3 h-3" />
                {restoring ? "Restaurando..." : "Restaurar compra anterior"}
              </button>

              {/* Mensaje de error */}
              {errorMsg && (
                <p className="text-center text-xs text-red-400 font-semibold mt-1 px-2">
                  {errorMsg}
                </p>
              )}

              {/* Aviso legal requerido por Apple */}
              <p className="text-center text-[10px] text-white/30 leading-relaxed px-2">
                La suscripción se cobra a tu cuenta de {typeof window !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent) ? "App Store" : "Google Play"}.
                Se renueva automáticamente hasta que canceles. Cancela en cualquier momento desde la configuración de tu cuenta.
              </p>
            </div>
          )}

          {justPurchased && (
            <p className="text-center text-xs text-emerald-400 font-bold mt-2 animate-bounce">
              ¡Felicidades! Ahora eres Miembro VIP. Disfruta de tus salas exclusivas.
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
