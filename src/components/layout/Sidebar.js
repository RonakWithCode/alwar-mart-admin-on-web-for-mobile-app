'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Categories', path: '/dashboard/categories', icon: '📁' },
    { name: 'Products', path: '/dashboard/products', icon: '📦' },
    { name: 'Brands', path: '/dashboard/brands', icon: '🏢' },
    { name: 'Orders', path: '/dashboard/orders', icon: '🛍️' },
    { name: 'Analytics', path: '/dashboard/analytics', icon: '📈' },
  ];

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-800">Alwar Mart</h1>
      </div>
      <nav className="mt-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 ${
              pathname === item.path ? 'bg-gray-100 border-l-4 border-blue-500' : ''
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
} 