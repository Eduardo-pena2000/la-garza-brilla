import { r as __toESM } from "../_runtime.mjs";
import { n as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as BrandBackground } from "./BrandBackground-r8YRdigP.mjs";
import { n as getCard, t as DECK } from "./deck-9k1yKny1.mjs";
import { a as ref, i as push, n as onDisconnect, o as set, r as onValue, s as update } from "../_libs/@firebase/database+[...].mjs";
import "../_libs/firebase.mjs";
import { t as database } from "./firebase-BY-4v7ot.mjs";
import { g as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as Pause, E as Menu, I as Heart, M as Info, N as Image, S as Pen, T as MessageCircle, X as ArrowLeft, _ as RotateCcw, a as Trophy, b as Play, c as Timer, h as Send, k as Link, m as Settings2, n as X, o as Triangle, r as Users } from "../_libs/lucide-react.mjs";
import { t as CoinAnimation } from "./CoinAnimation-BgsU05yx.mjs";
import { t as Route } from "./mesa._id.jugar-CYnIDeJu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mesa._id.jugar-PpdT_9Sg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TABLAS_KEY = "garza:tablas";
function loadTablas() {
	try {
		const raw = localStorage.getItem(TABLAS_KEY);
		if (!raw) return [];
		return JSON.parse(raw);
	} catch {
		return [];
	}
}
function shuffle(arr) {
	const out = [...arr];
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[out[i], out[j]] = [out[j], out[i]];
	}
	return out;
}
function speedFor(mode) {
	switch (mode) {
		case "relampago": return 2500;
		case "chorro": return 3500;
		case "lleno": return 4500;
		default: return 4e3;
	}
}
function checkWin(mode, size, cards, marked) {
	const n = size === "4x4" ? 4 : 5;
	const grid = Array.from({ length: n }, (_, r) => cards.slice(r * n, (r + 1) * n));
	const isMarked = (c) => marked.has(c);
	if (mode === "lleno") return cards.every(isMarked);
	if (mode === "chorro") return [
		grid[0][0],
		grid[0][n - 1],
		grid[n - 1][0],
		grid[n - 1][n - 1]
	].every(isMarked);
	for (let r = 0; r < n; r++) if (grid[r].every(isMarked)) return true;
	for (let c = 0; c < n; c++) if (grid.every((row) => isMarked(row[c]))) return true;
	if (grid.every((row, i) => isMarked(row[i]))) return true;
	if (grid.every((row, i) => isMarked(row[n - 1 - i]))) return true;
	return false;
}
function ToggleSwitch({ checked, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		onClick: () => onChange(!checked),
		className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-green-500" : "bg-gray-300"}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${checked ? "translate-x-5" : "translate-x-1"}` })
	});
}
function JugarPage() {
	const { id } = Route.useParams();
	const navigate = useNavigate();
	const [mesa, setMesa] = (0, import_react.useState)(null);
	const [tablasActivas, setTablasActivas] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [marked, setMarked] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [paused, setPaused] = (0, import_react.useState)(true);
	const [won, setWon] = (0, import_react.useState)(false);
	const timerRef = (0, import_react.useRef)(null);
	const [settings, setSettings] = (0, import_react.useState)({
		audio: true,
		effects: true,
		confetti: true,
		vibration: true,
		marker: "/markers/ifrijol.png",
		voice: "default"
	});
	const VOICES = [
		{
			id: "default",
			name: "Clásica",
			icon: "👩‍🎤"
		},
		{
			id: "1",
			name: "Voz 1",
			icon: "👨‍🎤"
		},
		{
			id: "2",
			name: "Voz 2",
			icon: "👩‍🎤"
		},
		{
			id: "3",
			name: "Voz 3",
			icon: "👨‍🎤"
		},
		{
			id: "5",
			name: "Voz 4",
			icon: "👩‍🎤"
		},
		{
			id: "6",
			name: "Voz 5",
			icon: "👨‍🎤"
		},
		{
			id: "7",
			name: "Voz 6",
			icon: "👩‍🎤"
		},
		{
			id: "8",
			name: "Voz 7",
			icon: "👨‍🎤"
		},
		{
			id: "9",
			name: "Voz 8",
			icon: "👩‍🎤"
		}
	];
	const [chatMsgs, setChatMsgs] = (0, import_react.useState)([]);
	const [floatingMsg, setFloatingMsg] = (0, import_react.useState)(null);
	const [chatInput, setChatInput] = (0, import_react.useState)("");
	const [stickerTab, setStickerTab] = (0, import_react.useState)("clasicos");
	const [interaction, setInteraction] = (0, import_react.useState)(null);
	const [activeModal, setActiveModal] = (0, import_react.useState)(null);
	const userName = typeof window !== "undefined" ? localStorage.getItem("garza:name") || "Jugador" : "Jugador";
	const isHost = mesa?.host === userName;
	(0, import_react.useEffect)(() => {
		const mesaRef = ref(database, `mesas/${id}`);
		const unsubscribe = onValue(mesaRef, (snapshot) => {
			const data = snapshot.val();
			if (data) {
				setMesa(data);
				if (isHost && !data.deck) {
					const newDeck = shuffle(DECK.map((c) => c.n));
					update(mesaRef, {
						deck: newDeck,
						drawnIdx: -1
					});
				}
				setTablasActivas((prev) => {
					if (prev.length > 0) return prev;
					return loadTablas().slice(0, data.perPlayer || 1);
				});
			} else setMesa(null);
			setLoading(false);
		});
		const unsubscribeChat = onValue(ref(database, `mesas/${id}/chat`), (snapshot) => {
			const msgs = snapshot.val();
			if (msgs) {
				const msgList = Object.values(msgs);
				msgList.sort((a, b) => a.timestamp - b.timestamp);
				setChatMsgs(msgList);
				const last = msgList[msgList.length - 1];
				if (Date.now() - last.timestamp < 3e3) {
					const isSticker = last.text.startsWith("[STICKER:") && last.text.endsWith("]");
					setFloatingMsg({
						text: last.text,
						sender: last.sender,
						isSticker
					});
					setTimeout(() => setFloatingMsg(null), 3e3);
				}
			}
		});
		const playerRef = ref(database, `mesas/${id}/players/${userName}`);
		set(playerRef, true);
		onDisconnect(playerRef).remove();
		return () => {
			unsubscribe();
			unsubscribeChat();
			set(playerRef, null);
		};
	}, [
		id,
		isHost,
		userName
	]);
	const deck = mesa?.deck || [];
	const drawnIdx = mesa?.drawnIdx ?? -1;
	const isGameStarted = drawnIdx >= 0;
	const [showTutorial, setShowTutorial] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (drawnIdx === 0) {
			setShowTutorial(true);
			const timer = setTimeout(() => setShowTutorial(false), 4e3);
			return () => clearTimeout(timer);
		}
	}, [drawnIdx]);
	const currentCard = deck[drawnIdx];
	(0, import_react.useEffect)(() => {
		if (currentCard !== void 0 && settings.audio) {
			const basePath = settings.voice === "default" ? "/audio/cards" : `/audio/cards/${settings.voice}`;
			new Audio(`${basePath}/b${currentCard}.mp3`).play().catch(() => {});
		}
	}, [
		currentCard,
		settings.audio,
		settings.voice
	]);
	const drawn = drawnIdx >= 0 ? getCard(deck[drawnIdx]) : null;
	const drawNext = (0, import_react.useCallback)(async () => {
		if (!isHost) return;
		const nextIdx = drawnIdx + 1;
		if (nextIdx < deck.length) await update(ref(database, `mesas/${id}`), { drawnIdx: nextIdx });
	}, [
		drawnIdx,
		deck.length,
		isHost,
		id
	]);
	(0, import_react.useEffect)(() => {
		if (paused || won || !mesa || !isHost) return;
		const speed = speedFor(mesa.mode);
		timerRef.current = window.setTimeout(drawNext, speed);
		return () => {
			if (timerRef.current) window.clearTimeout(timerRef.current);
		};
	}, [
		paused,
		drawnIdx,
		mesa,
		drawNext,
		won,
		isHost
	]);
	(0, import_react.useEffect)(() => {
		if (!mesa || tablasActivas.length === 0) return;
		if (tablasActivas.some((t) => checkWin(mesa.mode, t.size, t.cards, marked))) {
			setWon(true);
			setPaused(true);
			if (settings.effects) new Audio("/audio/effects/winner.mp3").play().catch(() => {});
			if (settings.vibration && navigator.vibrate) navigator.vibrate([
				500,
				200,
				500
			]);
		}
	}, [
		marked,
		mesa,
		tablasActivas,
		settings
	]);
	function toggleMark(card) {
		if (won) return;
		if (!new Set(deck.slice(0, drawnIdx + 1)).has(card)) return;
		setMarked((prev) => {
			const next = new Set(prev);
			if (next.has(card)) next.delete(card);
			else {
				next.add(card);
				if (settings.effects) new Audio("/audio/effects/pop.mp3").play().catch(() => {});
				if (settings.vibration && navigator.vibrate) navigator.vibrate(50);
			}
			return next;
		});
	}
	const handlePointerDown = (e, c) => {
		e.currentTarget.setPointerCapture(e.pointerId);
		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		setInteraction({
			cardId: c,
			startX: x,
			startY: y,
			curX: x,
			curY: y,
			isScratching: false
		});
	};
	const handlePointerMove = (e, c) => {
		if (!interaction || interaction.cardId !== c) return;
		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const dx = x - interaction.startX;
		const dy = y - interaction.startY;
		const dist = Math.sqrt(dx * dx + dy * dy);
		const isScratching = interaction.isScratching || dist > 10;
		setInteraction((prev) => prev ? {
			...prev,
			curX: x,
			curY: y,
			isScratching
		} : null);
		if (isScratching && settings.vibration && navigator.vibrate) {
			if (Math.random() > .6) navigator.vibrate(5);
		}
	};
	const handlePointerUp = (e, c) => {
		e.currentTarget.releasePointerCapture(e.pointerId);
		if (interaction && interaction.cardId === c) {
			if (!interaction.isScratching) toggleMark(c);
			setInteraction(null);
		}
	};
	async function restart() {
		if (!isHost) return;
		const newDeck = shuffle(DECK.map((c) => c.n));
		await update(ref(database, `mesas/${id}`), {
			deck: newDeck,
			drawnIdx: -1
		});
		setMarked(/* @__PURE__ */ new Set());
		setWon(false);
		setPaused(true);
		setActiveModal(null);
	}
	function sendChat(text) {
		if (!text.trim()) return;
		const chatRef = push(ref(database, `mesas/${id}/chat`));
		set(chatRef, {
			id: chatRef.key,
			text: text.trim(),
			sender: userName,
			timestamp: Date.now()
		});
		setChatInput("");
		if (activeModal === "stickers") setActiveModal(null);
	}
	async function handleChangeMode(newMode) {
		if (!isHost || isGameStarted) return;
		await update(ref(database, `mesas/${id}`), { mode: newMode });
		setActiveModal(null);
	}
	function handleInvite() {
		const url = window.location.href;
		if (navigator.share) navigator.share({
			title: "Lotería La Garza",
			text: `¡Únete a mi mesa de Lotería!`,
			url
		});
		else {
			navigator.clipboard.writeText(url);
			alert("Enlace copiado al portapapeles.");
		}
		setActiveModal(null);
	}
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandBackground, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-[100dvh] place-items-center text-white",
		children: "Cargando..."
	}) });
	if (!mesa || tablasActivas.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandBackground, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-[100dvh] place-items-center text-white",
		children: "Tablas no disponibles"
	}) });
	const timeSecs = speedFor(mesa.mode) / 1e3;
	const connectedPlayers = mesa.players ? Object.keys(mesa.players) : [mesa.host];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandBackground, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col min-h-[100dvh] font-sans relative overflow-hidden bg-white/5",
		children: [
			showTutorial && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm animate-pop-in px-6 pb-20",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mb-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-24 h-36 bg-white/20 rounded-xl shadow-2xl border-2 border-white/50 rotate-[-5deg] backdrop-blur-sm" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-0 flex items-center justify-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative animate-scratch-hand z-10 scale-125",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-7xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]",
									children: "👇"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinAnimation, { className: "absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 drop-shadow-md rotate-[-15deg]" })]
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-[color:var(--brand-gold)] font-black text-2xl uppercase tracking-widest mb-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]",
						children: "Ritual de Suerte"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-white font-bold text-lg leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center",
						children: [
							"Para marcar, presiona tu carta y",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[color:var(--brand-cyan)] text-2xl mt-1 block",
								children: "mueve de lado a lado"
							})
						]
					})
				]
			}),
			floatingMsg && !activeModal && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute top-32 left-1/2 -translate-x-1/2 z-40 bg-[color:var(--brand-navy)] px-4 py-2 rounded-2xl shadow-xl border border-[color:var(--brand-cyan)] animate-bounce text-white flex flex-col items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-bold text-[color:var(--brand-gold)] text-xs mb-1",
					children: [floatingMsg.sender, ":"]
				}), floatingMsg.isSticker ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: floatingMsg.text.replace("[STICKER:", "").replace("]", "").startsWith("/") ? floatingMsg.text.replace("[STICKER:", "").replace("]", "") : `/stickers/${floatingMsg.text.replace("[STICKER:", "").replace("]", "")}`,
					className: "w-24 h-24 object-contain",
					alt: "sticker"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: floatingMsg.text })]
			}),
			won && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-0 z-50 bg-[color:var(--brand-navy-deep)]/80 flex items-center justify-center p-6 backdrop-blur-sm",
				children: [settings.confetti && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 pointer-events-none bg-[url('https://cdn-icons-png.flaticon.com/512/1795/1795325.png')] bg-[length:50px] animate-confetti-fall opacity-40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-[color:var(--brand-navy)] p-6 rounded-3xl shadow-2xl text-center border-2 border-[color:var(--brand-gold)] w-full max-w-sm animate-pop-in relative z-10",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-5xl font-black text-[color:var(--brand-gold)] mb-2 drop-shadow-md",
							children: "¡Lotería!"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-white mb-6",
							children: "Has ganado la partida."
						}),
						isHost && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: restart,
							className: "w-full bg-[color:var(--brand-cyan)] text-[color:var(--brand-navy-deep)] font-black py-4 rounded-full mb-3 text-lg shadow-lg active:scale-95",
							children: "Jugar de nuevo"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => navigate({
								to: "/mesa/$id",
								params: { id: mesa.id }
							}),
							className: "w-full bg-white/10 text-white font-bold py-3 rounded-full text-lg hover:bg-white/20 active:scale-95",
							children: "Salir"
						})
					]
				})]
			}),
			activeModal && activeModal !== "menu" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-[2px]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `bg-white w-full max-w-md rounded-3xl overflow-hidden flex flex-col animate-pop-in shadow-2xl max-h-[85vh]`,
					children: [
						[
							"chat",
							"players",
							"tablas",
							"modos",
							"settings",
							"stickers"
						].includes(activeModal) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-[color:var(--brand-navy-deep)] p-4 flex items-center justify-between border-b border-white/10 shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-white font-bold text-lg capitalize",
								children: activeModal === "chat" ? "Chat de Mesa" : activeModal === "settings" ? "Configuración" : activeModal === "stickers" ? "Enviar Sticker" : activeModal
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setActiveModal(null),
								className: "text-white/50 hover:text-white",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-6 h-6" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "overflow-y-auto flex-1 bg-[color:var(--brand-navy)]",
							children: [
								activeModal === "settings" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col text-white font-medium p-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between p-4 border-b border-white/10",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-bold text-[color:var(--brand-cyan)]",
												children: "Audio"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-white/50",
												children: "Grita el nombre de las cartas"
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleSwitch, {
												checked: settings.audio,
												onChange: (v) => setSettings({
													...settings,
													audio: v
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between p-4 border-b border-white/10",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-bold text-[color:var(--brand-cyan)]",
												children: "Voz del gritón"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
												className: "text-xs text-white/70 bg-[color:var(--brand-navy-deep)] border border-white/10 rounded px-2 py-1 outline-none mt-1",
												value: settings.voice,
												onChange: (e) => setSettings({
													...settings,
													voice: e.target.value
												}),
												children: VOICES.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: v.id,
													children: v.name
												}, v.id))
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-lg border border-white/10",
												children: VOICES.find((v) => v.id === settings.voice)?.icon
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between p-4 border-b border-white/10",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-bold text-[color:var(--brand-cyan)]",
												children: "Efectos de sonido"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleSwitch, {
												checked: settings.effects,
												onChange: (v) => setSettings({
													...settings,
													effects: v
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between p-4 border-b border-white/10",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-bold text-[color:var(--brand-cyan)]",
												children: "Confetti"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-white/50",
												children: "Lluvia visual al ganar."
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleSwitch, {
												checked: settings.confetti,
												onChange: (v) => setSettings({
													...settings,
													confetti: v
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between p-4 border-b border-white/10",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-bold text-[color:var(--brand-cyan)]",
												children: "Vibración"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleSwitch, {
												checked: settings.vibration,
												onChange: (v) => setSettings({
													...settings,
													vibration: v
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between p-4",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-bold text-[color:var(--brand-cyan)]",
												children: "Vista de Tablas"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
												className: "bg-[color:var(--brand-navy-deep)] text-white/70 border border-white/10 rounded px-2 py-1 outline-none",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Rejilla" })
											})]
										})
									]
								}),
								activeModal === "stickers" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col h-[60vh] bg-[color:var(--brand-navy-deep)]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-around bg-[color:var(--brand-navy)] border-b border-white/10 font-bold text-white/50 shrink-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => setStickerTab("clasicos"),
												className: `py-3 px-4 border-b-2 transition-colors ${stickerTab === "clasicos" ? "border-[color:var(--brand-cyan)] text-[color:var(--brand-cyan)]" : "border-transparent hover:text-white"}`,
												children: "Clásicos"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => setStickerTab("gifs"),
												className: `py-3 px-4 border-b-2 transition-colors ${stickerTab === "gifs" ? "border-[color:var(--brand-cyan)] text-[color:var(--brand-cyan)]" : "border-transparent hover:text-white"}`,
												children: "GIFs"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => setStickerTab("cartas"),
												className: `py-3 px-4 border-b-2 transition-colors ${stickerTab === "cartas" ? "border-[color:var(--brand-cyan)] text-[color:var(--brand-cyan)]" : "border-transparent hover:text-white"}`,
												children: "Cartas"
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex-1 overflow-y-auto p-4 grid grid-cols-4 gap-4 auto-rows-max",
										children: [
											stickerTab === "clasicos" && Array.from({ length: 76 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => sendChat(`[STICKER:${i}.png]`),
												className: "aspect-square bg-white/5 hover:bg-white/20 rounded-xl transition-colors active:scale-95 flex items-center justify-center p-2 border border-white/10",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
													src: `/stickers/${i}.png`,
													className: "w-full h-full object-contain drop-shadow-sm",
													loading: "lazy",
													alt: `Sticker ${i}`
												})
											}, `clasico-${i}`)),
											stickerTab === "gifs" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => sendChat(`[STICKER:manoarriba.gif]`),
												className: "aspect-square bg-white/5 hover:bg-white/20 rounded-xl transition-colors active:scale-95 flex items-center justify-center p-2 border border-white/10",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
													src: `/stickers/manoarriba.gif`,
													className: "w-full h-full object-contain drop-shadow-sm",
													loading: "lazy",
													alt: "Mano Arriba"
												})
											}),
											stickerTab === "cartas" && DECK.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => sendChat(`[STICKER:${c.image}]`),
												className: "aspect-[1/1.55] bg-transparent hover:bg-white/10 rounded transition-colors active:scale-95 flex items-center justify-center p-1 border border-white/5",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
													src: c.image,
													className: "w-full h-full object-fill drop-shadow-md rounded-sm",
													loading: "lazy",
													alt: c.name
												})
											}, `carta-${c.n}`))
										]
									})]
								}),
								[
									"chat",
									"players",
									"tablas",
									"modos"
								].includes(activeModal) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-4 h-full min-h-[300px]",
									children: [
										activeModal === "players" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex flex-col gap-2",
											children: connectedPlayers.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between bg-white/10 p-3 rounded-xl border border-white/5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-white font-bold flex items-center gap-2",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "w-4 h-4 text-[color:var(--brand-cyan)]" }),
														" ",
														p
													]
												}), p === mesa.host && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[10px] bg-[color:var(--brand-gold)] text-black px-2 py-0.5 rounded-full font-bold",
													children: "ANFITRIÓN"
												})]
											}, p))
										}),
										activeModal === "chat" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col h-[400px]",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex-1 overflow-y-auto space-y-3 mb-4 pr-2 hide-scrollbar",
												children: [chatMsgs.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-white/50 text-center text-sm mt-10",
													children: "No hay mensajes aún."
												}), chatMsgs.map((msg) => {
													const isMe = msg.sender === userName;
													const isSticker = msg.text.startsWith("[STICKER:") && msg.text.endsWith("]");
													return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: `flex flex-col ${isMe ? "items-end" : "items-start"}`,
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-white/40 mb-0.5 px-1",
															children: msg.sender
														}), isSticker ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
															src: msg.text.replace("[STICKER:", "").replace("]", "").startsWith("/") ? msg.text.replace("[STICKER:", "").replace("]", "") : `/stickers/${msg.text.replace("[STICKER:", "").replace("]", "")}`,
															className: "w-20 h-20 object-contain drop-shadow-md"
														}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: `px-3 py-2 rounded-2xl max-w-[85%] text-sm shadow-sm ${isMe ? "bg-[color:var(--brand-cyan)] text-[color:var(--brand-navy-deep)] rounded-tr-none font-medium" : "bg-white/15 text-white rounded-tl-none border border-white/5"}`,
															children: msg.text
														})]
													}, msg.id);
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2 pt-3 border-t border-white/10",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "text",
													value: chatInput,
													onChange: (e) => setChatInput(e.target.value),
													onKeyDown: (e) => e.key === "Enter" && sendChat(chatInput),
													placeholder: "Mensaje...",
													className: "flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white text-sm outline-none focus:border-[color:var(--brand-cyan)]"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: () => sendChat(chatInput),
													className: "w-10 h-10 rounded-full bg-[color:var(--brand-cyan)] flex items-center justify-center text-[color:var(--brand-navy-deep)] shrink-0 active:scale-95",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "w-4 h-4" })
												})]
											})]
										}),
										activeModal === "tablas" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col gap-3",
											children: [isGameStarted && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[color:var(--brand-gold)] text-sm text-center mb-2 font-bold",
												children: "La partida ya inició. Aplica para la siguiente."
											}), loadTablas().map((t, idx) => {
												const isActiva = tablasActivas.some((act) => act.id === t.id);
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													onClick: () => {
														let newActive = [...tablasActivas];
														if (isActiva) newActive = newActive.filter((act) => act.id !== t.id);
														else if (newActive.length < mesa.perPlayer) newActive.push(t);
														if (newActive.length > 0) {
															setTablasActivas(newActive);
															setMarked(/* @__PURE__ */ new Set());
														}
													},
													className: `p-4 rounded-xl border text-left flex justify-between items-center transition-colors shadow-sm ${isActiva ? "bg-white/20 border-white" : "bg-white/5 border-white/10 hover:bg-white/10"}`,
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-white font-bold text-lg",
														children: [
															"Tabla ",
															idx + 1,
															" ",
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																className: "text-white/50 text-sm ml-2",
																children: [
																	"(",
																	t.size,
																	")"
																]
															})
														]
													}), isActiva && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[color:var(--brand-gold)] text-xs font-black uppercase tracking-wider",
														children: "Activa"
													})]
												}, t.id);
											})]
										}),
										activeModal === "modos" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex flex-col gap-3",
											children: !isHost ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-white/70 text-center font-bold",
												children: "Solo el anfitrión decide."
											}) : isGameStarted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[color:var(--brand-gold)] text-center font-bold",
												children: "Espera a que acabe la partida."
											}) : [
												"clasico",
												"relampago",
												"chorro",
												"lleno"
											].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												onClick: () => handleChangeMode(m),
												className: `p-4 rounded-xl border text-left capitalize transition-colors shadow-sm flex items-center justify-between ${mesa.mode === m ? "bg-[color:var(--brand-cyan)]/20 border-[color:var(--brand-cyan)]" : "bg-white/5 border-white/10 hover:bg-white/10"}`,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-white font-black text-lg",
													children: m
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-white/60 text-sm mt-0.5 font-medium",
													children: [
														"Cronómetro: ",
														speedFor(m) / 1e3,
														"s"
													]
												})] }), mesa.mode === m && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-3 h-3 bg-[color:var(--brand-cyan)] rounded-full shadow-[0_0_10px_var(--brand-cyan)]" })]
											}, m))
										})
									]
								})
							]
						}),
						(activeModal === "settings" || activeModal === "stickers") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-4 bg-[color:var(--brand-navy-deep)] flex justify-center border-t border-white/10 shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setActiveModal(null),
								className: `w-3/4 py-3 rounded-full text-white font-black shadow-md active:scale-95 transition-colors ${activeModal === "settings" ? "bg-[color:var(--brand-cyan)] text-[color:var(--brand-navy-deep)]" : "bg-white/10 hover:bg-white/20"}`,
								children: activeModal === "settings" ? "Cerrar" : "Cancelar"
							})
						})
					]
				})
			}),
			activeModal === "menu" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-40 bg-transparent",
				onClick: () => setActiveModal(null)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute top-14 right-2 z-50 bg-[color:var(--brand-navy-deep)] rounded-xl shadow-2xl py-2 w-56 border border-white/10 animate-slide-up-soft origin-top-right",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							restart();
							setActiveModal(null);
						},
						className: "w-full text-left px-4 py-3 hover:bg-white/10 flex items-center gap-3 text-white font-bold border-b border-white/5 transition-colors",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "w-5 h-5 text-[color:var(--brand-gold)]" }), " Nueva partida"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: handleInvite,
						className: "w-full text-left px-4 py-3 hover:bg-white/10 flex items-center gap-3 text-white font-bold border-b border-white/5 transition-colors",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, { className: "w-5 h-5 text-[color:var(--brand-cyan)]" }), " Invitar amigos"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							setActiveModal(null);
						},
						className: "w-full text-left px-4 py-3 hover:bg-white/10 flex items-center gap-3 text-white/80 font-bold border-b border-white/5 transition-colors",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pen, { className: "w-5 h-5 text-white/50" }), " Marcador"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							setActiveModal(null);
						},
						className: "w-full text-left px-4 py-3 hover:bg-white/10 flex items-center gap-3 text-white/80 font-bold border-b border-white/5 transition-colors",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "w-5 h-5 text-[color:var(--brand-gold)] opacity-70" }), " Ganadores"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							setActiveModal(null);
						},
						className: "w-full text-left px-4 py-3 hover:bg-white/10 flex items-center gap-3 text-white/80 font-bold transition-colors",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "w-5 h-5 text-[color:var(--brand-cyan)] opacity-70" }), " Info de la mesa"]
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "h-14 bg-[color:var(--brand-navy-deep)] flex items-center justify-between px-3 shrink-0 z-30 relative shadow-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": true,
						className: "absolute inset-x-0 bottom-0 h-1.5 sarape-band animate-sarape-slide"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => navigate({
							to: "/mesa/$id",
							params: { id: mesa.id }
						}),
						className: "p-2 -ml-2 text-white/80 active:scale-95 hover:text-white transition",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {
							className: "w-6 h-6",
							strokeWidth: 2.5
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-4 text-[color:var(--brand-cyan)]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: isHost ? restart : void 0,
								className: "active:scale-95 hover:text-white transition hidden sm:block",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {
									className: "w-6 h-6",
									strokeWidth: 2.5
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setActiveModal("players"),
								className: "active:scale-95 hover:text-white transition relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {
									className: "w-6 h-6",
									strokeWidth: 2.5
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "absolute -top-1.5 -right-2 bg-[color:var(--brand-pink)] text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-[color:var(--brand-navy-deep)]",
									children: connectedPlayers.length
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setActiveModal("settings"),
								className: "active:scale-95 hover:text-white transition",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, {
									className: "w-6 h-6",
									strokeWidth: 2.5
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setActiveModal("chat"),
								className: "relative active:scale-95 hover:text-white transition",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, {
									className: "w-6 h-6",
									strokeWidth: 2.5
								}), chatMsgs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "absolute -top-1 -right-1 bg-[color:var(--brand-pink)] flex items-center justify-center text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 border-2 border-[color:var(--brand-navy-deep)]",
									children: chatMsgs.length > 9 ? "9+" : chatMsgs.length
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setActiveModal(activeModal === "menu" ? null : "menu"),
								className: "active:scale-95 hover:text-white transition",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, {
									className: "w-6 h-6",
									strokeWidth: 2.5
								})
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "h-12 bg-[color:var(--brand-navy)] flex items-center px-2 gap-2 overflow-x-auto shrink-0 z-30 relative shadow-md border-b border-white/5 hide-scrollbar",
				children: [
					[
						"¡Espera!",
						"¡Estoy listo!",
						"¡Ok!",
						"¡Continúa!"
					].map((txt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => sendChat(txt),
						className: "whitespace-nowrap px-3 py-1.5 bg-[color:var(--brand-cyan)] text-[color:var(--brand-navy-deep)] text-xs font-bold rounded shadow-sm active:scale-95 transition-transform",
						children: txt
					}, txt)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => sendChat("❤️"),
						className: "p-1.5 shrink-0 active:scale-95",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "w-5 h-5 text-[color:var(--brand-pink)] fill-[color:var(--brand-pink)]" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setActiveModal("stickers"),
						className: "p-1.5 shrink-0 active:scale-95 bg-white/10 rounded shadow-sm border border-white/10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: "w-4 h-4 text-white" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-[72px] bg-black/20 shrink-0 border-b border-white/5 p-2 overflow-y-auto flex flex-col-reverse shadow-inner relative z-20",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-1 w-full max-w-[800px] mx-auto",
					children: [chatMsgs.slice(-5).map((msg, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-[11px] leading-tight animate-fade-in-right",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-bold text-[color:var(--brand-cyan)]",
							children: [msg.sender, ": "]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-white/90",
							children: msg.text
						})]
					}, idx)), chatMsgs.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] text-white/30 italic text-center w-full mt-4",
						children: "No hay mensajes aún"
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute right-2 top-[180px] z-20 w-[64px] h-[96px] bg-white/10 p-1 rounded-lg shadow-2xl border border-white/20 transform rotate-2 backdrop-blur-md",
				children: drawn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: drawn.image,
					alt: drawn.name,
					className: "w-full h-full object-fill animate-pop-in rounded-md"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-full h-full bg-red-600 rounded-md border border-red-800 flex flex-col items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1 relative p-4 pt-8 pb-32 flex justify-center items-center overflow-y-auto z-10 w-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-full h-full flex flex-col items-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `grid gap-2 w-full max-w-[800px] h-fit place-items-center mx-auto ${tablasActivas.length === 1 ? "grid-cols-1 max-w-[360px]" : "grid-cols-2"}`,
						children: tablasActivas.map((tablaItem) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-white/10 p-1.5 sm:p-2 rounded-2xl shadow-2xl backdrop-blur-md w-full max-w-[360px] h-fit border border-white/20 relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "absolute -top-3 left-1/2 -translate-x-1/2 bg-[color:var(--brand-navy-deep)] px-3 py-0.5 rounded-full border border-[color:var(--brand-cyan)]/30 text-[10px] text-[color:var(--brand-cyan)] font-bold tracking-widest shadow-md",
								children: ["TABLA ", tablaItem.id.slice(0, 4).toUpperCase()]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid gap-[2px] bg-white/20 border-2 border-white/10 rounded-xl overflow-hidden mt-1",
								style: { gridTemplateColumns: `repeat(${tablaItem.size === "4x4" ? 4 : 5}, minmax(0, 1fr))` },
								children: tablaItem.cards.map((c, idx) => {
									const card = getCard(c);
									const isMarked = marked.has(c);
									const uid = `${tablaItem.id}-${c}-${idx}`;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onPointerDown: (e) => handlePointerDown(e, c),
										onPointerMove: (e) => handlePointerMove(e, c),
										onPointerUp: (e) => handlePointerUp(e, c),
										onPointerCancel: (e) => handlePointerUp(e, c),
										className: "relative aspect-[1/1.55] bg-white w-full overflow-hidden active:scale-95 transition-transform touch-none select-none",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
												src: card?.image,
												alt: card?.name ?? `Carta ${c}`,
												className: "w-full h-full object-fill pointer-events-none",
												draggable: false
											}),
											isMarked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-[1px] pointer-events-none",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
													src: settings.marker,
													alt: "Frijol",
													className: "w-10 h-10 object-contain drop-shadow-lg animate-pop-in",
													draggable: false
												})
											}),
											interaction?.cardId === c && interaction.isScratching && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "absolute z-20 pointer-events-none drop-shadow-2xl flex flex-col items-center justify-center animate-scratch-hand",
												style: {
													left: interaction.curX,
													top: interaction.curY
												},
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "relative flex items-center justify-center",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinAnimation, { className: "w-12 h-12 drop-shadow-lg z-10" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[40px] absolute top-3 left-4 z-20 drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)]",
														children: "🤏🏽"
													})]
												})
											})
										]
									}, uid);
								})
							})]
						}, tablaItem.id))
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-[color:var(--brand-navy-deep)] py-3 px-4 flex justify-between gap-4 border-t border-white/10 shrink-0 z-30 relative shadow-2xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setActiveModal("tablas"),
					className: "flex-1 py-2.5 rounded-full border-2 border-white/20 text-white font-bold text-sm flex items-center justify-center gap-2 active:bg-white/10 transition-colors",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {
						className: "w-4 h-4",
						strokeWidth: 2.5
					}), " Cambiar Tablas"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setActiveModal("modos"),
					className: "flex-1 py-2.5 rounded-full border-2 border-[color:var(--brand-cyan)] text-[color:var(--brand-cyan)] font-bold text-sm flex items-center justify-center gap-2 active:bg-[color:var(--brand-cyan)]/10 transition-colors",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Triangle, {
						className: "w-4 h-4 rotate-90",
						strokeWidth: 2.5
					}), " Cambiar Modo"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-[color:var(--brand-navy)] px-4 py-3 flex items-center gap-3 shrink-0 z-30 border-t border-white/10 relative shadow-inner",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5 bg-white/10 px-3 py-2.5 rounded-full border border-white/20 shadow-sm shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timer, { className: "w-4 h-4 text-white/80" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-extrabold text-sm text-white",
							children: [timeSecs, "s"]
						})]
					}),
					isHost ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setPaused(!paused),
						className: "bg-[color:var(--brand-cyan)] w-[42px] h-[42px] shrink-0 rounded-full flex items-center justify-center shadow-inner border border-[color:var(--brand-cyan)] active:scale-95 transition-transform",
						children: paused ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "w-5 h-5 text-[color:var(--brand-navy-deep)] fill-[color:var(--brand-navy-deep)] ml-1" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "w-5 h-5 text-[color:var(--brand-navy-deep)] fill-[color:var(--brand-navy-deep)]" })
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "bg-white/5 w-[42px] h-[42px] shrink-0 rounded-full flex items-center justify-center border border-white/10 opacity-50",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "w-5 h-5 text-white/40 fill-white/40 ml-1" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: isHost ? drawNext : void 0,
						disabled: won || drawnIdx >= deck.length - 1,
						className: `flex-1 text-[color:var(--brand-navy-deep)] font-extrabold py-3 rounded-full shadow-md text-sm sm:text-base tracking-wide transition-transform ${!isHost ? "bg-white/20 text-white/50 cursor-not-allowed" : "bg-[color:var(--brand-gold)] active:scale-95"}`,
						children: isHost ? drawnIdx < 0 ? "INICIAR" : "Corre y se va corriendo" : "Esperando al anfitrión"
					})
				]
			})
		]
	}) });
}
//#endregion
export { JugarPage as component };
