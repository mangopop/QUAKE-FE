import React from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 pt-24">
        <div className="px-4 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
}