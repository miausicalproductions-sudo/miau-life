import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [criando, setCriando] = useState(false)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [ocupada, setOcupada] = useState(false)

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase) return
    setOcupada(true)
    setMsg(null)
    if (criando) {
      const { data, error } = await supabase.auth.signUp({ email, password: senha, options: { data: { nome: nome.trim() || 'Thaís' } } })
      if (error) setMsg(traduz(error.message))
      else if (!data.session) setMsg('Conta criada! Se o Supabase pediu confirmação, abra o e-mail que você recebeu e depois entre aqui.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
      if (error) setMsg(traduz(error.message))
    }
    setOcupada(false)
  }

  return (
    <div className="grid min-h-screen place-items-center px-5">
      <form onSubmit={enviar} className="cartao w-full max-w-sm p-7">
        <div className="mb-6 text-center">
          <img src={`${import.meta.env.BASE_URL}icons/gatinho.svg`} alt="" className="mx-auto mb-3 h-20 w-20" />
          <h1 className="m-0 text-2xl font-extrabold">Miau Life</h1>
          <p className="mt-1 text-sm text-suave">Sua vida inteira, em um lugarzinho fofo.</p>
        </div>

        {criando && (
          <div className="mb-4">
            <label className="rotulo" htmlFor="nome">Como quer ser chamada?</label>
            <input id="nome" className="campo" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Thaís" />
          </div>
        )}
        <div className="mb-4">
          <label className="rotulo" htmlFor="email">E-mail</label>
          <input id="email" type="email" required autoComplete="email" className="campo" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="mb-5">
          <label className="rotulo" htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            required
            minLength={6}
            autoComplete={criando ? 'new-password' : 'current-password'}
            className="campo"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>

        {msg && <p className="mb-4 rounded-2xl bg-pessego/50 px-4 py-3 text-sm">{msg}</p>}

        <button className="btn w-full" disabled={ocupada}>
          {ocupada ? 'Um instante…' : criando ? 'Criar minha conta' : 'Entrar'}
        </button>
        <button type="button" className="mt-4 w-full text-sm font-bold text-suave" onClick={() => { setCriando(!criando); setMsg(null) }}>
          {criando ? 'Já tenho conta · Entrar' : 'Primeira vez aqui? Criar conta'}
        </button>
      </form>
    </div>
  )
}

function traduz(m: string) {
  if (/invalid login/i.test(m)) return 'E-mail ou senha não conferem.'
  if (/already registered|already been registered/i.test(m)) return 'Esse e-mail já tem conta. Use “Entrar”.'
  if (/signups? not allowed|signup is disabled/i.test(m)) return 'Novas contas estão desativadas. Entre com a sua conta.'
  if (/password/i.test(m)) return 'A senha precisa ter pelo menos 6 caracteres.'
  if (/email not confirmed/i.test(m)) return 'Confirme seu e-mail (veja a caixa de entrada) e tente de novo.'
  return m
}
