import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Topbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleLogout = () => {
    document.cookie = "username=; path=/; max-age=0";
    window.location.href = "/login";
  };

  const navItems = [
    { to: '/', label: 'Disdrometer' },
    { to: '/ka', label: 'Ka-band' },
    { to: '/ku', label: 'Ku-band ' },
    { to: '/cband', label: 'C-band ' },
    { to: '/download', label: 'Export Data' },
  ];

  return (
    <nav className="w-full bg-gray-650 text-white shadow-md sticky top-0 z-50">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex-shrink-0 flex items-center gap-3">
          <img
            className="h-14 w-auto"
            src="https://tronova.azmiproductions.com/img/isteru.png"
            alt="LOURA Logo"
          />
        </div>
        

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `text-sm font-medium px-3 py-2 rounded-md transition ${
                  isActive
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-black hover:text-white hover:bg-gray-700'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Logout Button */}
        <div className="hidden md:flex">
          <button
            onClick={handleLogout}
            className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium shadow transition"
          >
            Logout
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition"
          >
            {menuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 bg-gray-800 space-y-1">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? 'bg-white text-gray-900'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="mt-2 w-full text-left px-4 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 text-white"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Topbar;
