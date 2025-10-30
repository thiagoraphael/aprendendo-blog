import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type Post = {
  id: string
  title: string
  content: string
  created_at: string
  tags?: { name: string; slug: string }[]
  images?: { image_path: string; caption: string | null }[]
}

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPost()
  }, [slug])

  async function fetchPost() {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        post_tags (
          tags (
            name,
            slug
          )
        ),
        post_images (
          image_path,
          caption,
          order_index
        )
      `)
      .eq('slug', slug)
      .single()

    if (error) {
      console.error('Erro ao buscar post:', error)
    } else {
      const postWithData = {
        ...data,
        tags: data.post_tags?.map((pt: any) => pt.tags) || [],
        images: data.post_images?.sort((a: any, b: any) => a.order_index - b.order_index) || []
      }
      setPost(postWithData)
    }
    setLoading(false)
  }

  function getImageUrl(path: string) {
    return supabase.storage.from('post-images').getPublicUrl(path).data.publicUrl
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post não encontrado</h1>
          <Link to="/blog" className="text-blue-500 hover:underline">
            Voltar para o blog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <article className="max-w-3xl mx-auto px-4">
        <Link
          to="/blog"
          className="text-blue-500 hover:underline mb-6 inline-block"
        >
          ← Voltar
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {post.title}
        </h1>

        <div className="flex items-center gap-4 mb-8">
          <p className="text-gray-500">
            {new Date(post.created_at).toLocaleDateString('pt-BR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>

          {post.tags && post.tags.length > 0 && (
            <>
              <span className="text-gray-300">•</span>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag.slug}
                    className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {post.images && post.images.length > 0 && (
          <div className="mb-8">
            {post.images.length === 1 ? (
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img
                  src={getImageUrl(post.images[0].image_path)}
                  alt={post.images[0].caption || post.title}
                  className="w-full h-auto"
                />
                {post.images[0].caption && (
                  <p className="text-sm text-gray-600 text-center mt-2 italic">
                    {post.images[0].caption}
                  </p>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {post.images.map((img, index) => (
                  <div key={index} className="rounded-lg overflow-hidden shadow">
                    <img
                      src={getImageUrl(img.image_path)}
                      alt={img.caption || `Imagem ${index + 1}`}
                      className="w-full h-64 object-cover"
                    />
                    {img.caption && (
                      <p className="text-sm text-gray-600 text-center mt-2 italic px-2">
                        {img.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-white p-8 rounded-lg shadow prose max-w-none">
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
            {post.content}
          </div>
        </div>
      </article>
    </div>
  )
}