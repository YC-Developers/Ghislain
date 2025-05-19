import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = ({ children, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {/* Topbar */}
        <Topbar
          toggleSidebar={toggleSidebar}
          user={user}
          onLogout={onLogout}
        />

        {/* Main Container */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          <div className="w-full max-w-full mx-auto px-0 sm:px-2 lg:px-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
