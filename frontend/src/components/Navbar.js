import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import {
  Home, Package, PlusCircle, Bot, Heart,
  AlertCircle, User as UserIcon, LogOut,
  Menu, X, Stethoscope, LayoutDashboard,
  ShoppingBag, ChevronDown, Bell, Search
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, label, color }) => (
    <Link
      to={to}
      onClick={() => setIsOpen(false)}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm ${isActive(to)
          ? `bg-white text-teal-600 shadow-sm`
          : `text-white/80 hover:bg-white/10 hover:text-white`
        }`}
    >
      <Icon className={`w-4 h-4 ${isActive(to) ? 'scale-110' : ''}`} />
      <span>{label}</span>
    </Link>
  );

  return (
    <nav className="bg-gradient-to-r from-teal-600 to-cyan-600 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="p-2 bg-white rounded-xl shadow-md transform transition-transform group-hover:rotate-12">
                <Stethoscope className="w-6 h-6 text-teal-600" />
              </div>
              <span className="text-2xl font-black text-white tracking-tighter uppercase">
                MediMitra
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {!user ? (
              <>
                <NavLink to="/" icon={Home} label="Home" />
                <Link
                  to="/login"
                  className="ml-4 px-6 py-2.5 bg-white text-teal-600 rounded-xl font-bold text-sm hover:shadow-lg transition-all"
                >
                  Sign In
                </Link>
              </>
            ) : user.role === 'Admin' ? (
              <>
                <NavLink to="/admin-dashboard" icon={LayoutDashboard} label="Admin Console" />
                <NavLink to="/admin/profile" icon={UserIcon} label="My Profile" />
              </>
            ) : (
              <>
                <NavLink to="/dashboard" icon={Home} label="Dashboard" />
                <NavLink to="/products" icon={ShoppingBag} label="Products" />
                <NavLink to="/add-product" icon={PlusCircle} label="Sell" />
                <NavLink to="/health-assistant" icon={Bot} label="AI Help" />
                <NavLink to="/health-tips" icon={Heart} label="Tips" />
                <NavLink to="/emergency-contacts" icon={AlertCircle} label="Emergency" />
              </>
            )}

            {user && (
              <div className="ml-4 pl-4 border-l border-white/20 flex items-center gap-4">
                <button className="p-2 text-white/80 hover:text-white transition-colors relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-teal-600"></span>
                </button>

                <div className="relative">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-2 p-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-teal-600 font-bold shadow-sm">
                      {user.name.charAt(0)}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-white transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl py-2 border border-gray-100 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-800">{user.name}</p>
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{user.role}</p>
                      </div>
                      <Link
                        to={user.role === 'Admin' ? '/admin/profile' : '/profile'}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <UserIcon className="w-4 h-4" /> Profile Info
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-4">
            {user && (
              <button className="p-2 text-white/80 hover:text-white transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-teal-600"></span>
              </button>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-white hover:bg-white/10 focus:outline-none transition-all"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-4 pb-6 space-y-1">
            {!user ? (
              <>
                <Link to="/" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl">Home</Link>
                <Link to="/login" onClick={() => setIsOpen(false)} className="block px-4 py-3 bg-teal-600 text-white font-bold rounded-xl text-center">Sign In</Link>
              </>
            ) : user.role === 'Admin' ? (
              <>
                <Link to="/admin-dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl">
                  <LayoutDashboard className="w-5 h-5" /> Admin Console
                </Link>
                <Link to="/admin/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl">
                  <UserIcon className="w-5 h-5" /> My Profile
                </Link>
              </>
            ) : (
              <>
                {[
                  { to: '/dashboard', icon: Home, label: 'Dashboard' },
                  { to: '/products', icon: ShoppingBag, label: 'Products' },
                  { to: '/add-product', icon: PlusCircle, label: 'Sell Medicine' },
                  { to: '/health-assistant', icon: Bot, label: 'AI Health Assistant' },
                  { to: '/health-tips', icon: Heart, label: 'Health Tips' },
                  { to: '/emergency-contacts', icon: AlertCircle, label: 'Emergency Help' },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive(item.to) ? 'bg-teal-50 text-teal-600' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <item.icon className="w-5 h-5" /> {item.label}
                  </Link>
                ))}
              </>
            )}

            {user && (
              <div className="pt-4 mt-4 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl"
                >
                  <LogOut className="w-5 h-5" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
