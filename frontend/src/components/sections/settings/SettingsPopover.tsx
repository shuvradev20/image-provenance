"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { CreditCard, HelpCircle, MessageSquare, Monitor, Moon, Palette, Sun, Check, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"

export function SettingsPopover({ children }: { children: React.ReactNode }) {
  const {theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  const [isMobile, setIsMobile] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [themeExpanded, setThemeExpanded] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile() 
    
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const menuItemStyle = "py-2 px-3 cursor-pointer rounded-md transition-colors hover:bg-gray-200 dark:hover:bg-[#2A2A2A] focus:bg-gray-200 dark:focus:bg-[#2A2A2A]"

  const getActiveStyle = (currentTheme: string) => {
    if (!mounted) return menuItemStyle
    return theme === currentTheme
      ? `${menuItemStyle} bg-muted dark:bg-[#2A2A2A]` 
      : menuItemStyle
  }

  if (isMobile) {
    return (
      <>
        <div onClick={() => setMobileMenuOpen(true)} className="cursor-pointer">
          {children}
        </div>

        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 transition-opacity"
            onClick={() => setMobileMenuOpen(false)} 
          >
            <div 
              className="bg-white dark:bg-[#1C1C1C] w-full rounded-t-2xl p-4 animate-in slide-in-from-bottom-full duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-5 cursor-pointer" 
                onClick={() => setMobileMenuOpen(false)} 
              />
              
              <div className="flex flex-col gap-1">
                <div className="flex flex-col">
                  <button 
                    onClick={() => setThemeExpanded(!themeExpanded)} 
                    className={`${menuItemStyle} flex items-center justify-between w-full text-left`}
                  >
                    <div className="flex items-center">
                      <Palette className="mr-2 h-4 w-4" />
                      <span className="text-sm font-medium">Theme</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${themeExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {themeExpanded && (
                    <div className="pl-6 flex flex-col gap-1 mt-1 border-l-2 border-gray-100 dark:border-[#2A2A2A] ml-3 overflow-hidden animate-in slide-in-from-top-2">
                      <button 
                        onClick={() => { setTheme("light"); setMobileMenuOpen(false); }} 
                        className={`${getActiveStyle("light")} flex items-center justify-between w-full`}
                      >
                        <div className="flex items-center">
                          <Sun className="mr-2 h-4 w-4" />
                          <span className="text-sm">Light</span>
                        </div>
                        {mounted && theme === "light" && <Check className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
                      </button>
                      
                      <button 
                        onClick={() => { setTheme("dark"); setMobileMenuOpen(false); }} 
                        className={`${getActiveStyle("dark")} flex items-center justify-between w-full`}
                      >
                        <div className="flex items-center">
                          <Moon className="mr-2 h-4 w-4" />
                          <span className="text-sm">Dark</span>
                        </div>
                        {mounted && theme === "dark" && <Check className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
                      </button>
                      
                      <button 
                        onClick={() => { setTheme("system"); setMobileMenuOpen(false); }} 
                        className={`${getActiveStyle("system")} flex items-center justify-between w-full`}
                      >
                        <div className="flex items-center">
                          <Monitor className="mr-2 h-4 w-4" />
                          <span className="text-sm">System</span>
                        </div>
                        {mounted && theme === "system" && <Check className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
                      </button>
                    </div>
                  )}
                </div>

                <button className={`${menuItemStyle} flex items-center w-full text-left`} onClick={() => setMobileMenuOpen(false)}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span className="text-sm font-medium">Manage Subscription</span>
                </button>
                
                <button className={`${menuItemStyle} flex items-center w-full text-left`} onClick={() => setMobileMenuOpen(false)}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span className="text-sm font-medium">Help</span>
                </button>

                <button className={`${menuItemStyle} flex items-center w-full text-left`} onClick={() => setMobileMenuOpen(false)}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span className="text-sm font-medium">Send Feedback</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      
      <DropdownMenuContent side="right" align="start" className="w-56 p-2 bg-white dark:bg-[#1C1C1C] border border-border shadow-none" sideOffset={8}>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className={menuItemStyle}>
            <Palette className="mr-2 h-4 w-4" />
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="p-1.5 w-40 bg-white dark:bg-[#1C1C1C] border border-border">
              <DropdownMenuItem onClick={() => setTheme("light")} className={`${getActiveStyle("light")} flex items-center justify-between`}>
                <div className="flex items-center">
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                </div>
                {mounted && theme === "light" && <Check className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")} className={`${getActiveStyle("dark")} flex items-center justify-between`}>
                <div className="flex items-center">
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                </div>
                {mounted && theme === "dark" && <Check className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")} className={`${getActiveStyle("system")} flex items-center justify-between`}>
                <div className="flex items-center">
                  <Monitor className="mr-2 h-4 w-4" />
                  <span>System</span>
                </div>
                {mounted && theme === "system" && <Check className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuItem className={menuItemStyle}>
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Manage Subscription</span>
        </DropdownMenuItem>

        <DropdownMenuItem className={menuItemStyle}>
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Help</span>
        </DropdownMenuItem>

        <DropdownMenuItem className={menuItemStyle}>
          <MessageSquare className="mr-2 h-4 w-4" />
          <span>Send Feedback</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}