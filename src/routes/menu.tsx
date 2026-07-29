import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Home, Gamepad2, ShoppingCart, Layers, User } from "lucide-react";
import { InicioView } from "@/components/views/InicioView";
import { JugarView } from "@/components/views/JugarView";
import { TablasView } from "@/components/views/TablasView";
import { TiendaView } from "@/components/views/TiendaView";
import { PerfilView } from "@/components/views/PerfilView";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menú — Lotería La Garza" },
      { name: "description", content: "Elige tu modo de juego en Lotería La Garza." },
    ],
  }),
  component: MainTabsLayout,
});

function MainTabsLayout() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState(0); // 0: Inicio, 1: Jugar, 2: Barajas, 3: Tienda, 4: Perfil

  // Sync scroll position with active tab
  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollLeft = containerRef.current.scrollLeft;
    const width = containerRef.current.clientWidth;
    const index = Math.round(scrollLeft / width);
    if (index !== activeTab && index >= 0 && index <= 4) {
      setActiveTab(index);
    }
  };

  const scrollToTab = (index: number) => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    containerRef.current.scrollTo({
      left: width * index,
      behavior: "smooth"
    });
  };

  const bottomTabs = [
    { label: "Inicio", Icon: Home, index: 0, action: () => scrollToTab(0) },
    { label: "Jugar", Icon: Gamepad2, index: 1, action: () => scrollToTab(1) },
    { label: "Barajas", Icon: Layers, index: 2, action: () => scrollToTab(2) },
    { label: "Tienda", Icon: ShoppingCart, index: 3, action: () => scrollToTab(3) },
    { label: "Perfil", Icon: User, index: 4, action: () => scrollToTab(4) },
  ];

  return (
    <div className="flex flex-col min-h-[100dvh] w-full bg-[color:var(--brand-navy-deep)] overflow-hidden relative">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[color:var(--brand-cyan)]/20 to-[color:var(--brand-navy-deep)] pointer-events-none" />

      {/* Swipeable Views Container */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex w-full h-[100dvh] overflow-x-auto snap-x snap-mandatory relative z-10 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Section 0: Inicio */}
        <div className="w-screen h-full shrink-0 snap-center">
          <InicioView 
            onNavigateTienda={() => scrollToTab(3)}
            onNavigateTablas={() => scrollToTab(2)}
            onOpenSidebar={() => scrollToTab(4)}
            onOpenPlayModal={() => scrollToTab(1)}
          />
        </div>

        {/* Section 1: Jugar */}
        <div className="w-screen h-full shrink-0 snap-center">
          <JugarView />
        </div>

        {/* Section 2: Barajas */}
        <div className="w-screen h-full shrink-0 snap-center">
          <TablasView 
            onBack={() => scrollToTab(0)}
            navigateToMenu={() => scrollToTab(0)}
          />
        </div>

        {/* Section 3: Tienda */}
        <div className="w-screen h-full shrink-0 snap-center">
          <TiendaView 
            onBack={() => scrollToTab(0)}
          />
        </div>

        {/* Section 4: Perfil */}
        <div className="w-screen h-full shrink-0 snap-center">
          <PerfilView />
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="surface-card fixed bottom-3 left-1/2 z-50 flex w-[calc(100%-1.5rem)] max-w-[27rem] -translate-x-1/2 justify-between rounded-3xl px-3 py-2 shadow-2xl border border-white/10">
        {bottomTabs.map(({ label, Icon, index, action }) => {
          const isActive = index !== -1 && activeTab === index;
          return (
            <button
              key={label}
              onClick={action}
              className={`flex flex-1 flex-col items-center gap-1 rounded-2xl py-1 text-[11px] font-bold hover:bg-white/5 active:scale-95 transition-all ${
                isActive ? "text-[color:var(--brand-gold)] scale-110 drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]" : "text-white/50 hover:text-white"
              }`}
            >
              <Icon className="size-5" />
              {label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}