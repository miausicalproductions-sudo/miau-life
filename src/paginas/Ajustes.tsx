import { useState } from 'react'
import { supabase, modoDemo } from '../lib/supabase'
import { useApp } from '../lib/ContextoApp'

const temas = [
  { id: 'auto', rotulo: 'Automático' },
  { id: 'claro', rotulo: 'Claro' },
  { id: 'noite', rotulo: 'Noite' },
]

export default function Ajustes() {
  const { sessao, nome } = useApp()
  const [tema, setTema] = useState(document.documentElement.dataset.tema || 'auto')
  const [novoNome, setNovoNome] = useState(nome)
  const [msg, setMsg] = useState<string | null>(null)

  function escolherTema(id: string) {
    setTema(id)
    document.documentElement.dataset.tema = id
    try { localStorage.setItem('miaulife-tema', id) } catch { /* ignora */ }
  }

  async function salvarNome() {
    const n = novoNome.trim()
    if (!n) return
    try { localStorage.setItem('miaulife-nome', n) } catch { /* ignora */ }
    if (supabase) await supabase.auth.updateUser({ data: { nome: n } })
    setMsg('Nome salvo! Ele aparece na saudação do Início.')
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="m-0 text-3xl font-extrabold">Ajustes</h1>

      <section className="cartao p-5">
        <label className="rotulo" htmlFor="nome-ajuste">Como o Miau Life te chama</label>
        <div className="flex gap-3">
          <input id="nome-ajuste" className="campo" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} />
          <button className="btn" onClick={salvarNome}>Salvar</button>
        </div>
        {msg && <p className="mb-0 mt-3 text-sm text-suave">{msg}</p>}
      </section>

      <section className="cartao p-5">
        <span className="rotulo">Aparência</span>
        <div className="flex gap-2">
          {temas.map((t) => (
            <button key={t.id} onClick={() => escolherTema(t.id)} className={`btn flex-1 ${tema === t.id ? '' : 'btn-suave'}`}>{t.rotulo}</button>
          ))}
        </div>
      </section>

      <section className="cartao p-5">
        <span className="rotulo">Conta</span>
        {modoDemo ? (
          <p className="m-0 text-sm text-suave">Modo demonstração: sem login. Conecte o Supabase para guardar seus dados na nuvem.</p>
        ) : (
          <>
            <p className="mt-0 text-sm text-suave">Você entrou como <b>{sessao?.user.email}</b></p>
            <button className="btn btn-suave" onClick={() => supabase?.auth.signOut()}>Sair</button>
          </>
        )}
      </section>

      <p className="text-center text-xs text-suave">Miau Life · versão 0.1 · Etapa 1 (Fundação) 🐾</p>
    </div>
  )
}
