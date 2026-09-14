import { r as __toESM } from "../_runtime.mjs";
import { n as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as BrandBackground } from "./BrandBackground-r8YRdigP.mjs";
import { t as PapelPicado } from "./Fiesta-DvkXsMDG.mjs";
import { n as getCard } from "./deck-9k1yKny1.mjs";
import { a as ref, i as push, o as set } from "../_libs/@firebase/database+[...].mjs";
import "../_libs/firebase.mjs";
import { t as database } from "./firebase-BY-4v7ot.mjs";
import { g as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as LayoutGrid, D as Lock, H as CirclePlus, J as Check, O as LockOpen, R as Eye, W as CircleAlert, X as ArrowLeft, Y as ArrowRight, a as Trophy, c as Timer, r as Users, t as Zap, u as Sparkles, w as PartyPopper, z as EyeOff } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/abrir-mesa-Bkz_fEiH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TABLAS_KEY = "garza:tablas";
var NAME_KEY = "garza:name";
function loadTablas() {
	try {
		const raw = localStorage.getItem(TABLAS_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}
function randomCards(size) {
	const total = size === "4x4" ? 16 : 25;
	const pool = Array.from({ length: 54 }, (_, i) => i + 1);
	for (let i = pool.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[pool[i], pool[j]] = [pool[j], pool[i]];
	}
	return pool.slice(0, total);
}
var STEPS = [
	"Nombre",
	"Modo",
	"Tablas",
	"Acceso",
	"Elegir"
];
var MODES = [
	{
		id: "clasico",
		label: "Clásico",
		hint: "Cuatro en línea, columna, fila o diagonal.",
		icon: Trophy,
		gradient: "var(--gradient-card-cyan)"
	},
	{
		id: "relampago",
		label: "Relámpago",
		hint: "Ronda rápida, cartas más veloces.",
		icon: Zap,
		gradient: "var(--gradient-card-pink)"
	},
	{
		id: "chorro",
		label: "Chorro",
		hint: "Cuatro esquinas para ganar.",
		icon: Sparkles,
		gradient: "var(--gradient-card-gold)"
	},
	{
		id: "lleno",
		label: "Tabla llena",
		hint: "Rellena toda la tabla para ganar.",
		icon: LayoutGrid,
		gradient: "var(--gradient-card-teal)"
	}
];
function AbrirMesaPage() {
	const navigate = useNavigate();
	const [step, setStep] = (0, import_react.useState)(0);
	const [name, setName] = (0, import_react.useState)("");
	const [mode, setMode] = (0, import_react.useState)("clasico");
	const [size, setSize] = (0, import_react.useState)("4x4");
	const [perPlayer, setPerPlayer] = (0, import_react.useState)(2);
	const [locked, setLocked] = (0, import_react.useState)(false);
	const [password, setPassword] = (0, import_react.useState)("");
	const [showPwd, setShowPwd] = (0, import_react.useState)(false);
	const [selected, setSelected] = (0, import_react.useState)([]);
	const [tablas, setTablas] = (0, import_react.useState)([]);
	const [hostName, setHostName] = (0, import_react.useState)("");
	const [createdMesa, setCreatedMesa] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setTablas(loadTablas());
		try {
			setHostName(localStorage.getItem(NAME_KEY) ?? "");
		} catch {}
	}, []);
	const filteredTablas = (0, import_react.useMemo)(() => tablas.filter((t) => t.size === size), [tablas, size]);
	const canNext = (0, import_react.useMemo)(() => {
		if (step === 0) return name.trim().length >= 2;
		if (step === 3) return !locked || password.trim().length >= 3;
		if (step === 4) return selected.length === perPlayer;
		return true;
	}, [
		step,
		name,
		locked,
		password,
		selected,
		perPlayer
	]);
	function addTabla() {
		const updated = [{
			id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36),
			size,
			cards: randomCards(size),
			createdAt: Date.now()
		}, ...tablas];
		setTablas(updated);
		try {
			localStorage.setItem(TABLAS_KEY, JSON.stringify(updated));
		} catch {}
	}
	function next() {
		if (!canNext) return;
		if (step < STEPS.length - 1) setStep(step + 1);
		else finish();
	}
	function back() {
		if (step === 0) navigate({ to: "/menu" });
		else setStep(step - 1);
	}
	async function finish() {
		if (selected.length !== perPlayer) {
			setError(`Selecciona ${perPlayer} tabla${perPlayer === 1 ? "" : "s"} para continuar.`);
			return;
		}
		if (selected.map((id) => tablas.find((t) => t.id === id)).filter((t) => Boolean(t)).length !== perPlayer) {
			setError("Alguna tabla ya no existe. Vuelve al paso anterior.");
			return;
		}
		try {
			const newMesaRef = push(ref(database, "mesas"));
			const mesaId = newMesaRef.key;
			if (!mesaId) throw new Error("No key generated");
			const mesa = {
				id: mesaId,
				name: name.trim(),
				mode,
				size,
				perPlayer,
				locked,
				password: locked ? password : "",
				tablaIds: selected,
				host: hostName || "Anfitrión",
				players: hostName ? [{
					name: hostName,
					role: "host"
				}] : [],
				status: "abierta",
				createdAt: Date.now()
			};
			await set(newMesaRef, mesa);
			setError("");
			setCreatedMesa({
				id: mesa.id,
				name: mesa.name
			});
		} catch (err) {
			console.error(err);
			setError("No se pudo conectar con el servidor para guardar la mesa.");
		}
	}
	function toggleSelect(id) {
		setSelected((prev) => {
			if (prev.includes(id)) return prev.filter((x) => x !== id);
			if (prev.length >= perPlayer) return [...prev.slice(1), id];
			return [...prev, id];
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BrandBackground, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PapelPicado, { count: 7 }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "relative z-30 flex items-center justify-between gap-3 px-4 pt-16",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Volver",
					onClick: back,
					className: "grid h-11 w-11 place-items-center rounded-2xl bg-white/10 ring-1 ring-[color:var(--brand-gold)]/40 backdrop-blur transition hover:bg-white/20 active:scale-95",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-5 w-5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center leading-tight",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-[11px] uppercase tracking-[0.3em] text-[color:var(--brand-gold)]",
						children: [
							"Paso ",
							step + 1,
							" de ",
							STEPS.length
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "text-lg font-black uppercase tracking-wide drop-shadow-[0_3px_0_rgba(0,0,0,0.35)]",
						children: [
							STEPS[step],
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[color:var(--brand-cyan)]",
								children: "·"
							}),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-white/80",
								children: "Abrir mesa"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-11 w-11" })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative z-10 mx-auto mt-4 flex w-full max-w-md items-center gap-1 px-5",
			children: STEPS.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "h-1.5 flex-1 overflow-hidden rounded-full bg-white/15",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block h-full rounded-full transition-all duration-500",
					style: {
						width: i <= step ? "100%" : "0%",
						background: "var(--gradient-brand)"
					}
				})
			}, i))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "relative z-10 mx-auto w-full max-w-md px-5 pb-32 pt-6",
			children: [
				step === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepName, {
					name,
					onChange: setName
				}),
				step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepMode, {
					mode,
					onChange: setMode
				}),
				step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepTablas, {
					size,
					onSize: setSize,
					perPlayer,
					onPerPlayer: setPerPlayer
				}),
				step === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepAccess, {
					locked,
					onLocked: setLocked,
					password,
					onPassword: setPassword,
					showPwd,
					onShowPwd: setShowPwd
				}),
				step === 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepSelectTablas, {
					tablas: filteredTablas,
					perPlayer,
					selected,
					onToggle: toggleSelect,
					size,
					onGoTablas: addTabla
				}),
				step === 4 && error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex items-start gap-2 rounded-2xl bg-[color:var(--brand-pink)/.15] px-4 py-3 text-sm text-white ring-1 ring-[color:var(--brand-pink)/.4]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "mt-0.5 h-4 w-4 shrink-0 text-[color:var(--brand-pink)]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: error })]
				})
			]
		}),
		createdMesa && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuccessOverlay, {
			mesaName: createdMesa.name,
			host: hostName || "Anfitrión",
			onGoMesa: () => navigate({
				to: "/mesa/$id",
				params: { id: createdMesa.id }
			}),
			onClose: () => navigate({ to: "/menu" })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[oklch(0.10_0.09_262)/.85] px-5 pb-5 pt-3 backdrop-blur-xl",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex w-full max-w-md items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: back,
					className: "h-12 flex-1 rounded-full bg-white/10 text-sm font-semibold text-white/85 ring-1 ring-white/15 transition hover:bg-white/15 active:scale-[0.98]",
					children: step === 0 ? "Cancelar" : "Atrás"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: next,
					disabled: !canNext,
					className: "flex h-12 flex-[1.4] items-center justify-center gap-2 rounded-full text-sm font-bold text-white shadow-[var(--shadow-card)] ring-1 ring-white/25 transition hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0",
					style: { background: "var(--gradient-brand)" },
					children: step === STEPS.length - 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }), " Crear mesa"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Continuar ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })] })
				})]
			})
		})
	] });
}
function SuccessOverlay({ mesaName, host, onClose, onGoMesa }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-40 grid place-items-center bg-[oklch(0.08_0.09_262)/.75] px-6 backdrop-blur-md",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "animate-slide-up-soft w-full max-w-sm overflow-hidden rounded-3xl bg-white/10 p-6 text-center ring-1 ring-white/20 shadow-[var(--shadow-card)] backdrop-blur-xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl text-white shadow-[var(--shadow-card)]",
					style: { background: "var(--gradient-brand)" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartyPopper, { className: "h-7 w-7" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-lg font-extrabold text-white",
					children: "¡Mesa creada!"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-white/75",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold text-white",
							children: mesaName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						"Anfitrión: ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[color:var(--brand-cyan)]",
							children: host
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onGoMesa,
					className: "mt-5 h-12 w-full rounded-full text-sm font-bold text-white shadow-[var(--shadow-card)] ring-1 ring-white/25 transition hover:-translate-y-0.5 active:scale-[0.98]",
					style: { background: "var(--gradient-brand)" },
					children: "Entrar a la mesa"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					className: "mt-2 h-11 w-full rounded-full text-sm font-semibold text-white/80 ring-1 ring-white/15 transition hover:bg-white/10",
					children: "Ir al menú"
				})
			]
		})
	});
}
function StepName({ name, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "animate-slide-up-soft",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
				icon: Users,
				title: "Nombre de la mesa",
				hint: "Cómo verán los demás jugadores tu partida."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 rounded-3xl bg-white/10 p-1 ring-1 ring-white/15 backdrop-blur",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: name,
					onChange: (e) => onChange(e.target.value),
					maxLength: 28,
					placeholder: "Ej. La mesa de los compas",
					className: "h-14 w-full rounded-[22px] bg-transparent px-5 text-base font-semibold text-white placeholder:text-white/40 focus:outline-none"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex justify-end px-1 text-[11px] text-white/50",
				children: [name.length, "/28"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid grid-cols-2 gap-3",
				children: [
					"Sábado en familia",
					"Reto rápido",
					"Con los primos",
					"Cumpleaños"
				].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => onChange(s),
					className: "rounded-2xl bg-white/5 px-3 py-3 text-left text-xs font-medium text-white/80 ring-1 ring-white/10 transition hover:bg-white/10",
					children: s
				}, s))
			})
		]
	});
}
function StepMode({ mode, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "animate-slide-up-soft",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
			icon: Timer,
			title: "Modo de juego",
			hint: "Elige cómo se decide el ganador."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 space-y-3",
			children: MODES.map((m) => {
				const Icon = m.icon;
				const active = m.id === mode;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onChange(m.id),
					className: `relative flex w-full items-center gap-4 overflow-hidden rounded-2xl px-3 py-3 text-left ring-1 transition ${active ? "ring-white/60 shadow-[var(--shadow-card)]" : "ring-white/10 bg-white/5 hover:bg-white/10"}`,
					style: active ? { background: m.gradient } : void 0,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `grid h-12 w-12 shrink-0 place-items-center rounded-full ring-2 ${active ? "bg-white/95 text-[color:var(--brand-navy-deep)] ring-white/60" : "bg-white/10 text-white ring-white/20"}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `text-[15px] font-bold ${active ? "text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]" : "text-white"}`,
								children: m.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `text-[12px] ${active ? "text-white/85" : "text-white/60"}`,
								children: m.hint
							})]
						}),
						active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid h-8 w-8 place-items-center rounded-full bg-white/95 text-[color:var(--brand-navy-deep)]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
						})
					]
				}, m.id);
			})
		})]
	});
}
function StepTablas({ size, onSize, perPlayer, onPerPlayer }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "animate-slide-up-soft",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
				icon: LayoutGrid,
				title: "Tablas por jugador",
				hint: "Tamaño de la tabla y cuántas repartir."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 relative flex h-12 items-center rounded-full bg-white/10 p-1 ring-1 ring-white/15 backdrop-blur",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"aria-hidden": true,
					className: "absolute top-1 bottom-1 left-1 right-1 rounded-full transition-all duration-300",
					style: {
						background: "var(--gradient-brand)",
						boxShadow: "0 8px 20px -8px rgba(0,0,0,0.5)"
					}
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative z-10 flex-1 text-center text-sm font-bold text-white",
					children: "4x4 (16 cartas)"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 rounded-3xl bg-white/5 p-5 ring-1 ring-white/10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-baseline justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-semibold text-white/80",
						children: "Tablas por jugador"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-3xl font-extrabold text-white",
						children: perPlayer
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => onPerPlayer(Math.max(1, perPlayer - 1)),
							className: "h-11 w-11 rounded-full bg-white/10 text-lg font-bold text-white ring-1 ring-white/15 transition hover:bg-white/20 active:scale-95",
							children: "−"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-2 rounded-full bg-white/10" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "absolute inset-y-0 left-0 h-2 rounded-full",
									style: {
										width: `${(perPlayer - 1) / 5 * 100}%`,
										background: "var(--gradient-brand)"
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 flex justify-between text-[10px] text-white/50",
									children: [
										1,
										2,
										3,
										4,
										5,
										6
									].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: n }, n))
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => onPerPlayer(Math.min(6, perPlayer + 1)),
							className: "h-11 w-11 rounded-full bg-white/10 text-lg font-bold text-white ring-1 ring-white/15 transition hover:bg-white/20 active:scale-95",
							children: "+"
						})
					]
				})]
			})
		]
	});
}
function StepAccess({ locked, onLocked, password, onPassword, showPwd, onShowPwd }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "animate-slide-up-soft",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
				icon: Lock,
				title: "Acceso a la mesa",
				hint: "Elige quién puede entrar."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccessOption, {
					active: !locked,
					onClick: () => onLocked(false),
					icon: LockOpen,
					label: "Pública",
					hint: "Cualquiera puede unirse."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccessOption, {
					active: locked,
					onClick: () => onLocked(true),
					icon: Lock,
					label: "Privada",
					hint: "Requiere contraseña."
				})]
			}),
			locked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 rounded-3xl bg-white/10 p-1 ring-1 ring-white/15 backdrop-blur animate-slide-up-soft",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: password,
						onChange: (e) => onPassword(e.target.value),
						type: showPwd ? "text" : "password",
						maxLength: 16,
						placeholder: "Contraseña de la mesa",
						className: "h-14 w-full rounded-[22px] bg-transparent px-5 pr-14 text-base font-semibold text-white placeholder:text-white/40 focus:outline-none"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": showPwd ? "Ocultar" : "Mostrar",
						onClick: () => onShowPwd(!showPwd),
						className: "absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white/80 ring-1 ring-white/15 hover:bg-white/20",
						children: showPwd ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4" })
					})]
				})
			})
		]
	});
}
function AccessOption({ active, onClick, icon: Icon, label, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: `relative overflow-hidden rounded-2xl px-4 py-4 text-left ring-1 transition ${active ? "ring-white/60 shadow-[var(--shadow-card)]" : "ring-white/10 bg-white/5 hover:bg-white/10"}`,
		style: active ? { background: "var(--gradient-brand)" } : void 0,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: `grid h-10 w-10 place-items-center rounded-full ${active ? "bg-white/95 text-[color:var(--brand-navy-deep)]" : "bg-white/10 text-white"}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 text-[15px] font-bold text-white",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `text-[11px] ${active ? "text-white/85" : "text-white/55"}`,
				children: hint
			})
		]
	});
}
function StepSelectTablas({ tablas, perPlayer, selected, onToggle, size, onGoTablas }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "animate-slide-up-soft",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
				icon: LayoutGrid,
				title: "Selecciona tus tablas",
				hint: `Elige ${perPlayer} tabla${perPlayer === 1 ? "" : "s"} de ${size}.`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-center justify-between px-1 text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-white/70",
					children: [
						"Seleccionadas",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-bold text-white",
							children: [
								selected.length,
								"/",
								perPlayer
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onGoTablas,
					className: "inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 font-semibold text-white/85 ring-1 ring-white/15 hover:bg-white/20",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CirclePlus, { className: "h-3.5 w-3.5" }), " Nueva"]
				})]
			}),
			tablas.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-col items-center rounded-3xl bg-white/5 px-6 py-10 text-center ring-1 ring-white/10 backdrop-blur",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-4 grid h-16 w-16 place-items-center rounded-2xl text-white shadow-lg",
						style: { background: "var(--gradient-brand)" },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "h-7 w-7" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "text-base font-bold",
						children: ["No tienes tablas ", size]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-white/70",
						children: [
							"Crea al menos ",
							perPlayer,
							" para continuar."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: onGoTablas,
						className: "mt-4 flex h-11 items-center gap-2 rounded-full px-5 text-sm font-bold text-white shadow-[var(--shadow-card)]",
						style: { background: "var(--gradient-card-pink)" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CirclePlus, { className: "h-4 w-4" }), " Crear tabla"]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid grid-cols-2 gap-3",
				children: tablas.map((t) => {
					const active = selected.includes(t.id);
					const order = selected.indexOf(t.id) + 1;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onToggle(t.id),
						className: `relative overflow-hidden rounded-2xl p-2 text-left ring-1 transition ${active ? "ring-[color:var(--brand-cyan)] shadow-[0_18px_32px_-12px_rgba(0,0,0,0.55)]" : "ring-white/20 bg-white/95 hover:-translate-y-0.5"}`,
						style: active ? { background: "var(--gradient-brand)" } : void 0,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniGrid, {
							cards: t.cards,
							size: t.size
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex items-center justify-between px-1 text-[11px] font-semibold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: active ? "text-white" : "text-[color:var(--brand-navy-dark)]",
								children: t.size
							}), active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid h-6 w-6 place-items-center rounded-full bg-white text-[color:var(--brand-navy-deep)]",
								children: order
							})]
						})]
					}, t.id);
				})
			})
		]
	});
}
function MiniGrid({ cards, size }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-[3px] overflow-hidden rounded-xl",
		style: { gridTemplateColumns: `repeat(${size === "4x4" ? 4 : 5}, minmax(0, 1fr))` },
		children: cards.map((n, i) => {
			const card = getCard(n);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative aspect-[3/4] overflow-hidden rounded-md",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: card?.image,
					alt: card?.name ?? `Carta ${n}`,
					loading: "lazy",
					className: "h-full w-full object-cover"
				})
			}, i);
		})
	});
}
function SectionTitle({ icon: Icon, title, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white shadow-[var(--shadow-card)]",
			style: { background: "var(--gradient-brand)" },
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-lg font-extrabold text-white",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-white/65",
			children: hint
		})] })]
	});
}
//#endregion
export { AbrirMesaPage as component };
