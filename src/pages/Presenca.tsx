import { useEffect, useState } from 'react'
import {
  justificarAusencia,
  listarPresencas,
  listarUsuarios,
  marcarPresenca,
  marcarTaxaPaga,
  obterConfiguracao
} from '../api/services'
import type { Presenca as PresencaType, Usuario } from '../types'
import { Card } from '../components/Card'
import { useAuth } from '../context/AuthContext'

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function hojeISO() {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = String(hoje.getMonth() + 1).padStart(2, '0')
  const dia = String(hoje.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

export function Presenca() {
  const { usuario, isAdmin } = useAuth()
  const [data, setData] = useState(hojeISO())
  const [presencas, setPresencas] = useState<PresencaType[]>([])
  const [membros, setMembros] = useState<Usuario[]>([])
  const [taxaConfigurada, setTaxaConfigurada] = useState(0)
  const [carregando, setCarregando] = useState(true)

  const [minhaJustificativa, setMinhaJustificativa] = useState('')
  const [enviandoJustificativa, setEnviandoJustificativa] = useState(false)
  const [erroJustificativa, setErroJustificativa] = useState('')

  async function carregar() {
    setCarregando(true)
    const promessas: Promise<any>[] = [listarPresencas(data), obterConfiguracao()]
    if (isAdmin) promessas.push(listarUsuarios())

    const resultados = await Promise.all(promessas)
    setPresencas(resultados[0])
    setTaxaConfigurada(resultados[1].valorTaxaAusencia)
    if (isAdmin) setMembros(resultados[2].filter((u: Usuario) => u.perfil === 'MEMBRO'))
    setCarregando(false)
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  function statusDe(usuarioId: number) {
    return presencas.find((p) => p.usuarioId === usuarioId) || null
  }

  async function handleMarcar(usuarioId: number, presente: boolean) {
    await marcarPresenca(usuarioId, data, presente)
    carregar()
  }

  async function handleTaxaPaga(id: number, pagaAtual: boolean) {
    await marcarTaxaPaga(id, !pagaAtual)
    carregar()
  }

  async function handleJustificar(e: React.FormEvent) {
    e.preventDefault()
    if (!minhaJustificativa.trim()) return
    setEnviandoJustificativa(true)
    setErroJustificativa('')
    try {
      await justificarAusencia(data, minhaJustificativa)
      setMinhaJustificativa('')
      carregar()
    } catch (err: any) {
      setErroJustificativa(err?.response?.data?.mensagem || 'Não foi possível enviar a justificativa.')
    } finally {
      setEnviandoJustificativa(false)
    }
  }

  const minhaPresenca = usuario ? presencas.find((p) => p.usuarioId === usuario.id) : null

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-4 pb-24 lg:pb-6">
      <h1 className="text-xl font-bold text-slate-800">✅ Presença</h1>

      <Card className="max-w-xs">
        <label className="text-xs text-slate-500">Data</label>
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </Card>

      {carregando ? (
        <p className="text-slate-400 text-sm">Carregando...</p>
      ) : isAdmin ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase">Lista de presença</p>
          {membros.length === 0 ? (
            <Card><p className="text-slate-400 text-sm text-center py-4">Nenhum membro cadastrado.</p></Card>
          ) : (
            membros.map((m) => {
              const p = statusDe(m.id)
              return (
                <Card key={m.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{m.nome}</p>
                      {p?.justificativa && (
                        <p className="text-xs text-slate-500 mt-0.5">💬 "{p.justificativa}"</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMarcar(m.id, true)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                          p?.presente === true ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        Presente
                      </button>
                      <button
                        onClick={() => handleMarcar(m.id, false)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                          p?.presente === false ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        Ausente
                      </button>
                    </div>
                  </div>

                  {p?.presente === false && p.taxaValor != null && (
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                      <span className="text-xs text-slate-500">
                        Taxa: <span className="font-semibold text-slate-700">{formatarMoeda(p.taxaValor)}</span>
                      </span>
                      <button
                        onClick={() => handleTaxaPaga(p.id, p.taxaPaga)}
                        className={`text-xs font-semibold px-3 py-1 rounded-lg ${
                          p.taxaPaga ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {p.taxaPaga ? '✓ Paga' : 'Marcar como paga'}
                      </button>
                    </div>
                  )}
                </Card>
              )
            })
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {minhaPresenca && (
            <Card>
              <p className="text-sm font-semibold text-slate-700">Seu status nessa data</p>
              <p className="text-sm text-slate-600 mt-1">
                {minhaPresenca.presente === true && '✅ Marcado como presente'}
                {minhaPresenca.presente === false && '❌ Marcado como ausente'}
                {minhaPresenca.presente === null && 'Ainda não marcado pelo admin'}
              </p>
              {minhaPresenca.justificativa && (
                <p className="text-xs text-slate-500 mt-1">💬 Sua justificativa: "{minhaPresenca.justificativa}"</p>
              )}
              {minhaPresenca.presente === false && minhaPresenca.taxaValor != null && (
                <p className="text-xs text-slate-500 mt-1">
                  Taxa: {formatarMoeda(minhaPresenca.taxaValor)} — {minhaPresenca.taxaPaga ? 'já paga ✓' : 'pendente'}
                </p>
              )}
            </Card>
          )}

          <Card>
            <p className="text-sm font-semibold text-slate-700 mb-1">Justificar ausência</p>
            {data < hojeISO() ? (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                ⚠️ Essa data já passou — não é mais possível justificar. Fale com o administrador se precisar corrigir algo.
              </p>
            ) : (
              <>
                <p className="text-xs text-slate-500 mb-3">
                  Se você não vai poder ir nessa data, escreva o motivo com antecedência (a justificativa precisa ser enviada
                  antes do dia da venda).
                  {taxaConfigurada > 0 && ` Faltas têm uma taxa de ${formatarMoeda(taxaConfigurada)}.`}
                </p>
                <form onSubmit={handleJustificar} className="space-y-3">
                  <textarea
                    required
                    placeholder="Explique o motivo..."
                    value={minhaJustificativa}
                    onChange={(e) => setMinhaJustificativa(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none"
                  />
                  {erroJustificativa && <p className="text-xs text-red-500">{erroJustificativa}</p>}
                  <button
                    type="submit"
                    disabled={enviandoJustificativa}
                    className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold rounded-lg py-2 text-sm"
                  >
                    {enviandoJustificativa ? 'Enviando...' : 'Enviar justificativa'}
                  </button>
                </form>
              </>
            )}
          </Card>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase">Presenças marcadas até agora</p>
            {presencas.length === 0 ? (
              <Card><p className="text-slate-400 text-sm text-center py-4">Ninguém marcado ainda nessa data.</p></Card>
            ) : (
              presencas.map((p) => (
                <Card key={p.id} className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">{p.usuarioNome}</span>
                  <span className={`text-xs font-semibold ${p.presente ? 'text-green-600' : 'text-red-500'}`}>
                    {p.presente === true ? 'Presente' : p.presente === false ? 'Ausente' : '—'}
                  </span>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
