"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { UserCircle, Palette, Sun, Moon, Monitor, Check, LogOut, ChevronDown } from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface AdminDropdownProps {
  children?: React.ReactNode;
  isSidebarOpen?: boolean;
}

export function AdminDropdown({ children }: AdminDropdownProps) {
  const { admin, logoutAdmin } = useAdminStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  const [isMobile, setIsMobile] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [themeExpanded, setThemeExpanded] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const menuItemStyle =
    "py-2 px-3 cursor-pointer rounded-md transition-colors hover:bg-zinc-200/80 dark:hover:bg-zinc-800/80 text-foreground text-xs font-medium flex items-center";

  const getActiveStyle = (currentTheme: string) => {
    if (!mounted) return menuItemStyle;
    return theme === currentTheme
      ? `${menuItemStyle} bg-muted dark:bg-[#2A2A2A]`
      : menuItemStyle;
  };

  if (isMobile) {
    return (
      <>
        <div
          onClick={() => setMobileMenuOpen(true)}
          className="cursor-pointer flex justify-center items-center"
        >
          {children}
        </div>

        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="bg-background border-t border-border w-full rounded-t-2xl p-4 slide-in-from-bottom-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                title="Close menu"
                className="w-12 h-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50 rounded-full mx-auto mb-5 cursor-pointer transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              />

              <div className="flex flex-col gap-1">
                <Link
                  href="/admin/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`${menuItemStyle} flex items-center gap-2 w-full text-left`}
                >
                  <UserCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-foreground">
                      {admin?.fullName || "Admin"}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-normal">
                      View Profile
                    </span>
                  </div>
                </Link>

                <div className="flex flex-col">
                  <button
                    title="Toggle Theme Options"
                    onClick={() => setThemeExpanded(!themeExpanded)}
                    className={`${menuItemStyle} flex items-center justify-between w-full text-left`}
                  >
                    <div className="flex items-center">
                      <Palette className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-medium">Theme</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                        themeExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {themeExpanded && (
                    <div className="pl-6 flex flex-col gap-1 mt-1 border-l border-border ml-3 overflow-hidden animate-in slide-in-from-top-2">
                      <button
                        title="Switch to Light Theme"
                        onClick={() => {
                          setTheme("light");
                          setMobileMenuOpen(false);
                        }}
                        className={`${getActiveStyle("light")} flex items-center justify-between w-full`}
                      >
                        <div className="flex items-center">
                          <Sun className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs">Light</span>
                        </div>
                        {mounted && theme === "light" && (
                          <Check className="h-3.5 w-3.5 text-primary" />
                        )}
                      </button>

                      <button
                        title="Switch to Dark Theme"
                        onClick={() => {
                          setTheme("dark");
                          setMobileMenuOpen(false);
                        }}
                        className={`${getActiveStyle("dark")} flex items-center justify-between w-full`}
                      >
                        <div className="flex items-center">
                          <Moon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs">Dark</span>
                        </div>
                        {mounted && theme === "dark" && (
                          <Check className="h-3.5 w-3.5 text-primary" />
                        )}
                      </button>

                      <button
                        title="Sync with System Theme"
                        onClick={() => {
                          setTheme("system");
                          setMobileMenuOpen(false);
                        }}
                        className={`${getActiveStyle("system")} flex items-center justify-between w-full`}
                      >
                        <div className="flex items-center">
                          <Monitor className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs">System</span>
                        </div>
                        {mounted && theme === "system" && (
                          <Check className="h-3.5 w-3.5 text-primary" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <button
                  title="Log Out"
                  onClick={() => {
                    if (logoutAdmin) logoutAdmin();
                    setMobileMenuOpen(false);
                  }}
                  className={`${menuItemStyle} flex items-center w-full text-left text-status-error hover:bg-status-error/10`}
                >
                  <LogOut className="mr-2 h-4 w-4 text-status-error shrink-0" />
                  <span className="text-xs font-medium">Log Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="right"
        align="start"
        sideOffset={8}
        className="w-56 p-1.5 bg-popover text-popover-foreground border border-border shadow-xl rounded-xl z-50"
      >
        <DropdownMenuItem
          asChild
          title="View Admin Profile"
          className={menuItemStyle}
        >
          <Link href="/admin/profile" className="w-full flex items-center">
            <UserCircle className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-foreground">
                {admin?.fullName || "Admin"}
              </span>
              <span className="text-[10px] text-muted-foreground font-normal">
                View Profile
              </span>
            </div>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger
            title="Change Appearance Theme"
            className={menuItemStyle}
          >
            <Palette className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
            <span>Theme</span>
          </DropdownMenuSubTrigger>

          <DropdownMenuPortal>
            <DropdownMenuSubContent
              sideOffset={6}
              alignOffset={-40}
              className="p-1 w-40 bg-popover text-popover-foreground border border-border rounded-xl shadow-xl z-50 -mt-10"
            >
              <DropdownMenuItem
                title="Set Light Theme"
                onClick={() => setTheme("light")}
                className={`${getActiveStyle("light")} flex items-center justify-between`}
              >
                <div className="flex items-center">
                  <Sun className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                  <span>Light</span>
                </div>
                {mounted && theme === "light" && (
                  <Check className="h-3.5 w-3.5 text-primary" />
                )}
              </DropdownMenuItem>

              <DropdownMenuItem
                title="Set Dark Theme"
                onClick={() => setTheme("dark")}
                className={`${getActiveStyle("dark")} flex items-center justify-between`}
              >
                <div className="flex items-center">
                  <Moon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                  <span>Dark</span>
                </div>
                {mounted && theme === "dark" && (
                  <Check className="h-3.5 w-3.5 text-primary" />
                )}
              </DropdownMenuItem>

              <DropdownMenuItem
                title="Set System Default Theme"
                onClick={() => setTheme("system")}
                className={`${getActiveStyle("system")} flex items-center justify-between`}
              >
                <div className="flex items-center">
                  <Monitor className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                  <span>System</span>
                </div>
                {mounted && theme === "system" && (
                  <Check className="h-3.5 w-3.5 text-primary" />
                )}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuItem
          title="Log Out"
          onClick={() => {
            if (logoutAdmin) logoutAdmin();
          }}
          className={cn(
            menuItemStyle,
            "text-status-error focus:text-status-error focus:bg-status-error/10 hover:text-status-error hover:bg-status-error/10 dark:hover:bg-status-error/20"
          )}
        >
          <LogOut className="mr-2 h-4 w-4 shrink-0 text-status-error" />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}