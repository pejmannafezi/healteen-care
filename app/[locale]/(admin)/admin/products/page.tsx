import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Leaf, Plus, Pencil, Trash2 } from "lucide-react";
import { adminListProducts } from "@/lib/services/admin";
import { deleteProduct } from "./actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, cn } from "@/lib/utils";

const TH = "px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider text-muted-foreground";

export default async function AdminProductsPage() {
  const products = await adminListProducts();

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-bold text-forest">Products</h2>
          <Badge variant="outline" className="tabular-nums">{products.length}</Badge>
        </div>
        <Link href="/admin/products/new">
          <Button size="sm"><Plus /> Add product</Button>
        </Link>
      </div>

      <Card className="overflow-hidden">
        {products.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center">
            <Leaf className="size-8 text-nature/40" aria-hidden />
            <p className="text-sm text-muted-foreground">No products yet. Add your first one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th scope="col" className={TH}>Product</th>
                  <th scope="col" className={cn(TH, "text-end")}>Price</th>
                  <th scope="col" className={cn(TH, "text-end")}>Stock</th>
                  <th scope="col" className={TH}>Status</th>
                  <th scope="col" className={cn(TH, "text-end")}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-nature/10">
                          {p.images?.[0] ? (
                            <Image src={p.images[0]} alt="" fill sizes="44px" className="object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Leaf className="size-5 text-nature/40" aria-hidden />
                            </div>
                          )}
                        </div>
                        <span className="min-w-0 max-w-[18rem] truncate font-semibold text-forest">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-end font-medium tabular-nums text-forest">
                      {formatPrice(p.price_cents / 100, p.currency)}
                    </td>
                    <td className="px-4 py-3 text-end tabular-nums text-forest/80">{p.stock_qty}</td>
                    <td className="px-4 py-3">
                      {p.is_active ? (
                        <Badge variant="nature">Active</Badge>
                      ) : (
                        <Badge variant="muted">Hidden</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/admin/products/${p.id}`}>
                          <Button variant="ghost" size="sm" className="h-9 w-9 p-0" aria-label="Edit">
                            <Pencil />
                          </Button>
                        </Link>
                        <form action={deleteProduct}>
                          <input type="hidden" name="id" value={p.id} />
                          <Button
                            variant="ghost"
                            size="sm"
                            type="submit"
                            aria-label="Delete"
                            className="h-9 w-9 p-0 text-terracotta hover:bg-terracotta/10 hover:text-terracotta"
                          >
                            <Trash2 />
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
