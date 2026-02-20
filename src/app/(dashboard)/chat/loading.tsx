import { Skeleton } from "@/components/ui/skeleton"

export default function ChatLoading() {
  return (
    <div className="flex h-[calc(100dvh-9rem-env(safe-area-inset-bottom))] overflow-hidden rounded-2xl border border-gray-100">

      {/* ─── Sidebar skeleton ─── */}
      <div className="w-80 flex-shrink-0 border-r border-gray-100 flex flex-col">
        {/* Search bar placeholder */}
        <div className="p-4 border-b border-gray-100">
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>

        {/* Conversation items */}
        <div className="flex-1 overflow-hidden divide-y divide-gray-50">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3.5">
              {/* Avatar */}
              <Skeleton className="w-11 h-11 rounded-full flex-shrink-0" />
              {/* Text lines */}
              <div className="flex-1 min-w-0 space-y-2 pt-0.5">
                <Skeleton className="h-3.5 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Chat panel skeleton ─── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-gray-50/40">
        <Skeleton className="w-14 h-14 rounded-full" />
        <div className="space-y-2 text-center">
          <Skeleton className="h-4 w-40 rounded mx-auto" />
          <Skeleton className="h-3 w-56 rounded mx-auto" />
        </div>
      </div>

    </div>
  )
}
