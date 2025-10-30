export function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Bem-vindo ao Meu Site
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Um projeto de aprendizado com React, TypeScript e Supabase
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/blog"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Ver Blog
            </a>
            <a
              href="/login"
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Área Restrita
            </a>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">📝 Blog</h3>
            <p className="text-gray-600">
              Sistema de blog com posts armazenados no Supabase
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">🔐 Autenticação</h3>
            <p className="text-gray-600">
              Login seguro com Supabase Auth
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">📁 Área Restrita</h3>
            <p className="text-gray-600">
              Documentos protegidos apenas para membros
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}