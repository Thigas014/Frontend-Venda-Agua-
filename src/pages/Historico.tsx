import { useEffect, useMemo, useState } from 'react'
import { listarVendas } from '../api/services'
import type { Venda } from '../types'
import { Card } from '../components/Card'

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatarData(iso: string) {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

const nomesMeses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

type Visao = 'semana' | 'mes'

export function Historico() {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [visao, setVisao] = useState<Visao>('semana')

  async function carregar() {
    setCarregando(true)
    setErro('')
    try {
      setVendas(await listarVendas())
    } catch (err: any) {
      setErro(err?.response?.data?.mensagem || 'Não foi possível carregar o histórico.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  const porMes = useMemo(() => {
    const grupos = new Map<string, { label: string; total: number; qtd: number }>()
    for (const v of vendas) {
      const [ano, mes] = v.data.split('-')
      const chave = `${ano}-${mes}`
      const label = `${nomesMeses[Number(mes) - 1]} de ${ano}`
      const atual = grupos.get(chave) || { label, total: 0, qtd: 0 }
      atual.total += v.valorTotal
      atual.qtd += 1
      grupos.set(chave, atual)
    }
    return Array.from(grupos.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([chave, dados]) => ({ chave, ...dados }))
  }, [vendas])

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-4 pb-24 lg:pb-6">
      <h1 className="text-xl font-bold text-slate-800">📜 Histórico</h1>

      <div className="flex bg-slate-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setVisao('semana')}
          className={`text-sm font-semibold rounded-lg px-4 py-1.5 transition-colors ${
            visao === 'semana' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500'
          }`}
        >
          Por semana
        </button>
        <button
          onClick={() => setVisao('mes')}
          className={`text-sm font-semibold rounded-lg px-4 py-1.5 transition-colors ${
            visao === 'mes' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500'
          }`}
        >
          Por mês
        </button>
      </div>

      {carregando ? (
        <p className="text-slate-400 text-sm">Carregando...</p>
      ) : erro ? (
        <Card className="bg-red-50 border-red-200">
          <p className="text-sm text-red-600 font-medium">⚠️ {erro}</p>
          <button onClick={carregar} className="mt-3 text-sm bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg px-4 py-2">
            Tentar de novo
          </button>
        </Card>
      ) : vendas.length === 0 ? (
        <Card><p className="text-slate-400 text-sm text-center py-6">Nenhum fechamento registrado ainda.</p></Card>
      ) : visao === 'semana' ? (
        <div className="space-y-2">
          {vendas.map((v) => (
            <Card key={v.id} className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">{formatarData(v.data)}</p>
                <p className="text-xs text-slate-500">
                  Moedas {formatarMoeda(v.valorMoedas)} · Notas {formatarMoeda(v.valorNotas)} · Pix {formatarMoeda(v.valorPix)}
                </p>
              </div>
              <span className="font-bold text-primary-600">{formatarMoeda(v.valorTotal)}</span>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {porMes.map((m) => (
            <Card key={m.chave} className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">{m.label}</p>
                <p className="text-xs text-slate-500">{m.qtd} {m.qtd === 1 ? 'fechamento' : 'fechamentos'}</p>
              </div>
              <span className="font-bold text-primary-600">{formatarMoeda(m.total)}</span>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
