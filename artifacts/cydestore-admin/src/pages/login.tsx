import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAdminLogin, getGetAdminMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const loginMutation = useAdminLogin();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: import.meta.env.DEV ? "admin@cydestore.co.ke" : "",
      password: import.meta.env.DEV ? "admin123" : "",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      await loginMutation.mutateAsync({ data: values });
      queryClient.invalidateQueries({ queryKey: getGetAdminMeQueryKey() });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-primary">Cydestore</h1>
            <p className="text-muted-foreground">Log in to your control center.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="admin@cydestore.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Sign In
              </Button>
            </form>
          </Form>

          {import.meta.env.DEV && (
            <div className="mt-8 rounded-lg bg-muted p-4 text-xs text-muted-foreground">
              <p className="font-semibold mb-1">Development Mode</p>
              <p>Email: admin@cydestore.co.ke</p>
              <p>Password: admin123</p>
            </div>
          )}
        </div>
      </div>

      <div className="hidden lg:block bg-primary/5 bg-cover bg-center" style={{ backgroundImage: "url('/logo.png')" }}>
        <div className="h-full w-full bg-primary/20 backdrop-blur-sm flex flex-col items-center justify-center text-primary-foreground p-12 text-center">
          <div className="max-w-md space-y-6 bg-background/80 p-8 rounded-2xl backdrop-blur-md border border-primary/20 text-foreground">
            <h2 className="text-2xl font-bold text-primary">Operations Console</h2>
            <p className="text-muted-foreground">Manage your storefront, products, and inventory with precision.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
