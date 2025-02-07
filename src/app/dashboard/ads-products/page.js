'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdsProductService } from '@/services/AdsProduct';
import { ProductService } from '@/services/ProductService';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Dialog from '@/components/ui/Dialog';
import AdsProduct from '@/models/AdsProduct';

export default function AdsProductsPage() {
  const router = useRouter();
  const [adsProducts, setAdsProducts] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSponsorTypes, setEditingSponsorTypes] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [adsProductsData, productsData] = await Promise.all([
        AdsProductService.getAllAdsProducts(),
        ProductService.getAllProducts()
      ]);

      // Convert products array to object for easier lookup
      const productsMap = {};
      productsData.forEach(product => {
        productsMap[product.id] = product;
      });

      setProducts(productsMap);
      setAdsProducts(adsProductsData);
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await AdsProductService.deleteAdsProduct(selectedProduct.id);
      toast.success('Ads product deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to delete ads product');
      console.error('Error:', error);
    }
  };

  const handleEdit = (adsProduct) => {
    setSelectedProduct(adsProduct);
    setEditingSponsorTypes([...adsProduct.sponsorTypes]);
    setIsEditModalOpen(true);
  };

  const addSponsorType = () => {
    setEditingSponsorTypes([
      ...editingSponsorTypes,
      { type: Object.values(AdsProduct.SPONSOR_TYPES)[0], priorityLevel: Object.values(AdsProduct.PRIORITY_LEVELS)[0] }
    ]);
  };

  const removeSponsorType = (index) => {
    setEditingSponsorTypes(editingSponsorTypes.filter((_, i) => i !== index));
  };

  const updateSponsorType = (index, field, value) => {
    const updatedTypes = [...editingSponsorTypes];
    updatedTypes[index] = { ...updatedTypes[index], [field]: value };
    setEditingSponsorTypes(updatedTypes);
  };

  const handleUpdate = async () => {
    try {
      await AdsProductService.updateAdsProduct(selectedProduct.id, {
        sponsorTypes: editingSponsorTypes
      });
      toast.success('Ads product updated successfully');
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to update ads product');
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Ads Products</h1>
          <Link
            href="/dashboard/ads-products/add"
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Add Ads Product
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid gap-6">
          {adsProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl">
              <p className="text-gray-500">No ads products found</p>
            </div>
          ) : (
            adsProducts.map((adsProduct) => {
              const product = products[adsProduct.productId];
              return (
                <div
                  key={adsProduct.id}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {product?.productName || 'Product Not Found'}
                      </h3>
                      <p className="text-sm text-gray-500">ID: {adsProduct.productId}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(adsProduct)}
                        className="p-2 text-gray-600 hover:text-blue-500"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProduct(adsProduct);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="p-2 text-gray-600 hover:text-red-500"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Sponsor Types:</h4>
                    <div className="grid gap-2">
                      {adsProduct.sponsorTypes.map((sponsor, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                        >
                          <span className="text-sm text-gray-600">
                            {sponsor.type} - {sponsor.priorityLevel}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Edit Ads Product</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name
                </label>
                <p className="text-gray-900">
                  {products[selectedProduct.productId]?.productName || 'Product Not Found'}
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Sponsor Types
                  </label>
                  <button
                    type="button"
                    onClick={addSponsorType}
                    className="text-sm text-blue-500 hover:text-blue-600"
                  >
                    + Add Type
                  </button>
                </div>

                <div className="space-y-3">
                  {editingSponsorTypes.map((sponsor, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                          <select
                            value={sponsor.type}
                            onChange={(e) => updateSponsorType(index, 'type', e.target.value)}
                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          >
                            {Object.entries(AdsProduct.SPONSOR_TYPES).map(([key, value]) => (
                              <option key={key} value={value}>
                                {key.toLowerCase().replace('_', ' ')}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <select
                            value={sponsor.priorityLevel}
                            onChange={(e) => updateSponsorType(index, 'priorityLevel', e.target.value)}
                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          >
                            {Object.entries(AdsProduct.PRIORITY_LEVELS).map(([key, value]) => (
                              <option key={key} value={value}>
                                {key.toLowerCase()}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSponsorType(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedProduct(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Ads Product"
        message={`Are you sure you want to delete this ads product?`}
      />
    </div>
  );
} 