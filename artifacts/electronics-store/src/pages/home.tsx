import { useListProducts, useListCategories, useListBanners, useListTestimonials, useGetSettings } from "@workspace/api-client-react";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { buildWhatsAppUrl } from "@/lib/format";
import { ShieldCheck, Truck, HeadphonesIcon, BadgeCheck, Star } from "lucide-react";
import { SEO } from "@/components/seo";

export default function Home() {
  const { data: settings } = useGetSettings({ query: { queryKey: ["/api/settings"] } });
  
  const { data: featuredData } = useListProducts({ featured: true, limit: 8 }, { query: { queryKey: ["/api/products", { featured: true, limit: 8 }] } });
  const { data: newArrivalsData } = useListProducts({ newArrival: true, limit: 4 }, { query: { queryKey: ["/api/products", { newArrival: true, limit: 4 }] } });
  const { data: bestSellersData } = useListProducts({ bestSeller: true, limit: 4 }, { query: { queryKey: ["/api/products", { bestSeller: true, limit: 4 }] } });
  
  const { data: categories } = useListCategories({ query: { queryKey: ["/api/categories"] } });
  const { data: banners } = useListBanners({ query: { queryKey: ["/api/banners"] } });
  const { data: testimonials } = useListTestimonials({ query: { queryKey: ["/api/testimonials"] } });

  const activeBanners = banners?.filter(b => b.isActive).sort((a, b) => a.sortOrder - b.sortOrder) || [];
  const activeTestimonials = testimonials?.filter(t => t.isActive) || [];

  return (
    <div className="flex flex-col w-full">
      <SEO title="Home" />
      
      {/* Hero Section */}
      <section className="relative w-full h-[80vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/src/assets/hero-bg.png" alt="Cydestore Electronics" className="w-full h-full object-cover brightness-[0.4]" />
        </div>
        <div className="container relative z-10 mx-auto px-4 flex flex-col items-center text-center text-white space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl">
            {settings?.heroTitle || "Premium Electronics for Nairobi"}
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl">
            {settings?.heroSubtitle || "Flagship-grade gadgets, reliable local delivery. Order via WhatsApp today."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <a href={buildWhatsAppUrl(settings?.whatsappNumber, "Hello Cydestore, I want to make an inquiry.")} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="text-base font-semibold w-full sm:w-auto h-14 px-8 bg-[#25D366] hover:bg-[#1DA851] text-white border-none">
                Order on WhatsApp
              </Button>
            </a>
            <Link href="/shop">
              <Button size="lg" variant="outline" className="text-base font-semibold w-full sm:w-auto h-14 px-8 bg-white/10 text-white border-white/20 hover:bg-white/20">
                Browse Shop
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Top Categories */}
      {categories && categories.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 text-center">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.slice(0, 8).map(category => (
                <Link key={category.id} href={`/categories/${category.slug}`}>
                  <div className="group bg-card rounded-xl p-6 flex flex-col items-center justify-center gap-4 text-center cursor-pointer border hover:border-primary transition-colors hover:shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      {category.image ? (
                        <img src={category.image} alt={category.name} className="w-10 h-10 object-contain" />
                      ) : (
                        <span className="text-2xl font-bold">{category.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">{category.name}</h3>
                      <p className="text-xs text-muted-foreground">{category.productCount} Products</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredData?.products && featuredData.products.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Featured Products</h2>
              <Link href="/shop?featured=true" className="text-sm font-medium text-primary hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featuredData.products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Promo Banners */}
      {activeBanners.length > 0 && (
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeBanners.slice(0, 2).map(banner => (
                <div key={banner.id} className="relative rounded-2xl overflow-hidden aspect-[2/1] group">
                  <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/20 flex flex-col justify-center p-8 text-white">
                    <h3 className="text-2xl md:text-3xl font-bold mb-2">{banner.title}</h3>
                    {banner.subtitle && <p className="text-white/80 mb-6 max-w-sm">{banner.subtitle}</p>}
                    {banner.linkUrl && (
                      <Link href={banner.linkUrl}>
                        <Button variant="outline" className="w-fit bg-white/10 border-white/30 text-white hover:bg-white hover:text-black">
                          Shop Now
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals & Best Sellers Split */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">New Arrivals</h2>
                <Link href="/shop?newArrival=true" className="text-sm font-medium text-primary hover:underline">View All</Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {newArrivalsData?.products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Best Sellers</h2>
                <Link href="/shop?bestSeller=true" className="text-sm font-medium text-primary hover:underline">View All</Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {bestSellersData?.products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features / Why Choose Us */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <ShieldCheck className="w-12 h-12 text-primary-foreground/80" />
              <h3 className="font-semibold text-lg">Genuine Products</h3>
              <p className="text-sm text-primary-foreground/70">100% authentic electronics with manufacturer warranties.</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <Truck className="w-12 h-12 text-primary-foreground/80" />
              <h3 className="font-semibold text-lg">Nairobi Delivery</h3>
              <p className="text-sm text-primary-foreground/70">Fast, reliable delivery within Nairobi and environs.</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <HeadphonesIcon className="w-12 h-12 text-primary-foreground/80" />
              <h3 className="font-semibold text-lg">Expert Support</h3>
              <p className="text-sm text-primary-foreground/70">Our knowledgeable staff helps you choose the right device.</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <BadgeCheck className="w-12 h-12 text-primary-foreground/80" />
              <h3 className="font-semibold text-lg">Trusted Local Shop</h3>
              <p className="text-sm text-primary-foreground/70">Visit our physical store at Rural Urban Building, Shop B4.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {activeTestimonials.length > 0 && (
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-12">What Our Customers Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {activeTestimonials.slice(0, 3).map(testimonial => (
                <div key={testimonial.id} className="bg-card p-8 rounded-2xl border shadow-sm flex flex-col items-center">
                  <div className="flex gap-1 mb-6 text-yellow-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < testimonial.rating ? "fill-current" : "opacity-30"}`} />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic mb-6">"{testimonial.comment}"</p>
                  <div className="mt-auto">
                    <p className="font-semibold">{testimonial.name}</p>
                    {testimonial.role && <p className="text-sm text-muted-foreground">{testimonial.role}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
