import React from 'react';
import { Home, Search, Grid3X3, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const MobileFooter = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      icon: Home,
      label: 'Home',
      path: '/home',
      active: isActive('/home')
    },
    {
      icon: Search,
      label: 'Browse',
      path: '/browse',
      active: isActive('/browse')
    },
    {
      icon: Grid3X3,
      label: 'Category',
      path: '/categories',
      active: isActive('/categories')
    },
    {
      icon: User,
      label: 'Profile',
      path: '/profile',
      active: isActive('/profile')
    }
  ];

  return (
    <>
      {/* Add bottom padding to prevent content hiding */}
      <div className="lg:hidden h-16"></div>
      
      <footer className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={index}
                to={item.path}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 ${
                  item.active
                    ? 'text-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
                }`}
              >
                <IconComponent 
                  size={20} 
                  className={`${item.active ? 'text-green-600' : 'text-gray-600'}`}
                />
                <span className={`text-xs mt-1 font-medium ${
                  item.active ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </footer>
    </>
  );
};

export default MobileFooter;