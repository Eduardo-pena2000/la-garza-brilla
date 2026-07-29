import type { ReactNode } from "react";

export function BrandBackground({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden text-white animate-gradient-shift ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(160deg, oklch(0.34 0.14 258) 0%, oklch(0.18 0.12 262) 55%, oklch(0.10 0.09 262) 100%)",
      }}
    >
      {/* Floating decorative orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-24 h-80 w-80 rounded-full opacity-30 blur-3xl animate-float"
        style={{ background: "var(--brand-cyan)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full opacity-25 blur-3xl animate-float-lg"
        style={{ background: "var(--brand-pink)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -right-16 h-56 w-56 rounded-full opacity-20 blur-3xl animate-float"
        style={{ background: "var(--brand-gold)", animationDelay: "1.5s" }}
      />

      {/* Floating lotería cards (real images) */}
      <FloatingCards />

      {/* Textura tipo talavera / azulejo mexicano */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.09]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.9) 1.4px, transparent 1.6px), radial-gradient(rgba(255,255,255,0.55) 1.4px, transparent 1.6px), repeating-linear-gradient(45deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 18px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 18px)",
          backgroundSize: "36px 36px, 36px 36px, 100% 100%, 100% 100%",
          backgroundPosition: "0 0, 18px 18px, 0 0, 0 0",
        }}
      />

      {/* Franja de sarape al pie */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-2 sarape-band animate-sarape-slide opacity-80" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function FloatingIcons() {
  // Iconografía mexicana flotando de fondo
  const items = [
    { e: "🌵", top: "10%", left: "6%", size: 24, delay: "0s", dur: "5s" },
    { e: "🎺", top: "16%", right: "8%", size: 26, delay: "1.2s", dur: "6s" },
    { e: "🌶️", top: "42%", left: "4%", size: 22, delay: "0.6s", dur: "5.5s" },
    { e: "🪇", top: "58%", right: "6%", size: 24, delay: "1.8s", dur: "6.5s" },
    { e: "🪅", top: "72%", left: "10%", size: 26, delay: "0.9s", dur: "5.2s" },
    { e: "💀", top: "30%", right: "16%", size: 20, delay: "2.1s", dur: "4.8s" },
    { e: "🌮", top: "84%", right: "14%", size: 22, delay: "0.3s", dur: "5.8s" },
    { e: "🌻", top: "24%", left: "20%", size: 20, delay: "1.5s", dur: "6.2s" },
    { e: "🎸", top: "66%", left: "22%", size: 20, delay: "2.4s", dur: "5.4s" },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 opacity-25">
      {items.map((it, i) => (
        <span
          key={i}
          className="absolute animate-float"
          style={{
            top: it.top,
            left: (it as { left?: string }).left,
            right: (it as { right?: string }).right,
            fontSize: it.size,
            animationDelay: it.delay,
            animationDuration: it.dur,
            filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))",
          }}
        >
          {it.e}
        </span>
      ))}
    </div>
  );
}

/* ── Floating Lotería card images ── */
interface FloatingCardDef {
  cardNum: number;
  top: string;
  left?: string;
  right?: string;
  size: number;
  rotate: number;
  delay: string;
  dur: string;
  opacity: number;
}

function FloatingCards() {
  const cards: FloatingCardDef[] = [
    { cardNum: 1,  top: "5%",   left: "3%",   size: 54, rotate: -15, delay: "0s",    dur: "7s",   opacity: 0.12 },
    { cardNum: 9,  top: "12%",  right: "5%",  size: 48, rotate: 12,  delay: "1.2s",  dur: "8s",   opacity: 0.10 },
    { cardNum: 17, top: "35%",  left: "2%",   size: 44, rotate: -8,  delay: "0.6s",  dur: "6.5s", opacity: 0.09 },
    { cardNum: 25, top: "55%",  right: "4%",  size: 50, rotate: 20,  delay: "2s",    dur: "7.5s", opacity: 0.11 },
    { cardNum: 33, top: "75%",  left: "6%",   size: 46, rotate: -22, delay: "0.9s",  dur: "6s",   opacity: 0.10 },
    { cardNum: 41, top: "85%",  right: "8%",  size: 42, rotate: 10,  delay: "1.5s",  dur: "8.5s", opacity: 0.08 },
    { cardNum: 12, top: "25%",  right: "12%", size: 38, rotate: -5,  delay: "2.4s",  dur: "7s",   opacity: 0.07 },
    { cardNum: 20, top: "60%",  left: "8%",   size: 40, rotate: 18,  delay: "0.3s",  dur: "6.8s", opacity: 0.09 },
    { cardNum: 36, top: "45%",  right: "2%",  size: 52, rotate: -12, delay: "1.8s",  dur: "7.2s", opacity: 0.10 },
    { cardNum: 48, top: "92%",  left: "15%",  size: 36, rotate: 25,  delay: "3s",    dur: "6.2s", opacity: 0.07 },
    { cardNum: 5,  top: "18%",  left: "14%",  size: 34, rotate: -28, delay: "2.1s",  dur: "8s",   opacity: 0.06 },
    { cardNum: 29, top: "68%",  right: "15%", size: 38, rotate: 8,   delay: "0.7s",  dur: "7.8s", opacity: 0.08 },
  ];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[0]">
      {cards.map((c, i) => {
        const ext = c.cardNum === 6 ? "png" : "jpeg";
        return (
          <div
            key={i}
            className="absolute"
            style={{
              top: c.top,
              left: c.left,
              right: c.right,
              width: c.size,
              height: c.size * 1.45,
              opacity: c.opacity,
              transform: `rotate(${c.rotate}deg)`,
              animation: `loteria-card-float ${c.dur} ease-in-out infinite`,
              animationDelay: c.delay,
            }}
          >
            <img
              src={`/cards/${String(c.cardNum).padStart(2, "0")}.${ext}`}
              alt=""
              className="h-full w-full rounded-md object-cover"
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
              loading="lazy"
            />
          </div>
        );
      })}
    </div>
  );
}