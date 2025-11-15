'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAdmin, user, logout, isLoading } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close profile dropdown when mobile menu opens
  useEffect(() => {
    if (mobileMenuOpen) {
      setUserMenuOpen(false);
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    // Only redirect if loading is complete and user is not an admin
    if (!isLoading && !isAdmin) {
      // Store the current path to redirect back after login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      }
      router.push('/login');
    }
  }, [isAdmin, isLoading, router]);

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render admin content if not an admin
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Admin Header */}
      <header className="bg-gray-900 text-white shadow-lg sticky top-0 z-[60]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/admin" className="flex items-center">
                <Image
                  src="/48x48.png"
                  alt="WallsPie"
                  width={48}
                  height={48}
                  className="h-8 w-8 sm:h-9 sm:w-9"
                  priority
                />
                {/* <span className="ml-2 sm:ml-3 text-base sm:text-lg font-bold text-white">
                  WallsPie <span className="text-purple-400">Admin</span>
                </span> */}
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex lg:space-x-4">
              <Link
                href="/admin"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/wallpapers"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition"
              >
                Wallpapers
              </Link>
              <Link
                href="/admin/categories"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition"
              >
                Categories
              </Link>
              <Link
                href="/admin/users"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition"
              >
                Users
              </Link>
              <Link
                href="/admin/analytics"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition"
              >
                Analytics
              </Link>
            </nav>

            {/* Right side - User menu and mobile toggle */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* User Profile Dropdown - Desktop Only, hidden when mobile menu open */}
              {!mobileMenuOpen && (
                <div className="hidden sm:block relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {user?.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden md:block text-sm font-medium text-white">{user?.name}</span>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{user?.email || 'No email'}</p>
                      {user?.user_type === 1 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mt-2">
                        Administrator
                        </span>
                      )}
                    </div>

                    <Link
                      href="/admin/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      View Profile
                    </Link>

                    <Link
                      href="/"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      View Site
                    </Link>

                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-800 transition-colors"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer - Slides from Right */}
          {mobileMenuOpen && (
            <div
              className={`fixed top-0 right-0 h-screen w-64 sm:w-72 bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out z-[70] lg:hidden overflow-y-auto ${
                mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <h2 className="text-lg font-bold text-white"></h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-md hover:bg-gray-800 transition-colors"
                >
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Menu Items */}
              <div className="p-4 space-y-2">
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="group block px-4 py-3 rounded-lg text-base font-medium text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                  </div>
                </Link>
                <Link
                  href="/admin/wallpapers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="group block px-4 py-3 rounded-lg text-base font-medium text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Wallpapers
                  </div>
                </Link>
                <Link
                  href="/admin/categories"
                  onClick={() => setMobileMenuOpen(false)}
                  className="group block px-4 py-3 rounded-lg text-base font-medium text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Categories
                  </div>
                </Link>
                <Link
                  href="/admin/users"
                  onClick={() => setMobileMenuOpen(false)}
                  className="group block px-4 py-3 rounded-lg text-base font-medium text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Users
                  </div>
                </Link>
                <Link
                  href="/admin/analytics"
                  onClick={() => setMobileMenuOpen(false)}
                  className="group block px-4 py-3 rounded-lg text-base font-medium text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Analytics
                  </div>
                </Link>
              </div>

              {/* User Section */}
              <div className="p-4 mt-auto border-t border-gray-800">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                    <span className="text-base font-bold text-white">
                      {user?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-semibold text-white">{user?.name}</p>
                    <p className="text-xs text-gray-400">{user?.email || 'No email'}</p>
                  </div>
                </div>

                <Link
                  href="/admin/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-gray-800 transition whitespace-nowrap"
                >
                  View Profile
                </Link>

                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-gray-800 transition"
                >
                  View Site
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:bg-gray-800 transition mt-2"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Admin Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">{children}</main>
    </div>
  );
}
