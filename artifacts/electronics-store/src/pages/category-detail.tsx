import { useRoute, useLocation, Link } from "wouter";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/seo";
import { ChevronLeft } from "lucide-react";

export default function CategoryDetail() {
  const [, params] = useRoute("/categories/:slug");
  const slug = params?.slug || "";
  
  const { data: categories } = useListCategories({ query: { queryKey: ["/api/categories"] } });
  const category = categories?.find(c => c.slug === slug);
  
  const { data: productData, isLoading } = useListProducts(
    { categoryId: category?.id, limit: 50 }, 
    { query: { enabled: !!category?.id, queryKey: ["/api/products", { categoryId: category?.id, limit: 50 }] } }
  );

  if (!category && categories) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Category Not Found</h2>
        <Link href="/categories"><Button>View All Categories</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <SEO title={`${category?.name || "Category"} Products`} />
      
      <div className="mb-8">
        <Link href="/categories" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1 mb-4 w-fit">
          <ChevronLeft className="w-4 h-4" /> Back to Categories
        </Link>
        <div className="flex items-center gap-6">
          {category?.image && (
            <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center shrink-0 p-4 border">
              <img src={category.image} alt={category.name} className="w-full h-full object-contain" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{category?.name}</h1>
            {category?.description && (
              <p className="text-muted-foreground mt-2 max-w-2xl">{category.description}</p>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="space-y-4">
              <div className="aspect-square bg-muted animate-pulse rounded-lg" />
              <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : productData?.products.length === 0 ? (
        <div className="text-center py-20 border rounded-xl bg-muted/10">
          <h3 className="text-lg font-semibold mb-2">No products yet</h3>
          <p className="text-muted-foreground">We are restocking this category soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {productData?.products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
