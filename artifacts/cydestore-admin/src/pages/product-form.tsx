import { useState, useEffect, type ChangeEvent } from "react";
import { useLocation, useParams } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useCreateProduct, 
  useUpdateProduct, 
  useGetProduct,
  useListCategories,
  useListBrands,
  getListProductsQueryKey,
  getGetProductQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Plus, Trash2, Image as ImageIcon, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  shortDescription: z.string().optional().nullable(),
  fullDescription: z.string().optional().nullable(),
  price: z.coerce.number().min(0, "Price must be positive"),
  oldPrice: z.coerce.number().optional().nullable(),
  sku: z.string().optional().nullable(),
  stockQuantity: z.coerce.number().int().min(0),
  stockStatus: z.enum(["in_stock", "low_stock", "out_of_stock"]),
  featured: z.boolean().optional(),
  bestSeller: z.boolean().optional(),
  newArrival: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  specifications: z.string().optional().nullable(),
  categoryId: z.coerce.number().optional().nullable(),
  brandId: z.coerce.number().optional().nullable(),
  mainImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  gallery: z.array(z.object({
    url: z.string().url("Must be a valid URL").optional().or(z.literal(""))
  })).optional()
});

const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const cloudinaryUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const canUploadImages = Boolean(cloudinaryCloudName && cloudinaryUploadPreset);

export default function ProductForm() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const id = params.id ? parseInt(params.id) : undefined;
  const isEdit = !!id;

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useListCategories();
  const { data: brands = [] } = useListBrands();

  const { data: product, isLoading: isProductLoading } = useGetProduct(id as number, {
    query: { enabled: isEdit, queryKey: getGetProductQueryKey(id as number) }
  });

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const [isUploadingMainImage, setIsUploadingMainImage] = useState(false);
  const [uploadingGalleryIndex, setUploadingGalleryIndex] = useState<number | null>(null);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      shortDescription: "",
      fullDescription: "",
      price: 0,
      oldPrice: null,
      sku: "",
      stockQuantity: 0,
      stockStatus: "in_stock",
      featured: false,
      bestSeller: false,
      newArrival: false,
      isPublished: true,
      seoTitle: "",
      seoDescription: "",
      specifications: "",
      categoryId: null,
      brandId: null,
      mainImage: "",
      gallery: []
    }
  });

  const { fields: galleryFields, append: appendGallery, remove: removeGallery } = useFieldArray({
    control: form.control,
    name: "gallery"
  });

  useEffect(() => {
    if (isEdit && product) {
      const mainImg = product.images?.find(i => i.isMain)?.imageUrl || "";
      const galImgs = product.images?.filter(i => !i.isMain).map(i => ({ url: i.imageUrl })) || [];

      form.reset({
        name: product.name,
        slug: product.slug,
        shortDescription: product.shortDescription,
        fullDescription: product.fullDescription,
        price: parseFloat(product.price),
        oldPrice: product.oldPrice ? parseFloat(product.oldPrice) : null,
        sku: product.sku,
        stockQuantity: product.stockQuantity,
        stockStatus: product.stockStatus,
        featured: product.featured,
        bestSeller: product.bestSeller,
        newArrival: product.newArrival,
        isPublished: product.isPublished,
        seoTitle: product.seoTitle,
        seoDescription: product.seoDescription,
        specifications: product.specifications,
        categoryId: product.categoryId,
        brandId: product.brandId,
        mainImage: mainImg,
        gallery: galImgs
      });
    }
  }, [product, isEdit, form]);

  const generateSlug = () => {
    const name = form.getValues("name");
    if (name) {
      form.setValue("slug", name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
      throw new Error("Image uploads are not configured");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cloudinaryUploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    const payload = (await response.json()) as {
      secure_url?: string;
      error?: { message?: string };
    };

    if (!response.ok || !payload.secure_url) {
      throw new Error(payload.error?.message ?? "Image upload failed");
    }

    return payload.secure_url;
  };

  const handleMainImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      setIsUploadingMainImage(true);
      const imageUrl = await uploadToCloudinary(file);
      form.setValue("mainImage", imageUrl, { shouldDirty: true, shouldValidate: true });
      toast({ title: "Main image uploaded" });
    } catch (error: any) {
      toast({
        title: "Image upload failed",
        description: error?.message ?? "Could not upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploadingMainImage(false);
    }
  };

  const handleGalleryImageUpload = async (
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      setUploadingGalleryIndex(index);
      const imageUrl = await uploadToCloudinary(file);
      form.setValue(`gallery.${index}.url`, imageUrl, {
        shouldDirty: true,
        shouldValidate: true,
      });
      toast({ title: `Gallery image ${index + 1} uploaded` });
    } catch (error: any) {
      toast({
        title: "Image upload failed",
        description: error?.message ?? "Could not upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingGalleryIndex(null);
    }
  };

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    try {
      const images: { imageUrl: string; isMain: boolean }[] = [];
      if (values.mainImage) {
        images.push({ imageUrl: values.mainImage, isMain: true });
      }
      if (values.gallery) {
        values.gallery.forEach(img => {
          if (img.url) images.push({ imageUrl: img.url, isMain: false });
        });
      }

      const payload = {
        name: values.name,
        slug: values.slug,
        shortDescription: values.shortDescription,
        fullDescription: values.fullDescription,
        price: values.price.toString(),
        oldPrice: values.oldPrice ? values.oldPrice.toString() : null,
        sku: values.sku,
        stockQuantity: values.stockQuantity,
        stockStatus: values.stockStatus as "in_stock" | "low_stock" | "out_of_stock",
        featured: values.featured,
        bestSeller: values.bestSeller,
        newArrival: values.newArrival,
        isPublished: values.isPublished,
        seoTitle: values.seoTitle,
        seoDescription: values.seoDescription,
        specifications: values.specifications,
        categoryId: values.categoryId || null,
        brandId: values.brandId || null,
        images
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id: id as number, data: payload });
        toast({ title: "Product updated successfully" });
      } else {
        await createMutation.mutateAsync({ data: payload });
        toast({ title: "Product created successfully" });
      }

      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      setLocation("/products");
    } catch (error: any) {
      toast({ title: "Error saving product", description: error.message, variant: "destructive" });
    }
  };

  if (isEdit && isProductLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[600px] w-full" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/products")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{isEdit ? "Edit Product" : "New Product"}</h2>
          <p className="text-muted-foreground">{isEdit ? "Update product details." : "Add a new product to your store."}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl><Input placeholder="iPhone 15 Pro" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="flex items-end gap-2">
                    <FormField control={form.control} name="slug" render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Slug</FormLabel>
                        <FormControl><Input placeholder="iphone-15-pro" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="button" variant="outline" onClick={generateSlug}>Generate</Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField control={form.control} name="categoryId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select value={field.value?.toString() || ""} onValueChange={(val) => field.onChange(parseInt(val))}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="brandId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <Select value={field.value?.toString() || ""} onValueChange={(val) => field.onChange(parseInt(val))}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select a brand" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {brands.map(b => <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="shortDescription" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl><Textarea placeholder="Brief summary for listings" {...field} value={field.value || ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="fullDescription" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Description</FormLabel>
                      <FormControl><Textarea className="min-h-[150px]" placeholder="Detailed description" {...field} value={field.value || ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="specifications" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specifications</FormLabel>
                      <FormControl><Textarea placeholder='{"Color": "Black", "Storage": "256GB"}' {...field} value={field.value || ""} /></FormControl>
                      <FormDescription>Can be valid JSON or freeform text.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Images</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload files directly or paste image URLs. Configure `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` to enable uploads.
                </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField control={form.control} name="mainImage" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Main Image URL</FormLabel>
                      <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-2">
                          <FormControl><Input placeholder="https://..." {...field} value={field.value || ""} /></FormControl>
                          <input
                            id="main-image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleMainImageUpload}
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            disabled={!canUploadImages || isUploadingMainImage}
                            onClick={() => (document.getElementById("main-image-upload") as HTMLInputElement | null)?.click()}
                          >
                            {isUploadingMainImage ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="mr-2 h-4 w-4" />
                            )}
                            Upload Main Image
                          </Button>
                          <FormMessage />
                        </div>
                        {field.value ? (
                          <img src={field.value} alt="Main preview" className="h-16 w-16 rounded object-cover border" />
                        ) : (
                          <div className="h-16 w-16 rounded border flex items-center justify-center bg-muted text-muted-foreground">
                            <ImageIcon className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                    </FormItem>
                  )} />
                  
                  <div className="space-y-4">
                    <p className="text-sm font-medium">Gallery Images</p>
                    {galleryFields.map((field, index) => (
                      <div key={field.id} className="flex items-start gap-4">
                        <FormField control={form.control} name={`gallery.${index}.url`} render={({ field: inputField }) => (
                          <FormItem className="flex-1">
                            <FormControl><Input placeholder="https://..." {...inputField} value={inputField.value || ""} /></FormControl>
                            <input
                              id={`gallery-upload-${index}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(event) => handleGalleryImageUpload(index, event)}
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              disabled={!canUploadImages || uploadingGalleryIndex === index}
                              onClick={() => (document.getElementById(`gallery-upload-${index}`) as HTMLInputElement | null)?.click()}
                            >
                              {uploadingGalleryIndex === index ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Upload className="mr-2 h-4 w-4" />
                              )}
                              Upload
                            </Button>
                            <FormMessage />
                          </FormItem>
                        )} />
                        {form.watch(`gallery.${index}.url`) ? (
                          <img src={form.watch(`gallery.${index}.url`)} alt="Gallery preview" className="h-10 w-10 rounded object-cover border" />
                        ) : (
                           <div className="h-10 w-10 rounded border flex items-center justify-center bg-muted text-muted-foreground">
                             <ImageIcon className="h-4 w-4" />
                           </div>
                        )}
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeGallery(index)} className="text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendGallery({ url: "" })}>
                      <Plus className="h-4 w-4 mr-2" /> Add Gallery Image
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Pricing & Inventory</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField control={form.control} name="price" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (KSh)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="oldPrice" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Compare at Price</FormLabel>
                        <FormControl><Input type="number" {...field} value={field.value || ""} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="sku" render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl><Input placeholder="IPH-15-PRO" {...field} value={field.value || ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField control={form.control} name="stockQuantity" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Quantity</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="stockStatus" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="in_stock">In Stock</SelectItem>
                            <SelectItem value="low_stock">Low Stock</SelectItem>
                            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Status & Flags</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="isPublished" render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Published</FormLabel>
                        <FormDescription>Make product visible in store</FormDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="featured" render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Featured</FormLabel>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="bestSeller" render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Best Seller</FormLabel>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="newArrival" render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>New Arrival</FormLabel>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>SEO (Optional)</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="seoTitle" render={({ field }) => (
                    <FormItem>
                      <FormLabel>SEO Title</FormLabel>
                      <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="seoDescription" render={({ field }) => (
                    <FormItem>
                      <FormLabel>SEO Description</FormLabel>
                      <FormControl><Textarea {...field} value={field.value || ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => setLocation("/products")}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
