import { r as __toESM } from "../_runtime.mjs";
import { n as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as BrandBackground } from "./BrandBackground-r8YRdigP.mjs";
import { g as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { w as PartyPopper } from "../_libs/lucide-react.mjs";
import { t as NameModal } from "./NameModal-B0If7EGE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DdAH1Xsy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BrandLogo({ size = 160, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `relative inline-flex items-center justify-center ${className}`,
		style: {
			width: size,
			height: size
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: "/logo-garza.png?v=2",
			alt: "Lotería La Garza",
			width: size,
			height: size,
			className: "relative object-contain"
		})
	});
}
function BrandTitle({ className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
		className: `brand-hero-title text-center relative z-20 ${className}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "brand-hero-loteria",
			children: "LOTERÍA"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "brand-hero-la-garza mt-3 block relative z-20",
			children: "La Garza"
		})]
	});
}
function LoginPage() {
	const navigate = useNavigate();
	const [askName, setAskName] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BrandBackground, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PapelPicado, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-6 pb-10 pt-24",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative w-full animate-pop-in",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pointer-events-none absolute -inset-3 rounded-[2rem] opacity-70 blur-2xl",
						style: { background: "radial-gradient(60% 60% at 50% 40%, var(--brand-pink), transparent 70%)" }
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative overflow-hidden rounded-[1.75rem] border border-white/20 bg-white/5 px-5 py-8 text-center backdrop-blur-sm shadow-[var(--shadow-brand)]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"aria-hidden": true,
								className: "absolute inset-x-0 top-0 h-1.5 sarape-band animate-sarape-slide"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"aria-hidden": true,
								className: "absolute inset-x-0 bottom-0 h-1.5 sarape-band animate-sarape-slide"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mx-auto mb-6 h-36 w-36",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandLogo, { className: "drop-shadow-xl" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandTitle, { size: "md" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-[15px] leading-relaxed text-white/90",
								children: "Crea tu mesa, invita a tus amigos y que gane el mejor."
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 flex w-full flex-col gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "group relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-white text-[15px] font-semibold text-[color:var(--brand-navy-dark)] shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-10px_rgba(0,0,0,0.5)] active:scale-[0.98] animate-slide-up-soft",
							style: { animationDelay: "0.45s" },
							onClick: () => setAskName(true),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"aria-hidden": true,
									className: "pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100",
									style: { animation: "shimmer-x 2.4s ease-in-out infinite" }
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid h-8 w-8 place-items-center rounded-xl bg-[color:var(--brand-navy-dark)]/5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleIcon, { className: "h-5 w-5" })
								}),
								"Iniciar sesión con Google"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "relative flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-black text-[15px] font-semibold text-white shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-10px_rgba(0,0,0,0.6)] active:scale-[0.98] animate-slide-up-soft",
							style: { animationDelay: "0.55s" },
							onClick: () => setAskName(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid h-8 w-8 place-items-center rounded-xl bg-white/10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppleIcon, { className: "h-5 w-5" })
							}), "Iniciar sesión con Apple"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/15 bg-white/10 text-[15px] font-semibold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/15 active:scale-[0.98] animate-slide-up-soft",
							style: { animationDelay: "0.65s" },
							onClick: () => setAskName(true),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"aria-hidden": true,
									className: "absolute inset-y-0 left-0 w-1.5 sarape-band animate-sarape-slide"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid h-8 w-8 place-items-center rounded-xl bg-[color:var(--brand-gold)]/25",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartyPopper, { className: "h-5 w-5 text-[color:var(--brand-gold)]" })
								}),
								"Entrar como invitado"
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-auto pt-10 text-center text-xs text-white/60 animate-slide-up-soft",
					style: { animationDelay: "0.85s" },
					children: [
						"Al usar la aplicación aceptas nuestros",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "underline",
							children: "Términos de uso"
						}),
						" y",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "underline",
							children: "Política de privacidad"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-[11px] text-white/40",
					children: "Versión 1.0.0"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NameModal, {
			open: askName,
			onClose: () => setAskName(false),
			onSave: (name) => {
				try {
					localStorage.setItem("garza:name", name);
				} catch {}
				setAskName(false);
				navigate({ to: "/menu" });
			}
		})
	] });
}
function GoogleIcon({ className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 48 48",
		className,
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#FFC107",
				d: "M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.2 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#FF3D00",
				d: "M6.3 14.7l6.6 4.8C14.6 16 18.9 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#4CAF50",
				d: "M24 43.5c5.1 0 9.8-2 13.3-5.2l-6.1-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.1-11.3-7.5l-6.5 5C9.5 39 16.2 43.5 24 43.5z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#1976D2",
				d: "M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4.1 5.2l6.1 5.2c-.4.4 6.7-4.9 6.7-14.4 0-1.2-.1-2.4-.4-3.5z"
			})
		]
	});
}
function PapelPicado() {
	const colors = [
		"var(--brand-pink)",
		"var(--brand-gold)",
		"var(--brand-teal)",
		"var(--brand-cyan)",
		"oklch(0.72 0.2 30)"
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"aria-hidden": true,
		className: "pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-between px-1",
		children: Array.from({ length: 9 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "animate-papel-sway",
			style: {
				animationDelay: `${i % 5 * .25}s`,
				animationDuration: `${3 + i % 3 * .4}s`
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				width: "46",
				height: "60",
				viewBox: "0 0 46 60",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M0 0 H46 V40 L23 58 L0 40 Z",
						fill: colors[i % colors.length],
						opacity: "0.85"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "23",
						cy: "16",
						r: "6",
						fill: "rgba(0,0,0,0.35)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "11",
						cy: "28",
						r: "3.2",
						fill: "rgba(0,0,0,0.35)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "35",
						cy: "28",
						r: "3.2",
						fill: "rgba(0,0,0,0.35)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "23",
						cy: "34",
						r: "3.6",
						fill: "rgba(0,0,0,0.35)"
					})
				]
			})
		}, i))
	});
}
function AppleIcon({ className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		className,
		fill: "currentColor",
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M16.365 1.43c0 1.14-.46 2.23-1.21 3.03-.82.88-2.16 1.56-3.27 1.47-.13-1.1.42-2.27 1.16-3.03.83-.86 2.24-1.5 3.32-1.47zM20.5 17.07c-.56 1.28-.82 1.86-1.54 3-1 1.6-2.41 3.6-4.16 3.6-1.55 0-1.95-1-4.05-1-2.1.01-2.54 1.02-4.1 1.01-1.75-.02-3.08-1.83-4.08-3.43-2.79-4.49-3.08-9.76-1.36-12.56C2.42 5.7 4.45 4.5 6.36 4.5c1.86 0 3.04 1.02 4.58 1.02 1.5 0 2.41-1.02 4.57-1.02 1.69 0 3.49.92 4.74 2.5-4.17 2.28-3.5 8.23.25 10.07z" })
	});
}
//#endregion
export { LoginPage as component };
