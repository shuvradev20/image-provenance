"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { CreditCard, HelpCircle, MessageSquare, Monitor, Moon, Palette, Sun } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"

export function SettingsPopover({ children }: { children: React.ReactNode }) {
  const { setTheme } = useTheme()

  const menuItemStyle = "py-2 px-3 cursor-pointer rounded-md transition-colors hover:bg-gray-200 dark:hover:bg-[#2A2A2A] focus:bg-gray-200 dark:focus:bg-[#2A2A2A]"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      
      <DropdownMenuContent side="right" align="start" className="w-56 p-2 bg-white dark:bg-[#1C1C1C] border-gray-200 dark:border-gray-800" sideOffset={8}>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className={menuItemStyle}>
            <Palette className="mr-2 h-4 w-4" />
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="p-1.5 w-40 bg-white dark:bg-[#1C1C1C] border-gray-200 dark:border-gray-800">
              <DropdownMenuItem onClick={() => setTheme("light")} className={menuItemStyle}>
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")} className={menuItemStyle}>
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")} className={menuItemStyle}>
                <Monitor className="mr-2 h-4 w-4" />
                <span>System</span>
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