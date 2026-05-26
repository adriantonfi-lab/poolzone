'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import {
  ArrowLeft, Trophy, DollarSign, Users, Star, Clock, RefreshCw,
  Sparkles, Zap, MessageCircle, Crown, HelpCircle, ExternalLink,
  Wallet, Calendar, BarChart2, BookOpen, Gift, CreditCard,
  AlertTriangle, CheckCircle, Lock, Info, Home, FileText
} from 'lucide-react'

export default function RulesPage() {
  return (
    <div className="px-4 py-6 max-w-3xl mx-auto pb-24 md:pb-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-base font-bold text-white hover:text-[#FFD700] transition-colors mb-4">
        <ArrowLeft size={20} />Volver al Dashboard
      </Link>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#FFD700]/10 to-[#FFA500]/10 border border-[#FFD700]/30 rounded-2xl p-6 mb-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FFD700]/20 border border-[#FFD700]/30 mb-4">
          <Trophy size={32} className="text-[#FFD700]" />
        </div>
        <h1 className="font-bebas text-5xl text-[#FFD700] tracking-wider mb-2">Reglas del Juego</h1>
        <p className="text-white font-bold text-lg">Che-Bacano — Mundial 2026</p>
        <p className="text-gray-400 text-sm mt-1">Todo lo que necesitás saber para jugar y ganar</p>
      </div>

      {/* ¿Qué es? */}
      <Section icon={<Star size={22} className="text-[#FFD700]" />} title="¿Qué es Che-Bacano?" color="text-[#FFD700]">
        <p className="text-white text-base leading-relaxed">
          Che-Bacano es la polla familiar del Mundial 2026. Cada participante predice los resultados de los <strong className="text-[#FFD700]">103 partidos</strong> del torneo y acumula puntos según sus aciertos. Al final, el que más puntos tenga se lleva el primer premio. Simple, divertido y competitivo.
        </p>
      </Section>

      {/* Inscripción */}
      <Section icon={<DollarSign size={22} className="text-green-400" />} title="Inscripción y costos" color="text-green-400">
        <div className="space-y-3">
          <Row icon={<Users size={18} className="text-[#FFD700]" />} label="Familia" value="$25" color="text-[#FFD700]" />
          <Row icon={<Users size={18} className="text-[#FFD700]" />} label="Invitados" value="$25" color="text-[#FFD700]" />
          <Row icon={<RefreshCw size={18} className="text-[#A855F7]" />} label="Re-enganche (solo en Octavos)" value="$25" color="text-[#A855F7]" />
        </div>
        <div className="mt-3 flex items-start gap-2 bg-green-500/10 border border-green-500/20 rounded-xl p-3">
          <CheckCircle size={16} className="text-green-400 shrink-0 mt-0.5" />
          <p className="text-green-400 text-sm font-bold">El 100% de las inscripciones va al pozo de premios. Nada se queda en la casa.</p>
        </div>
      </Section>

      {/* Referidos */}
      <Section icon={<Gift size={22} className="text-[#22C55E]" />} title="Sistema de referidos" color="text-[#22C55E]">
        <p className="text-white text-base leading-relaxed mb-3">
          Por cada persona que traés al juego recibís <strong className="text-[#22C55E]">$5 en créditos (50 créditos)</strong> como bonificación.
        </p>
        <div className="space-y-2">
          {[
            { n: 1, value: '$5 créditos' },
            { n: 2, value: '$10 créditos' },
            { n: 3, value: '$15 créditos' },
            { n: 4, value: '$20 créditos' },
            { n: 5, value: '$25 créditos' },
            { n: 6, value: '$30 créditos (máximo)' },
          ].map(({ n, value }) => (
            <div key={n} className="flex items-center justify-between bg-[#0D0D0D] rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#22C55E]/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-[#22C55E]">{n}</span>
                </div>
                <span className="text-white font-bold">{n === 1 ? '1 referido' : `${n} referidos`}</span>
              </div>
              <span className={`font-bebas text-xl ${n === 6 ? 'text-[#FFD700]' : 'text-[#22C55E]'}`}>{value}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
          <AlertTriangle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-yellow-400 text-sm font-bold">A partir del 7mo referido no se otorgan más créditos. El máximo es $30 en créditos por referidos.</p>
        </div>
      </Section>

      {/* Créditos */}
      <Section icon={<CreditCard size={22} className="text-blue-400" />} title="Sistema de créditos" color="text-blue-400">
        <Row icon={<DollarSign size={18} className="text-blue-400" />} label="1 dólar" value="10 créditos" color="text-blue-400" />
        <p className="text-gray-400 text-sm mt-3">Los créditos se usan para pagar cambios tardíos, El Oráculo y las batallas. Se cargan manualmente enviando el comprobante al admin.</p>
        <div className="mt-3 flex items-start gap-2 bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
          <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
          <p className="text-blue-400 text-sm font-bold">Podés cargar los créditos que quieras en cualquier momento desde tu Wallet.</p>
        </div>
      </Section>

      {/* Premios */}
      <Section icon={<Trophy size={22} className="text-[#FFD700]" />} title="Premios" color="text-[#FFD700]">
        <div className="grid grid-cols-3 gap-3">
          {[
            { place: '1° lugar', pct: '60%', color: 'text-[#FFD700]', border: 'border-[#FFD700]/30', bg: 'bg-[#FFD700]/5' },
            { place: '2° lugar', pct: '30%', color: 'text-gray-300', border: 'border-gray-500/30', bg: 'bg-gray-500/5' },
            { place: '3° lugar', pct: '10%', color: 'text-amber-600', border: 'border-amber-600/30', bg: 'bg-amber-600/5' },
          ].map(({ place, pct, color, border, bg }) => (
            <div key={place} className={`${bg} border ${border} rounded-xl p-4 text-center`}>
              <Trophy size={24} className={`${color} mx-auto mb-2`} />
              <p className={`font-bebas text-3xl ${color}`}>{pct}</p>
              <p className="text-xs font-bold text-white mt-1">{place}</p>
              <p className="text-xs text-gray-400">Del pozo total</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Sistema de puntos */}
      <Section icon={<Star size={22} className="text-[#A855F7]" />} title="Sistema de puntos" color="text-[#A855F7]">
        <div className="space-y-2">
          <PuntosRow nivel="Nivel 1" desc="Acertás el ganador o empate" pts={20} color="text-[#FFD700]" />
          <PuntosRow nivel="Nivel 2" desc="Acertás el marcador exacto" pts={25} color="text-[#A855F7]" />
          <PuntosRow nivel="Nivel 3" desc="Acertás los goles por tiempo (1er y 2do)" pts={15} color="text-orange-400" />
          <PuntosRow nivel="Nivel 4" desc="Acertás si va a penales (solo eliminatorias)" pts={10} color="text-red-400" />
        </div>
        <div className="mt-3 flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
          <AlertTriangle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-yellow-400 text-sm font-bold">Caso especial 0-0: Si el partido termina 0-0 y pusiste empate con marcador 0-0, solo cobrás el Nivel 1 (20 pts). No suma Nivel 2.</p>
        </div>
        <div className="mt-2 flex items-start gap-2 bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-xl p-3">
          <Info size={16} className="text-[#22C55E] shrink-0 mt-0.5" />
          <p className="text-[#22C55E] text-sm font-bold">Los niveles son acumulativos — podés sumar hasta 70 puntos por partido en eliminatorias.</p>
        </div>
      </Section>

      {/* Fees */}
      <Section icon={<Clock size={22} className="text-orange-400" />} title="Cuándo podés hacer las predicciones" color="text-orange-400">
        <div className="space-y-2">
          <FeeRow icon={<CheckCircle size={16} className="text-[#22C55E]" />} tiempo="Más de 24hs antes" fee="Gratis" mult="100% de los puntos" color="text-[#22C55E]" />
          <FeeRow icon={<Clock size={16} className="text-yellow-400" />} tiempo="Entre 1 y 24hs antes" fee="$2 · 20 créditos" mult="75% de los puntos" color="text-yellow-400" />
          <FeeRow icon={<Clock size={16} className="text-orange-400" />} tiempo="15 minutos antes" fee="$3 · 30 créditos" mult="50% de los puntos" color="text-orange-400" />
          <FeeRow icon={<Clock size={16} className="text-red-400" />} tiempo="5 minutos antes" fee="$5 · 50 créditos" mult="25% de los puntos" color="text-red-400" />
          <FeeRow icon={<Lock size={16} className="text-gray-500" />} tiempo="Partido empezado" fee="Bloqueado" mult="No se puede modificar" color="text-gray-500" />
        </div>
        <p className="text-gray-400 text-xs mt-3">Los fees se descuentan automáticamente de tus créditos.</p>
      </Section>

      {/* Re-enganche */}
      <Section icon={<RefreshCw size={22} className="text-[#A855F7]" />} title="Re-enganche" color="text-[#A855F7]">
        <p className="text-white text-base leading-relaxed mb-3">
          ¿Quedaste muy atrás en el ranking de grupos? Podés re-engancharte al inicio de cada etapa eliminatoria pagando <strong className="text-[#A855F7]">$25</strong>. Todos pagan lo mismo.
        </p>
        <div className="space-y-2">
          {[
            { etapa: 'Octavos de Final' },
            { etapa: 'Cuartos de Final' },
            { etapa: 'Semifinales' },
          ].map(({ etapa }) => (
            <div key={etapa} className="flex items-center justify-between bg-[#0D0D0D] rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <RefreshCw size={16} className="text-[#A855F7]" />
                <span className="text-white font-bold">{etapa}</span>
              </div>
              <span className="font-bebas text-2xl text-[#A855F7]">$25</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-start gap-2 bg-[#A855F7]/10 border border-[#A855F7]/30 rounded-xl p-3">
          <Info size={16} className="text-[#A855F7] shrink-0 mt-0.5" />
          <p className="text-[#A855F7] text-sm font-bold">Al re-engancharte sumás 50 puntos base a tu ranking actual. Los que jugaron bien desde el principio mantienen su ventaja — los 50 puntos son el precio de haber entrado tarde.</p>
        </div>
      </Section>

      {/* El Oráculo */}
      <Section icon={<Sparkles size={22} className="text-[#A855F7]" />} title="El Oráculo — IA para llenar tu polla" color="text-[#A855F7]">
        <p className="text-white text-base leading-relaxed mb-3">
          El Oráculo llena automáticamente todos los partidos por <strong className="text-[#A855F7]">$5 (50 créditos)</strong>.
          Cada usuario recibe <strong className="text-[#FFD700]">predicciones únicas</strong> basadas en su perfil.
        </p>
        <div className="space-y-2">
          {[
            { icon: <Trophy size={16} className="text-[#FFD700]" />, text: 'Tu equipo favorito siempre gana en tu polla' },
            { icon: <Users size={16} className="text-blue-400" />, text: 'Tu país de residencia genera un sesgo cultural único' },
            { icon: <BarChart2 size={16} className="text-green-400" />, text: 'Tu historial de predicciones define tu estilo' },
            { icon: <Star size={16} className="text-[#A855F7]" />, text: 'Se te asigna una personalidad futbolística exclusiva' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 bg-[#0D0D0D] rounded-xl px-3 py-2.5">
              <div className="shrink-0">{icon}</div>
              <p className="text-gray-300 text-sm">{text}</p>
            </div>
          ))}
        </div>
        <p className="text-gray-400 text-xs mt-3">Podés modificar cualquier predicción del Oráculo después de que las genere.</p>
      </Section>

      {/* Batallas */}
      <Section icon={<Zap size={22} className="text-orange-400" />} title="Batallas" color="text-orange-400">
        <p className="text-white text-base leading-relaxed mb-3">
          Apuestas directas entre dos participantes. Elegís un partido, tu predicción y el monto. Otro participante acepta apostando lo contrario.
        </p>
        <div className="flex items-start gap-2 bg-orange-500/10 border border-orange-500/30 rounded-xl p-3">
          <Zap size={16} className="text-orange-400 shrink-0 mt-0.5" />
          <p className="text-orange-400 text-sm font-bold">El ganador se lleva todo el pozo de la batalla. Es aparte del ranking general.</p>
        </div>
      </Section>

      {/* El Chat */}
      <Section icon={<MessageCircle size={22} className="text-[#22C55E]" />} title="Chat del Quilombo" color="text-[#22C55E]">
        <p className="text-white text-base leading-relaxed">
          El espacio para hablar de fútbol, bardear amigos y festejar goles. Mensajes, fotos, GIFs y reacciones con emojis. <strong className="text-[#22C55E]">Respeto ante todo</strong> — hay moderación automática y manual.
        </p>
        <div className="mt-3 flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
          <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm font-bold">Insultos, política y contenido inapropiado están prohibidos. Los moderadores pueden silenciar o banear usuarios.</p>
        </div>
      </Section>

      {/* Roles */}
      <Section icon={<Crown size={22} className="text-[#FFD700]" />} title="Roles" color="text-[#FFD700]">
        <div className="space-y-2">
          <RolRow icon={<Crown size={16} className="text-[#FFD700]" />} rol="Super Admin" desc="Control total del sistema" color="text-[#FFD700]" />
          <RolRow icon={<Star size={16} className="text-blue-400" />} rol="Admin" desc="Carga resultados y ayuda a usuarios" color="text-blue-400" />
          <RolRow icon={<Users size={16} className="text-[#22C55E]" />} rol="Familia" desc="Participantes — inscripción $25" color="text-[#22C55E]" />
          <RolRow icon={<Users size={16} className="text-gray-400" />} rol="Invitado" desc="Participantes — inscripción $25" color="text-gray-400" />
        </div>
      </Section>

      {/* FAQ */}
      <Section icon={<HelpCircle size={22} className="text-blue-400" />} title="Preguntas frecuentes" color="text-blue-400">
        <div className="space-y-3">
          {[
            { q: '¿Qué pasa si no lleno un partido?', a: 'No sumás puntos en ese partido. Te recomendamos tener al menos el Nivel 1 (ganador) para todos los partidos.' },
            { q: '¿Puedo modificar mis predicciones?', a: 'Sí, gratis hasta 24hs antes. Después podés pagar para modificar pero con menos puntos.' },
            { q: '¿Cuándo se calculan los puntos?', a: 'El admin carga el resultado final y el sistema calcula automáticamente los puntos de cada participante.' },
            { q: '¿Cómo se paga el premio?', a: 'Se coordina directamente con el organizador una vez terminado el torneo.' },
            { q: '¿Cómo cargo créditos?', a: 'Desde tu Wallet — mandás el comprobante de pago y el admin te acredita. 1 dólar = 10 créditos.' },
            { q: '¿Qué pasa con el 0-0?', a: 'Si pusiste empate y marcador 0-0 y el resultado es 0-0, solo cobrás el Nivel 1 (20 pts). No suma Nivel 2.' },
            { q: '¿Qué es el re-enganche?', a: 'Al inicio de la fase de Octavos podés pagar $25 y sumar 50 puntos al ranking. Disponible una sola vez por persona.' },
            { q: '¿Cuántos créditos gano por referidos?', a: '$5 en créditos por cada persona que traés. Máximo hasta 6 referidos = $30 en créditos.' },
          ].map(({ q, a }) => (
            <div key={q} className="bg-[#0D0D0D] border border-[#2A2A4A] rounded-xl p-3">
              <div className="flex items-start gap-2 mb-1">
                <HelpCircle size={14} className="text-blue-400 shrink-0 mt-0.5" />
                <p className="text-white font-bold text-sm">{q}</p>
              </div>
              <p className="text-gray-400 text-sm pl-5">{a}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Links rápidos */}
      <Section icon={<ExternalLink size={22} className="text-gray-400" />} title="Accesos rápidos" color="text-gray-400">
        <div className="grid grid-cols-2 gap-2">
          {[
            { href: '/dashboard', label: 'Dashboard', icon: <Home size={16} className="text-[#FFD700]" /> },
            { href: '/schedule', label: 'Fixture', icon: <Calendar size={16} className="text-blue-400" /> },
            { href: '/my-picks', label: 'Mi Polla', icon: <Trophy size={16} className="text-[#FFD700]" /> },
            { href: '/leaderboard', label: 'Ranking', icon: <BarChart2 size={16} className="text-[#22C55E]" /> },
            { href: '/challenges', label: 'Batallas', icon: <Zap size={16} className="text-orange-400" /> },
            { href: '/chat', label: 'Chat del Quilombo', icon: <MessageCircle size={16} className="text-[#22C55E]" /> },
            { href: '/ai-picks', label: 'El Oráculo', icon: <Sparkles size={16} className="text-[#A855F7]" /> },
            { href: '/wallet', label: 'Wallet', icon: <Wallet size={16} className="text-blue-400" /> },
            { href: '/join', label: 'Inscripción', icon: <FileText size={16} className="text-gray-400" /> },
          ].map(({ href, label, icon }) => (
            <Link key={href} href={href}
              className="flex items-center gap-2 bg-[#0D0D0D] border border-[#2A2A4A] rounded-xl px-3 py-2.5 hover:border-[#FFD700]/40 transition-all">
              {icon}
              <span className="text-white text-sm font-bold">{label}</span>
            </Link>
          ))}
        </div>
      </Section>

      <div className="text-center mt-6 py-4 border-t border-[#2A2A4A]">
        <p className="text-gray-400 text-sm">¿Tenés más preguntas? Escribí en el Chat del Quilombo</p>
        <Link href="/chat" className="inline-flex items-center gap-2 mt-3 bg-[#22C55E] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#16A34A] transition-all">
          <MessageCircle size={18} />
          Ir al Chat del Quilombo
        </Link>
      </div>
    </div>
  )
}

function Section({ icon, title, color, children }: { icon: React.ReactNode; title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl p-5 mb-4">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className={`font-bebas text-2xl tracking-wider ${color}`}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

function Row({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between bg-[#0D0D0D] rounded-xl px-4 py-3">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-white font-bold">{label}</span>
      </div>
      <span className={`font-bebas text-2xl ${color}`}>{value}</span>
    </div>
  )
}

function PuntosRow({ nivel, desc, pts, color }: { nivel: string; desc: string; pts: number; color: string }) {
  return (
    <div className="flex items-center justify-between bg-[#0D0D0D] rounded-xl px-4 py-3">
      <div>
        <p className={`text-sm font-bold ${color}`}>{nivel}</p>
        <p className="text-xs text-gray-400">{desc}</p>
      </div>
      <span className={`font-bebas text-3xl ${color}`}>+{pts}</span>
    </div>
  )
}

function FeeRow({ icon, tiempo, fee, mult, color }: { icon: React.ReactNode; tiempo: string; fee: string; mult: string; color: string }) {
  return (
    <div className="flex items-center justify-between bg-[#0D0D0D] rounded-xl px-4 py-3">
      <div className="flex items-center gap-2">
        {icon}
        <div>
          <p className="text-sm font-bold text-white">{tiempo}</p>
          <p className={`text-xs font-bold ${color}`}>{mult}</p>
        </div>
      </div>
      <span className={`font-bebas text-xl ${color}`}>{fee}</span>
    </div>
  )
}

function RolRow({ icon, rol, desc, color }: { icon: React.ReactNode; rol: string; desc: string; color: string }) {
  return (
    <div className="flex items-center gap-3 bg-[#0D0D0D] rounded-xl px-4 py-3">
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <p className={`text-sm font-bold ${color}`}>{rol}</p>
        <p className="text-xs text-gray-400">{desc}</p>
      </div>
    </div>
  )
}
