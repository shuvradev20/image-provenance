'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { name: 'process', href: '#' },
    { name: 'story', href: '#' },
    { name: 'pricing', href: '#' },
    { name: 'docs', href: '#' },
  ]

  return (
    <>
      {/* Desktop & Mobile Floating Navbar */}
      {/* pt-6 r px-4 er karonei dui inch er moto gap toiri hobe */}
      <div className="fixed top-0 inset-x-0 z-50 flex justify-center pt-6 px-4 sm:px-8">
        <nav className="w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-full px-6 py-3.5 flex items-center justify-between shadow-2xl">
          
          {/* Left: Logo and Text */}
          <div className="flex items-center gap-2">
            {/* Choto logo icon, apni chaile image dite paren */}
            <span className="text-white font-semibold text-xl tracking-tight">ProveNode</span>
          </div>

          {/* Right: Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors capitalize"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Right: Mobile Hamburger Icon */}
          <button
            onClick={() => setIsOpen(true)}
            className="md:hidden text-gray-300 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
        </nav>
      </div>

      {/* Mobile Drawer Backdrop (Blur effect) */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-md z-[60] transition-opacity duration-500 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Drawer (Right side, 80% width) */}
      <div
        className={`fixed top-0 right-0 h-full w-[80%] max-w-sm bg-[#0a0a0a] border-l border-white/10 z-[70] transform transition-transform duration-500 ease-in-out md:hidden flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Close Button */}
        <div className="flex justify-end p-6">
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white bg-white/5 p-2 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Mobile Links */}
        <div className="flex flex-col px-8 py-4 gap-8 mt-4">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-2xl font-medium text-gray-200 hover:text-white transition-colors capitalize"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </>
  )
}