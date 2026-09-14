import { r as __toESM } from "../_runtime.mjs";
import { n as require_react, r as require_jsx_runtime, t as QueryClientProvider } from "../_libs/react+tanstack__react-query.mjs";
import { _ as useRouter, c as HeadContent, d as Outlet, f as lazyRouteComponent, h as Link, m as createRootRouteWithContext, p as createFileRoute, s as Scripts, u as createRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Route$5 } from "./mesa._id.index-CNmuHe_m.mjs";
import { t as Route$6 } from "./mesa._id.jugar-CYnIDeJu.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-M-lwEUBc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-CyX6HucT.css";
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$4 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Lotería La Garza" },
			{
				name: "description",
				content: "Lotería La Garza - Juego de Lotería en línea"
			},
			{
				name: "author",
				content: "La Garza"
			},
			{
				property: "og:title",
				content: "Lotería La Garza"
			},
			{
				property: "og:description",
				content: "Juega Lotería La Garza en línea con tus amigos."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary"
			},
			{
				name: "twitter:site",
				content: "@LoteríaLaGarza"
			}
		],
		links: [{
			rel: "stylesheet",
			href: styles_default
		}]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$4.useRouteContext();
	(0, import_react.useEffect)(() => {
		try {
			localStorage.clear();
		} catch {}
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
	});
}
var $$splitComponentImporter$3 = () => import("./menu-BPh0h27-.mjs");
var Route$3 = createFileRoute("/menu")({
	head: () => ({ meta: [{ title: "Menú — Lotería La Garza" }, {
		name: "description",
		content: "Elige tu modo de juego en Lotería La Garza."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./abrir-mesa-Bkz_fEiH.mjs");
var Route$2 = createFileRoute("/abrir-mesa")({
	head: () => ({ meta: [{ title: "Abrir mesa — Lotería La Garza" }, {
		name: "description",
		content: "Configura y abre una nueva mesa de Lotería La Garza."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./routes-DdAH1Xsy.mjs");
var Route$1 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "Lotería La Garza — Iniciar sesión" },
		{
			name: "description",
			content: "Juega Lotería La Garza online con amigos. Inicia sesión y disfruta."
		},
		{
			property: "og:title",
			content: "Lotería La Garza"
		},
		{
			property: "og:description",
			content: "Juega Lotería La Garza online con amigos."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./mesa._id-BLG8SJh3.mjs");
var Route = createFileRoute("/mesa/$id")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var MenuRoute = Route$3.update({
	id: "/menu",
	path: "/menu",
	getParentRoute: () => Route$4
});
var AbrirMesaRoute = Route$2.update({
	id: "/abrir-mesa",
	path: "/abrir-mesa",
	getParentRoute: () => Route$4
});
var IndexRoute = Route$1.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$4
});
var MesaIdRoute = Route.update({
	id: "/mesa/$id",
	path: "/mesa/$id",
	getParentRoute: () => Route$4
});
var MesaIdIndexRoute = Route$5.update({
	id: "/",
	path: "/",
	getParentRoute: () => MesaIdRoute
});
var MesaIdRouteChildren = {
	MesaIdJugarRoute: Route$6.update({
		id: "/jugar",
		path: "/jugar",
		getParentRoute: () => MesaIdRoute
	}),
	MesaIdIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	AbrirMesaRoute,
	MenuRoute,
	MesaIdRoute: MesaIdRoute._addFileChildren(MesaIdRouteChildren)
};
var routeTree = Route$4._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
