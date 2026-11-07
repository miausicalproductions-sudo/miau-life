// Ilustrações do Miau Life, desenhadas em SVG (sem imagens externas).

/** Cabeça de gatinho, centrada em (0,0), com uns 130 de largura. */
function Cabeca({ olhos = 'feliz' }: { olhos?: 'feliz' | 'abertos' }) {
  return (
    <g>
      {/* orelhas */}
      <path d="M-58 -14 L-52 -62 L-14 -38 Z" fill="#FFF6EA" stroke="#E9C7B0" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M58 -14 L52 -62 L14 -38 Z" fill="#FFF6EA" stroke="#E9C7B0" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M-48 -24 L-46 -48 L-28 -36 Z" fill="#F7B6CB" />
      <path d="M48 -24 L46 -48 L28 -36 Z" fill="#F7B6CB" />
      {/* cabeça */}
      <ellipse cx="0" cy="4" rx="64" ry="50" fill="#FFF6EA" stroke="#E9C7B0" strokeWidth="2.5" />
      {/* manchas alaranjadas */}
      <path d="M-62 -6 Q-56 -40 -24 -44 Q-30 -20 -62 -6 Z" fill="#F6C28B" />
      <path d="M30 -46 Q50 -40 54 -24 Q40 -26 30 -46 Z" fill="#F6C28B" />
      {/* olhos */}
      {olhos === 'feliz' ? (
        <>
          <path d="M-36 4 Q-25 -10 -14 4" fill="none" stroke="#4A3A4A" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M14 4 Q25 -10 36 4" fill="none" stroke="#4A3A4A" strokeWidth="4.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="-25" cy="4" rx="7" ry="9" fill="#4A3A4A" />
          <ellipse cx="25" cy="4" rx="7" ry="9" fill="#4A3A4A" />
          <circle cx="-22.5" cy="0.5" r="2.6" fill="#fff" />
          <circle cx="27.5" cy="0.5" r="2.6" fill="#fff" />
        </>
      )}
      {/* bochechas, nariz, boca */}
      <ellipse cx="-44" cy="20" rx="12" ry="7" fill="#F7B6CB" opacity=".8" />
      <ellipse cx="44" cy="20" rx="12" ry="7" fill="#F7B6CB" opacity=".8" />
      <path d="M-5 16 L5 16 L0 23 Z" fill="#E58AAB" />
      <path d="M0 23 Q0 33 -9 32 M0 23 Q0 33 9 32" fill="none" stroke="#4A3A4A" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M-62 18 L-80 14 M-62 26 L-80 28 M62 18 L80 14 M62 26 L80 28" stroke="#D9B8A4" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  )
}

function Patinha({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="0" rx="17" ry="13" fill="#FFF6EA" stroke="#E9C7B0" strokeWidth="2.5" />
      <ellipse cx="0" cy="2" rx="5" ry="4" fill="#F7B6CB" />
      <circle cx="-8" cy="-3" r="2.4" fill="#F7B6CB" />
      <circle cx="0" cy="-6" r="2.4" fill="#F7B6CB" />
      <circle cx="8" cy="-3" r="2.4" fill="#F7B6CB" />
    </g>
  )
}

/** Gatinho deitado numa almofada (topo do Início). */
export function GatoAlmofada({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 190 120" className={className} role="img" aria-label="Gatinho deitado numa almofada">
      <rect x="6" y="26" width="86" height="78" rx="20" fill="#F9C9D8" stroke="#F0A9C0" strokeWidth="2.5" />
      <path d="M49 66 q-8 -9 -14 -1 q-5 8 14 19 q19 -11 14 -19 q-6 -8 -14 1 Z" fill="#F7A3BF" />
      <g transform="translate(96 62)">
        <Cabeca />
      </g>
      <Patinha x={70} y={108} />
      <Patinha x={122} y={108} />
      <path d="M160 18 q-6 -8 -12 -1 q-4 7 12 16 q16 -9 12 -16 q-6 -7 -12 1 Z" fill="#F7A3BF" />
    </svg>
  )
}

/** Gatinho segurando uma prancheta (metas da semana). */
export function GatoPrancheta({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 150 150" className={className} role="img" aria-label="Gatinho com uma prancheta">
      <g transform="translate(60 46) scale(0.78)">
        <Cabeca />
      </g>
      <rect x="62" y="70" width="70" height="74" rx="10" fill="#FFE9B8" stroke="#E7BE72" strokeWidth="3" transform="rotate(8 97 107)" />
      <rect x="84" y="64" width="26" height="12" rx="5" fill="#E7BE72" transform="rotate(8 97 70)" />
      <g transform="rotate(8 97 107)" stroke="#E58AAB" strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M74 92 l5 5 l9 -10" />
        <path d="M96 92 h26" stroke="#C9A25A" />
        <path d="M74 114 l5 5 l9 -10" />
        <path d="M96 114 h26" stroke="#C9A25A" />
      </g>
      <Patinha x={56} y={112} />
      <Patinha x={130} y={116} />
    </svg>
  )
}

/** Gatinho grande de rosto inteiro (Miau IA, telas vazias). */
export function GatoRosto({ className, olhos = 'abertos' }: { className?: string; olhos?: 'feliz' | 'abertos' }) {
  return (
    <svg viewBox="-90 -70 180 140" className={className} role="img" aria-label="Rostinho de gatinho">
      <Cabeca olhos={olhos} />
    </svg>
  )
}

/** Patinha solta, para detalhes decorativos. */
export function PatinhaIcone({ className }: { className?: string }) {
  return (
    <svg viewBox="-20 -20 40 40" className={className} aria-hidden>
      <ellipse cx="0" cy="6" rx="10" ry="8" fill="currentColor" />
      <circle cx="-11" cy="-4" r="4.5" fill="currentColor" />
      <circle cx="-4" cy="-11" r="4.5" fill="currentColor" />
      <circle cx="5" cy="-11" r="4.5" fill="currentColor" />
      <circle cx="12" cy="-4" r="4.5" fill="currentColor" />
    </svg>
  )
}
