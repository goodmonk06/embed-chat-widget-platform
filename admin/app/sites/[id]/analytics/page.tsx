'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { use } from 'react'

interface Analytics {
  totalSessions: number
  totalMessages: number
  recentSessions: {
    id: string
    sessionKey: string
    createdAt: string
    _count: {
      messages: number
    }
    messages: {
      content: string
      createdAt: string
    }[]
  }[]
}

interface Site {
  id: string
  name: string
  domain: string
}

export default function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [site, setSite] = useState<Site | null>(null)
  const [loading, setLoading] = useState(true)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  useEffect(() => {
    fetchData()
  }, [resolvedParams.id])

  const fetchData = async () => {
    try {
      const [analyticsRes, siteRes] = await Promise.all([
        fetch(`${apiUrl}/api/admin/sites/${resolvedParams.id}/analytics`),
        fetch(`${apiUrl}/api/admin/sites/${resolvedParams.id}`),
      ])

      const [analyticsData, siteData] = await Promise.all([
        analyticsRes.json(),
        siteRes.json(),
      ])

      setAnalytics(analyticsData)
      setSite(siteData)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!analytics || !site) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Failed to load analytics</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <Link href="/sites" className="text-purple-600 hover:text-purple-800 mb-2 inline-block">
            ← Back to Sites
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{site.name}</h1>
          <p className="text-gray-600">{site.domain}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="text-4xl mr-4">💬</div>
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  {analytics.totalSessions}
                </div>
                <div className="text-gray-600">Total Sessions</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="text-4xl mr-4">📝</div>
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {analytics.totalMessages}
                </div>
                <div className="text-gray-600">Total Messages</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Sessions</h2>

          {analytics.recentSessions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No sessions yet. Share your widget to start receiving chats!
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-gray-900">
                        Session {session.sessionKey.substring(0, 8)}...
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(session.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                      {session._count.messages} messages
                    </div>
                  </div>

                  {session.messages[0] && (
                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      <strong>Last message:</strong>{' '}
                      {session.messages[0].content.substring(0, 100)}
                      {session.messages[0].content.length > 100 ? '...' : ''}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
