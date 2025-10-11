import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Menu, X, User } from 'lucide-react';
import baseurl from '../Baseurl/baseurl';

const Header = () => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [memberData, setMemberData] = useState(null);
  const location = useLocation();
  
  // Separate refs for desktop and mobile dropdowns
  const desktopDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  const navItems = [
    { name: 'Home', href: '/home' },
    { name: 'Members', href: '/members' },
    { name: 'Categories', href: '/categories' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  useEffect(() => {
    // Load logged-in user from localStorage on mount
    const storedData = localStorage.getItem('memberData');
    if (storedData) {
      setMemberData(JSON.parse(storedData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('memberData');
    setShowProfileDropdown(false);
    setMemberData(null);
    console.log('Logout clicked');
    window.location.href = "/login";
  };

  const toggleMobileMenu = () => setShowMobileMenu(!showMobileMenu);
  const toggleProfileDropdown = () => setShowProfileDropdown(!showProfileDropdown);

  // Close dropdown when clicking outside - improved version
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check both desktop and mobile dropdown refs
      const isOutsideDesktop = desktopDropdownRef.current && !desktopDropdownRef.current.contains(event.target);
      const isOutsideMobile = mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target);
      
      if (isOutsideDesktop && isOutsideMobile) {
        setShowProfileDropdown(false);
      }
    };
    
    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showProfileDropdown]);

  // Handle profile link click
  const handleProfileClick = () => {
    setShowProfileDropdown(false);
  };

  // Handle logout with proper cleanup
  const handleLogoutClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowProfileDropdown(false);
    handleLogout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/home" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <img
                src="/image.png"
                alt="profile"
                className="rounded-full object-cover"
              />
            </div>
            <span className="text-xl font-semibold text-gray-900">KBC Directory</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`relative text-sm font-medium transition-colors duration-200 ${
                    isActive ? 'text-green-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Icons Section */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Link to='/notifications'>
                <Bell className="w-5 h-5" />
              </Link>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* Desktop Profile Dropdown */}
            <div className="relative" ref={desktopDropdownRef}>
              <button
                onClick={toggleProfileDropdown}
                aria-label="Open profile menu"
                className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors overflow-hidden"
              >
                {memberData?.profile_image ? (
                  <img
                    src={`${baseurl}/${memberData.profile_image}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-gray-600" />
                )}
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 text-left">
                  <div className="px-4 py-2 border-b border-gray-100 text-left">
                    <p className="text-sm font-medium text-gray-900 text-left">
                      {memberData?.first_name
                        ? `${memberData.first_name}`
                        : 'Guest User'}
                    </p>
                    <p className="text-xs text-gray-500 text-left">
                      {memberData?.email || memberData?.contact_no || 'Not logged in'}
                    </p>
                  </div>
                  {memberData ? (
                    <>
                      <Link 
                        to="/profile" 
                        onClick={handleProfileClick}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogoutClick}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link 
                      to="/login" 
                      onClick={handleProfileClick}
                      className="block px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors text-left"
                    >
                      Login
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Icons Section - Profile and Notifications */}
          <div className="md:hidden flex items-center space-x-4">
            <Link to='/notifications' className="relative p-2 text-gray-600">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </Link>
            
            {/* Mobile Profile Dropdown */}
            <div className="relative" ref={mobileDropdownRef}>
              <button
                onClick={toggleProfileDropdown}
                aria-label="Open profile menu"
                className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors overflow-hidden"
              >
                {memberData?.profile_image ? (
                  <img
                    src={`${baseurl}/${memberData.profile_image}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-gray-600" />
                )}
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 text-left">
                  <div className="px-4 py-2 border-b border-gray-100 text-left">
                    <p className="text-sm font-medium text-gray-900 text-left">
                      {memberData?.first_name
                        ? `${memberData.first_name}`
                        : 'Guest User'}
                    </p>
                    <p className="text-xs text-gray-500 text-left">
                      {memberData?.email || memberData?.contact_no || 'Not logged in'}
                    </p>
                  </div>
                  
                  {/* Navigation Links in Mobile Dropdown */}
                  <div className="border-b border-gray-100">
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setShowProfileDropdown(false)}
                        className={`block px-4 py-2 text-sm transition-colors text-left ${
                          location.pathname === item.href
                            ? 'text-green-700 bg-green-50'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>

                  {/* Auth Section */}
                  {memberData ? (
                    <>
                      <Link 
                        to="/profile" 
                        onClick={() => setShowProfileDropdown(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowProfileDropdown(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link 
                      to="/login" 
                      onClick={() => setShowProfileDropdown(false)}
                      className="block px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors text-left"
                    >
                      Login
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;