import { Link, useParams } from 'react-router-dom'
import { useApp } from '../lib/ContextoApp'
import { infoPadrao } from '../lib/areasPadrao'

export default function PaginaArea() {
  const { id } = useParams()
  const { areas } = useApp()
  const area = areas.find((a) => a.id === id)

  if (!area) {
    return (
      <div className="cartao p-8 text-center">
        <p>Não encontrei essa área.</p>
        <Link to="/areas" className="btn no-underline">Ver minhas áreas</Link>
      </div>
    )
  }
  const info = infoPadrao(area.chave)

  return (
    <div className="flex flex-col gap-5">
      <Link to="/areas" className="text-sm font-bold text-suave no-underline">← Áreas</Link>
      <div className={`cartao-area cor-${area.cor} p-6`}>
        <div className="text-5xl">{area.icone}</div>
        <h1 className="mb-1 mt-2 text-3xl font-extrabold">{area.nome}</h1>
        <p className="m-0 text-suave">{info?.resumo ?? 'Uma área só sua. Os itens dela chegam junto com a Etapa 2.'}</p>
      </div>
      <div className="cartao p-6 text-center">
        <div className="text-4xl">🚧</div>
        <p className="mb-0 mt-2 font-bold">Esta área está sendo construída</p>
        <p className="mt-1 text-sm text-suave">
          {info ? `Ela fica pronta na ${info.etapa}.` : 'Você já pode renomear, mudar a cor e o ícone dela em Áreas.'}
        </p>
      </div>
    </div>
  )
}
