import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CalendarDays, ChevronLeft, Construction, Plus } from 'lucide-react'
import { useApp } from '../lib/ContextoApp'
import { useForm } from '../componentes/ContextoForm'
import ItemCartao from '../componentes/ItemCartao'
import { Icone, nomeIconeArea } from '../lib/icones'
import { infoPadrao } from '../lib/areasPadrao'
import { configDaArea } from '../lib/sugestoes'
import Cuidados from '../componentes/Cuidados'
import ListaCompras from '../componentes/ListaCompras'
import { ativa, itensDoDia, metasDaSemana, type ItemDia } from '../lib/agenda'
import { hojeISO, somarDias } from '../lib/datas'

export default function PaginaArea() {
  const { id } = useParams()
  const { areas, atividades, ocorrencias } = useApp()
  const { abrirForm } = useForm()
  const area = areas.find((a) => a.id === id)
  const hoje = hojeISO()

  // Próximos 30 dias desta área, sem as rotinas
  const proximos = useMemo(() => {
    const out: ItemDia[] = []
    const daArea = atividades.filter((a) => a.area_id === id)
    for (let k = 0; k < 30; k++) out.push(...itensDoDia(somarDias(hoje, k), daArea, ocorrencias).filter((i) => i.categoria !== 'rotina'))
    return out
  }, [atividades, ocorrencias, id, hoje])

  const metas = useMemo(
    () => metasDaSemana(hoje, atividades.filter((a) => a.area_id === id), ocorrencias).metas,
    [atividades, ocorrencias, id, hoje],
  )
  const rotinas = atividades.filter((a) => ativa(a) && a.area_id === id && a.tipo === 'rotina')
  const rotinasHoje = useMemo(
    () => itensDoDia(hoje, atividades.filter((a) => a.area_id === id), ocorrencias).filter((i) => i.categoria === 'rotina'),
    [atividades, ocorrencias, id, hoje],
  )

  if (!area) {
    return (
      <div className="cartao p-8 text-center">
        <p>Não encontrei essa área.</p>
        <Link to="/areas" className="btn no-underline">Ver minhas áreas</Link>
      </div>
    )
  }
  const info = infoPadrao(area.chave)
  const config = configDaArea(area.chave)

  return (
    <div className="flex flex-col gap-4">
      <Link to="/areas" className="inline-flex items-center gap-1 text-sm font-bold text-suave no-underline"><ChevronLeft size={18} /> Áreas</Link>
      <div className={`cartao-area cor-${area.cor} flex items-center gap-4 p-5`}>
        <Icone nome={nomeIconeArea(area)} size={56} strokeWidth={1.8} className="icone-forte" />
        <div>
          <h1 className="m-0 text-3xl font-semibold">{area.nome}</h1>
          <p className="m-0 mt-1 text-sm text-suave">{info?.resumo ?? 'Uma área só sua.'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button className="btn whitespace-nowrap" onClick={() => abrirForm({ areaId: area.id })}><Plus size={18} /> Nova atividade</button>
        <Link to={`/agenda?vista=mes&area=${area.id}`} className="btn btn-suave no-underline"><CalendarDays size={18} /> Calendário</Link>
      </div>

      {config && <Cuidados area={area} config={config} />}

      {rotinasHoje.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="m-0 text-lg font-semibold text-titulo">Rotinas de hoje</h2>
          {rotinasHoje.map((i) => <ItemCartao key={i.chave} item={i} aoAbrir={() => abrirForm({ editar: i.atividade })} />)}
        </section>
      )}

      {metas.length > 0 && (
        <section className="cartao p-4">
          <h2 className="m-0 mb-2 text-lg font-semibold text-titulo">Metas da semana</h2>
          <ul className="m-0 list-none p-0">
            {metas.map((m) => (
              <li key={m.atividade.id} className="flex justify-between py-1 font-bold">
                <span>{m.atividade.titulo}</span>
                <span className="text-suave">{Math.min(m.feitas, m.meta)}/{m.meta}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="m-0 text-lg font-semibold text-titulo">Próximos 30 dias</h2>
        {proximos.length === 0 ? (
          <p className="cartao m-0 p-5 text-center text-sm text-suave">Nada marcado nesta área. Use “Nova atividade” para começar.</p>
        ) : (
          proximos.map((i) => <ItemCartao key={i.chave} item={i} mostrarData aoAbrir={() => abrirForm({ editar: i.atividade })} />)
        )}
      </section>

      {area.chave === 'casa' && <ListaCompras area={area} />}

      {rotinas.length > 0 && (
        <section className="cartao p-4">
          <h2 className="m-0 mb-2 text-lg font-semibold text-titulo">Todas as rotinas</h2>
          <ul className="m-0 list-none p-0">
            {rotinas.map((r) => (
              <li key={r.id} className="py-1 font-bold">{r.titulo}</li>
            ))}
          </ul>
        </section>
      )}

      {!config && (
      <div className="cartao flex items-start gap-3 p-4 text-sm text-suave">
        <Construction size={22} className="mt-0.5 shrink-0 text-titulo" />
        <span>
          {info
            ? `Os recursos próprios de ${area.nome} (${info.resumo.toLowerCase().replace(/\.$/, '')}) chegam na ${info.etapa}. Até lá, suas atividades já funcionam aqui.`
            : 'Esta é uma área só sua. Suas atividades já funcionam aqui.'}
        </span>
      </div>
      )}
    </div>
  )
}
