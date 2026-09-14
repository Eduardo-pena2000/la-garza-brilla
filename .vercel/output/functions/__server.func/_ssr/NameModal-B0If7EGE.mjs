import { r as __toESM } from "../_runtime.mjs";
import { n as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { P as IdCard, n as X } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/NameModal-B0If7EGE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function NameModal({ open, onClose, onSave, initial = "" }) {
	const [value, setValue] = (0, import_react.useState)(initial);
	(0, import_react.useEffect)(() => {
		if (open) setValue(initial);
	}, [open, initial]);
	if (!open) return null;
	const trimmed = value.trim();
	const finalName = trimmed.length > 0 ? trimmed : "Invitado";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-label": "Cerrar",
			onClick: onClose,
			className: "absolute inset-0 cursor-default"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative w-full max-w-sm overflow-hidden rounded-3xl bg-white text-[color:var(--brand-navy-dark)] shadow-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					"aria-label": "Cerrar",
					className: "absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/10 text-white/90 hover:bg-black/20",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex h-32 items-center justify-center",
					style: { background: "var(--gradient-brand)" },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"aria-hidden": true,
						className: "absolute inset-0 opacity-40",
						style: { background: "radial-gradient(circle at 30% 50%, var(--brand-cyan) 0%, transparent 55%), radial-gradient(circle at 75% 60%, var(--brand-pink) 0%, transparent 50%)" }
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/95 shadow-lg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdCard, { className: "h-9 w-9 text-[color:var(--brand-navy-deep)]" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-6 py-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-center text-lg font-bold",
							children: "Ingresa tu nombre"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-center text-xs text-[color:var(--muted-foreground)]",
							children: "Puedes cambiarlo más tarde"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								autoFocus: true,
								value,
								maxLength: 30,
								onChange: (e) => setValue(e.target.value),
								placeholder: "Tu nombre",
								className: "h-12 w-full rounded-2xl border-2 border-[color:var(--brand-cyan)] bg-white px-4 text-center text-base outline-none transition focus:border-[color:var(--brand-navy-deep)]"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 text-right text-[11px] text-[color:var(--muted-foreground)]",
								children: [trimmed.length, "/30"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => onSave(finalName),
							className: "mt-5 flex h-12 w-full items-center justify-center rounded-2xl text-base font-semibold text-white shadow-[var(--shadow-card)] transition active:scale-[0.98]",
							style: { background: "var(--gradient-brand)" },
							children: trimmed.length > 0 ? "Guardar y continuar" : "Continuar como Invitado"
						})
					]
				})
			]
		})]
	});
}
//#endregion
export { NameModal as t };
