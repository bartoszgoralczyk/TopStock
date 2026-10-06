import { Skeleton } from "@/components/ui/skeleton";

export function BoardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8" aria-busy="true">
      <p className="text-sm text-muted-foreground">Wczytuję notowania…</p>
      <Skeleton className="mt-3 h-9 w-48" />
      <div className="mt-4 flex gap-3 overflow-hidden md:grid md:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-24 min-w-[210px]" />
        ))}
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-2">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function InstrumentSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8" aria-busy="true">
      <p className="text-sm text-muted-foreground">Wczytuję instrument…</p>
      <Skeleton className="mt-3 h-4 w-32" />
      <Skeleton className="mt-3 h-10 w-64" />
      <Skeleton className="mt-4 h-12 w-48" />
      <Skeleton className="mt-6 h-[320px] w-full md:h-[440px]" />
    </div>
  );
}

export function ArticleSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 md:px-6" aria-busy="true">
      <p className="text-sm text-muted-foreground">Wczytuję tekst…</p>
      <Skeleton className="mt-4 h-4 w-28" />
      <Skeleton className="mt-3 h-10 w-full" />
      <Skeleton className="mt-3 h-6 w-4/5" />
      <div className="mt-8 space-y-3">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-5 w-full" />
        ))}
      </div>
    </div>
  );
}
