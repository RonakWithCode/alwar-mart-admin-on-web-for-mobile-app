import Image from "next/image";
import Link from "next/link";
import { 
  ShoppingBagIcon, 
  TagIcon, 
  BuildingStorefrontIcon,
  ListBulletIcon,
  Squares2X2Icon
} from "@heroicons/react/24/outline";

export default function Home() {
  const managementOptions = [
    {
      title: "Product Management",
      description: "Add, edit, and manage your products",
      icon: <ShoppingBagIcon className="w-8 h-8" />,
      href: "/dashboard/products",
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "Category Management",
      description: "Organize products with categories",
      icon: <Squares2X2Icon className="w-8 h-8" />,
      href: "/dashboard/categories",
      color: "bg-green-50 text-green-600"
    },
    {
      title: "Brand Management",
      description: "Manage product brands",
      icon: <BuildingStorefrontIcon className="w-8 h-8" />,
      href: "/dashboard/brands",
      color: "bg-purple-50 text-purple-600"
    },
    {
      title: "Sub-Category Management",
      description: "Manage product sub-categories",
      icon: <ListBulletIcon className="w-8 h-8" />,
      href: "/dashboard/subcategories",
      color: "bg-orange-50 text-orange-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Product Management System
          </h1>
          <p className="text-lg text-gray-600">
            Manage your products, categories, brands, and more
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {managementOptions.map((option) => (
            <Link 
              key={option.title} 
              href={option.href}
              className="block group"
            >
              <div className="relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
                <div className={`inline-flex p-3 rounded-lg ${option.color} mb-4`}>
                  {option.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {option.title}
                </h3>
                <p className="text-gray-600">
                  {option.description}
                </p>
                <div className="absolute bottom-6 right-6 opacity-0 transform translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
                  <TagIcon className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
