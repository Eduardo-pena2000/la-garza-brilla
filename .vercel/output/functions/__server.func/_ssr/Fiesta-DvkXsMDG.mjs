import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Fiesta-DvkXsMDG.js
var import_jsx_runtime = require_jsx_runtime();
var PAPEL_COLORS = [
	"var(--brand-pink)",
	"var(--brand-gold)",
	"var(--brand-teal)",
	"var(--brand-cyan)",
	"oklch(0.72 0.2 30)"
];
/** Guirnalda de papel picado animada */
function PapelPicado({ count = 9, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"aria-hidden": true,
		className: `pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-between px-1 ${className}`,
		children: Array.from({ length: count }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "animate-papel-sway",
			style: {
				animationDelay: `${i % 5 * .25}s`,
				animationDuration: `${3 + i % 3 * .4}s`
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				width: "42",
				height: "54",
				viewBox: "0 0 46 60",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M0 0 H46 V40 L23 58 L0 40 Z",
						fill: PAPEL_COLORS[i % PAPEL_COLORS.length],
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
//#endregion
export { PapelPicado as t };
