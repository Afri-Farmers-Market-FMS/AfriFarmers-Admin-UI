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
      <main className="max-w-[1920px] w-full mx-auto px-2 md:px-4 py-3 print:w-full">
        {children}
      </main>
    </div>
  );
};

export default Layout;
