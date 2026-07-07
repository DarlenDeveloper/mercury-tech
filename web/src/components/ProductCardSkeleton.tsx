export default function ProductCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col">
      {/* Image tile */}
      <div className="aspect-square rounded-[18px] bg-[#E5E7EB]" />
      {/* Name */}
      <div className="mt-2 h-3.5 w-3/4 rounded bg-[#E5E7EB]" />
      {/* Description */}
      <div className="mt-1.5 h-2.5 w-full rounded bg-[#F0F1F4]" />
      {/* Price */}
      <div className="mt-2 h-3.5 w-1/2 rounded bg-[#E5E7EB]" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(172px,1fr))] gap-3">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
