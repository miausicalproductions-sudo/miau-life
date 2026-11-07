import type { ReactNode } from 'react'

export default function EmBreve({ icone, titulo, etapa, texto }: { icone: ReactNode; titulo: string; etapa: string; texto: string }) {
  return (
    <div className="cartao mx-auto mt-6 flex max-w-md flex-col items-center p-8 text-center">
      <div className="text-titulo">{icone}</div>
      <h1 className="mb-1 mt-3 text-2xl font-semibold text-titulo">{titulo}</h1>
      <span className="inline-block rounded-full bg-lilas/50 px-3 py-1 text-xs font-bold">chega na {etapa}</span>
      <p className="mt-4 text-suave">{texto}</p>
    </div>
  )
}
