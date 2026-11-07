import { Link } from 'react-router-dom'
import { useApp } from '../lib/ContextoApp'

const hojeISO = () => new Date().toLocaleDateString('sv-SE') // YYYY-MM-DD no fuso do aparelho

function saudacao() {
  const h = new Date().getHours()
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
}

export default function Inicio() {
  const { nome, areas, pendentes, erro } = useApp()
  const hoje = hojeISO()
  const dataExtenso = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  const caixa = pendentes.filter((p) => p.tipo === 'caixa')
  const doDia = pendentes.filter(
    (p) => p.tipo !== 'caixa' && (p.dia === hoje || p.prazo === hoje || p.inicio?.startsWith(hoje)),
  )
  const atrasadas = pendentes.filter((p) => p.tipo !== 'caixa' && p.prazo && p.prazo < hoje)
  const contagem = (id: string) => pendentes.filter((p) => p.area_id === id && p.tipo !== 'caixa').length
  const ativas = areas.filter((a) => !a.arquivada)

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="m-0 text-3xl font-extrabold">
            {saudacao()}, {nome} 🌷
          </h1>
          <p className="mt-1 text-suave first-letter:uppercase">{dataExtenso}</p>
        </div>
        <Link to="/ajustes" aria-label="Ajustes" className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-2xl no-underline md:hidden">
          ⚙️
        </Link>
      </header>

      {erro && (
        <div className="rounded-2xl bg-pessego/60 px-4 py-3 text-sm">
          Não consegui carregar seus dados agora. Confira a internet e puxe para atualizar. <span className="opacity-70">({erro})</span>
        </div>
      )}

      {(atrasadas.length > 0 || caixa.length > 0) && (
        <section aria-label="Alertas" className="flex flex-col gap-2">
          {atrasadas.length > 0 && (
            <div className="rounded-2xl bg-pessego/60 px-4 py-3 font-bold">
              ⏰ {atrasadas.length} {atrasadas.length === 1 ? 'tarefa passou do prazo' : 'tarefas passaram do prazo'}
            </div>
          )}
          {caixa.length > 0 && (
            <div className="rounded-2xl bg-lilas/50 px-4 py-3 font-bold">
              📥 {caixa.length} {caixa.length === 1 ? 'anotação' : 'anotações'} na Caixa de entrada para organizar
            </div>
          )}
        </section>
      )}

      <section className="cartao p-5">
        <h2 className="m-0 mb-3 text-lg font-extrabold">Hoje</h2>
        {doDia.length === 0 ? (
          <p className="m-0 text-suave">Nada marcado para hoje. Um dia tranquilo, miau 🐾</p>
        ) : (
          <ul className="m-0 list-none p-0">
            {doDia.map((a) => (
              <li key={a.id} className="border-b border-borda py-2 last:border-0">{a.titulo}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="cartao p-5">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="m-0 text-lg font-extrabold">Metas da semana</h2>
          <span className="rounded-full bg-lilas/50 px-3 py-1 text-xs font-bold">chega na Etapa 2</span>
        </div>
        <p className="m-0 text-suave">
          Academia 3x, banho dos cachorros, lavar o cabelo… as tarefas flexíveis vão aparecer aqui, sem ocupar o seu calendário.
        </p>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="m-0 text-lg font-extrabold">Minhas áreas</h2>
          <Link to="/areas" className="text-sm font-bold text-destaque">ver todas</Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {ativas.map((a) => {
            const n = contagem(a.id)
            return (
              <Link key={a.id} to={`/area/${a.id}`} className={`cartao-area cor-${a.cor} flex min-h-28 flex-col justify-between p-4 no-underline`} style={{ color: 'inherit' }}>
                <span className="text-3xl">{a.icone}</span>
                <span>
                  <span className="block font-extrabold">{a.nome}</span>
                  <span className="text-sm text-suave">{n === 0 ? 'tudo em dia' : `${n} ${n === 1 ? 'pendência' : 'pendências'}`}</span>
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Link to="/calendario" className="btn btn-suave no-underline">📅 Calendário</Link>
        <Link to="/ia" className="btn no-underline">🐱 Miau IA</Link>
      </section>
    </div>
  )
}
