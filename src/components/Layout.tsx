import React from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-50">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 overflow-hidden flex flex-col h-[calc(100vh-64px)]">
        {children}
      </main>
    </div>
  );
};

export default Layout;
