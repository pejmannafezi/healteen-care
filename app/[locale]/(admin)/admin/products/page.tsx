import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Leaf, Plus, Pencil, Trash2 } from "lucide-react";
import { adminListProducts } from "@/lib/services/admin";
import { deleteProduct } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

export default async function AdminProductsPage() {
  const products = await adminListProducts();

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold">Products ({products.length})</h2>
        <Link href="/admin/products/new">
          <Button size="sm"><Plus /> Add product</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {products.length === 0 ? (
            <p className="p-8 text-center text-sm text-forest/60">No products yet. Add your first one.</p>
          ) : (
            <ul className="divide-y divide-border">
              {products.map((p) => (
                <li key={p.id} className="flex items-center gap-4 p-4">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-nature/10">
                    {p.images?.[0] ? (
                      <Image src={p.images[0]} alt="" fill sizes="48px" className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center"><Leaf className="size-5 text-nature/40" /></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-forest">{p.name}</p>
                    <p className="text-xs text-forest/50">
                      {formatPrice(p.price_cents / 100, p.currency)} · stock {p.stock_qty}
                      {!p.is_active && " · hidden"}
                    </p>
                  </div>
                  <Link href={`/admin/products/${p.id}`}>
                    <Button variant="ghost" size="icon" aria-label="Edit"><Pencil /></Button>
                  </Link>
                  <form action={deleteProduct}>
                    <input type="hidden" name="id" value={p.id} />
                    <Button variant="ghost" size="icon" type="submit" aria-label="Delete" className="text-terracotta">
                      <Trash2 />
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
