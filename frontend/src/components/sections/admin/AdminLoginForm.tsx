"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useAdminStore } from "@/store/useAdminStore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
    email: z.string().min(1, { message: "Email is required" }).email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>

export function AdminLoginForm() {
    const router = useRouter();
    const loginAdmin = useAdminStore((state) => state.loginAdmin);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // Eye icon toggle state

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        try {
            setIsLoading(true);
            await loginAdmin(data);
            toast.success("Welcome back, Admin!");
            router.push("/admin/dashboard");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Invalid credentials. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-sm shadow-xl border-zinc-200 dark:border-zinc-800">
            <CardHeader className="space-y-2 text-center pb-6">
                <CardTitle className="text-3xl font-bold tracking-tight">ProveNode Admin</CardTitle>
                <CardDescription className="text-zinc-500">
                    Enter your credentials to access the secure portal
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="font-semibold">Email Address</Label>
                        <Input 
                            id="email" 
                            type="email" 
                            placeholder="admin@provenode.com" 
                            className={`h-11 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            {...register("email")} 
                        />
                        {errors.email && <p className="text-sm text-red-500 font-medium">{errors.email.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="password" className="font-semibold">Password</Label>
                        <div className="relative">
                            <Input 
                                id="password" 
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className={`h-11 pr-10 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                {...register("password")} 
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        {errors.password && <p className="text-sm text-red-500 font-medium">{errors.password.message}</p>}
                    </div>

                    <Button type="submit" className="w-full h-11 text-base font-semibold mt-2" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Authenticating...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}