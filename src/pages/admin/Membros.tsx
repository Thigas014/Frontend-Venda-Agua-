import { useEffect, useState } from 'react'
import { atualizarUsuario, criarUsuario, excluirUsuario, listarUsuarios } from '../../api/services'
import type { Usuario } from '../../types'
import { Card } from '../../components/Card'

const vazio = { nome: '', email: '', senha: '', perfil: 'MEMBRO' }

export function Membros() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [form, setForm] = useState(vazio)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [erro, setErro] = useState('')

  async function carregar() {
    setUsuarios(await listarUsuarios())
  }

  useEffect(() => {
    carregar()
  }, [])

  function iniciarEdicao(u: Usuario) {
    setEditandoId(u.id)
    setForm({ nome: u.nome, email: u.email, senha: '', perfil: u.perfil })
    setMostrarForm(true)
    setErro('')
  }

  function novoMembro() {
    setEditandoId(null)
    setForm(vazio)
    setMostrarForm(true)
    setErro('')
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    try {
      if (editandoId) {
        const payload: any = { nome: form.nome, email: form.email, perfil: form.perfil }
        if (form.senha) payload.senha = form.senha
        await atualizarUsuario(editandoId, payload)
      } else {
        await criarUsuario(form)
      }
      setMostrarForm(false)
      setForm(vazio)
      setEditandoId(null)
      carregar()
    } catch (err: any) {
      setErro(err?.response?.data?.mensagem || 'Não foi possível salvar o membro.')
    }
  }

  async function alternarAtivo(u: Usuario) {
    await atualizarUsuario(u.id, { ativo: !u.ativo })
    carregar()
  }

  async function excluir(id: number) {
    if (!confirm('Excluir este membro?')) return
    await excluirUsuario(id)
    carregar()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-slate-800">Membros da equipe</h2>
        <button onClick={novoMembro} className="text-sm bg-primary-600 text-white rounded-lg px-3 py-1.5 font-semibold">
          + Membro
        </button>
      </div>

      {mostrarForm && (
        <Card className="max-w-md">
          <form onSubmit={salvar} className="space-y-3">
            <input required placeholder="Nome" value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <input required type="email" placeholder="E-mail" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <input
              type="password"
              placeholder={editandoId ? 'Nova senha (opcional)' : 'Senha'}
              required={!editandoId}
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <select value={form.perfil} onChange={(e) => setForm({ ...form, perfil: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="MEMBRO">Membro</option>
              <option value="ADMIN">Administrador</option>
            </select>

            {erro && <p className="text-xs text-red-500">{erro}</p>}

            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-primary-600 text-white rounded-lg py-2 text-sm font-semibold">
                Salvar
              </button>
              <button type="button" onClick={() => setMostrarForm(false)} className="flex-1 bg-slate-100 text-slate-600 rounded-lg py-2 text-sm font-semibold">
                Cancelar
              </button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {usuarios.map((u) => (
          <Card key={u.id}>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-slate-800">{u.nome}</p>
                <p className="text-xs text-slate-500">{u.email}</p>
                <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  u.perfil === 'ADMIN' ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'
                }`}>
                  {u.perfil === 'ADMIN' ? 'Administrador' : 'Membro'}
                </span>
                {!u.ativo && (
                  <span className="inline-block mt-1 ml-1 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-red-100 text-red-600">
                    Inativo
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-2 pt-2 border-t border-slate-100">
              <button onClick={() => iniciarEdicao(u)} className="text-xs text-primary-600 font-semibold">Editar</button>
              <button onClick={() => alternarAtivo(u)} className="text-xs text-amber-600 font-semibold">
                {u.ativo ? 'Desativar' : 'Ativar'}
              </button>
              <button onClick={() => excluir(u.id)} className="text-xs text-red-500 font-semibold">Excluir</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
