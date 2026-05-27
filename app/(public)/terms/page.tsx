export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0D0D1A', color: 'white', fontFamily: 'system-ui, sans-serif', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <a href="/" style={{ color: '#00C896', textDecoration: 'none', fontSize: '14px', display: 'block', marginBottom: '32px' }}>← Back</a>
        
        <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '8px' }}>Términos y Condiciones</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '40px', fontSize: '14px' }}>Última actualización: Mayo 2026</p>

        {[
          {
            title: '1. Descripción del Servicio',
            content: 'PoolZone es una plataforma de entretenimiento que permite a los usuarios participar en quinielas deportivas basadas en predictions del FIFA World Cup 2026. PoolZone NO es un servicio de apuestas deportivas regulado. Es un juego de habilidad y predicción para entretenimiento entre amigos y familia.'
          },
          {
            title: '2. Registration y Pago',
            content: 'La inscripción cuesta $30 USD por persona. Este pago es único y cubre toda la duración del torneo (11 junio al 19 julio 2026). De la inscripción, $20 se destinan al pozo de premios y el resto cubre los costos operativos de la plataforma. Los $5 en créditos incluidos son de uso exclusivo dentro de la plataforma y no son canjeables por dinero en efectivo.'
          },
          {
            title: '3. Créditos de la Plataforma',
            content: 'Los créditos otorgados al momento de la inscripción ($5 equivalente = 50 créditos) son exclusivos para uso dentro de PoolZone. Pueden usarse para consultas al Oracle IA, modificaciones tardías de predictions y challenges entre usuarios. Los créditos NO son dinero real y NO pueden ser retirados ni canjeados por efectivo bajo ninguna circunstancia.'
          },
          {
            title: '4. Pozo de Premios',
            content: 'El pozo se forma con $20 de cada inscripción. Los premios se distribuyen: 1° lugar 60%, 2° lugar 30%, 3° lugar 10%. Los premios se pagan dentro de las 48 horas posteriores a la final del Mundial (19 julio 2026) mediante Zelle (USA), Wise (internacional) o PayPal, según preferencia del ganador.'
          },
          {
            title: '5. Sistema de Points',
            content: 'Todos los participantes inician con 100 puntos base. Los puntos se otorgan por predictions correctas según los niveles establecidos en las reglas del juego. PoolZone se reserva el derecho de corregir errores en el cálculo de puntos. El ranking final se determina al concluir todos los matches del torneo.'
          },
          {
            title: '6. Re-enganche',
            content: 'El re-enganche ($25) está disponible una única vez por usuario durante la fase de Octavos de Final. Al re-engancharse, el usuario suma 50 puntos base a su puntaje actual. El fee del re-enganche no va al pozo de premios.'
          },
          {
            title: '7. Modificaciones de Predictions',
            content: 'Las predictions pueden modificarse antes del inicio de cada partido. Modificaciones realizadas con menos de 24 horas antes del partido tienen un cargo adicional ($2, $3 o $5 según el tiempo restante). Estos cargos se descuentan de los créditos del usuario.'
          },
          {
            title: '8. Conducta del Usuario',
            content: 'Queda prohibido el uso de bots, scripts o cualquier método automatizado para manipular predictions. El lenguaje ofensivo, discriminatorio o violento en el chat será motivo de expulsión sin reembolso. PoolZone se reserva el derecho de descalificar usuarios que violen estas normas.'
          },
          {
            title: '9. No Reembolsos',
            content: 'Una vez completada la inscripción y el pago, no se realizan reembolsos. En caso de cancelación del torneo por causas de fuerza mayor, PoolZone devolverá el 100% del pozo de premios a los participantes.'
          },
          {
            title: '10. Privacidad',
            content: 'PoolZone recopila nombre de usuario, email y foto de perfil para el funcionamiento de la plataforma. No vendemos ni compartimos datos personales con terceros. Los datos se almacenan de forma segura mediante Supabase y están protegidos por cifrado SSL.'
          },
          {
            title: '11. Limitación de Responsabilidad',
            content: 'PoolZone no se responsabiliza por problemas técnicos fuera de nuestro control (caídas de internet, interrupciones del servidor, etc.). En caso de problemas técnicos que afecten predictions, se evaluará caso por caso. La responsabilidad máxima de PoolZone está limitada al monto pagado por el usuario.'
          },
          {
            title: '12. Jurisdicción',
            content: 'Estos términos se rigen por las leyes del Estado de Texas, Estados Unidos. Cualquier disputa será resuelta mediante arbitraje informal entre las partes.'
          },
          {
            title: '13. Contacto',
            content: 'Para consultas, disputas o soporte: contacto@poolzone.app — Respondemos dentro de las 24 horas hábiles.'
          },
        ].map(({ title, content }) => (
          <div key={title} style={{ marginBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#00C896', marginBottom: '12px' }}>{title}</h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, margin: 0 }}>{content}</p>
          </div>
        ))}

        <div style={{ background: 'rgba(0,200,150,0.05)', border: '1px solid rgba(0,200,150,0.2)', borderRadius: '16px', padding: '20px', marginTop: '20px' }}>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: 0 }}>
            Al registrarte en PoolZone aceptás estos términos y condiciones. PoolZone es un juego de entretenimiento y predicción. Jugá con responsabilidad.
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.2)', marginTop: '40px' }}>
          poolzone.app · World Cup 2026
        </p>
      </div>
    </div>
  )
}
