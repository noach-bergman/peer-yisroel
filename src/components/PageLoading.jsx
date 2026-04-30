export default function PageLoading({ compact = false }) {
  return (
    <div className={`grid place-items-center bg-brand-neutral-50 ${compact ? 'min-h-32' : 'min-h-screen'}`}>
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-primary/20 border-b-brand-primary" />
    </div>
  )
}
