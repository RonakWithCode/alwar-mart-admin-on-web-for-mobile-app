'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProductService } from '@/services/ProductService';
import { AdsProductService } from '@/services/AdsProduct';
import AdsProduct from '@/models/AdsProduct';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function AddAdsProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [sponsorTypes, setSponsorTypes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsData = await ProductService.getAllProducts();
      setProducts(productsData);
    } catch (error) {
      toast.error('Failed to fetch products');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSponsorType = () => {
    setSponsorTypes([
      ...sponsorTypes,
      { type: Object.values(AdsProduct.SPONSOR_TYPES)[0], priorityLevel: Object.values(AdsProduct.PRIORITY_LEVELS)[0] }
    ]);
  };

  const removeSponsorType = (index) => {
    setSponsorTypes(sponsorTypes.filter((_, i) => i !== index));
  };

  const updateSponsorType = (index, field, value) => {
    const updatedTypes = [...sponsorTypes];
    updatedTypes[index] = { ...updatedTypes[index], [field]: value };
    setSponsorTypes(updatedTypes);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }

    if (sponsorTypes.length === 0) {
      toast.error('Please add at least one sponsor type');
      return;
    }

    try {
      setIsSubmitting(true);
      await AdsProductService.createAdsProduct({
        productId: selectedProduct,
        sponsorTypes: sponsorTypes
      });
      toast.success('Ads product created successfully');
      router.push('/dashboard/ads-products');
    } catch (error) {
      toast.error(error.message || 'Failed to create ads product');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
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
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Add New Ads Product</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Product <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.productName}
                </option>
              ))}
            </select>
          </div>

          {/* Sponsor Types */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Sponsor Types <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addSponsorType}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Sponsor Type
              </button>
            </div>

            <div className="space-y-4">
              {sponsorTypes.map((sponsor, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority Level
                      </label>
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
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}

              {sponsorTypes.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No sponsor types added. Click the button above to add one.
                </p>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard/ads-products')}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              Create Ads Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 