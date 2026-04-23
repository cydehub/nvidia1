import { useState } from "react";
import { Link } from "wouter";
import { 
  useListProducts, 
  useDeleteProduct, 
  useUpdateProduct,
  getListProductsQueryKey,
  useListCategories,
  useListBrands
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Image as ImageIcon,
  Search,
  CheckCircle2,
  XCircle,
  MoreHorizontal
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function Products() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [brandId, setBrandId] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [page, setPage] = useState(1);
  const limit = 10;

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: categories = [] } = useListCategories();
  const { data: brands = [] } = useListBrands();

  const queryParams: any = {
    page,
    limit,
    ...(search && { search }),
    ...(categoryId !== "all" && { categoryId: parseInt(categoryId) }),
    ...(brandId !== "all" && { brandId: parseInt(brandId) }),
    ...(sortBy !== "newest" && { sortBy }),
  };

  const { data: productData, isLoading } = useListProducts(queryParams);
  const deleteMutation = useDeleteProduct();
  const updateMutation = useUpdateProduct();

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      toast({ title: "Product deleted" });
    } catch (error: any) {
      toast({ title: "Error deleting product", description: error.message, variant: "destructive" });
    }
  };

  const toggleFlag = async (product: any, flag: 'featured' | 'isPublished') => {
    try {
      await updateMutation.mutateAsync({
        id: product.id,
        data: { [flag]: !product[flag] }
      });
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      toast({ title: `Product ${flag === 'isPublished' ? 'publication status' : 'featured status'} updated` });
    } catch (error: any) {
      toast({ title: "Error updating product", description: error.message, variant: "destructive" });
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(parseFloat(price));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">Manage your store's inventory.</p>
        </div>
        <Link href="/products/new">
          <Button className="gap-2"><Plus className="h-4 w-4" /> Add Product</Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={brandId} onValueChange={setBrandId}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="popularity">Popularity</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category/Brand</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-10 w-10 rounded-md" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : productData?.products?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              productData?.products?.map((product) => {
                const mainImage = product.images?.find(i => i.isMain)?.imageUrl || product.images?.[0]?.imageUrl;
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      {mainImage ? (
                        <img src={mainImage} alt={product.name} className="h-10 w-10 rounded-md object-cover border bg-muted" />
                      ) : (
                        <div className="h-10 w-10 rounded-md border bg-muted flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium truncate max-w-[200px]">{product.name}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">{product.slug}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{product.category?.name || 'Uncategorized'}</div>
                      <div className="text-xs text-muted-foreground">{product.brand?.name || 'No Brand'}</div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(product.price)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{product.stockQuantity}</span>
                        <Badge variant={
                          product.stockStatus === 'in_stock' ? 'default' :
                          product.stockStatus === 'low_stock' ? 'secondary' : 'destructive'
                        } className={product.stockStatus === 'low_stock' ? 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20' : ''}>
                          {product.stockStatus.replace('_', ' ')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {product.isPublished ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">Published</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-slate-100 text-slate-500">Draft</Badge>
                        )}
                        {product.featured && <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">Featured</Badge>}
                        {product.bestSeller && <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">Best Seller</Badge>}
                        {product.newArrival && <Badge variant="secondary" className="bg-purple-500/10 text-purple-600">New</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/products/${product.id}/edit`}>
                            <DropdownMenuItem className="cursor-pointer">
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem onClick={() => toggleFlag(product, 'isPublished')}>
                            {product.isPublished ? <XCircle className="mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                            {product.isPublished ? 'Unpublish' : 'Publish'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleFlag(product, 'featured')}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Toggle Featured
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive cursor-pointer">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete "{product.name}". This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(product.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {productData && productData.totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="text-sm font-medium">
            Page {page} of {productData.totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(productData.totalPages, p + 1))}
            disabled={page === productData.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
