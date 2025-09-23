import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Menu, X, User } from 'lucide-react';
import baseurl from '../Baseurl/baseurl';

const Header = () => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [memberData, setMemberData] = useState(null); // 👈 store logged-in user
  const location = useLocation();
  const dropdownRef = useRef(null);

  const navItems = [
    { name: 'Home', href: '/home' },
    { name: 'Members', href: '/members' },
    { name: 'Categories', href: '/categories' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  useEffect(() => {
    // 👇 Load logged-in user from localStorage on mount
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
                className="rounded-full  object-cover"
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
                  className={`relative text-sm font-medium transition-colors duration-200 ${isActive ? 'text-green-600' : 'text-gray-600 hover:text-gray-900'
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
              <Link to='/notifications'> <Bell className="w-5 h-5" /></Link>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
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
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {memberData?.first_name
                        ? `${memberData.first_name}`
                        : 'Guest User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {memberData?.email || memberData?.contact_no || 'Not logged in'}
                    </p>
                  </div>
                  {memberData ? (
                    <>
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link to="/login" className="block px-4 py-2 text-sm text-green-600 hover:bg-green-50">
                      Login
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link to='/notifications' className="relative p-2 text-gray-600">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </Link>
            <button
              onClick={toggleProfileDropdown}
              aria-label="Open profile menu"
              className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center"
            >
              <User className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={toggleMobileMenu}
              aria-label="Toggle navigation menu"
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setShowMobileMenu(false)}
                className={`block px-2 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === item.href
                  ? 'text-green-700 bg-green-50'
                  : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {item.name}
              </Link>
            ))}

            {/* Auth row */}
            <div className="pt-2 border-t border-gray-100 mt-2">
              {memberData ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setShowMobileMenu(false)}
                    className="block px-2 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => { setShowMobileMenu(false); handleLogout(); }}
                    className="w-full text-left px-2 py-2 rounded-md text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-2 py-2 rounded-md text-sm text-green-600 hover:bg-green-50"
                >
                  Login
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
