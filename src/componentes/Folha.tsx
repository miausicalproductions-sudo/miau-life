import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

/** Janelinha que sobe da parte de baixo no celular (e fica no centro no computador). */
export default function Folha({
  titulo,
  aoFechar,
  children,
  largura = 'max-w-md',
}: {
  titulo: string
  aoFechar: () => void
  children: ReactNode
  largura?: string
}) {
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && aoFechar()
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [aoFechar])

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/35 md:items-center" onClick={aoFechar}>
      <div
        role="dialog"
        aria-label={titulo}
        onClick={(e) => e.stopPropagation()}
        className={`folha cartao barra-baixo max-h-[92vh] w-full ${largura} overflow-y-auto rounded-b-none !bg-cartao p-5 md:rounded-b-[22px]`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="m-0 text-xl font-semibold">{titulo}</h2>
          <button onClick={aoFechar} aria-label="Fechar" className="grid h-9 w-9 place-items-center rounded-full border-0 bg-transparent">
            <X size={22} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
