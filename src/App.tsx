import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useApp } from './lib/ContextoApp'
import { modoDemo } from './lib/supabase'
import Estrutura from './componentes/Estrutura'
import Login from './paginas/Login'
import Inicio from './paginas/Inicio'
import Areas from './paginas/Areas'
import PaginaArea from './paginas/PaginaArea'
import EmBreve from './paginas/EmBreve'
import Ajustes from './paginas/Ajustes'

export default function App() {
  const { sessao, carregandoSessao } = useApp()
  const [aviso, setAviso] = useState(true)

  if (carregandoSessao) {
    return <div className="grid min-h-screen place-items-center text-4xl">🐾</div>
  }
  if (!modoDemo && !sessao) return <Login />

  return (
    <Estrutura>
      {modoDemo && aviso && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl bg-pessego/60 px-4 py-3 text-sm">
          <span>
            <b>Modo demonstração:</b> o Supabase ainda não foi conectado, então o que você anotar fica só neste aparelho.
          </span>
          <button className="ml-auto font-bold" onClick={() => setAviso(false)} aria-label="Fechar aviso">
            ✕
          </button>
        </div>
      )}
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route
          path="/calendario"
          element={
            <EmBreve
              emoji="📅"
              titulo="Calendário geral"
              etapa="Etapa 2"
              texto="Aqui você verá compromissos com presença e tarefas com prazo ou dia marcado, com alerta de conflito. As tarefas flexíveis ficam fora, em uma lista de metas da semana."
            />
          }
        />
        <Route
          path="/ia"
          element={
            <EmBreve
              emoji="🐱"
              titulo="Miau IA"
              etapa="Etapa 5"
              texto="Sua assistente pessoal. Ela vai sugerir e organizar, mas só muda algo depois do seu “sim”."
            />
          }
        />
        <Route path="/areas" element={<Areas />} />
        <Route path="/area/:id" element={<PaginaArea />} />
        <Route path="/ajustes" element={<Ajustes />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Estrutura>
  )
}
