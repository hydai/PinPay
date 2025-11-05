import React from 'react';
import { Navigation } from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Main Content */}
      <main className="max-w-2xl mx-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <Navigation />
    </div>
  );
};

export default Layout;
