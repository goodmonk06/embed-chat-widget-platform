import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🎨 Cocoon Chat
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Embeddable AI Chat Widget Platform
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/sites"
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-3xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold mb-2">Easy Integration</h3>
            <p className="text-gray-600">
              Add a chat widget to your website with just a simple script tag.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">AI Powered</h3>
            <p className="text-gray-600">
              Leverage OpenAI or Anthropic to provide intelligent responses.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Analytics</h3>
            <p className="text-gray-600">
              Track sessions, messages, and user engagement.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
