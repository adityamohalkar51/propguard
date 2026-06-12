export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-xl text-center">
        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent-logo">
          <span className="text-accent-icon text-xl font-medium">PG</span>
        </div>
        <h1 className="text-3xl font-medium mb-3 text-text-primary">
          PropGuard
        </h1>
        <p className="text-text-secondary mb-8">
          Track daily DD, max DD, and profit targets across all your prop firm challenge accounts and get warned before you breach a rule.
        </p>
        <a href="/signup" className="inline-block rounded-md bg-accent-purple px-6 py-3 text-sm font-medium text-text-primary hover:opacity-90 transition">
          Get Started
        </a>
      </div>
    </main>
  );
}