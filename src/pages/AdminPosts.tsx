import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type Post = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  created_at: string
}

export function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar posts:', error)
    } else {
      setPosts(data || [])
    }
    setLoading(false)
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Tem certeza que deseja deletar "${title}"?`)) return

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Erro ao deletar post')
      console.error(error)
    } else {
      alert('Post deletado com sucesso!')
      fetchPosts()
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
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link to="/admin" className="text-blue-500 hover:underline mb-2 inline-block">
              ← Voltar ao painel
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">Gerenciar Posts</h1>
          </div>
          <button
            onClick={() => navigate('/admin/posts/new')}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            ➕ Novo Post
          </button>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600 mb-4">Nenhum post criado ainda.</p>
            <button
              onClick={() => navigate('/admin/posts/new')}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              Criar Primeiro Post
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow flex justify-between items-start"
              >
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-gray-600 mb-3">{post.excerpt}</p>
                  )}
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>Slug: {post.slug}</span>
                    <span>|</span>
                    <span>{new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Link
                    to={`/blog/${post.slug}`}
                    target="_blank"
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    👁️ Ver
                  </Link>
                  <button
                    onClick={() => navigate(`/admin/posts/edit/${post.id}`)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDelete(post.id, post.title)}
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