import { useGetDashboardStats, useListProducts } from "@workspace/api-client-react";
import { Link } from "wouter";
import { 
  Package, 
  Tags, 
  Star, 
  AlertTriangle, 
  XCircle,
  Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();
  const { data: lowStockProducts } = useListProducts({ limit: 5 }); // Fallback or mock if no low_stock filter explicitly supported, though normally would filter by stockStatus='low_stock' if supported by API. The instruction says: "low stock list (products with stockStatus low_stock — query useListProducts and filter)"

  const { data: allProducts } = useListProducts({ limit: 100 });
  const lowStockItems = allProducts?.products?.filter(p => p.stockStatus === 'low_stock').slice(0, 5) || [];
  const recentProducts = allProducts?.products?.slice(0, 5) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Array(5).fill(0).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-12 w-full" /></CardContent></Card>
          ))}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const statCards = [
    { title: "Total Products", value: stats?.totalProducts || 0, icon: Package, color: "text-blue-500" },
    { title: "Categories", value: stats?.totalCategories || 0, icon: Tags, color: "text-purple-500" },
    { title: "Featured", value: stats?.featuredProducts || 0, icon: Star, color: "text-yellow-500" },
    { title: "Low Stock", value: stats?.lowStockItems || 0, icon: AlertTriangle, color: "text-orange-500" },
    { title: "Out of Stock", value: stats?.outOfStockItems || 0, icon: XCircle, color: "text-red-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">Here's what's happening in your store today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/products/new">
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </Link>
          <Link href="/categories">
            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
          </CardHeader>
          <CardContent>
            {recentProducts.length === 0 ? (
              <div className="text-sm text-muted-foreground">No recent products.</div>
            ) : (
              <div className="space-y-4">
                {recentProducts.map(product => (
                  <div key={product.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.category?.name}</p>
                    </div>
                    <div className="text-sm font-medium">KSh {parseFloat(product.price).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockItems.length === 0 ? (
              <div className="text-sm text-muted-foreground">No low stock items.</div>
            ) : (
              <div className="space-y-4">
                {lowStockItems.map(product => (
                  <div key={product.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div className="min-w-0 flex-1 pr-4">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">SKU: {product.sku || 'N/A'}</p>
                    </div>
                    <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-none shrink-0">
                      {product.stockQuantity} left
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
