import { useEffect } from "react";
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const settingsSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  storeTagline: z.string().optional().nullable(),
  logoUrl: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  whatsappNumber: z.string().min(1, "WhatsApp number is required"),
  contactPhone: z.string().optional().nullable(),
  contactEmail: z.string().email("Must be a valid email").optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable(),
  facebookUrl: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  instagramUrl: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  twitterUrl: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  footerText: z.string().optional().nullable(),
  announcementText: z.string().optional().nullable(),
  heroTitle: z.string().optional().nullable(),
  heroSubtitle: z.string().optional().nullable(),
});

export default function Settings() {
  const { data: settings, isLoading } = useGetSettings();
  const updateMutation = useUpdateSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      storeName: "",
      storeTagline: "",
      logoUrl: "",
      whatsappNumber: "",
      contactPhone: "",
      contactEmail: "",
      address: "",
      facebookUrl: "",
      instagramUrl: "",
      twitterUrl: "",
      footerText: "",
      announcementText: "",
      heroTitle: "",
      heroSubtitle: "",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        storeName: settings.storeName || "",
        storeTagline: settings.storeTagline || "",
        logoUrl: settings.logoUrl || "",
        whatsappNumber: settings.whatsappNumber || "",
        contactPhone: settings.contactPhone || "",
        contactEmail: settings.contactEmail || "",
        address: settings.address || "",
        facebookUrl: settings.facebookUrl || "",
        instagramUrl: settings.instagramUrl || "",
        twitterUrl: settings.twitterUrl || "",
        footerText: settings.footerText || "",
        announcementText: settings.announcementText || "",
        heroTitle: settings.heroTitle || "",
        heroSubtitle: settings.heroSubtitle || "",
      });
    }
  }, [settings, form]);

  const onSubmit = async (values: z.infer<typeof settingsSchema>) => {
    try {
      await updateMutation.mutateAsync({ data: values });
      queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
      toast({ title: "Settings saved successfully" });
    } catch (error: any) {
      toast({ title: "Error saving settings", description: error.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your store's global configuration.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Info</CardTitle>
                  <CardDescription>Basic information about your store.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="storeName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Name</FormLabel>
                      <FormControl><Input placeholder="Cydestore" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="storeTagline" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tagline</FormLabel>
                      <FormControl><Input placeholder="Your tech destination" {...field} value={field.value || ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="logoUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo URL</FormLabel>
                      <FormControl><Input placeholder="https://..." {...field} value={field.value || ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Details</CardTitle>
                  <CardDescription>How customers can reach you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="whatsappNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp Number</FormLabel>
                      <FormControl><Input placeholder="+254..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="contactPhone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Support Phone</FormLabel>
                        <FormControl><Input placeholder="+254..." {...field} value={field.value || ""} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="contactEmail" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Support Email</FormLabel>
                        <FormControl><Input placeholder="support@..." {...field} value={field.value || ""} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Physical Address</FormLabel>
                      <FormControl><Textarea placeholder="123 Tech Street..." {...field} value={field.value || ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Storefront Content</CardTitle>
                  <CardDescription>Text displayed on the main storefront.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="announcementText" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Top Announcement Bar</FormLabel>
                      <FormControl><Input placeholder="Free shipping on orders over $500!" {...field} value={field.value || ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="heroTitle" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hero Title</FormLabel>
                      <FormControl><Input placeholder="Welcome to..." {...field} value={field.value || ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="heroSubtitle" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hero Subtitle</FormLabel>
                      <FormControl><Textarea placeholder="Discover the latest..." {...field} value={field.value || ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="footerText" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Footer Text</FormLabel>
                      <FormControl><Textarea placeholder="© 2024 Cydestore..." {...field} value={field.value || ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Social Links</CardTitle>
                  <CardDescription>Your social media presence.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="facebookUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook URL</FormLabel>
                      <FormControl><Input placeholder="https://facebook.com/..." {...field} value={field.value || ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="instagramUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram URL</FormLabel>
                      <FormControl><Input placeholder="https://instagram.com/..." {...field} value={field.value || ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="twitterUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter (X) URL</FormLabel>
                      <FormControl><Input placeholder="https://twitter.com/..." {...field} value={field.value || ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
            </div>
            
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={updateMutation.isPending} className="gap-2">
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Settings
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
