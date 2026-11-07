import FormAtividade from './FormAtividade'

/** Mantido por compatibilidade: abre o formulário já na opção "Só anotar". */
export default function AnotarRapido({ aoFechar }: { aoFechar: () => void }) {
  return <FormAtividade tipoInicial="caixa" aoFechar={aoFechar} />
}
