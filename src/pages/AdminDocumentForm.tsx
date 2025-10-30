import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function AdminDocumentForm() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)

    if (!title.trim() || !file) {
      alert('Preencha o título e selecione um arquivo')
      setLoading(false)
      return
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file)

    if (uploadError) {
      alert('Erro ao fazer upload do arquivo')
      console.error(uploadError)
      setLoading(false)
      return
    }

    const { error: dbError } = await supabase
      .from('documents')
      .insert([{
        title: title.trim(),
        file_path: filePath,
        description: description.trim() || null,
        uploaded_by: user?.id,
      }])

    if (dbError) {
      alert('Erro ao salvar documento')
      console.error(dbError)
      
      await supabase.storage.from('documents').remove([filePath])
    } else {
      alert('Documento enviado com sucesso!')
      navigate('/admin/documents')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/admin/documents" className="text-blue-500 hover:underline mb-4 inline-block">
          ← Voltar
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Novo Documento
        </h1>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Nome do documento"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descrição (opcional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Breve descrição do documento"
            />
          </div>

          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
              Arquivo *
            </label>
            <input
              id="file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip"
            />
            <p className="text-sm text-gray-500 mt-1">
              Formatos aceitos: PDF, DOC, DOCX, XLS, XLSX, imagens, ZIP
            </p>
            {file && (
              <p className="text-sm text-green-600 mt-2">
                ✓ Arquivo selecionado: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {loading ? 'Enviando...' : 'Enviar Documento'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/documents')}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}