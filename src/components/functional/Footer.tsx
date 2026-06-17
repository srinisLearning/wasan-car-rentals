import React from 'react'
import Link from 'next/link'

const Footer = () => {
  return (
    <footer className="bg-primary text-white py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-center gap-6">
          <Link href="/login" className="text-sm hover:text-gray-200 transition">
            Login
          </Link>
          <Link href="/register" className="text-sm hover:text-gray-200 transition">
            Register
          </Link>
          <Link href="/" className="text-sm hover:text-gray-200 transition">
            Home
          </Link>
        </div>
        <div className="text-center border-t border-gray-400 pt-4">
          <p className="text-sm mb-2">
            © {new Date().getFullYear()} Wasan Car Rentals. All rights reserved.
          </p>
          <p className="text-xs text-gray-200">
            Making car rental easy and affordable across India
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
