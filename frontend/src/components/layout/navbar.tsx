'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // 50px er beshi scroll hole navbar upore chole jabe
      if (window.scrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'process', href: '#' },
    { name: 'Our story', href: '#' },
    { name: 'pricing', href: '#' },
    { name: 'docs', href: '#' },
  ]

  return (
    <>
      <div className={`fixed top-0 inset-x-0 z-50 flex justify-center px-4 sm:px-8 transition-all duration-500 ease-in-out ${
          isScrolled ? 'pt-0' : 'pt-6'
        }`}>
        <nav className="w-full max-w-4xl bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-full px-6 py-3.5 flex items-center justify-between shadow-lg dark:shadow-2xl transition-colors duration-300">
          
          <div className="flex items-center gap-2">
            <Link href="/" className="text-black dark:text-white font-semibold text-xl tracking-tight transition-colors">
              ProveNode
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors capitalize"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="md:hidden text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white bg-gray-100 dark:bg-white/5 p-2 rounded-full transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </nav>
      </div>

      <div
        className={`fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-md z-50 transition-opacity duration-500 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      <div
        className={`fixed top-0 right-1 h-full w-[80%] max-w-sm bg-white dark:bg-[#0a0a0a] border-l border-gray-200 dark:border-white/10 z-50 transform transition-transform duration-500 ease-in-out md:hidden flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between pt-10 pb-6 px-8 border-b border-gray-200 dark:border-white/10">

          <span className="text-xl font-bold text-black dark:text-white tracking-tight">
            ProveNode
          </span>

          <button onClick={() => setIsOpen(false)} className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white bg-gray-100 dark:bg-white/5 p-2 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex flex-col px-8 py-4 gap-8 mt-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors capitalize"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}