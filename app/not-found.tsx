export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <h2 className="text-xl mt-2">Page Not Found</h2>
        <p className="mt-4 text-muted-foreground">The page you're looking for doesn't exist.</p>
        <a href="/" className="mt-6 inline-block rounded bg-primary px-4 py-2 text-white">
          Go Home
        </a>
      </div>
    </div>
  )
}

