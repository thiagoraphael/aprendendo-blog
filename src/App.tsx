import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Header } from './components/Header'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { Home } from './pages/Home'
import { Blog } from './pages/Blog'
import { BlogPost } from './pages/BlogPost'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Admin } from './pages/Admin'
import { AdminPosts } from './pages/AdminPosts'
import { AdminPostForm } from './pages/AdminPostForm'
import { AdminDocuments } from './pages/AdminDocuments'
import { AdminDocumentForm } from './pages/AdminDocumentForm'
import { AdminTags } from './pages/AdminTags'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin/tags"
            element={
              <AdminRoute>
                <AdminTags />
              </AdminRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/posts"
            element={
              <AdminRoute>
                <AdminPosts />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/posts/new"
            element={
              <AdminRoute>
                <AdminPostForm />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/posts/edit/:id"
            element={
              <AdminRoute>
                <AdminPostForm />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/documents"
            element={
              <AdminRoute>
                <AdminDocuments />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/documents/new"
            element={
              <AdminRoute>
                <AdminDocumentForm />
              </AdminRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App