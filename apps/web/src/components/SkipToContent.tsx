export default function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-brand text-white px-4 py-2 rounded-md font-medium shadow-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-2"
    >
      Skip to main content
    </a>
  )
}
