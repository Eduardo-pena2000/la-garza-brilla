import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/CoinAnimation-BgsU05yx.js
var import_jsx_runtime = require_jsx_runtime();
function CoinAnimation({ className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `relative flex items-center justify-center ${className}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: "/shine_rotate-3.svg",
			alt: "Moneda",
			className: "absolute w-[200%] h-[200%] max-w-none object-contain top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-sm pointer-events-none"
		})
	});
}
//#endregion
export { CoinAnimation as t };
