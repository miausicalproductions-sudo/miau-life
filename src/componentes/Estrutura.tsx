import { useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useApp } from '../lib/ContextoApp'
import AnotarRapido from './AnotarRapido'

const itens = [
  { to: '/', rotulo: 'Início', emoji: '🏠' },
  { to: '/calendario', rotulo: 'Calendário', emoji: '📅' },
  { to: '/ia', rotulo: 'Miau IA', emoji: '🐱' },
  { to: '/areas', rotulo: 'Áreas', emoji: '🗂️' },
]

function classeLink({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-3 rounded-2xl px-4 py-3 font-bold ${isActive ? 'bg-rosa/50' : 'hover:bg-rosa/20'}`
}

export default function Estrutura({ children }: { children: ReactNode }) {
  const [anotando, setAnotando] = useState(false)
  const { areas } = useApp()

  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
      {/* Menu lateral: aparece no computador */}
      <aside className="sticky top-0 hidden h-screen flex-col gap-1 overflow-y-auto border-r border-borda p-5 md:flex">
        <div className="mb-4 flex items-center gap-3 text-xl font-extrabold">
          <img src={`${import.meta.env.BASE_URL}icons/gatinho.svg`} alt="" className="h-10 w-10" />
          Miau Life
        </div>
        <button className="btn mb-3" onClick={() => setAnotando(true)}>
          🐾 Anotar rápido
        </button>
        {itens.map((i) => (
          <NavLink key={i.to} to={i.to} end={i.to === '/'} className={classeLink}>
            <span>{i.emoji}</span>
            {i.rotulo}
          </NavLink>
        ))}
        <div className="mt-4 px-4 text-xs font-extrabold uppercase tracking-wide text-suave">Minhas áreas</div>
        {areas
          .filter((a) => !a.arquivada)
          .map((a) => (
            <NavLink key={a.id} to={`/area/${a.id}`} className={classeLink}>
              <span>{a.icone}</span>
              {a.nome}
            </NavLink>
          ))}
        <div className="mt-auto pt-4">
          <NavLink to="/ajustes" className={classeLink}>
            <span>⚙️</span>Ajustes
          </NavLink>
        </div>
      </aside>

      <main className="mx-auto w-full max-w-3xl px-4 pb-32 pt-[calc(1.5rem+env(safe-area-inset-top))] md:px-8 md:pb-12">{children}</main>

      {/* Barra de baixo: aparece no celular */}
      <nav className="barra-baixo fixed inset-x-0 bottom-0 z-20 border-t border-borda bg-fundo/95 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 items-end px-2 pb-2 pt-2">
          {[itens[0], itens[1]].map((i) => (
            <Aba key={i.to} {...i} />
          ))}
          <button
            onClick={() => setAnotando(true)}
            aria-label="Anotar rápido"
            className="-mt-6 mb-1 grid h-16 w-16 place-items-center justify-self-center rounded-full bg-rosa text-3xl shadow-lg"
          >
            🐾
          </button>
          {[itens[2], itens[3]].map((i) => (
            <Aba key={i.to} {...i} />
          ))}
        </div>
      </nav>

      {anotando && <AnotarRapido aoFechar={() => setAnotando(false)} />}
    </div>
  )
}

function Aba({ to, rotulo, emoji }: { to: string; rotulo: string; emoji: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 rounded-2xl py-1 text-[11px] font-bold ${isActive ? 'text-destaque' : 'text-suave'}`
      }
    >
      <span className="text-2xl leading-none">{emoji}</span>
      {rotulo}
    </NavLink>
  )
}
