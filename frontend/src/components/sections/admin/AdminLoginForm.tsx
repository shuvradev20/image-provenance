"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAdminStore } from "@/store/useAdminStore";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Eye, EyeOff, AlertCircle, X } from "lucide-react";
import { ProveNodeLogoLight, ProveNodeLogoDark } from "@/components/icons/ProveNodeLogo";

const loginSchema = z.object({
  email: z.string().min(1, { message: "Email is required" }).email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function AdminLoginForm() {
  const router = useRouter();
  const loginAdmin = useAdminStore((state) => state.loginAdmin);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setAuthError(null);
    try {
      setIsLoading(true);
      await loginAdmin(data);
      router.push("/admin/overview");
    } catch (error: unknown) {
      const errMessage = 
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 
        "Invalid credentials. Please try again.";
      setAuthError(errMessage);
    }
  };

  const handleClose = () => {
    router.push("/");
  };

  return (
    <div className="relative w-full max-w-100 rounded-xl p-8 sm:p-10 bg-card dark:bg-zinc-900/60 shadow-lg dark:shadow-[0_0_60px_-15px_rgba(0,0,0,0.8)]">
      <button
        type="button"
        onClick={handleClose}
        title="Close"
        className="absolute right-5 top-5 z-20 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-zinc-200/80 dark:hover:bg-zinc-800 transition-colors duration-150 cursor-pointer"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="mb-6 flex justify-center">
        <ProveNodeLogoLight className="w-12 h-12 block dark:hidden" />
        <ProveNodeLogoDark className="w-12 h-12 hidden dark:block" />
      </div>

      <div className="mb-8 text-center space-y-1.5">
        <h2 className="text-xl font-semibold text-foreground tracking-tight">
          Welcome back
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Sign in to access admin portal
        </p>
      </div>

      {authError && (
        <div className="w-full mb-6 p-4 rounded-md flex items-start gap-3 bg-destructive/10 text-destructive border border-destructive/20 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium leading-relaxed">
            {authError}
          </p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm font-medium text-foreground">
                  Email Address
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="admin@provenode.com"
                    className="h-11 px-3.5 py-2.5 bg-zinc-200/30 dark:bg-zinc-800 text-sm border border-border text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-foreground/40 transition-colors [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#f4f4f5_inset] dark:[&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#18181b_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:var(--foreground)]"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-[10px] font-mono text-destructive" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm font-medium text-foreground">
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-11 pl-3.5 pr-10 py-2.5 bg-zinc-200/30 dark:bg-zinc-800 text-sm border border-border text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-foreground/40 transition-colors [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#f4f4f5_inset] dark:[&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#18181b_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:var(--foreground)]"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "Hide Password" : "Show Password"}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-[10px] font-mono text-destructive" />
              </FormItem>
            )}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 mt-2 inline-flex items-center justify-center gap-2 rounded-md py-3.5 px-4 text-sm font-medium transition-all duration-150 bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-wait cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                Authenticating...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </Form>
    </div>
  );
}