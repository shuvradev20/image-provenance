"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";

export function CreateAdminModal() {
    const { isCreateModalOpen, setCreateModalOpen, createNewAdmin } = useAdminStore();
    
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleClose = (open: boolean) => {
        if (!open && !isSubmitting) {
            setCreateModalOpen(false);
            setTimeout(() => {
                setFormData({ fullName: "", email: "", password: "" });
                setShowPassword(false);
            }, 300);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.fullName || !formData.email || !formData.password) {
            toast.error("Please fill in all fields.");
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading("Creating new admin account...");

        try {
            await createNewAdmin(formData);
            toast.success("Admin created successfully!", { id: toastId });
            setCreateModalOpen(false);
            setFormData({ fullName: "", email: "", password: "" });
            setShowPassword(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create admin", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isCreateModalOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-100 p-8 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-xl rounded-xl">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-2xl font-bold text-center text-zinc-900 dark:text-zinc-100 tracking-tight">
                        Add New Admin
                    </DialogTitle>
                    <DialogDescription className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        Create a new administrator account.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="fullName" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            Full Name
                        </Label>
                        <Input 
                            id="fullName"
                            name="fullName"
                            placeholder="e.g. John Doe"
                            value={formData.fullName}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className="bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus-visible:ring-indigo-500"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            Email Address
                        </Label>
                        <Input 
                            id="email"
                            name="email"
                            type="email"
                            placeholder="admin@provenode.com"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className="bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus-visible:ring-indigo-500"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            Temporary Password
                        </Label>
                        <div className="relative">
                            <Input 
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                className="bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus-visible:ring-indigo-500 pr-10"
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
                    </div>

                    <div className="pt-2">
                        <Button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 font-medium h-10 transition-colors"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Creating...
                                </>
                            ) : (
                                "Create Admin"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}