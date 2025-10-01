import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X } from "lucide-react";
import logo from "../assets/logo.svg";

const Navbar = () => {
  const { user, userDoc, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/"); 
      setIsMenuOpen(false);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const isActive = (path) => location.pathname === path;

  const getDashboardLink = () => {
    if (!userDoc) return "/";
    if (userDoc.role === "secretary") return "/secretary-dashboard";
    if (
      ["owner", "owner_family", "renter", "renter_family"].includes(
        userDoc.role
      )
    )
      return "/dashboard";
    return "/";
  };

  const navLinks = [
    { 
      path: "/", 
      label: "Home", 
      show: true,
    },
    { 
      path: getDashboardLink(), 
      label: "Dashboard", 
      show: !!user,
    },
    { 
      path: "/profile", 
      label: "Profile", 
      show: !!user,
    },
    { 
      path: "/settings", 
      label: "Settings", 
      show: !!user,
    },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img src={logo} alt="Logo" className="h-9 w-9" />
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-lg text-gray-900">Residence</span>
              <p className="text-xs text-gray-500 -mt-1">Management System</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden custom-sm:flex items-center gap-x-6 lg:gap-x-8">
            {navLinks
              .filter((link) => link.show)
              .map(({ path, label }, idx) => (
                <Link
                  key={`${path}-${idx}`}
                  to={path}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(path)
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </Link>
              ))}
          </div>

          {/* Desktop User Info */}
          <div className="hidden custom-sm:flex items-center space-x-4">
            {!user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-sm"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="gap-8 flex items-center">
                <div className="flex space-x-3 items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[100px] sm:max-w-[160px]">
                      {userDoc?.name || userDoc?.fullName || user.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {userDoc?.role || "member"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg shadow-sm hover:bg-red-100 transition-all"
                >
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="custom-sm:hidden p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-all"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`custom-sm:hidden border-t border-gray-200 bg-white transition-all duration-300 ease-in-out overflow-hidden ${
          isMenuOpen ? "max-h-screen" : "max-h-0"
        }`}
      >
        <div className="px-4 pt-2 pb-3 space-y-1">
          {navLinks
            .filter((link) => link.show)
            .map(({ path, label }, idx) => (
              <Link
                key={`mobile-${path}-${idx}`}
                to={path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive(path)
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                {label}
              </Link>
            ))}

          {!user ? (
            <div className="pt-4 border-t border-gray-200 mt-4">
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMenuOpen(false)}
                className="block text-center mt-2 text-sm font-medium bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-all"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="pt-4 border-t border-gray-200 mt-4 space-y-3">
              <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[100px] sm:max-w-[160px]">
                    {userDoc?.name || userDoc?.fullName || user.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {userDoc?.role || "owner"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;