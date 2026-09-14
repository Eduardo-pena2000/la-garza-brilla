import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/BrandBackground-r8YRdigP.js
var import_jsx_runtime = require_jsx_runtime();
function BrandBackground({ children, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `relative min-h-screen w-full overflow-hidden text-white animate-gradient-shift ${className}`,
		style: { backgroundImage: "linear-gradient(160deg, oklch(0.34 0.14 258) 0%, oklch(0.18 0.12 262) 55%, oklch(0.10 0.09 262) 100%)" },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"aria-hidden": true,
				className: "pointer-events-none absolute -top-32 -left-24 h-80 w-80 rounded-full opacity-30 blur-3xl animate-float",
				style: { background: "var(--brand-cyan)" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"aria-hidden": true,
				className: "pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full opacity-25 blur-3xl animate-float-lg",
				style: { background: "var(--brand-pink)" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"aria-hidden": true,
				className: "pointer-events-none absolute top-1/3 -right-16 h-56 w-56 rounded-full opacity-20 blur-3xl animate-float",
				style: {
					background: "var(--brand-gold)",
					animationDelay: "1.5s"
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloatingCards, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"aria-hidden": true,
				className: "pointer-events-none absolute inset-0 opacity-[0.09]",
				style: {
					backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1.4px, transparent 1.6px), radial-gradient(rgba(255,255,255,0.55) 1.4px, transparent 1.6px), repeating-linear-gradient(45deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 18px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 18px)",
					backgroundSize: "36px 36px, 36px 36px, 100% 100%, 100% 100%",
					backgroundPosition: "0 0, 18px 18px, 0 0, 0 0"
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"aria-hidden": true,
				className: "pointer-events-none absolute inset-x-0 bottom-0 h-2 sarape-band animate-sarape-slide opacity-80"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative z-10",
				children
			})
		]
	});
}
function FloatingCards() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"aria-hidden": true,
		className: "pointer-events-none absolute inset-0 z-[0]",
		children: [
			{
				cardNum: 1,
				top: "5%",
				left: "3%",
				size: 54,
				rotate: -15,
				delay: "0s",
				dur: "7s",
				opacity: .12
			},
			{
				cardNum: 9,
				top: "12%",
				right: "5%",
				size: 48,
				rotate: 12,
				delay: "1.2s",
				dur: "8s",
				opacity: .1
			},
			{
				cardNum: 17,
				top: "35%",
				left: "2%",
				size: 44,
				rotate: -8,
				delay: "0.6s",
				dur: "6.5s",
				opacity: .09
			},
			{
				cardNum: 25,
				top: "55%",
				right: "4%",
				size: 50,
				rotate: 20,
				delay: "2s",
				dur: "7.5s",
				opacity: .11
			},
			{
				cardNum: 33,
				top: "75%",
				left: "6%",
				size: 46,
				rotate: -22,
				delay: "0.9s",
				dur: "6s",
				opacity: .1
			},
			{
				cardNum: 41,
				top: "85%",
				right: "8%",
				size: 42,
				rotate: 10,
				delay: "1.5s",
				dur: "8.5s",
				opacity: .08
			},
			{
				cardNum: 12,
				top: "25%",
				right: "12%",
				size: 38,
				rotate: -5,
				delay: "2.4s",
				dur: "7s",
				opacity: .07
			},
			{
				cardNum: 20,
				top: "60%",
				left: "8%",
				size: 40,
				rotate: 18,
				delay: "0.3s",
				dur: "6.8s",
				opacity: .09
			},
			{
				cardNum: 36,
				top: "45%",
				right: "2%",
				size: 52,
				rotate: -12,
				delay: "1.8s",
				dur: "7.2s",
				opacity: .1
			},
			{
				cardNum: 48,
				top: "92%",
				left: "15%",
				size: 36,
				rotate: 25,
				delay: "3s",
				dur: "6.2s",
				opacity: .07
			},
			{
				cardNum: 5,
				top: "18%",
				left: "14%",
				size: 34,
				rotate: -28,
				delay: "2.1s",
				dur: "8s",
				opacity: .06
			},
			{
				cardNum: 29,
				top: "68%",
				right: "15%",
				size: 38,
				rotate: 8,
				delay: "0.7s",
				dur: "7.8s",
				opacity: .08
			}
		].map((c, i) => {
			const ext = c.cardNum === 6 ? "png" : "jpeg";
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute",
				style: {
					top: c.top,
					left: c.left,
					right: c.right,
					width: c.size,
					height: c.size * 1.45,
					opacity: c.opacity,
					transform: `rotate(${c.rotate}deg)`,
					animation: `loteria-card-float ${c.dur} ease-in-out infinite`,
					animationDelay: c.delay
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: `/cards/${String(c.cardNum).padStart(2, "0")}.${ext}`,
					alt: "",
					className: "h-full w-full rounded-md object-cover",
					style: { boxShadow: "0 4px 20px rgba(0,0,0,0.5)" },
					loading: "lazy"
				})
			}, i);
		})
	});
}
//#endregion
export { BrandBackground as t };
