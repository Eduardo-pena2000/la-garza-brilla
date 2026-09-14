import { r as __toESM } from "../_runtime.mjs";
import { n as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as getCard, t as DECK } from "./deck-9k1yKny1.mjs";
import { g as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as LayoutGrid, B as Crown, F as House, G as ChevronRight, H as CirclePlus, K as ChevronLeft, L as Gamepad2, U as CircleCheckBig, X as ArrowLeft, d as ShoppingCart, g as Save, i as User, j as Layers, l as Star, p as Settings, q as ChevronDown, r as Users, s as Trash2, u as Sparkles, v as Pointer, x as Pencil, y as Plus } from "../_libs/lucide-react.mjs";
import { t as NameModal } from "./NameModal-B0If7EGE.mjs";
import { t as CoinAnimation } from "./CoinAnimation-BgsU05yx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/menu-BPh0h27-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var cards_fan_default = "/assets/cards-fan-CAeQfqp3.png";
var trophy_default = "/assets/trophy-DtbP8TFi.png";
var feature_join_default = "/assets/feature-join-Ce1fv8YX.png";
var feature_decks_default = "/assets/feature-decks-WF9ogsoy.png";
var feature_shop_default = "/assets/feature-shop-3nKO1xU7.png";
var avatar_juan_default = "/assets/avatar-juan-ct4od1hi.png";
var avatar_sofia_default = "/assets/avatar-sofia-fCbvnyz6.png";
var avatar_alex_default = "/assets/avatar-alex-BIJ3D9uj.png";
var avatar_fer_default = "/assets/avatar-fer-Dmhjagjm.png";
var col_muertos_default = "/assets/col-muertos-CMPGE3wH.jpg";
var col_mexico_default = "/assets/col-mexico-iWEa6erN.jpg";
var col_animales_default = "/assets/col-animales-CMqVRRbf.jpg";
var col_vintage_default = "/assets/col-vintage-BAHjX1P7.jpg";
function InicioView({ onNavigateTienda, onNavigateTablas, onOpenSidebar, onOpenPlayModal }) {
	const navigate = useNavigate();
	const [name, setName] = (0, import_react.useState)("Invitado");
	const [coins, setCoins] = (0, import_react.useState)(500);
	const [isVIP, setIsVIP] = (0, import_react.useState)(false);
	const [isTutorial, setIsTutorial] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const loadState = () => {
			try {
				const stored = localStorage.getItem("garza:name");
				if (stored) setName(stored);
				const storedCoins = localStorage.getItem("garza:coins");
				if (storedCoins) setCoins(parseInt(storedCoins));
				else localStorage.setItem("garza:coins", "500");
				if (localStorage.getItem("garza:vip") === "true") setIsVIP(true);
				const storedTablas = localStorage.getItem("garza:tablas");
				if (!storedTablas || JSON.parse(storedTablas).length === 0) setIsTutorial(true);
				else setIsTutorial(false);
			} catch {}
		};
		loadState();
		window.addEventListener("garza:tablas-updated", loadState);
		return () => window.removeEventListener("garza:tablas-updated", loadState);
	}, []);
	const features = [
		{
			img: null,
			title: "Crear mesa",
			desc: "Inicia tu propia partida",
			onClick: () => navigate({ to: "/abrir-mesa" })
		},
		{
			img: feature_join_default,
			title: "Unirse a mesa",
			desc: "Entra a una mesa con código",
			onClick: () => navigate({ to: "/unirse" })
		},
		{
			img: feature_decks_default,
			title: "Mis barajas",
			desc: "Administra tus barajas",
			onClick: onNavigateTablas
		},
		{
			img: feature_shop_default,
			title: "Tienda",
			desc: "Compra monedas, barajas y más",
			onClick: onNavigateTienda
		}
	];
	const friends = [
		{
			name: "Juan",
			img: avatar_juan_default
		},
		{
			name: "Sofía",
			img: avatar_sofia_default
		},
		{
			name: "Alex",
			img: avatar_alex_default
		},
		{
			name: "Fer",
			img: avatar_fer_default
		}
	];
	const collections = [
		{
			name: "Día de Muertos",
			img: col_muertos_default,
			isNew: true
		},
		{
			name: "México Lindo",
			img: col_mexico_default,
			isNew: true
		},
		{
			name: "Animales",
			img: col_animales_default,
			isNew: false
		},
		{
			name: "Vintage",
			img: col_vintage_default,
			isNew: false
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col mx-auto h-full w-full max-w-md pb-28 pt-5 overflow-y-auto overflow-x-hidden relative",
		children: [
			isTutorial && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 z-40 bg-black/80 backdrop-blur-sm pointer-events-auto" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "flex items-center justify-end px-4 relative z-10 shrink-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface-card flex items-center gap-2 rounded-full py-1.5 pr-1.5 pl-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "btn-gold flex size-8 items-center justify-center rounded-full",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-4 fill-current" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-lg font-bold",
							children: coins.toLocaleString()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "btn-gold flex size-8 items-center justify-center rounded-full cursor-pointer hover:scale-105 transition",
							onClick: onNavigateTienda,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-5" })
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative mx-auto -mt-6 flex w-36 items-center justify-center z-10 shrink-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/logo-garza.png?v=2",
					alt: "Logo Lotería La Garza",
					width: 1920,
					height: 1920,
					className: "relative w-36 h-36 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.55)]"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "relative px-4 z-10 shrink-0 mt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: cards_fan_default,
						alt: "Cartas de lotería",
						width: 912,
						height: 800,
						loading: "lazy",
						className: "pointer-events-none absolute -top-12 -right-2 w-56 drop-shadow-[0_12px_28px_rgba(0,0,0,0.5)]"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "relative text-3xl font-extrabold tracking-tight flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "truncate max-w-[220px]",
								children: [
									"¡Hola, ",
									name,
									"!"
								]
							}),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"aria-hidden": true,
								className: "shrink-0",
								children: "👋"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "relative mt-2 max-w-[9rem] text-lg leading-tight text-muted-foreground",
						children: "¿Listo para cantar una partida?"
					}),
					isTutorial && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => navigate({ to: "/abrir-mesa" }),
						className: "group relative flex w-full flex-col items-center justify-center overflow-hidden rounded-3xl p-6 shadow-2xl transition hover:shadow-3xl z-50 animate-pop-in border-2 border-[color:var(--brand-cyan)] bg-[color:var(--brand-navy)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-6" }), "JUGAR AHORA"]
					}),
					!isTutorial && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: onOpenPlayModal,
						className: "btn-gold relative mt-6 mb-4 flex w-[68%] items-center justify-center gap-3 rounded-full py-4 text-xl font-extrabold tracking-wide hover:scale-105 active:scale-95 transition",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-6" }), "JUGAR AHORA"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mt-4 grid grid-cols-4 gap-2 px-4 relative z-50 shrink-0",
				children: features.map((f) => {
					const isTarget = isTutorial && f.title === "Mis barajas";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [isTarget && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute -top-16 left-1/2 -translate-x-1/2 z-50 animate-bounce flex flex-col items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "bg-[color:var(--brand-cyan)] text-[color:var(--brand-navy-deep)] text-[10px] font-black uppercase px-2 py-1 rounded-full shadow-lg whitespace-nowrap",
								children: "Haz clic aquí"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pointer, { className: "w-8 h-8 text-[color:var(--brand-cyan)] drop-shadow-[0_0_8px_rgba(0,255,255,0.8)] rotate-180" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: f.onClick,
							className: `surface-card flex flex-col items-center gap-2 rounded-2xl px-2 py-3 text-center w-full h-full ${isTarget ? "ring-4 ring-[color:var(--brand-cyan)] scale-105 shadow-[0_0_20px_rgba(0,255,255,0.5)]" : ""} ${isTutorial && !isTarget ? "opacity-30 pointer-events-none" : "hover:scale-105 active:scale-95 transition"}`,
							children: [f.img ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: f.img,
								alt: "",
								width: 512,
								height: 512,
								loading: "lazy",
								className: "size-14 object-contain"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex size-14 items-center justify-center rounded-2xl bg-accent text-white",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-8" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] font-bold leading-tight",
								children: f.title
							})]
						})]
					}, f.title);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: `surface-card mx-4 mt-4 flex items-center gap-2 rounded-3xl p-3 relative z-10 shrink-0 ${isTutorial ? "opacity-30 pointer-events-none" : ""}`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: trophy_default,
						alt: "Trofeo del torneo",
						width: 600,
						height: 600,
						loading: "lazy",
						className: "size-24 shrink-0 object-contain"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "inline-block rounded-full bg-accent px-3 py-1 text-[10px] font-bold tracking-wide text-white",
								children: "TORNEO DE ESTA SEMANA"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-lg font-extrabold",
								children: "GRAN PREMIO"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-3xl leading-none font-extrabold text-[color:var(--gold)]",
								children: ["$5,000 ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm",
									children: "MXN"
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "w-[5.5rem] shrink-0 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl bg-secondary px-2 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] font-bold text-[color:var(--secondary-foreground)]",
								children: "TERMINA EN"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-bold text-[color:var(--gold)]",
								children: "2d 14h"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "btn-gold mt-2 w-full rounded-full py-1.5 text-xs font-bold hover:scale-105 active:scale-95 transition",
							children: "Participar"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: `mt-5 relative z-10 shrink-0 ${isTutorial ? "opacity-30 pointer-events-none" : ""}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between px-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-bold",
						children: "Amigos jugando"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "flex items-center gap-1 text-sm text-muted-foreground hover:text-white transition",
						children: ["Ver todos ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 grid grid-cols-4 gap-2 px-4",
					children: friends.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "surface-card flex flex-col items-center gap-1 rounded-2xl p-2 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: f.img,
								alt: f.name,
								width: 512,
								height: 512,
								loading: "lazy",
								className: "size-12 rounded-full object-cover ring-2 ring-transparent hover:ring-[color:var(--brand-cyan)] transition"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-bold",
								children: f.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1 text-[9px] leading-tight text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-[color:var(--success)]" }), "En línea"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn-gold mt-1 w-full rounded-full py-1 text-[11px] font-bold hover:scale-105 active:scale-95 transition",
								children: "Unirse"
							})
						]
					}, f.name))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: `mt-5 relative z-10 shrink-0 pb-6 ${isTutorial ? "opacity-30 pointer-events-none" : ""}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between px-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-base font-bold",
						children: ["Nuevas colecciones ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-hidden": true,
							children: "🔥"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "flex items-center gap-1 text-sm text-muted-foreground hover:text-white transition",
						children: ["Ver todas ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 flex gap-3 overflow-x-auto px-4 snap-x",
					children: collections.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "surface-card relative w-32 shrink-0 overflow-hidden rounded-2xl snap-start cursor-pointer hover:scale-[1.02] transition",
						onClick: onNavigateTienda,
						children: [
							c.isNew && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "absolute top-2 right-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white z-10 shadow-md",
								children: "NUEVA"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: c.img,
								alt: c.name,
								width: 512,
								height: 512,
								loading: "lazy",
								className: "h-28 w-full object-cover"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "absolute bottom-2 left-0 right-0 text-center text-xs font-bold text-white drop-shadow-md px-1",
								children: c.name
							})
						]
					}, c.name))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NameModal, {})
		]
	});
}
function JugarView() {
	const navigate = useNavigate();
	const blueGradient = "linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col h-full font-sans relative overflow-x-hidden overflow-y-auto text-white pt-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-500/20 to-transparent pointer-events-none" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "relative z-10 flex items-center justify-center px-4 shrink-0 pb-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center leading-tight",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[11px] uppercase tracking-[0.22em] text-white/60",
						children: "Modos de Juego"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "text-xl font-extrabold flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "w-5 h-5 text-blue-400" }), " ¡A Jugar!"]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "flex-1 flex flex-col items-center justify-center p-4 pb-32 space-y-6 relative z-10 w-full max-w-sm mx-auto",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70",
						children: "¿Cómo quieres jugar?"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-white/60 mt-2",
						children: "Elige una opción para comenzar tu partida"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 w-full",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => navigate({ to: "/abrir-mesa" }),
						className: "flex items-center gap-4 p-5 rounded-3xl active:scale-95 transition-transform shadow-xl border-t-2 border-white/20 relative overflow-hidden group",
						style: { background: blueGradient },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "bg-black/20 p-4 rounded-2xl shrink-0 shadow-inner",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CirclePlus, { className: "w-10 h-10 text-white drop-shadow-md" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-left flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-black text-white text-xl leading-tight",
									children: "Crear mesa"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-white/80 text-sm mt-1",
									children: "Inicia tu propia partida y sé el gritón"
								})]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => navigate({ to: "/unirse" }),
						className: "flex items-center gap-4 p-5 rounded-3xl active:scale-95 transition-transform shadow-xl border-t-2 border-white/20 relative overflow-hidden group",
						style: { background: blueGradient },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "bg-black/20 p-4 rounded-2xl shrink-0 shadow-inner",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "w-10 h-10 text-white drop-shadow-md" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-left flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-black text-white text-xl leading-tight",
									children: "Unirse a mesa"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-white/80 text-sm mt-1",
									children: "Entra con un código para jugar"
								})]
							})
						]
					})]
				})]
			})
		]
	});
}
var STORAGE_KEY = "garza:tablas";
function loadTablas() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}
function saveTablas(list) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
	} catch {}
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
function TablasView({ onBack, navigateToMenu }) {
	const [tablas, setTablas] = (0, import_react.useState)([]);
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [creationMode, setCreationMode] = (0, import_react.useState)("none");
	const [editingId, setEditingId] = (0, import_react.useState)(null);
	const isTutorial = tablas.length === 0;
	(0, import_react.useEffect)(() => {
		setTablas(loadTablas());
	}, []);
	const filtered = (0, import_react.useMemo)(() => tablas.filter((t) => t.size === "4x4").sort((a, b) => b.createdAt - a.createdAt), [tablas]);
	function addTabla(cards) {
		const isFirst = tablas.length === 0;
		const updated = [{
			id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36),
			size: "4x4",
			cards: cards || randomCards("4x4"),
			createdAt: Date.now()
		}, ...tablas];
		setTablas(updated);
		saveTablas(updated);
		if (isFirst && navigateToMenu) setTimeout(() => navigateToMenu(), 100);
		window.dispatchEvent(new Event("garza:tablas-updated"));
	}
	function deleteTabla(id) {
		const updated = tablas.filter((t) => t.id !== id);
		setTablas(updated);
		saveTablas(updated);
		setSelected(null);
	}
	const selectedTabla = tablas.find((t) => t.id === selected) ?? null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col h-full font-sans relative overflow-x-hidden overflow-y-auto text-white pt-5",
		children: [
			isTutorial && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm pointer-events-auto transition-all duration-500" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "relative z-10 flex items-center justify-between gap-3 px-4",
				children: [
					!isTutorial && onBack ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Volver",
						onClick: onBack,
						className: "grid h-11 w-11 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur transition hover:bg-white/20 active:scale-95",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-5 w-5" })
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-11 h-11" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center leading-tight",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] uppercase tracking-[0.22em] text-white/60",
							children: "Colección"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "text-lg font-extrabold",
							children: ["Mis tablas ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-[color:var(--brand-cyan)]",
								children: [
									"(",
									filtered.length,
									")"
								]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Agregar tabla",
						onClick: () => setCreationMode("choose"),
						className: "grid h-11 w-11 place-items-center rounded-2xl text-white shadow-[var(--shadow-card)] ring-1 ring-white/25 transition hover:-translate-y-0.5 active:scale-95",
						style: { background: "var(--gradient-card-pink)" },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-5 w-5" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "relative mx-auto w-full max-w-md px-4 pb-28 pt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `mt-4 flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-xs text-white/85 ring-1 ring-white/15 backdrop-blur animate-slide-up-soft ${isTutorial ? "opacity-30 pointer-events-none" : ""}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4 text-[color:var(--brand-cyan)]" }), "Toca una tabla para editarla o eliminarla."]
				}), filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					onAdd: () => setCreationMode("choose"),
					isTutorial: isTutorial && creationMode === "none"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 grid grid-cols-2 gap-3",
					children: filtered.map((t, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setSelected(t.id),
						className: "group relative overflow-hidden rounded-2xl bg-white/95 p-2 text-left shadow-[var(--shadow-card)] ring-1 ring-white/30 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_32px_-12px_rgba(0,0,0,0.55)] active:scale-[0.98] animate-slide-up-soft",
						style: { animationDelay: `${.05 * idx}s` },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TablaPreview, {
							cards: t.cards,
							size: t.size
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex items-center justify-between px-1 text-[11px] font-semibold text-[color:var(--brand-navy-dark)]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "h-3 w-3" }),
									" ",
									t.size
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-[color:var(--muted-foreground)]",
								children: ["#", filtered.length - idx]
							})]
						})]
					}, t.id))
				})]
			}),
			!isTutorial && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sticky bottom-24 left-0 right-0 z-20 flex justify-center pointer-events-none pb-4 shrink-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setCreationMode("choose"),
					className: "flex h-14 items-center gap-2 rounded-full px-6 text-sm font-bold text-white shadow-[0_20px_35px_-12px_rgba(0,0,0,0.55)] ring-1 ring-white/25 transition hover:-translate-y-1 active:scale-[0.98] pointer-events-auto",
					style: { background: "var(--gradient-brand)" },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-5 w-5" }), " Nueva tabla"]
				})
			}),
			selectedTabla && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TablaSheet, {
				tabla: selectedTabla,
				onClose: () => setSelected(null),
				onDelete: () => deleteTabla(selectedTabla.id),
				onEdit: () => {
					setEditingId(selectedTabla.id);
					setSelected(null);
					setTimeout(() => setCreationMode("custom"), 50);
				}
			}),
			creationMode === "choose" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-pop-in z-[60]`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-[color:var(--brand-navy-deep)] w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-white/10 flex flex-col gap-4 relative",
					children: [
						isTutorial && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute -top-10 left-1/2 -translate-x-1/2 z-50 animate-bounce flex flex-col items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "bg-[color:var(--brand-cyan)] text-[color:var(--brand-navy-deep)] text-[11px] font-black uppercase px-3 py-1 rounded-full shadow-lg whitespace-nowrap",
								children: "¡Elige una opción!"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pointer, { className: "w-8 h-8 text-[color:var(--brand-cyan)] drop-shadow-[0_0_8px_rgba(0,255,255,0.8)] rotate-180" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-xl font-bold text-center text-white mb-2",
							children: "Crear nueva tabla"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => {
								addTabla();
								setCreationMode("none");
							},
							className: "w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white font-bold flex flex-col items-center gap-1 border border-white/10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "w-6 h-6 text-[color:var(--brand-cyan)]" }), "Generar aleatoria"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setCreationMode("custom"),
							className: "w-full py-4 rounded-xl hover:opacity-90 active:scale-95 transition-all text-[color:var(--brand-navy-deep)] font-bold flex flex-col items-center gap-1 shadow-lg",
							style: { background: "var(--gradient-card-gold)" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "w-6 h-6" }), "Crear personalizada"]
						}),
						!isTutorial && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setCreationMode("none"),
							className: "mt-2 text-white/50 text-sm font-bold p-2",
							children: "Cancelar"
						})
					]
				})
			}),
			creationMode === "custom" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomTablaModal, {
				initialCards: editingId ? tablas.find((t) => t.id === editingId)?.cards : [],
				onClose: () => {
					setCreationMode("none");
					setEditingId(null);
				},
				onSave: (cards) => {
					if (editingId) {
						const updated = tablas.map((t) => t.id === editingId ? {
							...t,
							cards
						} : t);
						setTablas(updated);
						saveTablas(updated);
					} else addTabla(cards);
					setCreationMode("none");
					setEditingId(null);
					setSelected(null);
				}
			})
		]
	});
}
function TablaPreview({ cards, size }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-[3px] overflow-hidden rounded-xl",
		style: { gridTemplateColumns: `repeat(${size === "4x4" ? 4 : 5}, minmax(0, 1fr))` },
		children: cards.map((n, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTile, { n }, i))
	});
}
function CardTile({ n }) {
	const card = getCard(n);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "relative aspect-[3/4] overflow-hidden rounded-md",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: card?.image,
			alt: card?.name ?? `Carta ${n}`,
			loading: "lazy",
			className: "h-full w-full object-cover"
		})
	});
}
function EmptyState({ onAdd, isTutorial = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `mt-10 flex flex-col items-center rounded-3xl px-6 py-10 text-center ring-1 ring-white/10 animate-slide-up-soft ${isTutorial ? "z-[70] relative bg-[color:var(--brand-navy)]/80 ring-2 ring-[color:var(--brand-cyan)] shadow-[0_0_30px_rgba(0,255,255,0.2)]" : "bg-white/5 backdrop-blur"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4 grid h-16 w-16 place-items-center rounded-2xl text-white shadow-lg",
				style: { background: "var(--gradient-brand)" },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "h-7 w-7" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-lg font-bold",
				children: isTutorial ? "¡Bienvenido a Lotería La Garza!" : "Aún no tienes tablas"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-white/70",
				children: isTutorial ? "Para comenzar a jugar, necesitas crear tu primera baraja." : "Crea tu primera tabla y comienza a jugar cuando quieras."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mt-5",
				children: [isTutorial && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute -left-12 top-1/2 -translate-y-1/2 z-50 animate-bounce-slow flex flex-col items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "bg-[color:var(--brand-cyan)] text-[color:var(--brand-navy-deep)] text-[10px] font-black uppercase px-2 py-1 rounded-full shadow-lg whitespace-nowrap",
						children: "Crear baraja"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pointer, { className: "w-8 h-8 text-[color:var(--brand-cyan)] drop-shadow-[0_0_8px_rgba(0,255,255,0.8)] rotate-90" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onAdd,
					className: `flex h-12 items-center gap-2 rounded-full px-6 text-sm font-bold text-white shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 active:scale-[0.98] ${isTutorial ? "ring-2 ring-white ring-offset-2 ring-offset-[color:var(--brand-navy-deep)] shadow-[0_0_20px_rgba(255,255,255,0.4)]" : ""}`,
					style: { background: "var(--gradient-card-pink)" },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Crear tabla"]
				})]
			})
		]
	});
}
function TablaSheet({ tabla, onClose, onDelete, onEdit }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-label": "Cerrar",
			onClick: onClose,
			className: "absolute inset-0 cursor-default z-0"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative z-10 w-full max-w-md rounded-t-3xl bg-white p-5 pb-28 text-[color:var(--brand-navy-dark)] shadow-2xl animate-slide-up-soft",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto mb-3 h-1.5 w-12 rounded-full bg-black/15" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center justify-between",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]",
						children: ["Tabla ", tabla.size]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-lg font-extrabold",
						children: "Vista previa"
					})] })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto mt-4 max-w-[240px]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TablaPreview, {
						cards: tabla.cards,
						size: tabla.size
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 grid grid-cols-2 gap-3 relative z-20",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: onEdit,
						className: "flex h-12 items-center justify-center gap-2 rounded-2xl text-sm font-bold text-white shadow-[var(--shadow-card)] transition hover:opacity-90",
						style: { background: "var(--gradient-brand)" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" }), " Editar"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: onDelete,
						className: "flex h-12 items-center justify-center gap-2 rounded-2xl bg-[color:var(--brand-pink)]/10 text-sm font-bold text-[color:var(--brand-pink)] ring-1 ring-[color:var(--brand-pink)]/30 transition hover:bg-[color:var(--brand-pink)]/20",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" }), " Borrar"]
					})]
				})
			]
		})]
	});
}
function CustomTablaModal({ onClose, onSave, initialCards = [] }) {
	const [selected, setSelected] = (0, import_react.useState)(initialCards);
	const toggleCard = (n) => {
		if (selected.includes(n)) setSelected(selected.filter((x) => x !== n));
		else if (selected.length < 16) setSelected([...selected, n]);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-[70] flex flex-col bg-[color:var(--brand-navy-deep)] animate-slide-up-soft",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center justify-between px-4 py-4 bg-black/20 border-b border-white/10 shrink-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "p-2 text-white/70 hover:text-white",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "w-6 h-6" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-white font-bold text-lg",
						children: "Personalizada"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => onSave(selected),
						disabled: selected.length !== 16,
						className: "px-3 py-1.5 rounded-full text-xs font-bold text-white disabled:opacity-50 disabled:bg-white/10 transition-all shadow-md",
						style: { background: selected.length === 16 ? "var(--gradient-brand)" : void 0 },
						children: selected.length === 16 ? "Guardar" : `${selected.length}/16`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-4 flex flex-col items-center shrink-0 border-b border-white/5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-white/60 text-sm mb-3 font-semibold text-center",
					children: "Toca las cartas abajo para agregarlas"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-4 gap-1.5 w-full max-w-[280px]",
					children: Array.from({ length: 16 }).map((_, i) => {
						const cardNum = selected[i];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							onClick: () => cardNum && toggleCard(cardNum),
							className: "aspect-[3/4] bg-white/10 rounded-lg overflow-hidden border border-white/5 relative",
							children: cardNum && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTile, { n: cardNum }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "text-red-400 w-6 h-6" })
							})] })
						}, i);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 overflow-y-auto p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 pb-32",
					children: DECK.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => toggleCard(c.n),
						className: `relative aspect-[3/4] rounded-lg overflow-hidden transition-all ${selected.includes(c.n) ? "ring-2 ring-[color:var(--brand-cyan)] opacity-50 scale-95" : "ring-1 ring-white/10 hover:ring-white/30"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTile, { n: c.n }), selected.includes(c.n) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-0 bg-[color:var(--brand-cyan)]/20 flex items-center justify-center backdrop-blur-[1px]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "w-6 h-6 text-white" })
						})]
					}, c.n))
				})
			})
		]
	});
}
function TiendaView({ onBack }) {
	const [coins, setCoins] = (0, import_react.useState)(0);
	const [ownedItems, setOwnedItems] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		try {
			const storedCoins = localStorage.getItem("garza:coins");
			if (storedCoins) setCoins(parseInt(storedCoins));
			else {
				localStorage.setItem("garza:coins", "500");
				setCoins(500);
			}
			const storedItems = localStorage.getItem("garza:owned");
			if (storedItems) setOwnedItems(JSON.parse(storedItems));
		} catch {}
	}, []);
	const buyItem = (id, price) => {
		if (coins >= price && !ownedItems.includes(id)) {
			const newCoins = coins - price;
			setCoins(newCoins);
			localStorage.setItem("garza:coins", newCoins.toString());
			const newItems = [...ownedItems, id];
			setOwnedItems(newItems);
			localStorage.setItem("garza:owned", JSON.stringify(newItems));
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col h-full font-sans relative overflow-x-hidden text-white",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[color:var(--brand-cyan)]/20 to-transparent pointer-events-none" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-50 flex items-center justify-between p-4 bg-[color:var(--brand-navy-deep)]/90 backdrop-blur-md border-b border-white/10 shadow-lg",
				children: [
					onBack ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onBack,
						className: "p-2 -ml-2 rounded-xl bg-white/5 active:scale-95 transition-transform",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "w-7 h-7 text-white" })
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-11" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-[color:var(--brand-gold)] to-yellow-600 uppercase",
						children: "La Tienda"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5 bg-black/60 px-4 py-2 rounded-full ring-2 ring-[color:var(--brand-gold)] shadow-[0_0_15px_rgba(255,215,0,0.3)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinAnimation, { className: "w-6 h-6 -mt-0.5 drop-shadow-md" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-extrabold text-[color:var(--brand-gold)] tracking-wide",
							children: coins
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "flex-1 overflow-y-auto pb-28 p-5 space-y-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "animate-slide-up-soft",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "flex items-center justify-center gap-2 text-sm font-black text-white/50 mb-4 tracking-[0.2em] uppercase",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-8 bg-white/20" }),
								"Tesoros",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-8 bg-white/20" })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [
								{
									coins: 500,
									price: "$0.99",
									bonus: null,
									gradient: "from-green-500/20 to-emerald-700/40",
									ring: "ring-emerald-500/50"
								},
								{
									coins: 1200,
									price: "$1.99",
									bonus: "¡15% Extra!",
									gradient: "from-blue-500/20 to-indigo-700/40",
									ring: "ring-indigo-500/50"
								},
								{
									coins: 2500,
									price: "$3.99",
									bonus: "¡25% Extra!",
									gradient: "from-purple-500/20 to-fuchsia-700/40",
									ring: "ring-fuchsia-500/50"
								},
								{
									coins: 6500,
									price: "$9.99",
									bonus: "¡Mejor Valor!",
									gradient: "from-yellow-400/20 to-amber-700/40",
									ring: "ring-[color:var(--brand-gold)] shadow-[0_0_20px_rgba(255,215,0,0.3)]"
								}
							].map((pack, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: `relative flex flex-col items-center justify-center p-4 rounded-3xl bg-gradient-to-br ${pack.gradient} ring-1 ${pack.ring} border-t-2 border-white/20 active:scale-95 transition-transform overflow-hidden group`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" }),
									pack.bonus && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "absolute top-0 left-0 w-full bg-red-600 text-[9px] font-black uppercase tracking-wider py-0.5 shadow-md z-10",
										children: pack.bonus
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinAnimation, { className: `w-12 h-12 mt-2 drop-shadow-xl ${pack.coins > 2e3 ? "animate-pulse" : ""}` }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-black text-xl text-white drop-shadow-md mt-1",
										children: pack.coins
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-2 bg-white text-black font-extrabold text-sm px-4 py-1.5 rounded-full shadow-lg",
										children: pack.price
									})
								]
							}, idx))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "animate-slide-up-soft",
						style: { animationDelay: "0.1s" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "flex items-center justify-center gap-2 text-sm font-black text-amber-400 mb-4 tracking-[0.2em] uppercase drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-8 bg-amber-400/50" }),
								"Ofertas del Día",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-8 bg-amber-400/50" })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative rounded-3xl overflow-hidden ring-2 ring-[color:var(--brand-gold)] shadow-[0_10px_30px_rgba(255,215,0,0.2)] bg-gradient-to-br from-amber-600 to-yellow-900 border-t border-yellow-300",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "absolute top-0 right-0 bg-red-600 text-white font-black text-[10px] uppercase px-4 py-1 rounded-bl-xl shadow-lg z-10 animate-pulse",
									children: "¡Tiempo Limitado!"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-6 flex items-center gap-5 relative z-10",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "w-24 h-24 bg-black/40 rounded-2xl ring-2 ring-white/30 flex items-center justify-center shadow-inner relative overflow-hidden",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, { className: "w-12 h-12 text-yellow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.8)] animate-bounce-slow" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer-x_2s_infinite]" })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
												className: "font-black text-2xl text-white drop-shadow-lg leading-tight",
												children: [
													"Pase de Oro",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
													"Temporada 1"
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-yellow-200 text-xs font-semibold mt-1",
												children: "Marco + 50 Stickers VIP"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => buyItem("bundle_gold", 2e3),
												disabled: ownedItems.includes("bundle_gold") || coins < 2e3,
												className: `mt-3 w-full py-2.5 rounded-xl font-black text-lg shadow-xl active:scale-95 transition-transform flex justify-center items-center gap-1 ${ownedItems.includes("bundle_gold") ? "bg-black/40 text-white/50" : coins < 2e3 ? "bg-white/20 text-white/60" : "bg-gradient-to-r from-yellow-300 to-[color:var(--brand-gold)] text-black"}`,
												children: ownedItems.includes("bundle_gold") ? "¡ADQUIRIDO!" : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinAnimation, { className: "w-5 h-5 drop-shadow-sm" }), " 2000"] })
											})
										]
									})]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "animate-slide-up-soft",
						style: { animationDelay: "0.2s" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "flex items-center justify-center gap-2 text-sm font-black text-white/50 mb-4 tracking-[0.2em] uppercase",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-8 bg-white/20" }),
								"Stickers",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-8 bg-white/20" })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-4",
							children: [
								{
									id: "st_mex",
									name: "Paquete Norteño",
									icon: "🤠",
									price: 500,
									rarity: "Común",
									color: "from-blue-600 to-blue-900",
									ring: "ring-blue-400"
								},
								{
									id: "st_spicy",
									name: "Reacciones Picantes",
									icon: "🌶️",
									price: 800,
									rarity: "Raro",
									color: "from-orange-500 to-red-800",
									ring: "ring-orange-400"
								},
								{
									id: "st_magic",
									name: "Magia de Feria",
									icon: "✨",
									price: 1200,
									rarity: "Épico",
									color: "from-fuchsia-600 to-purple-900",
									ring: "ring-fuchsia-400"
								}
							].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `bg-gradient-to-br ${item.color} rounded-2xl p-4 flex items-center gap-4 ring-1 ${item.ring} shadow-lg relative overflow-hidden`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-xl pointer-events-none" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "w-16 h-16 bg-black/30 rounded-xl flex items-center justify-center shrink-0 border-b-2 border-white/20 text-3xl shadow-inner",
										children: item.icon
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex-1 relative z-10",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[10px] font-black uppercase text-white/70 mb-0.5 tracking-wider",
											children: item.rarity
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
											className: "text-white font-bold text-lg leading-none",
											children: item.name
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => buyItem(item.id, item.price),
										disabled: ownedItems.includes(item.id) || coins < item.price,
										className: `px-5 py-2.5 rounded-xl font-black text-sm shrink-0 flex items-center gap-1 transition-transform relative z-10 shadow-md ${ownedItems.includes(item.id) ? "bg-black/50 text-white/40" : coins < item.price ? "bg-black/30 text-white/50 cursor-not-allowed" : "bg-white text-black active:scale-95 hover:bg-gray-100"}`,
										children: ownedItems.includes(item.id) ? "TUYO" : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinAnimation, { className: "w-4 h-4 drop-shadow-sm" }),
											" ",
											item.price
										] })
									})
								]
							}, item.id))
						})]
					})
				]
			})
		]
	});
}
var SETTINGS_KEY = "garza:settings";
var DEFAULTS = {
	name: "",
	audio: true,
	voice: "mujer",
	deckStyle: "clasica",
	sfx: true,
	confetti: false,
	vibration: true,
	classicMode: false,
	tableView: "rejilla",
	marker: "ficha"
};
function PerfilView() {
	const [settings, setSettings] = (0, import_react.useState)(DEFAULTS);
	(0, import_react.useEffect)(() => {
		try {
			const raw = localStorage.getItem(SETTINGS_KEY);
			const storedName = localStorage.getItem("garza:name") ?? "";
			const parsed = raw ? JSON.parse(raw) : {};
			setSettings({
				...DEFAULTS,
				name: storedName,
				...parsed
			});
		} catch {}
	}, []);
	function update(key, value) {
		setSettings((prev) => {
			const next = {
				...prev,
				[key]: value
			};
			try {
				localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
			} catch {}
			return next;
		});
	}
	function saveName() {
		try {
			localStorage.setItem("garza:name", settings.name.trim());
		} catch {}
	}
	const voiceEmoji = settings.voice === "mujer" ? "👩‍🎤" : settings.voice === "hombre" ? "🧔‍♂️" : "🧒";
	const voiceLabel = settings.voice === "mujer" ? "Mujer" : settings.voice === "hombre" ? "Hombre" : "Niño";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col h-full font-sans relative overflow-x-hidden overflow-y-auto text-white pt-5 pb-28",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "relative z-10 flex items-center justify-center px-4 shrink-0 pb-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center leading-tight",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[11px] uppercase tracking-[0.22em] text-white/60",
						children: "Cuenta"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "text-xl font-extrabold flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "w-5 h-5 text-[color:var(--brand-cyan)]" }), " Mi Perfil"]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "flex-1 mx-auto w-full max-w-md px-5 space-y-2 relative z-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bg-white/5 rounded-3xl p-5 border border-white/10 shadow-xl backdrop-blur-md",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mb-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "relative flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "absolute -top-2 left-4 bg-[color:var(--brand-navy-deep)] px-1 text-[11px] text-[color:var(--brand-cyan)] font-semibold",
											children: "Nombre"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											value: settings.name,
											maxLength: 30,
											onChange: (e) => update("name", e.target.value),
											placeholder: "Tu nombre...",
											className: "h-12 w-full rounded-2xl border border-white/20 bg-black/20 px-4 text-base text-white outline-none focus:border-[color:var(--brand-cyan)] transition-colors"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: saveName,
										"aria-label": "Guardar nombre",
										className: "grid h-12 w-12 place-items-center rounded-xl bg-[color:var(--brand-cyan)]/20 text-[color:var(--brand-cyan)] border border-[color:var(--brand-cyan)]/30 transition hover:bg-[color:var(--brand-cyan)]/30 active:scale-95 shadow-md",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-6 w-6" })
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 pr-16 text-right text-xs text-white/40",
									children: [settings.name.length, "/30"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px bg-white/10 w-full mb-4" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mb-3 text-sm font-bold text-white/90",
									children: "Ficha (Marcador):"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex items-center gap-3",
									children: [
										{
											id: "ficha",
											label: "Ficha",
											visual: "🔴"
										},
										{
											id: "frijol",
											label: "Frijol",
											visual: "🫘"
										},
										{
											id: "corazon",
											label: "Corazón",
											visual: "❤️"
										}
									].map((opt) => {
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => update("marker", opt.id),
											className: `flex h-16 w-full flex-col items-center justify-center gap-1 rounded-xl border text-xs font-bold transition shadow-md ${settings.marker === opt.id ? "border-[color:var(--brand-cyan)] bg-[color:var(--brand-cyan)]/20 text-white" : "border-white/10 bg-black/20 text-white/60 hover:bg-black/40"}`,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-2xl drop-shadow-md",
												children: opt.visual
											}), opt.label]
										}, opt.id);
									})
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bg-white/5 rounded-3xl p-5 border border-white/10 shadow-xl backdrop-blur-md mt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowToggle, {
								title: "Audio",
								subtitle: "Grita el nombre de las cartas",
								value: settings.audio,
								onChange: (v) => update("audio", v)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px bg-white/10 w-full my-2" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowSelect, {
								title: "Voz del gritón",
								subtitle: voiceLabel,
								right: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-3xl drop-shadow-md",
									children: voiceEmoji
								}),
								onClick: () => {
									const order = [
										"mujer",
										"hombre",
										"nino"
									];
									update("voice", order[(order.indexOf(settings.voice) + 1) % order.length]);
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px bg-white/10 w-full my-2" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowToggle, {
								title: "Efectos de sonido",
								value: settings.sfx,
								onChange: (v) => update("sfx", v)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px bg-white/10 w-full my-2" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowToggle, {
								title: "Vibración",
								value: settings.vibration,
								onChange: (v) => update("vibration", v)
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bg-white/5 rounded-3xl p-5 border border-white/10 shadow-xl backdrop-blur-md mt-4 mb-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowSelect, {
								title: "Estilo de Baraja",
								subtitle: "Cartas clásicas o modernas",
								right: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid h-12 w-9 place-items-center rounded-md text-xl shadow-md border border-white/20",
									style: { background: "linear-gradient(180deg, #FFE68A 0%, #F6C13B 45%, #E9E9E9 46%, #E9E9E9 100%)" },
									children: "🐓"
								}),
								onClick: () => update("deckStyle", settings.deckStyle === "clasica" ? "moderna" : "clasica")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px bg-white/10 w-full my-2" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowToggle, {
								title: "Confetti",
								subtitle: "Efecto visual al ganar",
								value: settings.confetti,
								onChange: (v) => update("confetti", v)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px bg-white/10 w-full my-2" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowToggle, {
								title: "Modo clásico",
								subtitle: "Solo permite mesas de 4x4",
								value: settings.classicMode,
								onChange: (v) => update("classicMode", v)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px bg-white/10 w-full my-2" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "flex items-center justify-between py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-bold text-white/90",
									children: "Vista de Tablas"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => update("tableView", settings.tableView === "rejilla" ? "lista" : "rejilla"),
									className: "inline-flex items-center gap-2 text-sm text-[color:var(--brand-cyan)] bg-[color:var(--brand-cyan)]/10 px-3 py-1.5 rounded-lg font-semibold",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "h-4 w-4" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "capitalize",
											children: settings.tableView
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4" })
									]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							localStorage.removeItem("garza:name");
							localStorage.removeItem("garza:vip");
							localStorage.removeItem("garza:coins");
							window.location.href = "/";
						},
						className: "w-full bg-red-500/20 text-red-400 border border-red-500/30 rounded-2xl py-4 font-bold active:scale-[0.98] transition-all hover:bg-red-500/30 mb-8",
						children: "Cerrar sesión"
					})
				]
			})
		]
	});
}
function RowToggle({ title, subtitle, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex items-center gap-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm font-bold text-white/90",
				children: title
			}), subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-0.5 text-xs text-white/50 leading-tight",
				children: subtitle
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			role: "switch",
			"aria-checked": value,
			onClick: () => onChange(!value),
			className: `relative h-7 w-12 shrink-0 rounded-full transition-colors border border-white/10 shadow-inner ${value ? "bg-[color:var(--brand-cyan)]" : "bg-black/40"}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all ${value ? "left-6" : "left-1 opacity-60"}` })
		})]
	});
}
function RowSelect({ title, subtitle, right, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: "flex w-full items-center gap-4 py-3 text-left transition active:scale-[0.98] group",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm font-bold text-white/90 group-hover:text-white transition-colors",
				children: title
			}), subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-0.5 text-xs text-white/50 leading-tight",
				children: subtitle
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "shrink-0",
			children: right
		})]
	});
}
function MainTabsLayout() {
	const containerRef = (0, import_react.useRef)(null);
	const [activeTab, setActiveTab] = (0, import_react.useState)(0);
	const handleScroll = () => {
		if (!containerRef.current) return;
		const scrollLeft = containerRef.current.scrollLeft;
		const width = containerRef.current.clientWidth;
		const index = Math.round(scrollLeft / width);
		if (index !== activeTab && index >= 0 && index <= 4) setActiveTab(index);
	};
	const scrollToTab = (index) => {
		if (!containerRef.current) return;
		const width = containerRef.current.clientWidth;
		containerRef.current.scrollTo({
			left: width * index,
			behavior: "smooth"
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col min-h-[100dvh] w-full bg-[color:var(--brand-navy-deep)] overflow-hidden relative",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-b from-[color:var(--brand-cyan)]/20 to-[color:var(--brand-navy-deep)] pointer-events-none" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: containerRef,
				onScroll: handleScroll,
				className: "flex w-full h-[100dvh] overflow-x-auto snap-x snap-mandatory relative z-10 scrollbar-hide",
				style: {
					scrollbarWidth: "none",
					msOverflowStyle: "none"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-screen h-full shrink-0 snap-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InicioView, {
							onNavigateTienda: () => scrollToTab(3),
							onNavigateTablas: () => scrollToTab(2),
							onOpenSidebar: () => scrollToTab(4),
							onOpenPlayModal: () => scrollToTab(1)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-screen h-full shrink-0 snap-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JugarView, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-screen h-full shrink-0 snap-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TablasView, {
							onBack: () => scrollToTab(0),
							navigateToMenu: () => scrollToTab(0)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-screen h-full shrink-0 snap-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TiendaView, { onBack: () => scrollToTab(0) })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-screen h-full shrink-0 snap-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PerfilView, {})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "surface-card fixed bottom-3 left-1/2 z-50 flex w-[calc(100%-1.5rem)] max-w-[27rem] -translate-x-1/2 justify-between rounded-3xl px-3 py-2 shadow-2xl border border-white/10",
				children: [
					{
						label: "Inicio",
						Icon: House,
						index: 0,
						action: () => scrollToTab(0)
					},
					{
						label: "Jugar",
						Icon: Gamepad2,
						index: 1,
						action: () => scrollToTab(1)
					},
					{
						label: "Barajas",
						Icon: Layers,
						index: 2,
						action: () => scrollToTab(2)
					},
					{
						label: "Tienda",
						Icon: ShoppingCart,
						index: 3,
						action: () => scrollToTab(3)
					},
					{
						label: "Perfil",
						Icon: User,
						index: 4,
						action: () => scrollToTab(4)
					}
				].map(({ label, Icon, index, action }) => {
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: action,
						className: `flex flex-1 flex-col items-center gap-1 rounded-2xl py-1 text-[11px] font-bold hover:bg-white/5 active:scale-95 transition-all ${index !== -1 && activeTab === index ? "text-[color:var(--brand-gold)] scale-110 drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]" : "text-white/50 hover:text-white"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" }), label]
					}, label);
				})
			})
		]
	});
}
//#endregion
export { MainTabsLayout as component };
