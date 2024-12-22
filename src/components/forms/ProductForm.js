'use client';
import { useState, useEffect } from 'react';
import { XMarkIcon, PhotoIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Product from '@/models/Product';
import { ProductService } from '@/services/ProductService';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function ProductForm({ product, brands, categories, onSubmit }) {
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

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        keywords: Array.isArray(product.keywords) ? product.keywords.join(', ') : product.keywords,
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

  const searchProducts = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      setIsSearching(true);
      const allProducts = await ProductService.getAllProducts();
      const filtered = allProducts.filter(p => 
        (p.productName?.toLowerCase().includes(query.toLowerCase()) ||
        p.productId?.toLowerCase().includes(query.toLowerCase())) &&
        p.id !== product?.id
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error('Error searching products:', error);
      toast.error('Failed to search products');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (isVariationDialogOpen) {
      const timer = setTimeout(() => {
        searchProducts(variationSearch);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [variationSearch, isVariationDialogOpen]);

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Name</label>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Product ID</label>
          <input
            type="text"
            name="productId"
            value={formData.productId}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="productDescription"
            value={formData.productDescription}
            onChange={handleInputChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Categories and Brand */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Brand</label>
          <select
            name="brand"
            value={formData.brand}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
          <label className="block text-sm font-medium text-gray-700">Sub Category</label>
          <input
            type="text"
            name="subCategory"
            value={formData.subCategory}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Pricing */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">MRP</label>
          <input
            type="number"
            name="mrp"
            value={formData.mrp}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
          <input
            type="number"
            name="discount"
            value={formData.discount}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Stock and Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Stock Count</label>
          <input
            type="number"
            name="stockCount"
            value={formData.stockCount}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Min Selectable Quantity</label>
          <input
            type="number"
            name="minSelectableQuantity"
            value={formData.minSelectableQuantity}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Max Selectable Quantity</label>
          <input
            type="number"
            name="maxSelectableQuantity"
            value={formData.maxSelectableQuantity}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        {/* Weight and Units */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Weight</label>
          <input
            type="text"
            name="weight"
            value={formData.weight}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Weight SI Unit</label>
          <input
            type="text"
            name="weightSIUnit"
            value={formData.weightSIUnit}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Product Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Life</label>
          <input
            type="text"
            name="productLife"
            value={formData.productLife}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Product Type</label>
          <select
            name="productType"
            value={formData.productType}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Select Product Type</option>
            {Product.PRODUCT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Food Item Type</label>
          <select
            name="productIsFoodItem"
            value={formData.productIsFoodItem}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Select Type</option>
            {Object.entries(Product.FOOD_ITEM_TYPES).map(([key, value]) => (
              <option key={key} value={value}>
                {key === 'FoodNonVeg' ? 'Non-Vegetarian Food' :
                 key === 'VegetableAndFruit' ? 'Vegetable & Fruit' :
                 key === 'FoodVeg' ? 'Vegetarian Food' :
                 key === 'nonFood' ? 'Non-Food Item' : key}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Barcode</label>
          <input
            type="text"
            name="barcode"
            value={formData.barcode}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Keywords */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Keywords (comma-separated)</label>
          <input
            type="text"
            name="keywords"
            value={formData.keywords}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="e.g., organic, fresh, dairy"
          />
        </div>

        {/* Variations */}
        <div className="col-span-2">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Variations</label>
            <button
              type="button"
              onClick={() => setIsVariationDialogOpen(true)}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Variation
            </button>
          </div>
          
          {/* Variations List */}
          <div className="space-y-3">
            {formData.variations.map((variation, index) => (
              <div key={variation.id || index} className="flex gap-4 items-center bg-gray-50 p-3 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{variation.name}</p>
                  <p className="text-sm text-gray-600">{variation.weightWithSIUnit}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeVariation(index)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Variation Search Dialog */}
          {isVariationDialogOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Add Variation</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsVariationDialogOpen(false);
                      setVariationSearch('');
                      setSearchResults([]);
                    }}
                  >
                    <XMarkIcon className="h-6 w-6 text-gray-400" />
                  </button>
                </div>

                {/* Search Input */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={variationSearch}
                    onChange={(e) => setVariationSearch(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <LoadingSpinner size="small" />
                    </div>
                  )}
                </div>

                {/* Search Results */}
                <div className="max-h-96 overflow-y-auto">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                    >
                      <div>
                        <p className="font-medium">{product.productName}</p>
                        <p className="text-sm text-gray-600">
                          {product.weight} {product.weightSIUnit}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addVariation(product)}
                        className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                  
                  {variationSearch && searchResults.length === 0 && !isSearching && (
                    <p className="text-center text-gray-500 py-4">
                      No products found
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Product Images */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
            
            {imagePreviews.length < 4 && (
              <label className="flex flex-col items-center justify-center border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <PhotoIcon className="h-10 w-10 text-gray-400" />
                  <p className="text-sm text-gray-500">Add Image</p>
                </div>
                <input
                  type="file"
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/*"
                  multiple
                />
              </label>
            )}
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="col-span-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="available"
              checked={formData.available}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Product Available</label>
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => {
            setFormData({
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
            setImagePreviews([]);
            setVariations([]);
          }}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Reset
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          {product ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
} 