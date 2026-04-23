import { useListCategories } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { SEO } from "@/components/seo";

export default function Categories() {
  const { data: categories, isLoading } = useListCategories({ query: { queryKey: ["/api/categories"] } });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">All Categories</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="aspect-square bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <SEO title="Categories" />
      <h1 className="text-3xl font-bold mb-2">All Categories</h1>
      <p className="text-muted-foreground mb-10">Browse our wide selection of electronics by category.</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories?.map(category => (
          <Link key={category.id} href={`/categories/${category.slug}`}>
            <Card className="group h-full flex flex-col items-center justify-center p-8 text-center cursor-pointer border-border/50 hover:border-primary hover:shadow-md transition-all overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-24 h-24 mb-6 rounded-full bg-muted/50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 relative z-10">
                {category.image ? (
                  <img src={category.image} alt={category.name} className="w-14 h-14 object-contain" />
                ) : (
                  <span className="text-3xl font-bold">{category.name.charAt(0)}</span>
                )}
              </div>
              <h2 className="text-lg font-bold group-hover:text-primary transition-colors relative z-10">{category.name}</h2>
              <p className="text-sm text-muted-foreground mt-1 relative z-10">{category.productCount} Products</p>
              {category.description && (
                <p className="text-xs text-muted-foreground/70 mt-3 line-clamp-2 relative z-10">{category.description}</p>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
