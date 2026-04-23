import { useState } from "react";
import { 
  useListBanners, 
  useCreateBanner, 
  useUpdateBanner, 
  useDeleteBanner,
  getListBannersQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Edit2, Trash2, Loader2, Image as ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const bannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional().nullable(),
  imageUrl: z.string().url("Must be a valid URL"),
  linkUrl: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  isActive: z.boolean(),
  sortOrder: z.coerce.number().int(),
});

export default function Banners() {
  const { data: banners = [], isLoading } = useListBanners();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();
  const deleteMutation = useDeleteBanner();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);

  const form = useForm<z.infer<typeof bannerSchema>>({
    resolver: zodResolver(bannerSchema),
    defaultValues: { title: "", subtitle: "", imageUrl: "", linkUrl: "", isActive: true, sortOrder: 0 },
  });

  const onSubmit = async (values: z.infer<typeof bannerSchema>) => {
    try {
      if (editingBanner) {
        await updateMutation.mutateAsync({ id: editingBanner.id, data: values });
        toast({ title: "Banner updated successfully" });
      } else {
        await createMutation.mutateAsync({ data: values });
        toast({ title: "Banner created successfully" });
      }
      queryClient.invalidateQueries({ queryKey: getListBannersQueryKey() });
      setIsDialogOpen(false);
      form.reset();
      setEditingBanner(null);
    } catch (error: any) {
      toast({ title: "Error saving banner", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListBannersQueryKey() });
      toast({ title: "Banner deleted" });
    } catch (error: any) {
      toast({ title: "Error deleting banner", description: error.message, variant: "destructive" });
    }
  };

  const openEdit = (banner: any) => {
    setEditingBanner(banner);
    form.reset({
      title: banner.title,
      subtitle: banner.subtitle || "",
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || "",
      isActive: banner.isActive,
      sortOrder: banner.sortOrder,
    });
    setIsDialogOpen(true);
  };

  const openCreate = () => {
    setEditingBanner(null);
    form.reset({ title: "", subtitle: "", imageUrl: "", linkUrl: "", isActive: true, sortOrder: 0 });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Banners</h2>
          <p className="text-muted-foreground">Manage homepage carousel banners.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Add Banner</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBanner ? "Edit Banner" : "Add Banner"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input placeholder="Summer Sale" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="subtitle" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle</FormLabel>
                    <FormControl><Input placeholder="Up to 50% off" {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="imageUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="linkUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link URL</FormLabel>
                    <FormControl><Input placeholder="https://..." {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="sortOrder" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="isActive" render={({ field }) => (
                    <FormItem className="flex flex-col justify-end pb-2">
                      <div className="flex items-center gap-2">
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <FormLabel className="!m-0">Active</FormLabel>
                      </div>
                    </FormItem>
                  )} />
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Banner
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Image</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="text-center">Order</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-12 w-20 rounded-md" /></TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[150px] mb-2" />
                    <Skeleton className="h-3 w-[100px]" />
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 mx-auto rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : banners.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No banners found.</TableCell></TableRow>
            ) : (
              banners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <img src={banner.imageUrl} alt={banner.title} className="h-12 w-24 rounded-md object-cover border" />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{banner.title}</div>
                    <div className="text-xs text-muted-foreground">{banner.subtitle}</div>
                    {banner.linkUrl && <div className="text-xs text-blue-500 truncate max-w-[200px] mt-1">{banner.linkUrl}</div>}
                  </TableCell>
                  <TableCell className="text-center">{banner.sortOrder}</TableCell>
                  <TableCell className="text-center">
                    {banner.isActive ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">Active</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-100 text-slate-500">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(banner)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Banner?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the banner.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleDelete(banner.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
