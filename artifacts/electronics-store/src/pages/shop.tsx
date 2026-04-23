import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useListProducts, useListCategories, useListBrands } from "@workspace/api-client-react";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { SEO } from "@/components/seo";

export default function Shop() {
  const [location, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);

  // Parse state from URL
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [categoryId, setCategoryId] = useState<number | undefined>(searchParams.get("categoryId") ? Number(searchParams.get("categoryId")) : undefined);
  const [brandId, setBrandId] = useState<number | undefined>(searchParams.get("brandId") ? Number(searchParams.get("brandId")) : undefined);
  const [sortBy, setSortBy] = useState<any>(searchParams.get("sortBy") || "newest");
  const [page, setPage] = useState(searchParams.get("page") ? Number(searchParams.get("page")) : 1);

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (categoryId) params.set("categoryId", categoryId.toString());
    if (brandId) params.set("brandId", brandId.toString());
    if (sortBy && sortBy !== "newest") params.set("sortBy", sortBy);
    if (page > 1) params.set("page", page.toString());
    
    const newSearch = params.toString();
    const newPath = newSearch ? `/shop?${newSearch}` : "/shop";
    
    // Only update if changed to avoid infinite loops
    if (newSearch !== searchString) {
      setLocation(newPath, { replace: true });
    }
  }, [search, categoryId, brandId, sortBy, page, setLocation, searchString]);

  // Fetch data
  const { data: categories } = useListCategories({ query: { queryKey: ["/api/categories"] } });
  const { data: brands } = useListBrands({ query: { queryKey: ["/api/brands"] } });
  
  const productParams = {
    search: search || undefined,
    categoryId,
    brandId,
    sortBy,
    page,
    limit: 12
  };
  
  const { data: productData, isLoading } = useListProducts(productParams, { 
    query: { queryKey: ["/api/products", productParams] } 
  });

  const clearFilters = () => {
    setSearch("");
    setCategoryId(undefined);
    setBrandId(undefined);
    setSortBy("newest");
    setPage(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const Filters = () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-medium mb-4 text-lg">Categories</h3>
        <div className="space-y-2">
          <button 
            onClick={() => { setCategoryId(undefined); setPage(1); }}
            className={`block w-full text-left text-sm ${!categoryId ? 'font-bold text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            All Categories
          </button>
          {categories?.map(c => (
            <button 
              key={c.id}
              onClick={() => { setCategoryId(c.id); setPage(1); }}
              className={`block w-full text-left text-sm ${categoryId === c.id ? 'font-bold text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {c.name} <span className="text-xs opacity-50">({c.productCount})</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-4 text-lg">Brands</h3>
        <div className="space-y-2">
          <button 
            onClick={() => { setBrandId(undefined); setPage(1); }}
            className={`block w-full text-left text-sm ${!brandId ? 'font-bold text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            All Brands
          </button>
          {brands?.map(b => (
            <button 
              key={b.id}
              onClick={() => { setBrandId(b.id); setPage(1); }}
              className={`block w-full text-left text-sm ${brandId === b.id ? 'font-bold text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {b.name} <span className="text-xs opacity-50">({b.productCount})</span>
            </button>
          ))}
        </div>
      </div>
      
      {(search || categoryId || brandId || sortBy !== "newest") && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO title="Shop Products" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shop Products</h1>
          <p className="text-muted-foreground mt-1">
            {productData?.total || 0} items found
          </p>
        </div>
        
        <div className="flex w-full md:w-auto items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search products..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
          
          <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
            <SelectTrigger className="w-[160px] hidden md:flex">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest Arrivals</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden shrink-0">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader className="mb-6">
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mb-6">
                <Label className="mb-2 block">Sort By</Label>
                <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest Arrivals</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Filters />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-64 shrink-0 hidden md:block border-r pr-6">
          <Filters />
        </aside>
        
        <main className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="space-y-4">
                  <div className="aspect-square bg-muted animate-pulse rounded-lg" />
                  <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : productData?.products.length === 0 ? (
            <div className="text-center py-20 border rounded-xl bg-muted/10">
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your filters or search query.</p>
              <Button onClick={clearFilters}>Clear all filters</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-10">
                {productData?.products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              {productData && productData.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">Page {page} of {productData.totalPages}</span>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setPage(p => Math.min(productData.totalPages, p + 1))}
                    disabled={page === productData.totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
