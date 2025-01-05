'use client';
import { useState, useEffect, useContext } from 'react';
import { ProductService } from '@/services/ProductService';
import { BrandService } from '@/services/BrandService';
import { CategoryService } from '@/services/CategoryService';
import Dialog from '@/components/ui/Dialog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { SearchContext } from '@/context/SearchContext';
import { toast } from 'react-hot-toast';
import { MagnifyingGlassIcon, PlusIcon, XMarkIcon, PhotoIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import ProductForm from '@/components/forms/ProductForm';
import { SubCategoryService } from '@/services/SubCategoryService';
import Image from 'next/image';

export default function ProductsPage() {
  const { searchQuery, setSearchQuery } = useContext(SearchContext);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [productsData, brandsData, categoriesData ,subCategoriesData] = await Promise.all([
        ProductService.getAllProducts(),
        BrandService.getAllBrands(),
        CategoryService.getAllCategories(),
        SubCategoryService.getAllSubCategories()
      ]);
      setProducts(productsData);
      setFilteredProducts(productsData);
      setBrands(brandsData);
      setCategories(categoriesData);
      setSubCategories(subCategoriesData);
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      // await ProductService.deleteProductsByCategory('Dishwashing Bars & Tubs');
      await ProductService.deleteProduct(selectedProduct.id, selectedProduct.productImage);
      toast.success('Product deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      fetchInitialData();
    } catch (error) {
      toast.error('Failed to delete product');
      console.error('Error:', error);
    }
  };

  // const debugProduct = async () => {
  //   try {
  //     console.log('Starting product debug...');
  //     const product = await ProductService.getProductById('-OEcEGpltWneAQ9v4noh');
  //     console.log('Successfully fetched product:', product);
  //   } catch (error) {
  //     console.error('Debug error:', error);
  //   }
  // };

  // useEffect(() => {
  //   debugProduct();
  // }, []);

  const refreshBrands = async () => {
    try {
      setLoadingBrands(true);
      const brandsData = await BrandService.getAllBrands();
      setBrands(brandsData);
      toast.success('Brands refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh brands');
      console.error('Error:', error);
    } finally {
      setLoadingBrands(false);
    }
  };

  const refreshCategories = async () => {
    try {
      setLoadingCategories(true);
      const categoriesData = await CategoryService.getAllCategories();
      setCategories(categoriesData);
      toast.success('Categories refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh categories');
      console.error('Error:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const refreshSubCategories = async () => {
    try {
      setLoadingSubCategories(true);
      const subCategoriesData = await SubCategoryService.getAllSubCategories();
      setSubCategories(subCategoriesData);
      toast.success('Sub-categories refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh sub-categories');
      console.error('Error:', error);
    } finally {
      setLoadingSubCategories(false);
    }
  };

  const handleRefreshData = (type, data) => {
    switch(type) {
      case 'brands':
        setBrands(data);
        break;
      case 'categories':
        setCategories(data);
        break;
      case 'subCategories':
        setSubCategories(data);
        break;
    }
  };

  const handleProductSubmit = async (formData) => {
    try {
      if (selectedProduct) {
        await ProductService.updateProduct(
          selectedProduct.id,
          formData,
          formData.newImages,
          selectedProduct.productImage
        );
        toast.success('Product updated successfully');
      } else {
        const result = await ProductService.createProduct(formData, formData.newImages);
        toast.success('Product created successfully');
      }
      setIsModalOpen(false);
      setSelectedProduct(null);
      fetchInitialData();
    } catch (error) {
      toast.error(selectedProduct ? 'Failed to update product' : 'Failed to create product');
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-col space-y-6">
            {/* Title and Add Product */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h1 className="text-3xl font-bold text-gray-900">Products</h1>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add Product</span>
              </button>
            </div>

            {/* Refresh Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={refreshBrands}
                disabled={loadingBrands}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <ArrowPathIcon className={`h-4 w-4 ${loadingBrands ? 'animate-spin' : ''}`} />
                <span>Refresh Brands</span>
              </button>

              <button
                onClick={refreshCategories}
                disabled={loadingCategories}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <ArrowPathIcon className={`h-4 w-4 ${loadingCategories ? 'animate-spin' : ''}`} />
                <span>Refresh Categories</span>
              </button>

              <button
                onClick={refreshSubCategories}
                disabled={loadingSubCategories}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <ArrowPathIcon className={`h-4 w-4 ${loadingSubCategories ? 'animate-spin' : ''}`} />
                <span>Refresh Sub-Categories</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-96 pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              />
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No products</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new product.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
              >
                <div className="relative aspect-square">
                  <Image
                    src={product.productImage[0] || '/placeholder.png'}
                    alt={product.productName}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsModalOpen(true);
                        }}
                        className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.productName}</h3>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-gray-600">Brand: {product.brand}</p>
                    <p className="text-sm text-gray-600">Category: {product.category}</p>
                    <p className="text-sm font-semibold text-green-600">₹{product.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {selectedProduct ? 'Edit Product' : 'Add Product'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedProduct(null);
                }}
              >
                <XMarkIcon className="h-6 w-6 text-gray-400" />
              </button>
            </div>
            
            <ProductForm
              product={selectedProduct}
              brands={brands}
              categories={categories}
              subCategories={subCategories}
              onSubmit={handleProductSubmit}
              onRefreshData={handleRefreshData}
              cancel={() => {
                setIsModalOpen(false);
                setSelectedProduct(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${selectedProduct?.productName}"?`}
      />
    </div>
  );
} 