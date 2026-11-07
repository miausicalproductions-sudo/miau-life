import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { CalendarDays, ChartColumn, Cat, House, Plus, Settings, SquareCheckBig } from 'lucide-react'
import { useApp } from '../lib/ContextoApp'
import { Icone, nomeIconeArea } from '../lib/icones'
import { ProvedorForm, useForm } from './ContextoForm'
import { GatoRosto } from './Gatinhos'

const itens = [
  { to: '/', rotulo: 'Início', Icone: House },
  { to: '/agenda', rotulo: 'Agenda', Icone: CalendarDays },
  { to: '/tarefas', rotulo: 'Tarefas', Icone: SquareCheckBig },
  { to: '/evolucao', rotulo: 'Evolução', Icone: ChartColumn },
  { to: '/ia', rotulo: 'Miau IA', Icone: Cat },
]

function classeLink({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-3 rounded-2xl px-4 py-3 font-bold no-underline ${isActive ? 'bg-rosa/50' : 'hover:bg-rosa/20'}`
}

export default function Estrutura({ children }: { children: ReactNode }) {
  return (
    <ProvedorForm>
      <Casca>{children}</Casca>
    </ProvedorForm>
  )
}

function Casca({ children }: { children: ReactNode }) {
  const { areas } = useApp()
  const { abrirForm } = useForm()

  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
      {/* Menu lateral: aparece no computador */}
      <aside className="sticky top-0 hidden h-screen flex-col gap-1 overflow-y-auto border-r border-borda p-5 md:flex">
        <div className="mb-4 flex items-center gap-2">
          <GatoRosto className="h-12 w-14" olhos="feliz" />
          <span className="titulo-miau text-2xl">Miau Life</span>
        </div>
        <button className="btn mb-3" onClick={() => abrirForm()}>
          <Plus size={20} /> Nova atividade
        </button>
        {itens.map(({ to, rotulo, Icone: I }) => (
          <NavLink key={to} to={to} end={to === '/'} className={classeLink}>
            <I size={22} />
            {rotulo}
          </NavLink>
        ))}
        <div className="mt-4 px-4 text-xs font-extrabold uppercase tracking-wide text-suave">Minhas áreas</div>
        {areas
          .filter((a) => !a.arquivada)
          .map((a) => (
            <NavLink key={a.id} to={`/area/${a.id}`} className={classeLink}>
              <Icone nome={nomeIconeArea(a)} size={22} />
              {a.nome}
            </NavLink>
          ))}
        <div className="mt-auto flex flex-col gap-1 pt-4">
          <NavLink to="/areas" className={classeLink}>
            <Plus size={22} /> Mais áreas
          </NavLink>
          <NavLink to="/ajustes" className={classeLink}>
            <Settings size={22} /> Ajustes
          </NavLink>
        </div>
      </aside>

      <main className="mx-auto w-full max-w-3xl px-4 pb-40 pt-[calc(1rem+env(safe-area-inset-top))] md:px-8 md:pb-24">{children}</main>

      <button className="fab" onClick={() => abrirForm()} aria-label="Nova atividade">
        <Plus size={30} strokeWidth={3} />
      </button>

      {/* Barra de baixo: aparece no celular */}
      <nav className="barra-baixo fixed inset-x-0 bottom-0 z-30 border-t border-borda bg-fundo/95 backdrop-blur md:hidden" aria-label="Menu principal">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1 px-2 pb-2 pt-2">
          {itens.map(({ to, rotulo, Icone: I }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-bold no-underline ${isActive ? 'bg-rosa/45 text-titulo' : 'text-suave'}`
              }
            >
              <I size={24} />
              {rotulo}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
