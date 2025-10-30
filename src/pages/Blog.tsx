import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type Post = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  created_at: string
  tags?: { name: string; slug: string }[]
  coverImage?: string
}

type Tag = {
  id: string
  name: string
  slug: string
}

export function Blog() {
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  useEffect(() => {
    fetchTags()
    fetchPosts()
  }, [])

  useEffect(() => {
    filterPosts()
  }, [posts, searchTerm, selectedTag])

  async function fetchTags() {
    const { data } = await supabase
      .from('tags')
      .select('*')
      .order('name')
    
    setAllTags(data || [])
  }

  async function fetchPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        post_tags (
          tags (
            id,
            name,
            slug
          )
        ),
        post_images (
          image_path,
          order_index
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar posts:', error)
    } else {
      const postsWithData = data?.map(post => {
        const sortedImages = post.post_images?.sort((a: any, b: any) => a.order_index - b.order_index) || []
        return {
          ...post,
          tags: post.post_tags?.map((pt: any) => pt.tags) || [],
          coverImage: sortedImages[0]?.image_path
        }
      }) || []
      setPosts(postsWithData)
    }
    setLoading(false)
  }

  function filterPosts() {
    let filtered = posts

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(search) ||
        post.excerpt?.toLowerCase().includes(search) ||
        post.content.toLowerCase().includes(search)
      )
    }

    if (selectedTag) {
      filtered = filtered.filter(post =>
        post.tags?.some(tag => tag.id === selectedTag)
      )
    }

    setFilteredPosts(filtered)
  }

  function getImageUrl(path: string) {
    return supabase.storage.from('post-images').getPublicUrl(path).data.publicUrl
  }

  function clearFilters() {
    setSearchTerm('')
    setSelectedTag(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Carregando posts...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Blog</h1>

        {/* BARRA DE BUSCA */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="mb-4">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              🔍 Buscar posts
            </label>
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite palavras-chave..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🏷️ Filtrar por tag
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-4 py-2 rounded-full transition-colors ${
                  selectedTag === null
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Todas
              </button>
              {allTags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => setSelectedTag(tag.id)}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    selectedTag === tag.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {(searchTerm || selectedTag) && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredPosts.length} {filteredPosts.length === 1 ? 'resultado' : 'resultados'} encontrado{filteredPosts.length === 1 ? '' : 's'}
              </p>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-500 hover:underline"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>

        {/* POSTS */}
        {filteredPosts.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600">
              {posts.length === 0 
                ? 'Nenhum post publicado ainda.' 
                : 'Nenhum post encontrado com esses filtros.'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredPosts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden flex flex-col"
              >
                {post.coverImage && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={getImageUrl(post.coverImage)}
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <div className="p-6 flex-1 flex flex-col">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    {post.title}
                  </h2>
                  
                  {post.excerpt && (
                    <p className="text-gray-600 mb-4 flex-1">{post.excerpt}</p>
                  )}
                  
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.map((tag) => (
                        <span
                          key={tag.slug}
                          className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-sm text-gray-500">
                    {new Date(post.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}