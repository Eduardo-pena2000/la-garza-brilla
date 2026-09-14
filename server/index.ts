import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, update } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDi0AQO49GJhwIHY9IZHY-OKi-vgxOe6QQ",
  authDomain: "loteria-la-garza-ed90b.firebaseapp.com",
  databaseURL: "https://loteria-la-garza-ed90b-default-rtdb.firebaseio.com",
  projectId: "loteria-la-garza-ed90b",
  storageBucket: "loteria-la-garza-ed90b.firebasestorage.app",
  messagingSenderId: "233458148701",
  appId: "1:233458148701:web:c7358ec477e146861074b4",
  measurementId: "G-0DXNXHJ4NF"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const mesasRef = ref(db, "mesas");

// Guardar los timers de cada mesa para no tener múltiples ejecutándose
const activeTimers = new Map<string, Timer>();
const mesaStates = new Map<string, any>();

function startTimer(mesaId: string, currentIdx: number, deckLength: number, speed: number) {
  if (activeTimers.has(mesaId)) {
    clearTimeout(activeTimers.get(mesaId));
  }

  const timer = setTimeout(async () => {
    const nextIdx = currentIdx + 1;
    if (nextIdx < deckLength) {
      console.log(`[${mesaId}] Dibujando carta ${nextIdx}`);
      await update(ref(db, `mesas/${mesaId}`), { drawnIdx: nextIdx });
    }
  }, speed);

  activeTimers.set(mesaId, timer);
}

function stopTimer(mesaId: string) {
  if (activeTimers.has(mesaId)) {
    clearTimeout(activeTimers.get(mesaId));
    activeTimers.delete(mesaId);
  }
}

onValue(mesasRef, (snapshot) => {
  const mesas = snapshot.val() || {};
  
  // Limpiar timers de mesas que ya no existen
  for (const mesaId of activeTimers.keys()) {
    if (!mesas[mesaId]) {
      console.log(`[${mesaId}] Mesa eliminada. Deteniendo timer.`);
      stopTimer(mesaId);
      mesaStates.delete(mesaId);
    }
  }

  for (const [mesaId, mesa] of Object.entries<any>(mesas)) {
    mesaStates.set(mesaId, mesa);

    if (mesa.status === "en-juego" && mesa.deck && !mesa.serverPaused) {
      const drawnIdx = mesa.drawnIdx ?? -1;
      const speed = 3000;

      if (drawnIdx < mesa.deck.length - 1) {
        startTimer(mesaId, drawnIdx, mesa.deck.length, speed);
      } else {
        stopTimer(mesaId);
      }
    } else {
      stopTimer(mesaId);
    }
  }
});

console.log("🎮 Servidor Garza Game Engine iniciado y escuchando mesas...");
