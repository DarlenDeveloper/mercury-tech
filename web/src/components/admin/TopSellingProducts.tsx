import Image from "next/image";
import { TOP_SELLING } from "@/lib/adminData";

export default function TopSellingProducts() {
  return (
    <section className="admin-card p-5">
      <h3 className="mb-4 text-lg font-bold text-ink">Top selling products</h3>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line text-[12px] font-medium text-muted">
              <th className="pb-3 pl-1 font-medium">S/NO</th>
              <th className="pb-3 font-medium">Product Name</th>
              <th className="pb-3 font-medium">Category</th>
              <th className="pb-3 font-medium">Stock</th>
              <th className="pb-3 font-medium">Total sales</th>
            </tr>
          </thead>
          <tbody>
            {TOP_SELLING.map((p) => (
              <tr
                key={p.no}
                className="border-b border-line/70 last:border-0 text-sm"
              >
                <td className="py-3 pl-1 text-muted">{p.no}</td>
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-surface-soft">
                      <Image
                        src={p.image}
                        alt={p.name}
                        width={36}
                        height={36}
                        className="h-7 w-7 object-contain"
                      />
                    </span>
                    <span className="font-medium text-ink">{p.name}</span>
                  </div>
                </td>
                <td className="py-3 text-muted">{p.category}</td>
                <td className="py-3">
                  <span
                    className={`text-sm font-medium ${
                      p.inStock ? "text-[#16a34a]" : "text-[#e11d48]"
                    }`}
                  >
                    {p.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </td>
                <td className="py-3 font-semibold text-ink">{p.sales}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
