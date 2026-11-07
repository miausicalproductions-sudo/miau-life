import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { X } from 'lucide-react'
import { useApp } from './lib/ContextoApp'
import { modoDemo } from './lib/supabase'
import Estrutura from './componentes/Estrutura'
import { GatoRosto } from './componentes/Gatinhos'
import Login from './paginas/Login'
import Inicio from './paginas/Inicio'
import Agenda from './paginas/Agenda'
import Tarefas from './paginas/Tarefas'
import Evolucao from './paginas/Evolucao'
import Areas from './paginas/Areas'
import PaginaArea from './paginas/PaginaArea'
import EmBreve from './paginas/EmBreve'
import Ajustes from './paginas/Ajustes'

export default function App() {
  const { sessao, carregandoSessao } = useApp()
  const [aviso, setAviso] = useState(true)

  if (carregandoSessao) {
    return (
      <div className="grid min-h-screen place-items-center">
        <GatoRosto className="pulinho h-24 w-32" olhos="feliz" />
      </div>
    )
  }
  if (!modoDemo && !sessao) return <Login />

  return (
    <Estrutura>
      {modoDemo && aviso && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl bg-pessego/60 px-4 py-3 text-sm">
          <span>
            <b>Modo demonstração:</b> o Supabase ainda não foi conectado, então o que você anotar fica só neste aparelho.
          </span>
          <button className="ml-auto border-0 bg-transparent" onClick={() => setAviso(false)} aria-label="Fechar aviso">
            <X size={18} />
          </button>
        </div>
      )}
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/calendario" element={<Navigate to="/agenda" replace />} />
        <Route path="/tarefas" element={<Tarefas />} />
        <Route path="/evolucao" element={<Evolucao />} />
        <Route
          path="/ia"
          element={
            <EmBreve
              icone={<GatoRosto className="h-28 w-40" olhos="abertos" />}
              titulo="Miau IA"
              etapa="Etapa 5"
              texto="Sua assistente pessoal. Ela vai sugerir e organizar a sua semana, mas só muda algo depois do seu “sim”."
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
