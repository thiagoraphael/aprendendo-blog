import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type Tag = {
  id: string
  name: string
  slug: string
}

type PostImage = {
  id: string
  image_path: string
  caption: string | null
  order_index: number
}

export function AdminPostForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingPost, setLoadingPost] = useState(isEdit)
  
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  const [images, setImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<PostImage[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  useEffect(() => {
    fetchTags()
    if (isEdit) {
      fetchPost()
    }
  }, [id])

  async function fetchTags() {
    const { data } = await supabase
      .from('tags')
      .select('*')
      .order('name')
    
    setAllTags(data || [])
  }

  async function fetchPost() {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        post_tags (
          tag_id
        ),
        post_images (
          id,
          image_path,
          caption,
          order_index
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      alert('Erro ao carregar post')
      navigate('/admin/posts')
    } else {
      setTitle(data.title)
      setSlug(data.slug)
      setContent(data.content)
      setExcerpt(data.excerpt || '')
      setSelectedTags(data.post_tags.map((pt: any) => pt.tag_id))
      setExistingImages(data.post_images || [])
    }
    setLoadingPost(false)
  }

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!isEdit) {
      setSlug(generateSlug(value))
    }
  }

  function toggleTag(tagId: string) {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    setImages(prev => [...prev, ...files])
    
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  function removeImage(index: number) {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  async function removeExistingImage(imageId: string, imagePath: string) {
    if (!confirm('Deletar esta imagem?')) return

    await supabase.storage.from('post-images').remove([imagePath])
    await supabase.from('post_images').delete().eq('id', imageId)
    
    setExistingImages(prev => prev.filter(img => img.id !== imageId))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)

    if (!title.trim() || !slug.trim() || !content.trim()) {
      alert('Preencha todos os campos obrigatórios')
      setLoading(false)
      return
    }

    const postData = {
      title: title.trim(),
      slug: slug.trim(),
      content: content.trim(),
      excerpt: excerpt.trim() || null,
    }

    let postId = id
    let error

    if (isEdit) {
      const result = await supabase
        .from('posts')
        .update(postData)
        .eq('id', id)
      error = result.error

      await supabase.from('post_tags').delete().eq('post_id', id)
    } else {
      const result = await supabase
        .from('posts')
        .insert([postData])
        .select()
        .single()
      
      error = result.error
      postId = result.data?.id
    }

    if (error) {
      if (error.code === '23505') {
        alert('Já existe um post com este slug!')
      } else {
        alert('Erro ao salvar post')
        console.error(error)
      }
      setLoading(false)
      return
    }

    if (selectedTags.length > 0 && postId) {
      const tagInserts = selectedTags.map(tagId => ({
        post_id: postId,
        tag_id: tagId
      }))
      await supabase.from('post_tags').insert(tagInserts)
    }

    if (images.length > 0 && postId) {
      for (let i = 0; i < images.length; i++) {
        const file = images[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${postId}/${Date.now()}-${i}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, file)

        if (!uploadError) {
          await supabase.from('post_images').insert([{
            post_id: postId,
            image_path: fileName,
            order_index: i
          }])
        }
      }
    }

    alert(isEdit ? 'Post atualizado!' : 'Post criado!')
    navigate('/admin/posts')
    setLoading(false)
  }

  if (loadingPost) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/admin/posts" className="text-blue-500 hover:underline mb-4 inline-block">
          ← Voltar
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          {isEdit ? 'Editar Post' : 'Novo Post'}
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
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Digite o título do post"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
              Slug (URL) *
            </label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="meu-post-legal"
            />
            <p className="text-sm text-gray-500 mt-1">
              URL do post: /blog/{slug || 'slug-aqui'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    selectedTags.includes(tag.id)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
              Resumo (opcional)
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Breve descrição do post"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagens (opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            {existingImages.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Imagens atuais:</p>
                <div className="grid grid-cols-3 gap-4">
                  {existingImages.map((img) => (
                    <div key={img.id} className="relative">
                      <img
                        src={`${supabase.storage.from('post-images').getPublicUrl(img.image_path).data.publicUrl}`}
                        className="w-full h-32 object-cover rounded-lg"
                        alt=""
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img.id, img.image_path)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {imagePreviews.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Novas imagens:</p>
                <div className="grid grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        className="w-full h-32 object-cover rounded-lg"
                        alt=""
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Conteúdo *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={15}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              placeholder="Escreva o conteúdo do post aqui..."
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {loading ? 'Salvando...' : isEdit ? 'Atualizar Post' : 'Criar Post'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/posts')}
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