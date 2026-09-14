import { r as __toESM } from "../_runtime.mjs";
import { n as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as BrandBackground } from "./BrandBackground-r8YRdigP.mjs";
import { t as PapelPicado } from "./Fiesta-DvkXsMDG.mjs";
import { n as getCard } from "./deck-9k1yKny1.mjs";
import { a as ref, r as onValue, s as update } from "../_libs/@firebase/database+[...].mjs";
import "../_libs/firebase.mjs";
import { t as database } from "./firebase-BY-4v7ot.mjs";
import { g as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as LayoutGrid, B as Crown, D as Lock, J as Check, O as LockOpen, V as Copy, X as ArrowLeft, a as Trophy, b as Play, c as Timer, f as Share2, r as Users, t as Zap, u as Sparkles } from "../_libs/lucide-react.mjs";
import { t as Route } from "./mesa._id.index-CNmuHe_m.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mesa._id.index-yCD5DAoz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TABLAS_KEY = "garza:tablas";
var MODE_META = {
	clasico: {
		label: "Clásico",
		hint: "Cuatro en línea",
		icon: Trophy
	},
	relampago: {
		label: "Relámpago",
		hint: "Ronda rápida",
		icon: Zap
	},
	chorro: {
		label: "Chorro",
		hint: "Cuatro esquinas",
		icon: Sparkles
	},
	lleno: {
		label: "Tabla llena",
		hint: "Toda la tabla",
		icon: LayoutGrid
	}
};
var STATUS_META = {
	abierta: {
		label: "Abierta",
		color: "var(--brand-cyan)"
	},
	"en-juego": {
		label: "En juego",
		color: "var(--brand-gold)"
	},
	terminada: {
		label: "Terminada",
		color: "var(--brand-pink)"
	}
};
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
function MesaPage() {
	const { id } = Route.useParams();
	const navigate = useNavigate();
	const [mesa, setMesa] = (0, import_react.useState)(null);
	const [tablas, setTablas] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [copied, setCopied] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setTablas(loadTablas());
		const unsubscribe = onValue(ref(database, `mesas/${id}`), (snapshot) => {
			const data = snapshot.val();
			if (data) {
				if (!data.players) data.players = [];
				setMesa(data);
			} else setMesa(null);
			setLoading(false);
		});
		return () => unsubscribe();
	}, [id]);
	const mesaTablas = (0, import_react.useMemo)(() => {
		if (!mesa) return [];
		return mesa.tablaIds.map((tid) => tablas.find((t) => t.id === tid)).filter((t) => Boolean(t));
	}, [mesa, tablas]);
	function copyCode() {
		if (!mesa) return;
		const code = mesa.id.slice(0, 6).toUpperCase();
		try {
			navigator.clipboard.writeText(code);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch {}
	}
	async function startGame() {
		if (!mesa) return;
		try {
			await update(ref(database, `mesas/${id}`), { status: "en-juego" });
			navigate({
				to: "/mesa/$id/jugar",
				params: { id: mesa.id }
			});
		} catch (e) {
			console.error(e);
		}
	}
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandBackground, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center text-white/70",
		children: "Cargando…"
	}) });
	if (!mesa) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandBackground, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid h-16 w-16 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "h-7 w-7 text-white/70" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-4 text-xl font-extrabold text-white",
				children: "Mesa no encontrada"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-white/70",
				children: "Es posible que haya sido eliminada."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/menu",
				className: "mt-6 inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-bold text-white shadow-[var(--shadow-card)] ring-1 ring-white/25",
				style: { background: "var(--gradient-brand)" },
				children: "Volver al menú"
			})
		]
	}) });
	const ModeIcon = MODE_META[mesa.mode].icon;
	const status = STATUS_META[mesa.status];
	const code = mesa.id.slice(0, 6).toUpperCase();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BrandBackground, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PapelPicado, { count: 7 }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "relative z-30 flex items-center justify-between gap-3 px-4 pt-16",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Volver",
					onClick: () => navigate({ to: "/menu" }),
					className: "grid h-11 w-11 place-items-center rounded-2xl bg-white/10 ring-1 ring-[color:var(--brand-gold)]/40 backdrop-blur transition hover:bg-white/20 active:scale-95",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-5 w-5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white ring-1 ring-[color:var(--brand-gold)]/40 backdrop-blur",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "h-2 w-2 rounded-full animate-pulse",
						style: { background: status.color }
					}), status.label]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-11 w-11" })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "relative z-10 mx-auto w-full max-w-md px-5 pb-32 pt-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "animate-slide-up-soft relative overflow-hidden rounded-3xl p-5 text-white shadow-[var(--shadow-card)] ring-1 ring-white/15",
					style: { background: "var(--gradient-brand)" },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] uppercase tracking-[0.22em] text-white/60",
									children: "Mesa"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "mt-1 truncate text-2xl font-extrabold",
									children: mesa.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex items-center gap-2 text-xs text-white/75",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, { className: "h-3.5 w-3.5 text-[color:var(--brand-gold)]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: mesa.host })]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-12 w-12 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModeIcon, { className: "h-5 w-5" })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 grid grid-cols-3 gap-2 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Modo",
								value: MODE_META[mesa.mode].label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Tabla",
								value: mesa.size
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Por jug.",
								value: String(mesa.perPlayer)
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "animate-slide-up-soft mt-4 flex items-center gap-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-11 w-11 place-items-center rounded-full bg-white/10 ring-1 ring-white/15",
							children: mesa.locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-4 w-4 text-[color:var(--brand-gold)]" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockOpen, { className: "h-4 w-4 text-[color:var(--brand-cyan)]" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] uppercase tracking-wider text-white/50",
								children: mesa.locked ? "Mesa privada" : "Mesa pública"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-lg font-extrabold tracking-[0.2em] text-white",
								children: code
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: copyCode,
							className: "grid h-11 w-11 place-items-center rounded-full bg-white/10 ring-1 ring-white/15 transition hover:bg-white/20 active:scale-95",
							"aria-label": "Copiar código",
							children: copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4 text-[color:var(--brand-cyan)]" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "h-4 w-4 text-white/80" })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "animate-slide-up-soft mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: async () => {
							try {
								if (navigator.share) await navigator.share({
									title: "Lotería La Garza",
									text: `¡Únete a mi mesa de Lotería!`,
									url: window.location.href
								});
								else {
									navigator.clipboard.writeText(window.location.href);
									alert("¡Enlace copiado al portapapeles!");
								}
							} catch (e) {}
						},
						className: "w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-bold py-3.5 rounded-2xl border border-white/20 shadow-lg active:scale-95 transition-all",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "w-5 h-5" }), " Invitar amigos"]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "animate-slide-up-soft mt-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4 text-white/70" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-bold uppercase tracking-wider text-white/80",
								children: "Jugadores"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-white/50",
							children: mesa.players.length
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [mesa.players.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-white ring-2 ring-white/20",
									style: { background: "var(--gradient-card-cyan)" },
									children: p.name.slice(0, 1).toUpperCase()
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex-1 truncate text-sm font-semibold text-white",
									children: p.name
								}),
								p.role === "host" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-1 rounded-full bg-[color:var(--brand-gold)/.2] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[color:var(--brand-gold)] ring-1 ring-[color:var(--brand-gold)/.4]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, { className: "h-3 w-3" }), " Anfitrión"]
								})
							]
						}, `${p.name}-${i}`)), Array.from({ length: Math.max(0, 4 - mesa.players.length) }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-3 text-white/40",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid h-10 w-10 place-items-center rounded-full bg-white/5 ring-1 ring-white/10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timer, { className: "h-4 w-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs italic",
								children: "Esperando jugador…"
							})]
						}, `empty-${i}`))]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "animate-slide-up-soft mt-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "h-4 w-4 text-white/70" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-bold uppercase tracking-wider text-white/80",
								children: "Tus tablas"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-white/50",
							children: [
								mesaTablas.length,
								"/",
								mesa.perPlayer
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-3",
						children: mesaTablas.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative overflow-hidden rounded-2xl bg-white/5 p-3 ring-1 ring-white/10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-2 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-[10px] font-bold uppercase tracking-wider text-white/50",
									children: ["Tabla ", i + 1]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] text-white/40",
									children: t.size
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TablaPreview, {
								cards: t.cards,
								size: t.size
							})]
						}, t.id))
					})]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[oklch(0.10_0.09_262)/.85] px-5 pb-5 pt-3 backdrop-blur-xl",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex w-full max-w-md items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => navigate({ to: "/menu" }),
					className: "h-12 flex-1 rounded-full bg-white/10 text-sm font-semibold text-white/85 ring-1 ring-white/15 transition hover:bg-white/15 active:scale-[0.98]",
					children: "Menú"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: startGame,
					disabled: mesa.status !== "abierta",
					className: "flex h-12 flex-[1.4] items-center justify-center gap-2 rounded-full text-sm font-bold text-white shadow-[var(--shadow-card)] ring-1 ring-white/25 transition hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0",
					style: { background: "var(--gradient-brand)" },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-4 w-4" }), mesa.status === "abierta" ? "Iniciar partida" : "En juego"]
				})]
			})
		})
	] });
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl bg-white/10 px-2 py-2 ring-1 ring-white/15 backdrop-blur",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[10px] uppercase tracking-wider text-white/60",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-0.5 text-sm font-extrabold text-white",
			children: value
		})]
	});
}
function TablaPreview({ cards, size }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-1",
		style: { gridTemplateColumns: `repeat(${size === "4x4" ? 4 : 5}, minmax(0, 1fr))` },
		children: cards.map((c, i) => {
			const card = getCard(c);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative aspect-[3/4] overflow-hidden rounded-md ring-1 ring-white/10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: card?.image,
					alt: card?.name ?? `Carta ${c}`,
					loading: "lazy",
					className: "h-full w-full object-cover"
				})
			}, i);
		})
	});
}
//#endregion
export { MesaPage as component };
