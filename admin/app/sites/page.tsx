'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Site {
  id: string
  name: string
  domain: string
  publicKey: string
  secretKey: string
  createdAt: string
}

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    ownerId: 'demo-owner', // In production, this would come from auth
  })

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  useEffect(() => {
    fetchSites()
  }, [])

  const fetchSites = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/sites?ownerId=demo-owner`)
      const data = await response.json()
      setSites(data)
    } catch (error) {
      console.error('Failed to fetch sites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`${apiUrl}/api/admin/sites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowCreateForm(false)
        setFormData({ name: '', domain: '', ownerId: 'demo-owner' })
        fetchSites()
      }
    } catch (error) {
      console.error('Failed to create site:', error)
    }
  }

  const handleDelete = async (siteId: string) => {
    if (!confirm('Are you sure you want to delete this site?')) return

    try {
      await fetch(`${apiUrl}/api/admin/sites/${siteId}`, {
        method: 'DELETE',
      })
      fetchSites()
    } catch (error) {
      console.error('Failed to delete site:', error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <Link href="/" className="text-2xl font-bold text-purple-600">
              🎨 Cocoon Chat
            </Link>
            <p className="text-gray-600">Manage your sites</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition"
          >
            + Create Site
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Create New Site</h2>
            <form onSubmit={handleCreateSite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="My Awesome Site"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domain
                </label>
                <input
                  type="text"
                  required
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="example.com"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Sites List */}
        {sites.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No sites yet</h3>
            <p className="text-gray-600 mb-6">Create your first site to get started!</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition"
            >
              + Create Site
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sites.map((site) => (
              <div key={site.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{site.name}</h3>
                    <p className="text-sm text-gray-600">{site.domain}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(site.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Public Key
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-gray-100 px-2 py-1 rounded overflow-hidden text-ellipsis">
                        {site.publicKey}
                      </code>
                      <button
                        onClick={() => copyToClipboard(site.publicKey)}
                        className="text-xs text-purple-600 hover:text-purple-800"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Link
                      href={`/sites/${site.id}/analytics`}
                      className="block text-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold hover:bg-purple-200 transition"
                    >
                      View Analytics
                    </Link>
                  </div>

                  <div>
                    <button
                      onClick={() => {
                        const snippet = getEmbedSnippet(site.publicKey)
                        copyToClipboard(snippet)
                      }}
                      className="w-full text-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition"
                    >
                      Copy Embed Code
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function getEmbedSnippet(publicKey: string): string {
  return `<!-- Cocoon Chat Widget -->
<script src="https://cdn.yourdomain.com/cocoon-chat.js"></script>
<script>
  createCocoonChatWidget({
    siteKey: '${publicKey}',
    apiUrl: 'http://localhost:3001'
  });
</script>`
}
