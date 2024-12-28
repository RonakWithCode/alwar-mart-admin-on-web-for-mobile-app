'use client';
import { useState, useEffect, useContext } from 'react';
import { BrandService } from '@/services/BrandService';
import Dialog from '@/components/ui/Dialog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { SearchContext } from '@/context/SearchContext';
import { toast } from 'react-hot-toast';
import { MagnifyingGlassIcon, PlusIcon, XMarkIcon, PhotoIcon, CalendarIcon } from '@heroicons/react/24/outline';

export default function BrandsPage() {
  const { searchQuery, setSearchQuery } = useContext(SearchContext);
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    brandName: '',
    imageFile: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBrands(brands);
    } else {
      const filtered = brands.filter(brand =>
        brand.brandName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBrands(filtered);
    }
  }, [searchQuery, brands]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const data = await BrandService.getAllBrands();
      setBrands(data);
      setFilteredBrands(data);
    } catch (error) {
      toast.error('Failed to fetch brands');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setFormData({ ...formData, imageFile: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      if (selectedBrand) {
        await BrandService.updateBrand(selectedBrand.id, {
          brandName: formData.brandName,
          imageFile: formData.imageFile,
          currentBrandIcon: selectedBrand.brandIcon
        });
        toast.success('Brand updated successfully');
      } else {
        await BrandService.createBrand(formData);
        toast.success('Brand created successfully');
      }
      resetForm();
      fetchBrands();
    } catch (error) {
      toast.error(selectedBrand ? 'Failed to update brand' : 'Failed to create brand');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await BrandService.deleteBrand(selectedBrand.id, selectedBrand.brandIcon);
      toast.success('Brand deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedBrand(null);
      fetchBrands();
    } catch (error) {
      toast.error('Failed to delete brand');
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setFormData({ brandName: '', imageFile: null });
    setImagePreview(null);
    setSelectedBrand(null);
    setIsModalOpen(false);
  };

  const handleEdit = (brand) => {
    setSelectedBrand(brand);
    setFormData({ brandName: brand.brandName, imageFile: null });
    setImagePreview(brand.brandIcon);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Brands</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add Brand</span>
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-96 pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            />
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="large" />
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No brands found</h3>
            <p className="text-gray-500">Get started by creating a new brand.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBrands.map((brand) => (
              <div
                key={brand.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
              >
                <div className="relative aspect-square">
                  <img
                    src={brand.brandIcon || '/placeholder.png'}
                    alt={brand.brandName}
                    className="w-full h-full object-contain p-4"
                    onError={(e) => {
                      e.target.src = '/placeholder.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(brand)}
                        className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBrand(brand);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{brand.brandName}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    <span>Added {new Date(brand.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {selectedBrand ? 'Edit Brand' : 'Add Brand'}
              </h2>
              <button onClick={resetForm}>
                <XMarkIcon className="h-6 w-6 text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Logo
                </label>
                {imagePreview ? (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData({ ...formData, imageFile: null });
                      }}
                      className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <PhotoIcon className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="text-sm text-gray-500">Click to upload logo</p>
                    </div>
                    <input
                      type="file"
                      onChange={handleImageChange}
                      className="hidden"
                      accept="image/*"
                    />
                  </label>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {selectedBrand ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Brand"
        message={`Are you sure you want to delete "${selectedBrand?.brandName}"?`}
      />
    </div>
  );
} 