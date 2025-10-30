import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Stats = {
  totalPosts: number
  totalDocuments: number
  totalTags: number
  recentPosts: { id: string; title: string; created_at: string }[]
}

export function Admin() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    totalDocuments: 0,
    totalTags: 0,
    recentPosts: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    const [postsCount, docsCount, tagsCount, recentPosts] = await Promise.all([
      supabase.from('posts').select('*', { count: 'exact', head: true }),
      supabase.from('documents').select('*', { count: 'exact', head: true }),
      supabase.from('tags').select('*', { count: 'exact', head: true }),
      supabase.from('posts').select('id, title, created_at').order('created_at', { ascending: false }).limit(5)
    ])

    setStats({
      totalPosts: postsCount.count || 0,
      totalDocuments: docsCount.count || 0,
      totalTags: tagsCount.count || 0,
      recentPosts: recentPosts.data || []
    })
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Painel Administrativo
          </h1>
          <p className="text-gray-600">
            Bem-vindo(a), {user?.email}
          </p>
        </div>

        {/* ESTATÍSTICAS */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl">Carregando estatísticas...</div>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total de Posts</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalPosts}</p>
                  </div>
                  <div className="text-4xl">📝</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total de Documentos</p>
                    <p className="text-3xl font-bold text-green-600">{stats.totalDocuments}</p>
                  </div>
                  <div className="text-4xl">📁</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total de Tags</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.totalTags}</p>
                  </div>
                  <div className="text-4xl">🏷️</div>
                </div>
              </div>
            </div>

            {/* POSTS RECENTES */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h2 className="text-xl font-semibold mb-4">📌 Posts Recentes</h2>
              {stats.recentPosts.length === 0 ? (
                <p className="text-gray-500">Nenhum post criado ainda</p>
              ) : (
                <div className="space-y-3">
                  {stats.recentPosts.map(post => (
                    <div key={post.id} className="flex justify-between items-center border-b pb-3 last:border-b-0">
                      <span className="text-gray-800">{post.title}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(post.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* AÇÕES RÁPIDAS */}
        <h2 className="text-2xl font-semibold mb-4">⚡ Ações Rápidas</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Link
            to="/admin/posts"
            className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-l-4 border-blue-500"
          >
            <div className="text-4xl mb-4">📝</div>
            <h2 className="text-2xl font-semibold mb-2">Gerenciar Posts</h2>
            <p className="text-gray-600">
              Criar, editar e deletar posts do blog
            </p>
          </Link>

          <Link
            to="/admin/documents"
            className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-l-4 border-green-500"
          >
            <div className="text-4xl mb-4">📁</div>
            <h2 className="text-2xl font-semibold mb-2">Gerenciar Documentos</h2>
            <p className="text-gray-600">
              Upload e gerenciamento de documentos
            </p>
          </Link>

          <Link
            to="/admin/tags"
            className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-l-4 border-purple-500"
          >
            <div className="text-4xl mb-4">🏷️</div>
            <h2 className="text-2xl font-semibold mb-2">Gerenciar Tags</h2>
            <p className="text-gray-600">
              Criar, editar e organizar tags
            </p>
          </Link>

          <Link
            to="/blog"
            target="_blank"
            className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-l-4 border-yellow-500"
          >
            <div className="text-4xl mb-4">👁️</div>
            <h2 className="text-2xl font-semibold mb-2">Ver Site Público</h2>
            <p className="text-gray-600">
              Visualizar como os visitantes veem o site
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}