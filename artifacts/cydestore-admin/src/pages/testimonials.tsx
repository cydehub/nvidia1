import { useState } from "react";
import { 
  useListTestimonials, 
  useCreateTestimonial, 
  useUpdateTestimonial, 
  useDeleteTestimonial,
  getListTestimonialsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Edit2, Trash2, Loader2, Star, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const testimonialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().optional().nullable(),
  avatar: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(1, "Comment is required"),
  isActive: z.boolean(),
});

export default function Testimonials() {
  const { data: testimonials = [], isLoading } = useListTestimonials();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createMutation = useCreateTestimonial();
  const updateMutation = useUpdateTestimonial();
  const deleteMutation = useDeleteTestimonial();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<any>(null);

  const form = useForm<z.infer<typeof testimonialSchema>>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: { name: "", role: "", avatar: "", rating: 5, comment: "", isActive: true },
  });

  const onSubmit = async (values: z.infer<typeof testimonialSchema>) => {
    try {
      if (editingTestimonial) {
        await updateMutation.mutateAsync({ id: editingTestimonial.id, data: values });
        toast({ title: "Testimonial updated successfully" });
      } else {
        await createMutation.mutateAsync({ data: values });
        toast({ title: "Testimonial created successfully" });
      }
      queryClient.invalidateQueries({ queryKey: getListTestimonialsQueryKey() });
      setIsDialogOpen(false);
      form.reset();
      setEditingTestimonial(null);
    } catch (error: any) {
      toast({ title: "Error saving testimonial", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListTestimonialsQueryKey() });
      toast({ title: "Testimonial deleted" });
    } catch (error: any) {
      toast({ title: "Error deleting testimonial", description: error.message, variant: "destructive" });
    }
  };

  const openEdit = (testimonial: any) => {
    setEditingTestimonial(testimonial);
    form.reset({
      name: testimonial.name,
      role: testimonial.role || "",
      avatar: testimonial.avatar || "",
      rating: testimonial.rating,
      comment: testimonial.comment,
      isActive: testimonial.isActive,
    });
    setIsDialogOpen(true);
  };

  const openCreate = () => {
    setEditingTestimonial(null);
    form.reset({ name: "", role: "", avatar: "", rating: 5, comment: "", isActive: true });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Testimonials</h2>
          <p className="text-muted-foreground">Manage customer reviews and feedback.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Add Testimonial</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTestimonial ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="role" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role (Optional)</FormLabel>
                      <FormControl><Input placeholder="Verified Buyer" {...field} value={field.value || ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="avatar" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar URL (Optional)</FormLabel>
                    <FormControl><Input placeholder="https://..." {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="rating" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating (1-5)</FormLabel>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`h-6 w-6 cursor-pointer ${star <= field.value ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} 
                          onClick={() => field.onChange(star)} 
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="comment" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comment</FormLabel>
                    <FormControl><Textarea className="min-h-[100px]" placeholder="Great product!" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="isActive" render={({ field }) => (
                  <FormItem className="flex items-center gap-2 pb-2">
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="!m-0">Active (Visible on store)</FormLabel>
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Testimonial
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
              <TableHead className="w-16">Avatar</TableHead>
              <TableHead className="w-48">Customer</TableHead>
              <TableHead className="w-32">Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead className="w-24 text-center">Status</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[120px] mb-1" />
                    <Skeleton className="h-3 w-[80px]" />
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 mx-auto rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : testimonials.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No testimonials found.</TableCell></TableRow>
            ) : (
              testimonials.map((testimonial) => (
                <TableRow key={testimonial.id}>
                  <TableCell>
                    {testimonial.avatar ? (
                      <img src={testimonial.avatar} alt={testimonial.name} className="h-10 w-10 rounded-full object-cover border" />
                    ) : (
                      <div className="h-10 w-10 rounded-full border bg-muted flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <p className="truncate text-sm text-muted-foreground" title={testimonial.comment}>{testimonial.comment}</p>
                  </TableCell>
                  <TableCell className="text-center">
                    {testimonial.isActive ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">Active</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-100 text-slate-500">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(testimonial)}>
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
                            <AlertDialogTitle>Delete Testimonial?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the testimonial.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleDelete(testimonial.id)}>Delete</AlertDialogAction>
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
