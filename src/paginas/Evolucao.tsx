import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CheckCheck, Target } from 'lucide-react'
import { useApp } from '../lib/ContextoApp'
import { concluidasPorSemana, metasDaSemana } from '../lib/agenda'
import { dataCurta, hojeISO } from '../lib/datas'

export default function Evolucao() {
  const { atividades, ocorrencias } = useApp()
  const hoje = hojeISO()
  const semanas = useMemo(() => concluidasPorSemana(hoje, 6, atividades, ocorrencias), [hoje, atividades, ocorrencias])
  const { metas, percentual } = useMemo(() => metasDaSemana(hoje, atividades, ocorrencias), [hoje, atividades, ocorrencias])
  const maior = Math.max(1, ...semanas.map((s) => s.total))
  const estaSemana = semanas[semanas.length - 1]?.total ?? 0
  const anterior = semanas[semanas.length - 2]?.total ?? 0
  const semDados = semanas.every((s) => s.total === 0)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="m-0 text-2xl font-semibold text-titulo">Evolução</h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="cartao flex flex-col gap-1 p-4">
          <Target className="text-titulo" />
          <span className="font-display text-3xl font-semibold">{metas.length === 0 ? '—' : `${percentual}%`}</span>
          <span className="text-sm text-suave">das metas desta semana</span>
        </div>
        <div className="cartao flex flex-col gap-1 p-4">
          <CheckCheck className="text-emerald-500" />
          <span className="font-display text-3xl font-semibold">{estaSemana}</span>
          <span className="text-sm text-suave">
            {estaSemana === 1 ? 'coisa feita' : 'coisas feitas'} esta semana{anterior > 0 ? ` (semana passada: ${anterior})` : ''}
          </span>
        </div>
      </div>

      <section className="cartao p-4" aria-label="Concluídas por semana">
        <h2 className="m-0 mb-1 text-lg font-semibold text-titulo">O que você fez, semana a semana</h2>
        <p className="m-0 mb-3 text-sm text-suave">Tarefas concluídas, metas e rotinas marcadas.</p>
        {semDados ? (
          <p className="m-0 py-6 text-center text-suave">Quando você marcar suas primeiras tarefas como feitas, o gráfico aparece aqui.</p>
        ) : (
          <svg viewBox="0 0 320 170" className="w-full" role="img" aria-label={`Concluídas por semana: ${semanas.map((s) => `${dataCurta(s.inicio)}: ${s.total}`).join(', ')}`}>
            {semanas.map((s, i) => {
              const h = (s.total / maior) * 110
              const x = 14 + i * 52
              const atual = i === semanas.length - 1
              return (
                <g key={s.inicio}>
                  <rect x={x} y={130 - h} width="34" height={Math.max(h, 2)} rx="10" fill={atual ? 'var(--cf-presenca)' : 'var(--cf-rosa)'} opacity={atual ? 1 : 0.55} />
                  <text x={x + 17} y={122 - h} textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--c-texto)">{s.total}</text>
                  <text x={x + 17} y="152" textAnchor="middle" fontSize="11" fill="var(--c-suave)">{dataCurta(s.inicio)}</text>
                </g>
              )
            })}
            <line x1="6" y1="130" x2="314" y2="130" stroke="var(--c-borda)" strokeWidth="2" />
          </svg>
        )}
        <p className="mb-0 mt-1 text-xs text-suave">As datas embaixo são o início de cada semana (segunda-feira).</p>
      </section>

      <section className="cartao p-4">
        <h2 className="m-0 mb-1 text-lg font-semibold text-titulo">Em breve aqui</h2>
        <p className="m-0 text-sm text-suave">
          Peso e medidas (Vida Fit), gastos do mês (Financeiro), produção da fazenda… cada área vai trazer os próprios gráficos conforme for construída.
        </p>
        <Link to="/tarefas?aba=metas" className="mt-3 inline-block text-sm font-bold text-titulo">Ver minhas metas da semana →</Link>
      </section>
    </div>
  )
}
