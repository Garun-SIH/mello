import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 ml-64 transition-all duration-300">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
