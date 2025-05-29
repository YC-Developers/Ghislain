import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="ml-2 text-xl font-bold">EPMS</span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/')} hover:bg-blue-700`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/employees"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/employees')} hover:bg-blue-700`}
                >
                  Employees
                </Link>
                <Link
                  to="/departments"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/departments')} hover:bg-blue-700`}
                >
                  Departments
                </Link>
                <Link
                  to="/salaries"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/salaries')} hover:bg-blue-700`}
                >
                  Salaries
                </Link>
                <Link
                  to="/reports"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/reports')} hover:bg-blue-700`}
                >
                  Reports
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <span className="mr-2">{user?.username}</span>
                  <button
                    onClick={onLogout}
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none"
            >
              <svg
                className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/"
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/')} hover:bg-blue-700`}
            onClick={closeMenu}
          >
            Dashboard
          </Link>
          <Link
            to="/employees"
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/employees')} hover:bg-blue-700`}
            onClick={closeMenu}
          >
            Employees
          </Link>
          <Link
            to="/departments"
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/departments')} hover:bg-blue-700`}
            onClick={closeMenu}
          >
            Departments
          </Link>
          <Link
            to="/salaries"
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/salaries')} hover:bg-blue-700`}
            onClick={closeMenu}
          >
            Salaries
          </Link>
          <Link
            to="/reports"
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/reports')} hover:bg-blue-700`}
            onClick={closeMenu}
          >
            Reports
          </Link>
        </div>
        <div className="pt-4 pb-3 border-t border-blue-700">
          <div className="flex items-center px-5">
            <div className="ml-3">
              <div className="text-base font-medium">{user?.username}</div>
              <div className="text-sm font-medium text-blue-200">Admin</div>
            </div>
          </div>
          <div className="mt-3 px-2 space-y-1">
            <button
              onClick={() => {
                onLogout();
                closeMenu();
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
