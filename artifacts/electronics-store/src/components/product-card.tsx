import { Link } from "wouter";
import { Product } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { useState } from "react";

export function ProductCard({ product }: { product: Product }) {
  const mainImage = product.images?.find((img) => img.isMain)?.imageUrl || product.images?.[0]?.imageUrl;
  const [imgError, setImgError] = useState(false);

  const hasDiscount = product.oldPrice && Number(product.price) < Number(product.oldPrice);
  const discountPercent = hasDiscount 
    ? Math.round(((Number(product.oldPrice) - Number(product.price)) / Number(product.oldPrice)) * 100)
    : 0;

  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="overflow-hidden flex flex-col h-full group cursor-pointer transition-all hover:shadow-md border-border/50">
        <div className="relative aspect-square bg-muted/30 overflow-hidden flex items-center justify-center">
          {mainImage && !imgError ? (
            <img 
              src={mainImage} 
              alt={product.name} 
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex flex-col items-center justify-center text-primary/40">
              <span className="text-4xl font-bold">{product.name.charAt(0).toUpperCase()}</span>
            </div>
          )}
          
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.stockStatus === "out_of_stock" && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Out of Stock</Badge>
            )}
            {hasDiscount && (
              <Badge variant="destructive" className="bg-red-500 hover:bg-red-600 text-[10px] px-1.5 py-0">-{discountPercent}%</Badge>
            )}
            {product.newArrival && (
              <Badge className="bg-blue-500 hover:bg-blue-600 text-white text-[10px] px-1.5 py-0">New</Badge>
            )}
          </div>
        </div>
        
        <CardContent className="p-4 flex-grow flex flex-col gap-1">
          <div className="text-xs text-muted-foreground mb-1">{product.category?.name || "Uncategorized"}</div>
          <h3 className="font-medium text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">{product.name}</h3>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex items-end gap-2">
          <span className="font-bold text-primary">{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">{formatPrice(product.oldPrice)}</span>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
