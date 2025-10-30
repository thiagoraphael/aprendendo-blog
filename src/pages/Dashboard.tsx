import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

type Document = {
  id: string
  title: string
  file_path: string
  description: string | null
  created_at: string
}

export function Dashboard() {
  const { user, role, isAdmin } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)

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

  async function handleDownload(filePath: string, title: string, docId: string) {
    setDownloading(docId)
    
    const { data, error } = await supabase.storage
      .from('documents')
      .download(filePath)

    if (error) {
      alert('Erro ao baixar arquivo')
      console.error(error)
      setDownloading(null)
      return
    }

    const url = URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = url
    a.download = title
    a.click()
    URL.revokeObjectURL(url)
    
    setDownloading(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Área Restrita
          </h1>
          <p className="text-gray-600">
            Bem-vindo(a), {user?.email}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Role: {role || 'carregando...'} | Admin: {isAdmin ? 'SIM' : 'NÃO'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-6">Documentos</h2>

          {loading ? (
            <p className="text-gray-600">Carregando documentos...</p>
          ) : documents.length === 0 ? (
            <p className="text-gray-600">Nenhum documento disponível ainda.</p>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors flex justify-between items-start"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{doc.title}</h3>
                    {doc.description && (
                      <p className="text-gray-600 text-sm mb-2">{doc.description}</p>
                    )}
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span>📄 {doc.file_path.split('/').pop()}</span>
                      <span>•</span>
                      <span>{new Date(doc.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload(doc.file_path, doc.title, doc.id)}
                    disabled={downloading === doc.id}
                    className="ml-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {downloading === doc.id ? '⏳ Baixando...' : '⬇️ Baixar'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}