import { useState } from "react";
import {
  ShieldCheck,
  FileText,
  Copyright,
  Coins,
  X,
  Lock,
  Sparkles,
  Scale,
  Users,
  CheckCircle,
} from "lucide-react";

export type LegalTab = "privacidad" | "terminos" | "copyright" | "monedas";

interface LegalNoticeModalProps {
  open: boolean;
  initialTab?: LegalTab;
  onClose: () => void;
}

export function LegalNoticeModal({
  open,
  initialTab = "privacidad",
  onClose,
}: LegalNoticeModalProps) {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[88vh] rounded-3xl bg-gradient-to-b from-slate-900 via-[color:var(--brand-navy-dark)] to-slate-950 border border-white/20 shadow-2xl p-5 sm:p-6 text-white animate-pop-in flex flex-col overflow-hidden"
      >
        {/* Botón de cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition active:scale-95 touch-manipulation cursor-pointer z-10"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pr-10 mb-4 shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-cyan-500/20 text-amber-300 flex items-center justify-center border border-amber-400/30 shrink-0">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white leading-tight flex items-center gap-2">
              <span>Marco Legal y Transparencia</span>
            </h2>
            <p className="text-xs text-white/50">
              Lotería La Garza • Información para usuarios y tiendas de apps
            </p>
          </div>
        </div>

        {/* Pestañas de navegación */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-black/40 rounded-2xl border border-white/10 mb-4 shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("privacidad")}
            className={`py-2 px-1 rounded-xl transition flex flex-col items-center justify-center gap-1 text-[11px] ${
              activeTab === "privacidad"
                ? "bg-[color:var(--brand-cyan)] text-slate-950 font-black shadow-md"
                : "text-white/60 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="truncate">Privacidad</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("terminos")}
            className={`py-2 px-1 rounded-xl transition flex flex-col items-center justify-center gap-1 text-[11px] ${
              activeTab === "terminos"
                ? "bg-[color:var(--brand-cyan)] text-slate-950 font-black shadow-md"
                : "text-white/60 hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="truncate">Términos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("copyright")}
            className={`py-2 px-1 rounded-xl transition flex flex-col items-center justify-center gap-1 text-[11px] ${
              activeTab === "copyright"
                ? "bg-[color:var(--brand-cyan)] text-slate-950 font-black shadow-md"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Copyright className="w-4 h-4" />
            <span className="truncate">Copyright</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("monedas")}
            className={`py-2 px-1 rounded-xl transition flex flex-col items-center justify-center gap-1 text-[11px] ${
              activeTab === "monedas"
                ? "bg-amber-400 text-slate-950 font-black shadow-md"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Coins className="w-4 h-4" />
            <span className="truncate">Monedas</span>
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto pr-1 text-xs text-white/80 space-y-4 leading-relaxed hide-scrollbar scroll-touch-y">
          {/* TAB 1: PRIVACIDAD */}
          {activeTab === "privacidad" && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-400/30 flex items-start gap-3">
                <Lock className="w-5 h-5 text-cyan-300 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-black text-cyan-200 text-sm">
                    Aviso de Privacidad y Protección de Datos
                  </h3>
                  <p className="text-[11px] text-cyan-100/70 mt-0.5">
                    En cumplimiento con la LFPDPPP y los lineamientos de privacidad de Apple App Store y Google Play Store.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">1. Datos Personales que Recabamos</h4>
                <p>
                  Lotería La Garza prioriza la privacidad. Solo recopilamos los datos estrictamente necesarios para el funcionamiento del juego:
                </p>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-white/70">
                  <li><strong>Nombre o alias de jugador:</strong> Para identificarte en las salas multijugador.</li>
                  <li><strong>Correo electrónico (opcional):</strong> En caso de crear una cuenta para guardar tu avance y compras virtuales.</li>
                  <li><strong>Datos de juego y estadísticas:</strong> Victorias, monedas virtuales, barajas y cosméticos desbloqueados.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">2. Finalidad del Tratamiento</h4>
                <p>
                  Tus datos se emplean únicamente para:
                </p>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-white/70">
                  <li>Gestionar el inicio de sesión y sincronizar tu inventario en la nube.</li>
                  <li>Conectar jugadores en salas multijugador en tiempo real.</li>
                  <li>Prevenir fraudes, trampas y abusos en el sistema.</li>
                </ul>
                <p className="mt-1 font-semibold text-emerald-300">
                  ✓ Nunca vendemos, comercializamos ni compartimos tus datos personales con terceros para fines publicitarios.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">3. Seguridad y Almacenamiento</h4>
                <p>
                  Los datos se procesan a través de la infraestructura de <strong>Google Firebase Realtime Database</strong>, protegidos con cifrado SSL/TLS de 256 bits en tránsito y en reposo, bajo estrictas reglas de control de acceso.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">4. Derechos ARCO y Eliminación de Cuenta</h4>
                <p>
                  Tienes el derecho pleno de acceder, rectificar o eliminar todos tus datos personales en cualquier momento. Puedes solicitar la <strong>eliminación inmediata y permanente de tu cuenta</strong> desde el botón "Eliminar Cuenta y Datos" en la sección de Perfil/Ajustes o escribiendo a nuestro equipo de soporte.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: TÉRMINOS */}
          {activeTab === "terminos" && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                <FileText className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-black text-white text-sm">
                    Términos y Condiciones del Servicio
                  </h3>
                  <p className="text-[11px] text-white/60 mt-0.5">
                    Última actualización: Noviembre 2026 • Versión 1.0.0
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">1. Aceptación del Servicio</h4>
                <p>
                  Al descargar, acceder o jugar a <strong>Lotería La Garza</strong>, aceptas cumplir estos términos y las políticas comunitarias aplicables. Si no estás de acuerdo, te recomendamos desinstalar la aplicación.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">2. Licencia de Uso</h4>
                <p>
                  Se te concede una licencia personal, no exclusiva, intransferible y revocable para utilizar la aplicación con fines personales de entretenimiento lúdico y familiar.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">3. Código de Conducta en Salas y Chat</h4>
                <p>
                  Fomentamos un ambiente familiar y respetuoso. Queda estrictamente prohibido:
                </p>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-white/70">
                  <li>Utilizar nombres de usuario o mensajes de chat ofensivos, discriminatorios, sexuales o amenazantes.</li>
                  <li>Hacer uso de trampas, emuladores con scripts de auto-click o manipular el tráfico de red.</li>
                  <li>Hacer spam publicitario o comercial en las salas de juego.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">4. Disponibilidad del Servicio</h4>
                <p>
                  Nos esforzamos por ofrecer una experiencia 24/7 sin interrupciones. No obstante, el servicio puede experimentar mantenimientos programados o variaciones dependiendo de la conexión a internet de cada usuario.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: COPYRIGHT */}
          {activeTab === "copyright" && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-start gap-3">
                <Copyright className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-black text-amber-200 text-sm">
                    Aviso Legal, Derechos de Autor y Folclore
                  </h3>
                  <p className="text-[11px] text-amber-100/70 mt-0.5">
                    Declaración de propiedad intelectual y no-afiliación
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">1. Obra y Desarrollo Independiente</h4>
                <p>
                  <strong>Lotería La Garza</strong> es una obra y desarrollo tecnológico independiente, inspirado en la rica tradición cultural de la lotería popular mexicana, cuyas dinámicas lúdicas forman parte del patrimonio cultural inmaterial.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                <h4 className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                  <Scale className="w-4 h-4" />
                  Descargo de Responsabilidad de Marcas (Disclaimer)
                </h4>
                <p className="text-white/80 text-[11px]">
                  Lotería La Garza <strong>no está afiliada, asociada, patrocinada, respaldada ni de ninguna manera oficialmente conectada con Pasatiempos Gallo S.A. de C.V., Don Clemente Inc.</strong>, ni con ninguna de sus filiales o marcas registradas de juegos de mesa físicos. Todos los nombres de figuras populares (como El Gallo, La Sirena, La Garza, etc.) se emplean con fines de homenaje al folclore mexicano tradicional.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">2. Propiedad del Arte, Código y Contenidos</h4>
                <p>
                  El software, el código fuente, la identidad gráfica de "La Garza", la interfaz gráfica de usuario, los efectos de sonido y las colecciones de barajas temáticas (Lomitos, Michis, Neón, Día de Muertos) son propiedad exclusiva de los creadores de Lotería La Garza y están protegidos por las leyes de derechos de autor y propiedad intelectual.
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 text-center text-white/50 text-[11px]">
                © 2025 - 2026 Lotería La Garza. Todos los derechos reservados.<br />
                Hecho con orgullo y tradición en México.
              </div>
            </div>
          )}

          {/* TAB 4: MONEDAS Y JUEGO SOCIAL */}
          {activeTab === "monedas" && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-start gap-3">
                <Coins className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-black text-emerald-200 text-sm">
                    Moneda Virtual y Juego de Entretenimiento
                  </h3>
                  <p className="text-[11px] text-emerald-100/70 mt-0.5">
                    Ausencia de apuestas reales • Exclusivamente lúdico
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/30">
                <h4 className="font-bold text-amber-300 text-xs mb-1">
                  ⚠️ Declaración de Juego Social (Sin Apuestas Reales)
                </h4>
                <p className="text-white/80 text-[11px]">
                  <strong>Lotería La Garza es un juego estrictamente para fines de entretenimiento social y familiar.</strong> No ofrece apuestas con dinero real ni la oportunidad de ganar dinero en efectivo, transferencias bancarias o premios físicos reales.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">1. Naturaleza de las Monedas y Fichas Virtuales</h4>
                <p>
                  Las monedas virtuales (🪙), gemas, fichas y cofres presentes en la aplicación son artículos digitales ficticios destinados exclusivamente al progreso y diversión dentro de la plataforma.
                </p>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-white/70">
                  <li>No tienen valor monetario en el mundo real.</li>
                  <li>No pueden ser canjeadas, vendidas ni reembolsadas por dinero de curso legal.</li>
                  <li>No pueden ser transferidas fuera de la plataforma del juego.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">2. Marco Regulatorio (SEGOB / Tiendas de Apps)</h4>
                <p>
                  Al no existir un cruce de apuestas patrimoniales ni premios en dinero en efectivo, el juego se cataloga como software de entretenimiento lúdico y no requiere licencia de juego de azar ni sorteo con apuesta según los criterios de la Dirección General de Juegos y Sorteos de México (SEGOB) y las directrices de contenido de Google Play Store y Apple App Store.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-white/40">
            Lotería La Garza • Versión 1.0.0
          </span>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs hover:scale-[1.02] active:scale-95 transition shadow-md"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

