import { ref, get, set, update, remove } from "firebase/database";
import { database } from "@/lib/firebase";

export interface UserAccount {
  id: string;
  email: string;
  password?: string;
  name: string;
  isVip: boolean;
  coins: number;
  owned: string[];
  equippedDeck: string;
  equippedWallpaper: string;
  equippedMarker: string;
  createdAt: number;
  lastLogin: number;
}

const CURRENT_USER_KEY = "garza:user";

export function encodeEmailKey(email: string): string {
  return email.trim().toLowerCase().replace(/\./g, "_").replace(/@/g, "_at_");
}

export const ADMIN_INITIAL_ACCOUNT: UserAccount = {
  id: "usr_jeff_admin",
  email: "omgiscooljeff21@gmail.com",
  password: "admin123456",
  name: "Eduardo Alejandro (Jeff)",
  isVip: true,
  coins: 6000,
  owned: [
    "wp_clasico",
    "wp_cempasuchil",
    "wp_michis",
    "wp_lomitos",
    "wp_feria",
    "wp_cantina",
    "wp_casino_oro",
    "deck_clasica",
    "deck_michis",
    "deck_lomitos",
    "deck_neon",
    "marker_frijol",
    "marker_ficha",
    "marker_moneda",
  ],
  equippedDeck: "deck_michis",
  equippedWallpaper: "wp_cempasuchil",
  equippedMarker: "marker_frijol",
  createdAt: Date.now(),
  lastLogin: Date.now(),
};

/**
 * Obtener el usuario autenticado actualmente desde almacenamiento local
 */
export function getCurrentUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Guardar datos de usuario en localStorage y disparar eventos
 */
export function applyUserSession(user: UserAccount): void {
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    localStorage.setItem("garza:name", user.name);
    localStorage.setItem("garza:vip", user.isVip ? "true" : "false");
    localStorage.setItem("garza:coins", user.coins.toString());
    localStorage.setItem("garza:owned", JSON.stringify(user.owned || []));
    if (user.equippedDeck) localStorage.setItem("garza:equipped_deck", user.equippedDeck);
    if (user.equippedWallpaper) localStorage.setItem("garza:equipped_wallpaper", user.equippedWallpaper);
    if (user.equippedMarker) localStorage.setItem("garza:equipped_marker", user.equippedMarker);

    window.dispatchEvent(new Event("garza:vip-updated"));
    window.dispatchEvent(new Event("garza:coins-updated"));
    window.dispatchEvent(new Event("garza:deck-updated"));
    window.dispatchEvent(new Event("garza:wallpaper-updated"));
    window.dispatchEvent(new Event("garza:auth-updated"));
  } catch (e) {
    console.error("Error setting user session", e);
  }
}

/**
 * Inicializar y asegurar que la cuenta principal VIP exista en Firebase Cloud
 */
export async function ensureAdminAccountProvisioned(): Promise<void> {
  try {
    const key = encodeEmailKey(ADMIN_INITIAL_ACCOUNT.email);
    const userRef = ref(database, `users/${key}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      await set(userRef, ADMIN_INITIAL_ACCOUNT);
    } else {
      // Garantizar que conserve VIP y monedas
      const existing = snapshot.val();
      await update(userRef, {
        isVip: true,
        coins: Math.max(existing.coins || 0, 6000),
        owned: Array.from(new Set([...(existing.owned || []), ...ADMIN_INITIAL_ACCOUNT.owned])),
      });
    }
  } catch (err) {
    console.warn("Could not sync admin account with Firebase (offline fallback active):", err);
  }
}

/**
 * Iniciar sesión con Correo y Contraseña
 */
export async function loginWithEmail(email: string, password: string): Promise<UserAccount> {
  const cleanEmail = email.trim().toLowerCase();
  const key = encodeEmailKey(cleanEmail);

  // Fallback rápido si es la cuenta solicitada
  if (cleanEmail === ADMIN_INITIAL_ACCOUNT.email && password === ADMIN_INITIAL_ACCOUNT.password) {
    const user: UserAccount = {
      ...ADMIN_INITIAL_ACCOUNT,
      lastLogin: Date.now(),
    };
    applyUserSession(user);
    // Sincronizar asíncronamente en Firebase
    ensureAdminAccountProvisioned().catch(() => {});
    return user;
  }

  // Buscar en Firebase Cloud
  const userRef = ref(database, `users/${key}`);
  const snapshot = await get(userRef);

  if (!snapshot.exists()) {
    throw new Error("No existe ninguna cuenta registrada con este correo electrónico.");
  }

  const userData = snapshot.val() as UserAccount;
  if (userData.password !== password) {
    throw new Error("Contraseña incorrecta. Por favor verifica tus datos.");
  }

  userData.lastLogin = Date.now();
  await update(userRef, { lastLogin: userData.lastLogin }).catch(() => {});

  applyUserSession(userData);
  return userData;
}

/**
 * Registrar nueva cuenta con Correo y Contraseña
 */
export async function registerWithEmail(
  email: string,
  password: string,
  name: string
): Promise<UserAccount> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (!cleanEmail || !cleanEmail.includes("@")) {
    throw new Error("Por favor ingresa un correo electrónico válido.");
  }
  if (!password || password.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres.");
  }
  if (!cleanName) {
    throw new Error("Por favor ingresa tu nombre de jugador.");
  }

  const key = encodeEmailKey(cleanEmail);
  const userRef = ref(database, `users/${key}`);
  const snapshot = await get(userRef);

  if (snapshot.exists()) {
    throw new Error("Ya existe una cuenta con este correo. Inicia sesión en su lugar.");
  }

  // Nueva cuenta con paquete de bienvenida
  const newAccount: UserAccount = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    email: cleanEmail,
    password,
    name: cleanName,
    isVip: cleanEmail === ADMIN_INITIAL_ACCOUNT.email, // Si es el correo oficial, activar VIP
    coins: 1000, // Bono de bienvenida de 1,000 monedas
    owned: [
      "wp_clasico",
      "deck_clasica",
      "marker_frijol",
      "marker_ficha",
      ...(cleanEmail === ADMIN_INITIAL_ACCOUNT.email ? ADMIN_INITIAL_ACCOUNT.owned : []),
    ],
    equippedDeck: "deck_clasica",
    equippedWallpaper: "wp_clasico",
    equippedMarker: "marker_frijol",
    createdAt: Date.now(),
    lastLogin: Date.now(),
  };

  await set(userRef, newAccount);
  applyUserSession(newAccount);
  return newAccount;
}

/**
 * Cerrar sesión
 */
export function logoutUser(): void {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.setItem("garza:name", "Invitado");
    localStorage.setItem("garza:vip", "false");
    window.dispatchEvent(new Event("garza:auth-updated"));
    window.dispatchEvent(new Event("garza:vip-updated"));
  } catch {}
}

/**
 * Eliminar cuenta y todos los datos asociados del usuario
 * Cumple con los requisitos obligatorios de Google Play Store y Apple App Store (Account Deletion)
 */
export async function deleteUserAccount(email?: string): Promise<void> {
  try {
    const targetEmail = email || getCurrentUser()?.email;
    if (targetEmail) {
      const key = encodeEmailKey(targetEmail);
      const userRef = ref(database, `users/${key}`);
      await remove(userRef).catch(() => {});
    }
  } catch (e) {
    console.warn("Could not delete cloud user record", e);
  } finally {
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.dispatchEvent(new Event("garza:auth-updated"));
      window.dispatchEvent(new Event("garza:coins-updated"));
      window.dispatchEvent(new Event("garza:vip-updated"));
    } catch {}
  }
}
