import { useState, type ReactNode } from 'react'
import { CalendarCheck, CalendarClock, Inbox, MapPin, Repeat, Target } from 'lucide-react'
import Folha from './Folha'
import { useApp } from '../lib/ContextoApp'
import { combinar, hhmm, hojeISO, SEMANA_SEG } from '../lib/datas'
import type { Atividade, NovaAtividade, TipoAtividade } from '../lib/tipos'

export interface OpcoesForm {
  editar?: Atividade | null
  tipoInicial?: TipoAtividade
  areaId?: string | null
  dia?: string
}

const TIPOS: { id: TipoAtividade; rotulo: string; dica: string; icone: ReactNode }[] = [
  { id: 'compromisso', rotulo: 'Presença', dica: 'Hora marcada, preciso estar lá', icone: <MapPin size={20} /> },
  { id: 'prazo', rotulo: 'Com prazo', dica: 'Até uma data, sem hora', icone: <CalendarClock size={20} /> },
  { id: 'agendada', rotulo: 'Agendada', dica: 'Escolhi o dia de fazer', icone: <CalendarCheck size={20} /> },
  { id: 'flexivel', rotulo: 'Meta da semana', dica: 'X vezes na semana, dia livre', icone: <Target size={20} /> },
  { id: 'rotina', rotulo: 'Rotina', dica: 'Todo dia ou dias fixos', icone: <Repeat size={20} /> },
  { id: 'caixa', rotulo: 'Só anotar', dica: 'Decido depois', icone: <Inbox size={20} /> },
]

// Ordem dos botões de dia: segunda a domingo, mas o valor guardado é 0=Dom ... 6=Sáb
const VALOR_DIA = [1, 2, 3, 4, 5, 6, 0]

export default function FormAtividade({ editar, tipoInicial, areaId, dia: diaInicial, aoFechar }: OpcoesForm & { aoFechar: () => void }) {
  const { areas, criar, atualizar } = useApp()
  const [tipo, setTipo] = useState<TipoAtividade>(editar?.tipo ?? tipoInicial ?? 'compromisso')
  const [titulo, setTitulo] = useState(editar?.titulo ?? '')
  const [area, setArea] = useState(editar?.area_id ?? areaId ?? '')
  const [dia, setDia] = useState(editar?.dia ?? diaInicial ?? hojeISO())
  const [hora, setHora] = useState(editar?.inicio ? hhmm(editar.inicio) : '')
  const [horaFim, setHoraFim] = useState(editar?.fim ? hhmm(editar.fim) : '')
  const [prazo, setPrazo] = useState(editar?.prazo ?? diaInicial ?? hojeISO())
  const [meta, setMeta] = useState(editar?.meta_semana ?? 3)
  const [diasSemana, setDiasSemana] = useState<Set<number>>(new Set(editar?.dias_semana ?? []))
  const [local, setLocal] = useState(editar?.local ?? '')
  const [endereco, setEndereco] = useState(editar?.endereco ?? '')
  const [lembrete, setLembrete] = useState<string>(editar?.lembrete_min != null ? String(editar.lembrete_min) : '')
  const [importante, setImportante] = useState(editar?.prioridade === 'alta')
  const [notas, setNotas] = useState(editar?.descricao ?? '')
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  const ativas = areas.filter((a) => !a.arquivada)
  const comHorario = tipo === 'compromisso' || (tipo === 'agendada' && hora !== '')

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    const t = titulo.trim()
    if (!t) return setErro('Escreva um nome para a atividade.')
    if (tipo === 'compromisso' && (!dia || !hora)) return setErro('Para um compromisso com presença, escolha o dia e a hora.')
    if (tipo === 'agendada' && !dia) return setErro('Escolha o dia.')
    if (tipo === 'prazo' && !prazo) return setErro('Escolha a data do prazo.')
    if (horaFim && hora && horaFim <= hora) return setErro('A hora de fim precisa ser depois da hora de início.')

    const p: NovaAtividade = {
      titulo: t,
      tipo,
      area_id: area || null,
      descricao: notas.trim() || null,
      prioridade: importante ? 'alta' : 'normal',
      dia: tipo === 'compromisso' || tipo === 'agendada' ? dia : null,
      inicio: comHorario ? combinar(dia, hora) : null,
      fim: comHorario && horaFim ? combinar(dia, horaFim) : null,
      prazo: tipo === 'prazo' ? prazo : null,
      meta_semana: tipo === 'flexivel' ? meta : null,
      dias_semana: tipo === 'rotina' && diasSemana.size > 0 && diasSemana.size < 7 ? [...diasSemana].sort() : null,
      local: tipo === 'compromisso' ? local.trim() || null : null,
      endereco: tipo === 'compromisso' ? endereco.trim() || null : null,
      lembrete_min: comHorario && lembrete !== '' ? Number(lembrete) : null,
    }
    setSalvando(true)
    try {
      if (editar) await atualizar(editar.id, p)
      else await criar(p)
      aoFechar()
    } catch {
      setErro('Não consegui salvar agora. Tente de novo.')
      setSalvando(false)
    }
  }

  async function paraLixeira() {
    if (!editar) return
    if (!confirm(`Mover “${editar.titulo}” para a lixeira? Você pode restaurar depois, em Tarefas.`)) return
    await atualizar(editar.id, { excluida_em: new Date().toISOString() })
    aoFechar()
  }

  return (
    <Folha titulo={editar ? 'Editar' : 'Nova atividade'} aoFechar={aoFechar}>
      <form onSubmit={salvar} className="flex flex-col gap-4">
        <div>
          <span className="rotulo">O que é?</span>
          <div className="grid grid-cols-2 gap-2">
            {TIPOS.map((x) => (
              <button
                type="button"
                key={x.id}
                onClick={() => setTipo(x.id)}
                aria-pressed={tipo === x.id}
                className={`flex items-start gap-2 rounded-2xl border-2 p-3 text-left ${tipo === x.id ? 'border-destaque bg-rosa/30' : 'border-borda bg-transparent'}`}
              >
                <span className="mt-0.5 text-destaque">{x.icone}</span>
                <span>
                  <span className="block text-sm font-extrabold">{x.rotulo}</span>
                  <span className="block text-xs leading-tight text-suave">{x.dica}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="rotulo" htmlFor="ativ-titulo">Nome</label>
          <input id="ativ-titulo" className="campo" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Consulta, Academia, Banho dos cachorros" autoFocus />
        </div>

        {tipo !== 'caixa' && (
          <div>
            <label className="rotulo" htmlFor="ativ-area">Área</label>
            <select id="ativ-area" className="campo" value={area} onChange={(e) => setArea(e.target.value)}>
              <option value="">Sem área</option>
              {ativas.map((a) => (
                <option key={a.id} value={a.id}>{a.nome}</option>
              ))}
            </select>
          </div>
        )}

        {(tipo === 'compromisso' || tipo === 'agendada') && (
          <>
            <div>
              <label className="rotulo" htmlFor="ativ-dia">Dia</label>
              <input id="ativ-dia" type="date" className="campo" value={dia} onChange={(e) => setDia(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="rotulo" htmlFor="ativ-hora">Hora {tipo === 'agendada' && '(opcional)'}</label>
                <input id="ativ-hora" type="time" className="campo" value={hora} onChange={(e) => setHora(e.target.value)} />
              </div>
              <div>
                <label className="rotulo" htmlFor="ativ-fim">Termina às (opcional)</label>
                <input id="ativ-fim" type="time" className="campo" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} />
              </div>
            </div>
          </>
        )}

        {tipo === 'compromisso' && (
          <>
            <div>
              <label className="rotulo" htmlFor="ativ-local">Local</label>
              <input id="ativ-local" className="campo" value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Ex.: Clínica Vet Amigo" />
            </div>
            <div>
              <label className="rotulo" htmlFor="ativ-end">Endereço ou link</label>
              <input id="ativ-end" className="campo" value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Rua, número... ou link da reunião" />
            </div>
          </>
        )}

        {comHorario && (
          <div>
            <label className="rotulo" htmlFor="ativ-lembrete">Lembrar antes</label>
            <select id="ativ-lembrete" className="campo" value={lembrete} onChange={(e) => setLembrete(e.target.value)}>
              <option value="">Sem lembrete</option>
              <option value="15">15 minutos antes</option>
              <option value="30">30 minutos antes</option>
              <option value="60">1 hora antes</option>
              <option value="1440">1 dia antes</option>
            </select>
            <p className="mb-0 mt-1 text-xs text-suave">O lembrete já fica guardado; os avisos no celular chegam em uma etapa futura.</p>
          </div>
        )}

        {tipo === 'prazo' && (
          <div>
            <label className="rotulo" htmlFor="ativ-prazo">Entregar até</label>
            <input id="ativ-prazo" type="date" className="campo" value={prazo} onChange={(e) => setPrazo(e.target.value)} />
          </div>
        )}

        {tipo === 'flexivel' && (
          <div>
            <span className="rotulo">Quantas vezes por semana?</span>
            <div className="flex items-center gap-4">
              <button type="button" className="btn btn-suave !min-h-11 !px-5 text-xl" onClick={() => setMeta(Math.max(1, meta - 1))} aria-label="Menos">−</button>
              <span className="min-w-10 text-center text-2xl font-extrabold">{meta}x</span>
              <button type="button" className="btn btn-suave !min-h-11 !px-5 text-xl" onClick={() => setMeta(Math.min(7, meta + 1))} aria-label="Mais">＋</button>
            </div>
            <p className="mb-0 mt-2 text-xs text-suave">Ela não ocupa o calendário. Você escolhe o dia quando quiser, em Tarefas → Metas.</p>
          </div>
        )}

        {tipo === 'rotina' && (
          <div>
            <span className="rotulo">Quais dias? (nenhum marcado = todos os dias)</span>
            <div className="flex flex-wrap gap-2">
              {SEMANA_SEG.map((nome, i) => {
                const v = VALOR_DIA[i]
                const on = diasSemana.has(v)
                return (
                  <button
                    type="button"
                    key={nome}
                    aria-pressed={on}
                    onClick={() => {
                      const n = new Set(diasSemana)
                      if (on) n.delete(v)
                      else n.add(v)
                      setDiasSemana(n)
                    }}
                    className={`h-10 min-w-12 rounded-full border-2 px-3 text-sm font-bold ${on ? 'border-destaque bg-rosa/40' : 'border-borda bg-transparent'}`}
                  >
                    {nome}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {tipo !== 'caixa' && (
          <>
            <label className="flex items-center gap-3 font-bold">
              <input type="checkbox" checked={importante} onChange={(e) => setImportante(e.target.checked)} className="h-5 w-5 accent-[var(--c-destaque)]" />
              Marcar como importante
            </label>
            <div>
              <label className="rotulo" htmlFor="ativ-notas">Anotações (opcional)</label>
              <textarea id="ativ-notas" className="campo" value={notas} onChange={(e) => setNotas(e.target.value)} />
            </div>
          </>
        )}

        {erro && <p className="m-0 rounded-2xl bg-pessego/50 px-4 py-3 text-sm">{erro}</p>}

        <div className="flex gap-3">
          <button type="button" className="btn btn-suave" onClick={aoFechar}>Cancelar</button>
          <button className="btn flex-1" disabled={salvando}>{salvando ? 'Salvando…' : editar ? 'Salvar' : tipo === 'caixa' ? 'Guardar' : 'Criar'}</button>
        </div>
        {editar && (
          <button type="button" className="border-0 bg-transparent p-2 text-sm font-bold text-suave" onClick={paraLixeira}>
            Mover para a lixeira
          </button>
        )}
      </form>
    </Folha>
  )
}
