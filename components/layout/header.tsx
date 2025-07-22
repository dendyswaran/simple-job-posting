'use client'

import Link from 'next/link'
import { useState } from 'react'
import { UserNav } from '@/components/auth/user-nav'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link 
            href="/" 
            className="font-bold text-lg sm:text-xl text-gray-900 hover:text-gray-700 transition-colors"
            onClick={closeMobileMenu}
          >
            Job Posting App
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/jobs" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Browse Jobs
            </Link>
            <Link 
              href="/jobs/create" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Post a Job
            </Link>
            <Link 
              href="/dashboard" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Dashboard
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {/* Desktop User Nav */}
          <div className="hidden md:block">
            <UserNav />
          </div>
          
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <nav className="container mx-auto px-4 py-4 space-y-4">
            <Link 
              href="/" 
              className="block text-base font-medium text-gray-600 hover:text-gray-900 transition-colors py-2"
              onClick={closeMobileMenu}
            >
              Home
            </Link>
            <Link 
              href="/jobs" 
              className="block text-base font-medium text-gray-600 hover:text-gray-900 transition-colors py-2"
              onClick={closeMobileMenu}
            >
              Browse Jobs
            </Link>
            <Link 
              href="/jobs/create" 
              className="block text-base font-medium text-gray-600 hover:text-gray-900 transition-colors py-2"
              onClick={closeMobileMenu}
            >
              Post a Job
            </Link>
            <Link 
              href="/dashboard" 
              className="block text-base font-medium text-gray-600 hover:text-gray-900 transition-colors py-2"
              onClick={closeMobileMenu}
            >
              Dashboard
            </Link>
            
            {/* Mobile User Nav */}
            <div className="pt-4 border-t">
              <UserNav />
            </div>
          </nav>
        </div>
      )}
    </header>
  )
} 