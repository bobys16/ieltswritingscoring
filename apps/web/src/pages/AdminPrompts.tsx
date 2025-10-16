import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface AdminPrompt {
  id: number
  name: string
  description: string
  prompt: string
  type: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface PromptFormData {
  name: string
  description: string
  prompt: string
  type: string
  isActive: boolean
}

export default function AdminPrompts() {
  const [prompts, setPrompts] = useState<AdminPrompt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<AdminPrompt | null>(null)
  const [formData, setFormData] = useState<PromptFormData>({
    name: '',
    description: '',
    prompt: '',
    type: 'scoring',
    isActive: true
  })
  const navigate = useNavigate()

  useEffect(() => {
    fetchPrompts()
  }, [])

  const fetchPrompts = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      const response = await fetch('/api/sidigi/prompts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPrompts(data.prompts)
      } else if (response.status === 401) {
        navigate('/login')
      } else if (response.status === 403) {
        navigate('/dashboard')
      } else {
        setError('Failed to load prompts')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const token = localStorage.getItem('token')
    const url = editingPrompt ? `/api/sidigi/prompts/${editingPrompt.id}` : '/api/sidigi/prompts'
    const method = editingPrompt ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowForm(false)
        setEditingPrompt(null)
        setFormData({
          name: '',
          description: '',
          prompt: '',
          type: 'scoring',
          isActive: true
        })
        fetchPrompts()
      } else {
        alert('Failed to save prompt')
      }
    } catch (err) {
      alert('Network error')
    }
  }

  const editPrompt = (prompt: AdminPrompt) => {
    setEditingPrompt(prompt)
    setFormData({
      name: prompt.name,
      description: prompt.description,
      prompt: prompt.prompt,
      type: prompt.type,
      isActive: prompt.isActive
    })
    setShowForm(true)
  }

  const deletePrompt = async (promptId: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/sidigi/prompts/${promptId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchPrompts()
      } else {
        alert('Failed to delete prompt')
      }
    } catch (err) {
      alert('Network error')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <svg className="animate-spin w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading prompts...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Prompt Management</h1>
              <p className="text-gray-600 mt-2">Configure AI prompts for essay scoring and feedback</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/sidigi')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              >
                ← Back to Dashboard
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
              >
                + New Prompt
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingPrompt ? 'Edit AI Prompt' : 'Create New AI Prompt'}
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      placeholder="e.g., Main Scoring Prompt"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    >
                      <option value="scoring">Scoring</option>
                      <option value="feedback">Feedback</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    placeholder="Brief description of what this prompt does..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prompt Content *</label>
                  <textarea
                    required
                    value={formData.prompt}
                    onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                    rows={15}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand font-mono text-sm"
                    placeholder="Enter the AI prompt here. Use {{variables}} for dynamic content..."
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Use variables like {'{essay}'}, {'{task_type}'}, {'{criteria}'} in your prompt for dynamic content.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-brand focus:ring-brand border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="text-sm font-medium text-gray-700">
                    Active (use this prompt)
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
                  >
                    {editingPrompt ? 'Update Prompt' : 'Create Prompt'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingPrompt(null)
                      setFormData({
                        name: '',
                        description: '',
                        prompt: '',
                        type: 'scoring',
                        isActive: true
                      })
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Prompts List */}
        <div className="space-y-6">
          {prompts.map((prompt) => (
            <div key={prompt.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{prompt.name}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      prompt.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {prompt.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                      {prompt.type}
                    </span>
                  </div>
                  {prompt.description && (
                    <p className="text-gray-600 mb-4">{prompt.description}</p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => editPrompt(prompt)}
                    className="px-3 py-1 text-sm text-brand hover:text-brand/80 border border-brand hover:border-brand/80 rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deletePrompt(prompt.id, prompt.name)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 hover:border-red-400 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Prompt Content</h4>
                  <div className="text-xs text-gray-500">
                    Updated: {new Date(prompt.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono bg-white border border-gray-200 rounded p-3 max-h-40 overflow-y-auto">
                  {prompt.prompt}
                </pre>
              </div>
            </div>
          ))}
        </div>

        {prompts.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No AI prompts found</h3>
            <p className="text-gray-500 mb-4">Create your first AI prompt to configure how essays are scored and feedback is generated.</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
            >
              Create First Prompt
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
