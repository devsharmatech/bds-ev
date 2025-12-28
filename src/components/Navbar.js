"use client";

import { useState, useEffect, useRef } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  User,
  Calendar,
  Home,
  Users,
  LogIn,
  LogOut,
  Bell,
  Shield,
  Image as ImageIcon,
  Mic,
  Search,
  ChevronDown,
  Users2,
  MoreVertical,
  Loader2,
  MapPin,
  Clock,
} from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMembershipDropdownOpen, setIsMembershipDropdownOpen] =
    useState(false);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const fetchedRef = useRef(false);
  const searchTimeoutRef = useRef(null);
  const searchResultsRef = useRef(null);
  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
    setIsLoggedIn(false);
    setIsUserDropdownOpen(false);

    window.location.href = "/auth/login";
  };

  useEffect(() => {
    setMounted(true);
    // Force light mode
    if (typeof window !== "undefined") {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  }, []);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setIsLoggedIn(!!data.user);
        } else {
          setUser(null);
          setIsLoggedIn(false);
        }
      } catch {
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setIsAuthLoading(false);
      }
    };

    fetchUser();
  }, []);

  const [committeesMenu, setCommitteesMenu] = useState([]);

  useEffect(() => {
    const loadCommittees = async () => {
      try {
        const res = await fetch("/api/committees");
        const data = await res.json();
        if (data.success && Array.isArray(data.committees)) {
          const items = data.committees.map((c) => ({
            name: c.name,
            href: `/committees/${c.slug}`,
          }));
          setCommitteesMenu(items);
        }
      } catch {}
    };
    loadCommittees();
  }, []);

  const mainNavItems = [
    { name: "Home", href: "/", icon: <Home className="w-4 h-4" /> },
    { name: "About Us", href: "/about", icon: <User className="w-4 h-4" /> },
    {
      name: "Upcoming Events",
      href: "/events",
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      name: "Our Team",
      href: "/team",
      icon: <Users2 className="w-4 h-4" />,
    },
    {
      name: "Membership",
      href: "/membership",
      icon: <Shield className="w-4 h-4" />,
    },
    {
      name: "Committees",
      href: "/committees",
      icon: <Users className="w-4 h-4" />,
      submenu: committeesMenu,
    },
    {
      name: "Gallery",
      href: "/gallery",
      icon: <ImageIcon className="w-4 h-4" />,
    },
  ];


  // Handle search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length >= 2) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await fetch(`/api/search/events?q=${encodeURIComponent(searchQuery)}&limit=8`);
          const data = await response.json();
          
          console.log('Search API Response:', data); // Debug log
          
          if (data.success && data.events && Array.isArray(data.events)) {
            console.log('Setting search results:', data.events.length, 'events'); // Debug log
            console.log('First event:', data.events[0]); // Debug log
            setSearchResults(data.events);
          } else {
            console.log('No events in response or success is false', { success: data.success, events: data.events });
            setSearchResults([]);
          }
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300); // 300ms debounce
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // If there are results, navigate to events page with search query
      if (searchResults.length > 0) {
        router.push(`/events?search=${encodeURIComponent(searchQuery)}`);
        setShowSearchModal(false);
        setSearchQuery("");
        setSearchResults([]);
      } else {
        // Navigate to events page anyway
        router.push(`/events?search=${encodeURIComponent(searchQuery)}`);
        setShowSearchModal(false);
        setSearchQuery("");
      }
    }
  };

  // Handle clicking on a search result
  const handleResultClick = (slug) => {
    if (slug) {
      router.push(`/events/${slug}`);
    } else {
      // Fallback if no slug
      router.push(`/events`);
    }
    setShowSearchModal(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Close search modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close modal if clicking outside the search modal
      if (showSearchModal && !event.target.closest('.search-modal-content')) {
        setShowSearchModal(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    };

    if (showSearchModal) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSearchModal]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape" && showSearchModal) {
        setShowSearchModal(false);
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [showSearchModal]);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo - static */}
            <Link href="/" className="flex items-center space-x-3">
              <img
                src="https://bds-web-iota.vercel.app/long-logo.png"
                alt="Bahrain Dental Society Logo"
                className=" h-10 "
              />
            </Link>

            {/* Empty placeholder */}
            <div className="w-10 h-10"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm">
          <div className="fixed inset-0 flex items-start justify-center pt-4">
            <div className="relative w-full max-w-2xl mx-4 search-modal-content">
              {/* Modal Content */}
              <div className="bg-white rounded-xl shadow-2xl max-h-[85vh] min-h-[500px] flex flex-col">
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-200 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[#03215F]">
                      Search Bahrain Dental Society
                    </h3>
                    <button
                      onClick={() => setShowSearchModal(false)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      aria-label="Close search"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Search Input and Results Container - Scrollable */}
                <div className="flex-1 overflow-y-auto min-h-[400px]">
                  <form onSubmit={handleSearch} className="p-6 search-container">
                    <div className="relative" ref={searchResultsRef}>
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for events..."
                      className="w-full pl-12 pr-20 py-4 bg-gray-50 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AE9B66] focus:border-[#AE9B66] text-[#03215F] text-base"
                      autoFocus
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-14 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                    )}
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-[#AE9B66] text-white rounded-md hover:bg-[#03215F] transition-colors"
                    >
                      Search
                    </button>

                    {/* Search Results Dropdown */}
                    {searchQuery.trim().length >= 2 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl max-h-[calc(85vh-200px)] overflow-y-auto z-50 search-results">
                        {isSearching ? (
                          <div className="p-4 text-center text-gray-500">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                            <p className="text-sm">Searching events...</p>
                          </div>
                        ) : searchResults && Array.isArray(searchResults) && searchResults.length > 0 ? (
                          <>
                            {/* Debug: Remove this in production */}
                            {console.log('Rendering search results:', searchResults.length, searchResults)}
                            <div className="p-2 border-b border-gray-200 bg-gray-50">
                              <p className="text-xs font-medium text-gray-500 uppercase">
                                Events ({searchResults.length})
                              </p>
                            </div>
                            <div className="divide-y divide-gray-100">
                              {searchResults.map((event) => (
                                <button
                                  key={event.id}
                                  onClick={() => handleResultClick(event.slug)}
                                  className="w-full p-4 hover:bg-gray-50 transition-colors text-left group"
                                >
                                  <div className="flex gap-3">
                                    {event.banner_url ? (
                                      <img
                                        src={event.banner_url}
                                        alt={event.title}
                                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                      />
                                    ) : (
                                      <div className="w-16 h-16 bg-gradient-to-br from-[#03215F] to-[#AE9B66] rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Calendar className="w-8 h-8 text-white/70" />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-[#03215F] group-hover:text-[#AE9B66] transition-colors truncate">
                                        {event.title}
                                      </h4>
                                      {event.description && (
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                          {event.description}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                          <Calendar className="w-3 h-3" />
                                          <span>{event.date}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <MapPin className="w-3 h-3" />
                                          <span className="truncate">{event.venue}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                            <div className="p-2 border-t border-gray-200">
                              <button
                                onClick={handleSearch}
                                className="w-full text-center text-sm text-[#AE9B66] hover:text-[#03215F] font-medium py-2"
                              >
                                View all results →
                              </button>
                            </div>
                          </>
                        ) : searchQuery.trim().length >= 2 ? (
                          <div className="p-4 text-center text-gray-500">
                            <p className="text-sm">No events found</p>
                            <p className="text-xs mt-1">Try a different search term</p>
                          </div>
                        ) : null}
                      </div>
                    )}
                    </div>
                  </form>

                  {/* Popular Searches */}
                  {searchResults.length === 0 && !isSearching && searchQuery.trim().length < 2 && (
                    <div className="px-6 pb-6">
                      <h4 className="text-sm font-semibold text-gray-700 mb-4">
                        Popular Searches
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {[
                          "Dental Conference",
                          "Workshops",
                          "Seminars",
                          "Training",
                        ].map((term) => (
                          <button
                            key={term}
                            onClick={() => setSearchQuery(term)}
                            className="px-3 py-1.5 bg-gray-100 text-[#03215F] rounded-full text-sm hover:bg-gray-200 transition-colors"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-18 md:lg-20 lg:h-24 xl:h-18 ">
            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <img
                src="https://bds-web-iota.vercel.app/long-logo.png"
                alt="Bahrain Dental Society Logo"
                className="
      h-9 sm:h-10 md:h-12 lg:h-10
      w-auto
      object-contain
    "
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden xl:flex items-center space-x-1">
              {mainNavItems.map((item) =>
                item.name === "Committees" ? (
                  <div key={item.name} className="relative group">
                    <button className="flex items-center space-x-1 px-2 py-2 text-[#03215F] hover:text-[#AE9B66] transition-colors font-medium text-sm">
                      {item.icon}
                      <span>{item.name}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute top-full left-0  w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-200">
                      {item.submenu?.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className="block px-2 py-3 text-[#03215F] hover:bg-gray-50 hover:text-[#AE9B66] transition-colors first:rounded-t-lg last:rounded-b-lg text-sm"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-2 px-2 py-2 text-[#03215F] hover:text-[#AE9B66] transition-colors font-medium text-sm"
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                )
              )}
            </div>

            {/* Search and Right Side Controls */}
            <div className="flex items-center space-x-4">
              {/* Search Button - Opens Modal */}
              <button
                onClick={() => setShowSearchModal(true)}
                className="hidden xl:flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Open search"
              >
                <Search className="w-5 h-5 text-gray-600" />
              </button>


              {/* AUTH SLOT – FIXED WIDTH */}
              <div className="hidden xl:flex items-center justify-end w-[150px]">
                {isAuthLoading ? (
                  // Skeleton placeholder (same size)
                  <div className="h-10 w-full rounded-lg bg-gray-200 animate-pulse" />
                ) : isLoggedIn && user ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                      className="flex items-center space-x-2 px-2 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition w-full justify-center text-sm"
                    >
                      <User className="w-5 h-5" />
                      <span className="font-medium">
                        {user.full_name?.split(" ")[0]}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {isUserDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50  text-sm">
                        <Link
                          href="/member/dashboard"
                          className="block px-4 py-3 hover:bg-gray-100  text-sm"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          Go to Dashboard
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 text-[#b8352d] hover:bg-gray-100  text-sm"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href="/auth/login" className="w-full">
                    <button className="w-full px-2 py-2 bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] text-white rounded-lg flex items-center justify-center space-x-2  text-sm">
                      <LogIn className="w-5 h-5" />
                      <span>Member Login</span>
                    </button>
                  </Link>
                )}
              </div>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="xl:hidden p-2 rounded-lg bg-gray-100"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="xl:hidden py-4 border-t border-gray-200">
              {/* Search and Theme Toggle in Mobile */}
              <div className="px-4 mb-4 flex items-center justify-between">
                <button
                  onClick={() => setShowSearchModal(true)}
                  className="relative flex-1 mr-4"
                >
                  <div className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg border border-gray-300 text-left">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <span className="text-gray-500">
                      Search...
                    </span>
                  </div>
                </button>
              </div>

              {/* Main Navigation Items */}
              <div className="flex flex-col space-y-1 px-2">
                {mainNavItems.map((item) =>
                  item.name === "Committees" ? (
                    <div key={item.name}>
                      <button
                        onClick={() =>
                          setIsMembershipDropdownOpen(!isMembershipDropdownOpen)
                        }
                        className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-100 transition-colors  text-sm"
                      >
                        <div className="flex items-center space-x-3  text-sm">
                          {item.icon}
                          <span className="font-medium text-[#03215F]">
                            {item.name}
                          </span>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 transition-transform text-gray-500 ${
                            isMembershipDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Dropdown for Membership */}
                      {isMembershipDropdownOpen && (
                        <div className="ml-8 mt-1 mb-2 space-y-1">
                          {item.submenu?.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="block p-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-600  text-sm"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors  text-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.icon}
                      <span className="font-medium text-[#03215F]">
                        {item.name}
                      </span>
                    </Link>
                  )
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 my-4"></div>
              {/* Auth in Mobile Menu */}
              <div className="mt-6 px-2 space-y-3">
                {isLoggedIn && user ? (
                  <>
                    <Link
                      href="/member/dashboard"
                      className="block text-center px-4 py-3 bg-gradient-to-r from-[#AE9B66] to-[#03215F] text-white rounded-lg  text-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Go to Dashboard
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center space-x-2 p-3 border rounded-lg  text-sm"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    className="block text-center px-4 py-3 bg-gradient-to-r from-[#AE9B66] to-[#03215F] text-white rounded-lg  text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Member Login
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
