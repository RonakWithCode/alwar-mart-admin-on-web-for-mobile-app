'use client';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { SearchContext } from '@/context/SearchContext';

export default function DashboardLayout({ children }) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onSearch={handleSearch} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
            {children}
          </main>
        </div>
      </div>
    </SearchContext.Provider>
  );
} 