import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Home, Package, PlusCircle, Bot, Heart, AlertCircle, User, LogOut, Menu, X, Stethoscope } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Add Product', path: '/add-product', icon: PlusCircle },
    { name: 'Health Assistant', path: '/health-assistant', icon: Bot },
    { name: 'Health Tips', path: '/health-tips', icon: Heart },
    { name: 'Emergency', path: '/emergency-contacts', icon: AlertCircle },
  ];

  return (
    <nav className="bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-600 text-white shadow-2xl sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="p-2 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm group-hover:bg-opacity-30 transition-all">
              <Stethoscope className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight">MediMitra</span>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <>
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white hover:bg-opacity-20 transition-all duration-300 font-medium backdrop-blur-sm group"
                    >
                      <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
                
                {/* Profile Dropdown */}
                <div className="relative ml-2">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white hover:bg-opacity-20 transition-all duration-300 backdrop-blur-sm"
                  >
                    <img
                      src={user.profileImage ? (user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:5000${user.profileImage}`) : '/default-avatar.png'}
                      alt="User Avatar"
                      className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-md"
                    />
                    <span className="font-medium hidden lg:block">{user.name}</span>
                  </button>
                  
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl py-2 z-20 animate-slide-down border border-gray-100">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-all group"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <User className="w-4 h-4 text-teal-500 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Profile</span>
                      </Link>
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 transition-all group"
                      >
                        <LogOut className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="px-6 py-2 rounded-xl hover:bg-white hover:bg-opacity-20 transition-all duration-300 font-medium backdrop-blur-sm"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-6 py-2 bg-white text-teal-600 rounded-xl hover:bg-opacity-90 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pb-4 animate-slide-down">
            {user ? (
              <div className="flex flex-col space-y-1">
                {/* User Info */}
                <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <img
                    src={user.profileImage ? (user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:5000${user.profileImage}`) : '/default-avatar.png'}
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                  />
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-xs text-teal-100">{user.email}</p>
                  </div>
                </div>

                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white hover:bg-opacity-20 transition-all backdrop-blur-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{link.name}</span>
                    </Link>
                  );
                })}

                <div className="pt-2 mt-2 border-t border-white border-opacity-20">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white hover:bg-opacity-20 transition-all backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white hover:bg-opacity-20 transition-all backdrop-blur-sm"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link 
                  to="/login" 
                  className="px-4 py-3 rounded-xl hover:bg-white hover:bg-opacity-20 transition-all backdrop-blur-sm font-medium text-center" 
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-3 bg-white text-teal-600 rounded-xl hover:bg-opacity-90 transition-all font-semibold text-center shadow-lg" 
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;