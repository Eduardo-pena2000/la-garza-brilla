import { useEffect, useState } from "react";
import { IdCard, X } from "lucide-react";

interface NameModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  initial?: string;
}

export function NameModal({ open, onClose, onSave, initial = "" }: NameModalProps) {
  const [value, setValue] = useState(initial);

  useEffect(() => {
    if (open) setValue(initial);
  }, [open, initial]);

  if (!open) return null;

  const trimmed = value.trim();
  const finalName = trimmed.length > 0 ? trimmed : "Invitado";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white text-[color:var(--brand-navy-dark)] shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/10 text-white/90 hover:bg-black/20"
        >
          <X className="h-4 w-4" />
        </button>

        <div
          className="relative flex h-32 items-center justify-center"
          style={{ background: "var(--gradient-brand)" }}
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(circle at 30% 50%, var(--brand-cyan) 0%, transparent 55%), radial-gradient(circle at 75% 60%, var(--brand-pink) 0%, transparent 50%)",
            }}
          />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/95 shadow-lg">
            <IdCard className="h-9 w-9 text-[color:var(--brand-navy-deep)]" />
          </div>
        </div>

        <div className="px-6 py-6">
          <h2 className="text-center text-lg font-bold">Ingresa tu nombre</h2>
          <p className="mt-1 text-center text-xs text-[color:var(--muted-foreground)]">
            Puedes cambiarlo más tarde
          </p>

          <div className="mt-5">
            <input
              autoFocus
              value={value}
              maxLength={30}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Tu nombre"
              className="h-12 w-full rounded-2xl border-2 border-[color:var(--brand-cyan)] bg-white px-4 text-center text-base outline-none transition focus:border-[color:var(--brand-navy-deep)]"
            />
            <div className="mt-1 text-right text-[11px] text-[color:var(--muted-foreground)]">
              {trimmed.length}/30
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSave(finalName)}
            className="mt-5 flex h-12 w-full items-center justify-center rounded-2xl text-base font-semibold text-white shadow-[var(--shadow-card)] transition active:scale-[0.98]"
            style={{ background: "var(--gradient-brand)" }}
          >
            {trimmed.length > 0 ? "Guardar y continuar" : "Continuar como Invitado"}
          </button>
        </div>
      </div>
    </div>
  );
}