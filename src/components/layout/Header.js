'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Header({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();

  const getPageTitle = (path) => {
    const segments = path.split('/');
    const lastSegment = segments[segments.length - 1];
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {getPageTitle(pathname)}
        </h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-64 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-3 top-2.5">🔍</span>
          </div>
          <button className="text-gray-500 hover:text-gray-700 relative">
            <span className="sr-only">Notifications</span>
            🔔
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              3
            </span>
          </button>
          <button className="text-gray-500 hover:text-gray-700">
            <span className="sr-only">Profile</span>
            👤
          </button>
        </div>
      </div>
    </header>
  );
} 