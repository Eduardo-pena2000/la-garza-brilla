/**
 * purchases.ts — Wrapper de RevenueCat para Lotería La Garza
 *
 * Centraliza toda la lógica de In-App Purchases (iOS App Store + Google Play).
 * Los product IDs aquí coinciden exactamente con los configurados en:
 *   - App Store Connect → Compras In-App
 *   - Google Play Console → Productos / Suscripciones
 *   - RevenueCat Dashboard → Packages / Offerings
 */

import { Capacitor } from "@capacitor/core";
import { Purchases, LOG_LEVEL, type PurchasesPackage } from "@revenuecat/purchases-capacitor";
import { ref, update, increment, get } from "firebase/database";
import { database as db } from "@/lib/firebase";

// ─────────────────────────────────────────────────────────────
//  API Keys de RevenueCat
//  Se pueden configurar mediante variables de entorno Vite
//  (VITE_REVENUECAT_APPLE_KEY y VITE_REVENUECAT_GOOGLE_KEY)
//  o reemplazando las constantes directamente abajo.
// ─────────────────────────────────────────────────────────────
const REVENUECAT_API_KEY_IOS =
  (import.meta.env.VITE_REVENUECAT_APPLE_KEY as string) ||
  "appl_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

const REVENUECAT_API_KEY_ANDROID =
  (import.meta.env.VITE_REVENUECAT_GOOGLE_KEY as string) ||
  "goog_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

// ─────────────────────────────────────────────────────────────
//  IDs de producto (idénticos en App Store y Play Store)
// ─────────────────────────────────────────────────────────────
export const PRODUCT_IDS = {
  VIP_MONTHLY: "vip_monthly",    // Suscripción mensual $99 MXN
  COINS_500:   "coins_500",      // 500 monedas ~$0.99 USD
  COINS_1200:  "coins_1200",     // 1,200 monedas ~$1.99 USD
  COINS_2500:  "coins_2500",     // 2,500 monedas ~$3.99 USD
  COINS_6500:  "coins_6500",     // 6,500 monedas ~$9.99 USD
} as const;

export type CoinProductId = typeof PRODUCT_IDS[keyof Omit<typeof PRODUCT_IDS, "VIP_MONTHLY">];

// Monedas que entrega cada paquete
export const COINS_BY_PRODUCT: Record<string, number> = {
  [PRODUCT_IDS.COINS_500]:  500,
  [PRODUCT_IDS.COINS_1200]: 1200,
  [PRODUCT_IDS.COINS_2500]: 2500,
  [PRODUCT_IDS.COINS_6500]: 6500,
};

let _initialized = false;

// ─────────────────────────────────────────────────────────────
//  Inicialización (llamar una vez al arrancar la app)
// ─────────────────────────────────────────────────────────────
export async function initPurchases(userId?: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    console.log("[Purchases] Plataforma web — IAP en modo simulación");
    return;
  }
  if (_initialized) return;

  try {
    const platform = Capacitor.getPlatform();
    const apiKey = platform === "ios" ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;

    if (!apiKey || apiKey.includes("XXXX")) {
      console.warn("[Purchases] RevenueCat API Key pendiente de configurar para plataforma:", platform);
      return;
    }

    await Purchases.setLogLevel({ level: LOG_LEVEL.WARN });
    await Purchases.configure({ apiKey });

    if (userId) {
      await Purchases.logIn({ appUserID: userId });
    }

    _initialized = true;
    console.log("[Purchases] RevenueCat inicializado exitosamente en:", platform);
  } catch (err) {
    console.error("[Purchases] Error al inicializar RevenueCat:", err);
  }
}

// ─────────────────────────────────────────────────────────────
//  Verificar estado VIP (entitlement / Firebase / local)
// ─────────────────────────────────────────────────────────────
export async function checkVipStatus(userId?: string): Promise<boolean> {
  // 1. Verificar entitlement nativo en RevenueCat si corre en móvil
  if (Capacitor.isNativePlatform() && _initialized) {
    try {
      const { customerInfo } = await Purchases.getCustomerInfo();
      const hasActiveVip = Boolean(
        customerInfo.entitlements.active["vip_access"] ||
        customerInfo.entitlements.active["vip"]
      );
      if (hasActiveVip) {
        localStorage.setItem("garza:vip", "true");
        _updateLocalUserCache({ isVip: true });
        window.dispatchEvent(new Event("garza:vip-updated"));
        return true;
      }
    } catch (err) {
      console.warn("[Purchases] Error consultando entitlements de RevenueCat:", err);
    }
  }

  // 2. Verificar en Firebase RTDB (fuente de verdad en nube)
  if (userId && userId !== "guest") {
    try {
      const userRef = ref(db, `users/${userId}`);
      const snap = await get(userRef);
      if (snap.exists()) {
        const val = snap.val();
        const isVip = Boolean(val.isVip ?? val.vip);
        localStorage.setItem("garza:vip", isVip ? "true" : "false");
        _updateLocalUserCache({ isVip });
        window.dispatchEvent(new Event("garza:vip-updated"));
        return isVip;
      }
    } catch (err) {
      console.warn("[Purchases] Error verificando VIP en Firebase:", err);
    }
  }

  // 3. Fallback a cache local
  return localStorage.getItem("garza:vip") === "true";
}

// ─────────────────────────────────────────────────────────────
//  Obtener offering de VIP
// ─────────────────────────────────────────────────────────────
export async function getVipOffering(): Promise<PurchasesPackage | null> {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const offerings = await Purchases.getOfferings();
    const vipOffering = offerings.all["vip_offering"] ?? offerings.current;
    if (!vipOffering) return null;
    return vipOffering.monthly ?? vipOffering.availablePackages[0] ?? null;
  } catch (err) {
    console.error("[Purchases] Error obteniendo offering VIP:", err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
//  Obtener offering de monedas
// ─────────────────────────────────────────────────────────────
export async function getCoinsOffering(): Promise<PurchasesPackage[]> {
  if (!Capacitor.isNativePlatform()) return [];
  try {
    const offerings = await Purchases.getOfferings();
    const coinsOffering = offerings.all["coins_offering"] ?? offerings.current;
    if (!coinsOffering) return [];
    return coinsOffering.availablePackages;
  } catch (err) {
    console.error("[Purchases] Error obteniendo offering de monedas:", err);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
//  Comprar VIP
// ─────────────────────────────────────────────────────────────
export type PurchaseResult =
  | { success: true }
  | { success: false; cancelled: boolean; error?: string };

export async function purchaseVip(
  userId: string,
  pkg: PurchasesPackage
): Promise<PurchaseResult> {
  if (!Capacitor.isNativePlatform() || !_initialized) {
    // Modo web o desarrollo: simular compra exitosa
    console.log("[Purchases] Simulación de compra VIP");
    localStorage.setItem("garza:vip", "true");
    const currentCoins = parseInt(localStorage.getItem("garza:coins") || "500", 10);
    const newCoins = currentCoins + 2000;
    localStorage.setItem("garza:coins", newCoins.toString());
    _updateLocalUserCache({ isVip: true, coinsToAdd: 2000 });
    window.dispatchEvent(new Event("garza:vip-updated"));
    window.dispatchEvent(new Event("garza:coins-updated"));

    if (userId && userId !== "guest") {
      await _syncVipToFirebase(userId, true);
      await _addCoinsToFirebase(userId, 2000);
    }
    return { success: true };
  }

  try {
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
    const isVip = Boolean(
      customerInfo.entitlements.active["vip_access"] ||
      customerInfo.entitlements.active["vip"]
    );

    if (isVip) {
      // Sincronizar con Firebase RTDB
      if (userId && userId !== "guest") {
        await _syncVipToFirebase(userId, true);
        await _addCoinsToFirebase(userId, 2000);
      }

      // Actualizar almacenamiento local
      localStorage.setItem("garza:vip", "true");
      const currentCoins = parseInt(localStorage.getItem("garza:coins") || "500", 10);
      localStorage.setItem("garza:coins", (currentCoins + 2000).toString());
      _updateLocalUserCache({ isVip: true, coinsToAdd: 2000 });

      window.dispatchEvent(new Event("garza:vip-updated"));
      window.dispatchEvent(new Event("garza:coins-updated"));
      return { success: true };
    }

    return {
      success: false,
      cancelled: false,
      error: "No se pudo verificar la activación de tu membresía VIP.",
    };
  } catch (err: unknown) {
    const e = err as { userCancelled?: boolean; message?: string };
    if (e?.userCancelled) return { success: false, cancelled: true };
    return { success: false, cancelled: false, error: e?.message ?? "Error desconocido al procesar el pago." };
  }
}

// ─────────────────────────────────────────────────────────────
//  Comprar monedas
// ─────────────────────────────────────────────────────────────
export async function purchaseCoins(
  userId: string,
  pkg: PurchasesPackage
): Promise<PurchaseResult & { coinsAdded?: number }> {
  const targetId = pkg.product?.identifier || pkg.identifier;
  let coinsToAdd = COINS_BY_PRODUCT[targetId] ?? 0;
  if (!coinsToAdd && typeof targetId === "string") {
    const match = targetId.match(/coins_?(\d+)/i);
    if (match) coinsToAdd = parseInt(match[1], 10);
  }

  if (!Capacitor.isNativePlatform() || !_initialized) {
    // Modo web o desarrollo: simular compra
    console.log("[Purchases] Simulación de compra de monedas:", coinsToAdd);
    const current = parseInt(localStorage.getItem("garza:coins") || "0", 10);
    const total = current + (coinsToAdd > 0 ? coinsToAdd : 500);
    const added = coinsToAdd > 0 ? coinsToAdd : 500;
    localStorage.setItem("garza:coins", total.toString());
    _updateLocalUserCache({ coinsToAdd: added });
    window.dispatchEvent(new Event("garza:coins-updated"));

    if (userId && userId !== "guest") {
      await _addCoinsToFirebase(userId, added);
    }
    return { success: true, coinsAdded: added };
  }

  try {
    await Purchases.purchasePackage({ aPackage: pkg });

    if (coinsToAdd > 0) {
      if (userId && userId !== "guest") {
        await _addCoinsToFirebase(userId, coinsToAdd);
      }
      const current = parseInt(localStorage.getItem("garza:coins") || "0", 10);
      localStorage.setItem("garza:coins", (current + coinsToAdd).toString());
      _updateLocalUserCache({ coinsToAdd });
      window.dispatchEvent(new Event("garza:coins-updated"));
    }

    return { success: true, coinsAdded: coinsToAdd };
  } catch (err: unknown) {
    const e = err as { userCancelled?: boolean; message?: string };
    if (e?.userCancelled) return { success: false, cancelled: true };
    return { success: false, cancelled: false, error: e?.message ?? "Error al procesar la compra." };
  }
}

// ─────────────────────────────────────────────────────────────
//  Restaurar compras (requerido por Apple)
// ─────────────────────────────────────────────────────────────
export async function restorePurchases(userId: string): Promise<boolean> {
  if (Capacitor.isNativePlatform() && _initialized) {
    try {
      const { customerInfo } = await Purchases.restorePurchases();
      const isVip = Boolean(
        customerInfo.entitlements.active["vip_access"] ||
        customerInfo.entitlements.active["vip"]
      );

      if (isVip) {
        if (userId && userId !== "guest") {
          await _syncVipToFirebase(userId, true);
        }
        localStorage.setItem("garza:vip", "true");
        _updateLocalUserCache({ isVip: true });
        window.dispatchEvent(new Event("garza:vip-updated"));
      }
      return isVip;
    } catch (err) {
      console.error("[Purchases] Error al restaurar compras:", err);
      return false;
    }
  }

  // Modo desarrollo / web o sin keys configuradas: verificar en Firebase RTDB y local
  if (userId && userId !== "guest") {
    try {
      const isVip = await checkVipStatus(userId);
      return isVip;
    } catch {
      return false;
    }
  }

  return localStorage.getItem("garza:vip") === "true";
}

// ─────────────────────────────────────────────────────────────
//  Helpers Firebase & LocalStorage
// ─────────────────────────────────────────────────────────────
async function _syncVipToFirebase(userId: string, vip: boolean): Promise<void> {
  try {
    const userRef = ref(db, `users/${userId}`);
    await update(userRef, {
      vip,
      isVip: vip,
      vipSince: vip ? Date.now() : null,
    });
  } catch (err) {
    console.error("[Purchases] Error sincronizando VIP en Firebase:", err);
  }
}

async function _addCoinsToFirebase(userId: string, amount: number): Promise<void> {
  try {
    const userRef = ref(db, `users/${userId}`);
    await update(userRef, {
      coins: increment(amount),
    });
  } catch (err) {
    console.error("[Purchases] Error acreditando monedas en Firebase:", err);
  }
}

function _updateLocalUserCache(patch: { isVip?: boolean; coinsToAdd?: number }): void {
  try {
    const raw = localStorage.getItem("garza:user");
    if (raw) {
      const user = JSON.parse(raw);
      if (patch.isVip !== undefined) {
        user.isVip = patch.isVip;
        user.vip = patch.isVip;
      }
      if (patch.coinsToAdd !== undefined) {
        user.coins = (user.coins || 0) + patch.coinsToAdd;
      }
      localStorage.setItem("garza:user", JSON.stringify(user));
    }
  } catch {
    /* ignore */
  }
}
