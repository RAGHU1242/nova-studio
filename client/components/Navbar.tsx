import { Link, useLocation } from "react-router-dom";
import { NAV_LINKS, APP_NAME } from "@/utils/constants";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent hover:opacity-80 transition"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-white text-sm font-bold">
              ⚔️
            </div>
            <span className="hidden sm:inline">{APP_NAME}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  location.pathname === link.path
                    ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-lg shadow-violet-500/50"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button and right actions */}
          <div className="flex items-center gap-2">
            {!isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500"
                  >
                    Register
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {user?.name}
                </div>
                <Button
                  onClick={logout}
                  variant="outline"
                  size="sm"
                  className="border-red-500/30 text-red-400 hover:bg-red-600/10"
                >
                  Logout
                </Button>
              </div>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-slate-200 dark:border-slate-800 pt-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  location.pathname === link.path
                    ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                {link.label}
              </Link>
            ))}
            {!isAuthenticated ? (
              <div className="pt-2 space-y-2 border-t border-slate-200 dark:border-slate-800 mt-2">
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500">
                    Register
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 mt-2">
                <div className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
                  {user?.name}
                </div>
                <Button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  variant="outline"
                  className="w-full border-red-500/30 text-red-400 hover:bg-red-600/10"
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
