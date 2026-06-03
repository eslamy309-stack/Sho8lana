import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center mb-6">
        <span className="text-white text-2xl font-bold">⚡</span>
      </div>
      <h1 className="text-4xl font-bold text-neutral-900 mb-2">404</h1>
      <p className="text-lg font-semibold text-neutral-700 mb-1">Page not found</p>
      <p className="text-sm text-neutral-400 mb-8 max-w-xs">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors"
      >
        Back to Sho8lana
      </Link>
    </div>
  )
}
