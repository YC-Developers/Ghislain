import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-blue-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-white text-xl font-bold">
                EPMS
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`${
                  isActive('/') 
                    ? 'border-white text-white' 
                    : 'border-transparent text-blue-100 hover:border-blue-300 hover:text-white'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Dashboard
              </Link>
              <Link
                to="/employees"
                className={`${
                  isActive('/employees') 
                    ? 'border-white text-white' 
                    : 'border-transparent text-blue-100 hover:border-blue-300 hover:text-white'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Employees
              </Link>
              <Link
                to="/departments"
                className={`${
                  isActive('/departments') 
                    ? 'border-white text-white' 
                    : 'border-transparent text-blue-100 hover:border-blue-300 hover:text-white'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Departments
              </Link>
              <Link
                to="/salaries"
                className={`${
                  isActive('/salaries') 
                    ? 'border-white text-white' 
                    : 'border-transparent text-blue-100 hover:border-blue-300 hover:text-white'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Salaries
              </Link>
              <Link
                to="/reports"
                className={`${
                  isActive('/reports') 
                    ? 'border-white text-white' 
                    : 'border-transparent text-blue-100 hover:border-blue-300 hover:text-white'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Reports
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="ml-3 relative">
              <div className="flex items-center space-x-4">
                <span className="text-white text-sm">
                  {user?.username} ({user?.role})
                </span>
                <button
                  onClick={onLogout}
                  className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              onClick={closeMobileMenu}
              className={`${
                isActive('/') 
                  ? 'bg-blue-700 text-white' 
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              } block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium`}
            >
              Dashboard
            </Link>
            <Link
              to="/employees"
              onClick={closeMobileMenu}
              className={`${
                isActive('/employees') 
                  ? 'bg-blue-700 text-white' 
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              } block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium`}
            >
              Employees
            </Link>
            <Link
              to="/departments"
              onClick={closeMobileMenu}
              className={`${
                isActive('/departments') 
                  ? 'bg-blue-700 text-white' 
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              } block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium`}
            >
              Departments
            </Link>
            <Link
              to="/salaries"
              onClick={closeMobileMenu}
              className={`${
                isActive('/salaries') 
                  ? 'bg-blue-700 text-white' 
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              } block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium`}
            >
              Salaries
            </Link>
            <Link
              to="/reports"
              onClick={closeMobileMenu}
              className={`${
                isActive('/reports') 
                  ? 'bg-blue-700 text-white' 
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              } block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium`}
            >
              Reports
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-blue-700">
            <div className="flex items-center px-4">
              <div className="ml-3">
                <div className="text-base font-medium text-white">
                  {user?.username}
                </div>
                <div className="text-sm font-medium text-blue-100">
                  {user?.role}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={() => {
                  closeMobileMenu();
                  onLogout();
                }}
                className="block w-full text-left px-4 py-2 text-base font-medium text-blue-100 hover:text-white hover:bg-blue-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
