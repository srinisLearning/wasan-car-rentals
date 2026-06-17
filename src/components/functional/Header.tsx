import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const Header = () => {
  return (
    <header className="bg-primary text-white py-4 px-6 shadow-md">
      <nav className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-primary font-bold text-lg">W</span>
          </div>
          <span className="text-2xl font-bold hidden sm:inline">Wasan Car Rentals</span>
        </Link>

        {/* Login Button */}
        <Button
          asChild
          className="bg-white text-primary hover:bg-gray-100 font-semibold"
        >
          <Link href="/login">Login</Link>
        </Button>
      </nav>
    </header>
  )
}

export default Header
