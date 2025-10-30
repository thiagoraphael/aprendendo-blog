import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type Tag = {
  id: string
  name: string
  slug: string
  created_at: string
}

export function AdminTags() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchTags()
  }, [])

  async function fetchTags() {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name')

    if (error) {
      console.error('Erro ao buscar tags:', error)
    } else {
      setTags(data || [])
    }
    setLoading(false)
  }

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  function handleNameChange(value: string) {
    setName(value)
    if (!editingTag) {
      setSlug(generateSlug(value))
    }
  }

  function openCreateForm() {
    setEditingTag(null)
    setName('')
    setSlug('')
    setShowForm(true)
  }

  function openEditForm(tag: Tag) {
    setEditingTag(tag)
    setName(tag.name)
    setSlug(tag.slug)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingTag(null)
    setName('')
    setSlug('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    if (!name.trim() || !slug.trim()) {
      alert('Preencha todos os campos')
      setSaving(false)
      return
    }

    const tagData = {
      name: name.trim(),
      slug: slug.trim()
    }

    let error

    if (editingTag) {
      const result = await supabase
        .from('tags')
        .update(tagData)
        .eq('id', editingTag.id)
      error = result.error
    } else {
      const result = await supabase
        .from('tags')
        .insert([tagData])
      error = result.error
    }

    if (error) {
      if (error.code === '23505') {
        alert('Já existe uma tag com este nome ou slug')
      } else {
        alert('Erro ao salvar tag')
        console.error(error)
      }
    } else {
      alert(editingTag ? 'Tag atualizada!' : 'Tag criada!')
      closeForm()
      fetchTags()
    }

    setSaving(false)
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Deletar tag "${name}"? Ela será removida de todos os posts.`)) return

    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Erro ao deletar tag')
      console.error(error)
    } else {
      alert('Tag deletada!')
      fetchTags()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link to="/admin" className="text-blue-500 hover:underline mb-2 inline-block">
              ← Voltar ao painel
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">Gerenciar Tags</h1>
          </div>
          <button
            onClick={openCreateForm}
            className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors"
          >
            ➕ Nova Tag
          </button>
        </div>

        {/* FORMULÁRIO */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {editingTag ? 'Editar Tag' : 'Nova Tag'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome *
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: Tecnologia"
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                  Slug *
                </label>
                <input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="tecnologia"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Salvando...' : editingTag ? 'Atualizar' : 'Criar'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* LISTA DE TAGS */}
        {tags.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600 mb-4">Nenhuma tag criada ainda.</p>
            <button
              onClick={openCreateForm}
              className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600"
            >
              Criar Primeira Tag
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                        {tag.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{tag.slug}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditForm(tag)}
                        className="text-yellow-600 hover:text-yellow-700 font-medium"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDelete(tag.id, tag.name)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        🗑️ Deletar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}