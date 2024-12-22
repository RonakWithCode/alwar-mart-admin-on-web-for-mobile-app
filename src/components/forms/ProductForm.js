'use client';
import { useState, useEffect } from 'react';
import { XMarkIcon, PhotoIcon, PlusIcon, TrashIcon, TagIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Product from '@/models/Product';
import { ProductService } from '@/services/ProductService';
import LoadingSpinner from '../ui/LoadingSpinner';
import Image from 'next/image';

export default function ProductForm({ product, brands, categories, subCategories, onSubmit }) {
  const [formData, setFormData] = useState({
    available: false,
    productId: '',
    productName: '',
    productDescription: '',
    brand: '',
    category: '',
    subCategory: '',
    price: '',
    mrp: '',
    discount: '',
    stockCount: '',
    minSelectableQuantity: '1',
    maxSelectableQuantity: '1',
    selectableQuantity: '1',
    weight: '',
    weightSIUnit: '',
    productLife: '',
    productType: '',
    productIsFoodItem: Product.FOOD_ITEM_TYPES.nonFood,
    keywords: '',
    productImage: [],
    variations: [],
    barcode: '',
    newImages: []
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [variations, setVariations] = useState([]);
  const [isVariationDialogOpen, setIsVariationDialogOpen] = useState(false);
  const [variationSearch, setVariationSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        keywords: Array.isArray(product.keywords) ? product.keywords : 
                 (typeof product.keywords === 'string' ? product.keywords.split(',').map(k => k.trim()) : []),
        newImages: [],
        variations: product.variations || []
      });
      setImagePreviews(product.productImage || []);
      setVariations(product.variations || []);
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);

    if (validFiles.length !== files.length) {
      toast.error('Some images were skipped (max size: 5MB)');
    }

    setFormData(prev => ({
      ...prev,
      newImages: [...prev.newImages, ...validFiles]
    }));

    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      newImages: prev.newImages.filter((_, i) => i !== index),
      productImage: prev.productImage?.filter((_, i) => i !== index)
    }));
  };

  useEffect(() => {
    if (isVariationDialogOpen) {
      const timer = setTimeout(async () => {
        if (!variationSearch.trim()) {
          setSearchResults([]);
          return;
        }
        
        try {
          setIsSearching(true);
          const allProducts = await ProductService.getAllProducts();
          const filtered = allProducts.filter(p => 
            (p.productName?.toLowerCase().includes(variationSearch.toLowerCase()) ||
            p.productId?.toLowerCase().includes(variationSearch.toLowerCase())) &&
            p.id !== product?.id
          );
          setSearchResults(filtered);
        } catch (error) {
          console.error('Error searching products:', error);
          toast.error('Failed to search products');
        } finally {
          setIsSearching(false);
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [variationSearch, isVariationDialogOpen, product?.id]);

  const addVariation = (selectedProduct) => {
    const existingVariation = formData.variations.find(v => v.id === selectedProduct.id);
    
    if (existingVariation) {
      toast.error('This product is already added as a variation');
      return;
    }

    const newVariation = {
      id: selectedProduct.id,
      name: selectedProduct.productName,
      weightWithSIUnit: `${selectedProduct.weight} ${selectedProduct.weightSIUnit}`,
    };
    
    setFormData(prev => ({
      ...prev,
      variations: [...prev.variations, newVariation]
    }));
    
    setIsVariationDialogOpen(false);
    setVariationSearch('');
    setSearchResults([]);
  };

  const removeVariation = (index) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index)
    }));
  };

  const handleVariationChange = (index, field, value) => {
    setVariations(prev => prev.map((v, i) => 
      i === index ? { ...v, [field]: value } : v
    ));
  };

  const handleKeywordInput = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newKeyword = keywordInput.trim();
      if (newKeyword && !formData.keywords.includes(newKeyword)) {
        const updatedKeywords = [...(Array.isArray(formData.keywords) ? formData.keywords : []), newKeyword];
        setFormData(prev => ({
          ...prev,
          keywords: updatedKeywords
        }));
      }
      setKeywordInput('');
    }
  };

  const removeKeyword = (keywordToRemove) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(keyword => keyword !== keywordToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate form data
      if (!formData.productName || !formData.brand || !formData.category) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Process form data
      const processedData = {
        ...formData,
        price: Number(formData.price),
        mrp: Number(formData.mrp),
        discount: Number(formData.discount),
        stockCount: Number(formData.stockCount),
        variations: formData.variations || []
      };

      await onSubmit(processedData);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to save product');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Image Upload Section */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Product Images</h3>
        <div className="flex flex-wrap gap-4">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative group">
              <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
          <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
            <PhotoIcon className="h-8 w-8 text-gray-400" />
            <span className="mt-2 text-sm text-gray-500">Add Image</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Basic Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product ID
              </label>
              <input
                type="text"
                name="productId"
                value={formData.productId}
                onChange={handleInputChange}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="productDescription"
                value={formData.productDescription}
                onChange={handleInputChange}
                rows={4}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Classification</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand <span className="text-red-500">*</span>
              </label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select Brand</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.brandName}>
                    {brand.brandName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.tag}>
                    {category.tag}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sub Category
              </label>
              <select
                name="subCategory"
                value={formData.subCategory}
                onChange={handleInputChange}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Sub Category</option>
                {subCategories.map(subCategory => (
                  <option key={subCategory.id} value={subCategory.subCategoryName}>
                    {subCategory.subCategoryName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Pricing & Stock</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                MRP (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="mrp"
                value={formData.mrp}
                onChange={handleInputChange}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleInputChange}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Count <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stockCount"
                value={formData.stockCount}
                onChange={handleInputChange}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Product Details</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Quantity
                </label>
                <input
                  type="number"
                  name="minSelectableQuantity"
                  value={formData.minSelectableQuantity}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Quantity
                </label>
                <input
                  type="number"
                  name="maxSelectableQuantity"
                  value={formData.maxSelectableQuantity}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight
                </label>
                <input
                  type="text"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight Unit
                </label>
                <select
                  name="weightSIUnit"
                  value={formData.weightSIUnit}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                >
                {console.log(formData.weightSIUnit)}

                  <option value="">Select Unit</option>

                  {Object.entries(Product.WEIGHT_SI_UNITS).map(([key, value]) => (
                    <option key={key} value={value}>
                      {key}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Life
              </label>
              <input
                type="text"
                name="productLife"
                value={formData.productLife}
                onChange={handleInputChange}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., 12 months"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Type
              </label>
              <select
                name="productType"
                value={formData.productType}
                onChange={handleInputChange}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Type</option>
                {Product.PRODUCT_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Food Item Type
              </label>
              <select
                name="productIsFoodItem"
                value={formData.productIsFoodItem}
                onChange={handleInputChange}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              >
                {Object.entries(Product.FOOD_ITEM_TYPES).map(([key, value]) => (
                  <option key={key} value={value}>
                    {key}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Keywords and Variations */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Additional Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keywords
            </label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 bg-gray-50 rounded-lg border border-gray-300">
                {Array.isArray(formData.keywords) && formData.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleKeywordInput}
                  className="flex-1 min-w-[120px] bg-transparent border-none focus:ring-0 text-sm p-0"
                  placeholder="Type and press Enter to add keywords"
                />
              </div>
              <p className="text-xs text-gray-500 ml-1">
                Press Enter or use comma to add keywords
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Barcode
            </label>
            <input
              type="text"
              name="barcode"
              value={formData.barcode}
              onChange={handleInputChange}
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={() => onCancel?.()}
          className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {product ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
} 