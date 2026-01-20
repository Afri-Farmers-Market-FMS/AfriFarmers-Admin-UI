import React from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen font-sans bg-green-100">
      <div className="print:hidden sticky top-0 z-50">
        <Header />
      </div>
      <main className="max-w-7xl w-full mx-auto p-4 md:p-6 print:w-full">
        {children}
      </main>
    </div>
  );
};

export default Layout;
