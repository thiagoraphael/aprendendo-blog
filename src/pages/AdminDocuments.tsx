import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type Document = {
  id: string
  title: string
  file_path: string
  description: string | null
  created_at: string
}

export function AdminDocuments() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDocuments()
  }, [])

  async function fetchDocuments() {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar documentos:', error)
    } else {
      setDocuments(data || [])
    }
    setLoading(false)
  }

  async function handleDelete(id: string, filePath: string, title: string) {
    if (!confirm(`Tem certeza que deseja deletar "${title}"?`)) return

    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([filePath])

    if (storageError) {
      console.error('Erro ao deletar arquivo:', storageError)
    }

    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)

    if (dbError) {
      alert('Erro ao deletar documento')
      console.error(dbError)
    } else {
      alert('Documento deletado com sucesso!')
      fetchDocuments()
    }
  }

  async function handleDownload(filePath: string, title: string) {
    const { data, error } = await supabase.storage
      .from('documents')
      .download(filePath)

    if (error) {
      alert('Erro ao baixar arquivo')
      console.error(error)
      return
    }

    const url = URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = url
    a.download = title
    a.click()
    URL.revokeObjectURL(url)
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
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link to="/admin" className="text-blue-500 hover:underline mb-2 inline-block">
              ← Voltar ao painel
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">Gerenciar Documentos</h1>
          </div>
          <button
            onClick={() => navigate('/admin/documents/new')}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            ➕ Novo Documento
          </button>
        </div>

        {documents.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600 mb-4">Nenhum documento enviado ainda.</p>
            <button
              onClick={() => navigate('/admin/documents/new')}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
            >
              Enviar Primeiro Documento
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow flex justify-between items-start"
              >
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    {doc.title}
                  </h2>
                  {doc.description && (
                    <p className="text-gray-600 mb-3">{doc.description}</p>
                  )}
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>Arquivo: {doc.file_path.split('/').pop()}</span>
                    <span>|</span>
                    <span>{new Date(doc.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleDownload(doc.file_path, doc.title)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    ⬇️ Baixar
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id, doc.file_path, doc.title)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    🗑️ Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}