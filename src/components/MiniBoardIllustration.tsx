import type { FC } from "react";

type Mode = "normal" | "pozo" | "esquinas" | "sieteLoco" | "modoX";

export const MiniBoardIllustration: FC<{ mode: Mode; active: boolean }> = ({ mode, active }) => {
  const isMarked = (r: number, c: number) => {
    if (mode === "normal") return r === 0; // Top row
    if (mode === "pozo") return (r === 1 || r === 2) && (c === 1 || c === 2);
    if (mode === "esquinas") return (r === 0 || r === 3) && (c === 0 || c === 3);
    if (mode === "modoX") return r === c || r === 3 - c;
    return false;
  };

  const isMarkedSieteLoco = (r: number, c: number) => {
    const cells = ["0,0", "0,3", "3,0", "3,3", "1,1", "2,2", "1,2"]; // 7 cells
    return cells.includes(`${r},${c}`);
  };

  return (
    <div className={`grid grid-cols-4 gap-[2px] p-1.5 rounded-lg border shadow-sm ${active ? 'bg-white/20 border-white/40' : 'bg-[color:var(--brand-navy-deep)]/40 border-white/10'}`}>
      {Array.from({ length: 16 }).map((_, i) => {
        const r = Math.floor(i / 4);
        const c = i % 4;
        const marked = mode === "sieteLoco" ? isMarkedSieteLoco(r, c) : isMarked(r, c);
        return (
          <div key={i} className={`w-2.5 h-[14px] rounded-[2px] transition-colors ${marked ? (active ? 'bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)]' : 'bg-white/80') : (active ? 'bg-white/10' : 'bg-white/5')}`} />
        );
      })}
    </div>
  );
};
