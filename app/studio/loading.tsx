import { Skeleton } from '@/components/ui/skeleton'

const ITEMS_PER_GRID = 4

export default function StudioLoading() {
  return (
    <div className="space-y-8">
      {/* Welcome Section Skeleton */}
      <div>
        <Skeleton className="mb-2 h-9 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Quick Actions Skeleton */}
      <section>
        <Skeleton className="mb-4 h-6 w-32" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...new Array(ITEMS_PER_GRID)].map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton placeholders
            <Skeleton className="h-24" key={i} />
          ))}
        </div>
      </section>

      {/* Statistics Skeleton */}
      <section>
        <Skeleton className="mb-4 h-6 w-24" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...new Array(ITEMS_PER_GRID)].map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton placeholders
            <Skeleton className="h-32" key={i} />
          ))}
        </div>
      </section>

      {/* Recent Forms Skeleton */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-48" />
      </section>
    </div>
  )
}
