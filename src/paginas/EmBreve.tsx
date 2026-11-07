export default function EmBreve({ emoji, titulo, etapa, texto }: { emoji: string; titulo: string; etapa: string; texto: string }) {
  return (
    <div className="cartao mx-auto mt-6 max-w-md p-8 text-center">
      <div className="text-6xl">{emoji}</div>
      <h1 className="mb-1 mt-3 text-2xl font-extrabold">{titulo}</h1>
      <span className="inline-block rounded-full bg-lilas/50 px-3 py-1 text-xs font-bold">chega na {etapa}</span>
      <p className="mt-4 text-suave">{texto}</p>
    </div>
  )
}
