import { useState } from "react";
import { useRoute } from "wouter";
import { useGetProductBySlug, useGetRelatedProducts, useGetSettings } from "@workspace/api-client-react";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, buildWhatsAppUrl } from "@/lib/format";
import { MessageCircle, Check, AlertCircle, XCircle, Share2, Info, Package, Shield } from "lucide-react";
import { SEO } from "@/components/seo";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:slug");
  const slug = params?.slug || "";
  
  const { data: product, isLoading } = useGetProductBySlug(slug, { 
    query: { enabled: !!slug, queryKey: ["/api/products/slug", slug] } 
  });
  
  const { data: relatedProducts } = useGetRelatedProducts(product?.id || 0, {
    query: { enabled: !!product?.id, queryKey: ["/api/products/related", product?.id] }
  });

  const { data: settings } = useGetSettings({ query: { queryKey: ["/api/settings"] } });

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-muted animate-pulse rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-6 bg-muted animate-pulse rounded w-1/4" />
            <div className="h-32 bg-muted animate-pulse rounded w-full mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  const images = product.images?.length > 0 
    ? [...product.images].sort((a, b) => (a.isMain === b.isMain ? 0 : a.isMain ? -1 : 1))
    : [];

  const mainImage = images[activeImageIndex]?.imageUrl;
  
  const hasDiscount = product.oldPrice && Number(product.price) < Number(product.oldPrice);
  const discountPercent = hasDiscount 
    ? Math.round(((Number(product.oldPrice) - Number(product.price)) / Number(product.oldPrice)) * 100)
    : 0;

  const stockBadge = {
    in_stock: { label: "In Stock", color: "bg-green-500", icon: Check },
    low_stock: { label: "Low Stock", color: "bg-amber-500", icon: AlertCircle },
    out_of_stock: { label: "Out of Stock", color: "bg-red-500", icon: XCircle },
  }[product.stockStatus];
  
  const StockIcon = stockBadge.icon;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on Cydestore`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  let specs: Record<string, string> = {};
  if (product.specifications) {
    try {
      specs = JSON.parse(product.specifications);
    } catch (e) {
      // Not JSON, handle gracefully below
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO title={product.seoTitle || product.name} description={product.seoDescription || product.shortDescription || product.name} />
      
      <div className="grid md:grid-cols-2 gap-10 mb-16">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-muted/20 rounded-2xl overflow-hidden border flex items-center justify-center relative">
            {mainImage ? (
              <img src={mainImage} alt={product.name} className="w-full h-full object-contain p-4" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex flex-col items-center justify-center text-primary/40">
                <span className="text-8xl font-bold">{product.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
            
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {hasDiscount && (
                <Badge className="bg-red-500 hover:bg-red-600 text-white border-none shadow-sm px-3 py-1 text-sm">
                  Save {discountPercent}%
                </Badge>
              )}
            </div>
          </div>
          
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <button 
                  key={img.id}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImageIndex === idx ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}`}
                >
                  <img src={img.imageUrl} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            {product.category?.name && <span>{product.category.name}</span>}
            {product.brand?.name && (
              <>
                <span>•</span>
                <span className="font-medium text-foreground">{product.brand.name}</span>
              </>
            )}
            {product.sku && (
              <>
                <span>•</span>
                <span>SKU: {product.sku}</span>
              </>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="text-xl text-muted-foreground line-through">{formatPrice(product.oldPrice)}</span>
            )}
          </div>
          
          <div className="flex items-center gap-4 mb-8 pb-8 border-b">
            <Badge variant="secondary" className={`${stockBadge.color} text-white hover:${stockBadge.color} border-none gap-1.5 px-3 py-1`}>
              <StockIcon className="w-3.5 h-3.5" />
              {stockBadge.label}
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleShare} className="text-muted-foreground hover:text-foreground">
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none mb-8">
            <p className="text-base text-muted-foreground leading-relaxed">
              {product.shortDescription || product.fullDescription?.substring(0, 150) + "..."}
            </p>
          </div>

          <div className="mt-auto space-y-4 bg-muted/30 p-6 rounded-2xl border">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
              Order via WhatsApp
            </h3>
            <p className="text-sm text-muted-foreground">We don't process payments online. Click below to confirm availability and arrange delivery with our team.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <a href={buildWhatsAppUrl(settings?.whatsappNumber, `Hello, I want to buy the *${product.name}* (${formatPrice(product.price)}). Is it available?`)} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white font-semibold shadow-sm h-12">
                  Buy on WhatsApp
                </Button>
              </a>
              <a href={buildWhatsAppUrl(settings?.whatsappNumber, `Hello, I need more information about the *${product.name}*.`)} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full h-12 bg-background border-border hover:bg-muted font-medium">
                  Ask a Question
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-12">
          {product.fullDescription && (
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Info className="w-6 h-6 text-primary" /> Product Details
              </h2>
              <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                {product.fullDescription.split('\n').map((paragraph, idx) => (
                  paragraph.trim() ? <p key={idx}>{paragraph}</p> : <br key={idx} />
                ))}
              </div>
            </section>
          )}

          {product.specifications && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Specifications</h2>
              {Object.keys(specs).length > 0 ? (
                <div className="border rounded-xl overflow-hidden bg-card">
                  <table className="w-full text-sm">
                    <tbody>
                      {Object.entries(specs).map(([key, value], idx) => (
                        <tr key={key} className={idx % 2 === 0 ? "bg-muted/50" : ""}>
                          <td className="py-3 px-4 font-medium w-1/3 border-r">{key}</td>
                          <td className="py-3 px-4 text-muted-foreground">{value as string}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-muted/30 p-6 rounded-xl text-muted-foreground whitespace-pre-wrap">
                  {product.specifications}
                </div>
              )}
            </section>
          )}
        </div>
        
        <div className="space-y-6">
          <div className="border rounded-2xl p-6 bg-card shadow-sm space-y-6 sticky top-24">
            <h3 className="font-semibold text-lg">Why Buy From Us?</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <Shield className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-sm">Authentic Guarantee</p>
                  <p className="text-xs text-muted-foreground">All products are 100% genuine with manufacturer warranty.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <Package className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-sm">Fast Nairobi Delivery</p>
                  <p className="text-xs text-muted-foreground">Same-day delivery within Nairobi CBD and environs.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <BadgeCheck className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-sm">Trusted Store</p>
                  <p className="text-xs text-muted-foreground">Physical shop at Rural Urban Bldg, Shop B4, Tom Mboya St.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {relatedProducts && relatedProducts.length > 0 && (
        <section className="mt-20 pt-10 border-t">
          <h2 className="text-2xl font-bold mb-8">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map(related => (
              <ProductCard key={related.id} product={related} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
