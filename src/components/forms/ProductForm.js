'use client';
import { useState, useEffect } from 'react';
import { XMarkIcon, PhotoIcon, PlusIcon, TrashIcon, TagIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Product from '@/models/Product';
import { ProductService } from '@/services/ProductService';
import LoadingSpinner from '../ui/LoadingSpinner';
import Image from 'next/image';
import { BrandService } from '@/services/BrandService';
import { CategoryService } from '@/services/CategoryService';
import { SubCategoryService } from '@/services/SubCategoryService';

export default function ProductForm({ product, brands, categories, subCategories, onSubmit, onRefreshData }) {
  const [formData, setFormData] = useState({
    available: true,
    productId: product?.productId || '',
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
    purchasePrice: '',
    newImages: []
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [variations, setVariations] = useState([]);
  const [isVariationDialogOpen, setIsVariationDialogOpen] = useState(false);
  const [variationSearch, setVariationSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(false);

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

  const validatePrice = (price, mrp) => {
    if (Number(price) > Number(mrp)) {
      return 'Price cannot exceed MRP';
    }
    return '';
  };

  const validateQuantity = (max, stock) => {
    if (Number(max) > Number(stock)) {
      return 'Maximum quantity cannot exceed stock count';
    }
    return '';
  };

  const validateForm = () => {
    const errors = [];
    // const specialChars = /[+*]/;

    // Required field validation
    const requiredFields = {
      productName: 'Product Name',
      productDescription: 'Product Description',
      brand: 'Brand',
      category: 'Category',
      subCategory: 'Sub Category',
      price: 'Price',
      mrp: 'MRP',
      stockCount: 'Stock Count',
      weight: 'Weight',
      weightSIUnit: 'Weight Unit',
      productType: 'Product Type',
      purchasePrice: 'Purchase Price'
    };

    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        errors.push(`${label} is required`);
      }
    });

    // Product Images validation (minimum 2)
    const totalImages = (formData.productImage?.length || 0) + (formData.newImages?.length || 0);
    if (totalImages < 2) {
      errors.push('Minimum 2 product images are required');
    }

    // Numeric validations
    const numericFields = {
      price: 'Price',
      mrp: 'MRP',
      discount: 'Discount',
      stockCount: 'Stock Count',
      minSelectableQuantity: 'Minimum Selectable Quantity',
      maxSelectableQuantity: 'Maximum Selectable Quantity',
      selectableQuantity: 'Selectable Quantity',
      purchasePrice: 'Purchase Price'
    };

    Object.entries(numericFields).forEach(([field, label]) => {
      const value = Number(formData[field]);
      if (isNaN(value) || value < 0) {
        errors.push(`${label} must be a valid positive number`);
      }
    });

    // Price validations
    if (Number(formData.price) > Number(formData.mrp)) {
      errors.push('Price cannot be greater than MRP');
    }

    if (Number(formData.purchasePrice) > Number(formData.price)) {
      errors.push('Purchase price cannot be greater than selling price');
    }

    // Discount validation (0-100)
    if (Number(formData.discount) < 0 || Number(formData.discount) > 100) {
      errors.push('Discount must be between 0 and 100');
    }

    // Quantity validations
    if (Number(formData.maxSelectableQuantity) > Number(formData.stockCount)) {
      errors.push('Maximum selectable quantity cannot exceed stock count');
    }

    if (Number(formData.minSelectableQuantity) > Number(formData.maxSelectableQuantity)) {
      errors.push('Minimum selectable quantity cannot be greater than maximum');
    }

    // Set default selectable quantity to minSelectableQuantity if not set
    // if (!formData.selectableQuantity) {
      formData.selectableQuantity = formData.minSelectableQuantity;
    // }

    // Validate that selectable quantity is within range
    // const selectableQty = Number(formData.selectableQuantity);
    // const minQty = Number(formData.minSelectableQuantity);
    // const maxQty = Number(formData.maxSelectableQuantity);

    // // if (selectableQty < minQty || selectableQty > maxQty) {
    // //   errors.push('Default quantity must be between minimum and maximum values');
    // // }

    // Keywords validation (at least one keyword)
    if (!formData.keywords?.length) {
      errors.push('At least one keyword is required');
    }

    // Description length validation
    if (formData.productDescription.length < 20) {
      errors.push('Product description must be at least 20 characters long');
    }

    // Weight validation
    // if (Number(formData.weight) <= 0) {
    //   errors.push('Weight must be greater than 0');
    // }

    if (!formData.weightSIUnit) {
      errors.push('Weight unit is required');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }

    // Show review screen instead of submitting directly
    setShowReview(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      toast.success(`Product ${product ? 'updated' : 'created'} successfully`);
      setShowReview(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add helper function for real-time validation
  const validateField = (name, value) => {
    switch (name) {
      case 'price':
        if (Number(value) > Number(formData.mrp)) {
          toast.error('Price cannot exceed MRP');
        }
        break;
      case 'maxSelectableQuantity':
        if (Number(value) > Number(formData.stockCount)) {
          toast.error('Maximum quantity cannot exceed stock count');
        }
        break;
      case 'purchasePrice':
        if (Number(value) > Number(formData.price)) {
          toast.error('Purchase price cannot exceed selling price');
        }
        break;
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Perform real-time validation for specific fields
    validateField(name, value);
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
      addKeyword();
    }
  };

  const addKeyword = () => {
    const keyword = keywordInput.trim().toLowerCase();
    
    if (!keyword) return;

    // Generate progressive substrings
    const progressiveKeywords = [];
    for (let i = 1; i <= keyword.length; i++) {
      progressiveKeywords.push(keyword.slice(0, i));
    }

    // Get current keywords array or initialize empty array
    const currentKeywords = Array.isArray(formData.keywords) ? formData.keywords : [];

    // Filter out duplicates
    const newKeywords = progressiveKeywords.filter(
      kw => !currentKeywords.includes(kw)
    );

    if (newKeywords.length > 0) {
      setFormData(prev => ({
        ...prev,
        keywords: [...currentKeywords, ...newKeywords]
      }));
      toast.success(`Added ${newKeywords.length} keywords for "${keyword}"`);
    } else {
      toast.error('These keywords already exist');
    }

    // Clear input
    setKeywordInput('');
  };

  const removeKeyword = (keywordToRemove) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keywordToRemove)
    }));
  };

  const refreshBrands = async () => {
    try {
      setLoadingBrands(true);
      const brandsData = await BrandService.getAllBrands();
      onRefreshData?.('brands', brandsData);
      toast.success('Brands refreshed');
    } catch (error) {
      toast.error('Failed to refresh brands');
    } finally {
      setLoadingBrands(false);
    }
  };

  const refreshCategories = async () => {
    try {
      setLoadingCategories(true);
      const categoriesData = await CategoryService.getAllCategories();
      onRefreshData?.('categories', categoriesData);
      toast.success('Categories refreshed');
    } catch (error) {
      toast.error('Failed to refresh categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const refreshSubCategories = async () => {
    try {
      setLoadingSubCategories(true);
      const subCategoriesData = await SubCategoryService.getAllSubCategories();
      onRefreshData?.('subCategories', subCategoriesData);
      toast.success('Sub-categories refreshed');
    } catch (error) {
      toast.error('Failed to refresh sub-categories');
    } finally {
      setLoadingSubCategories(false);
    }
  };

  // Review Modal Component
  const ReviewModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Review Product Details</h2>
          <button
            onClick={() => setShowReview(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Product Name:</span> {formData.productName}</p>
              <p><span className="font-medium">Description:</span> {formData.productDescription}</p>
              <p><span className="font-medium">Brand:</span> {formData.brand}</p>
              <p><span className="font-medium">Category:</span> {formData.category}</p>
              <p><span className="font-medium">Sub Category:</span> {formData.subCategory}</p>
              <p><span className="font-medium">Product Type:</span> {formData.productType}</p>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Pricing & Stock</h3>
            <div className="space-y-2">
              <p><span className="font-medium">MRP:</span> ₹{formData.mrp}</p>
              <p><span className="font-medium">Selling Price:</span> ₹{formData.price}</p>
              <p><span className="font-medium">Purchase Price:</span> ₹{formData.purchasePrice}</p>
              <p><span className="font-medium">Discount:</span> {formData.discount}%</p>
              <p><span className="font-medium">Stock Count:</span> {formData.stockCount}</p>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Product Details</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Weight:</span> {formData.weight} {formData.weightSIUnit}</p>
              <p><span className="font-medium">Min Quantity:</span> {formData.minSelectableQuantity}</p>
              <p><span className="font-medium">Max Quantity:</span> {formData.maxSelectableQuantity}</p>
              <p><span className="font-medium">Default Quantity:</span> {formData.selectableQuantity}</p>
              <p><span className="font-medium">Food Item:</span> {formData.productIsFoodItem}</p>
            </div>
          </div>

          {/* Images & Keywords */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Images & Keywords</h3>
            <div className="space-y-2">
              <div>
                <p className="font-medium mb-2">Product Images:</p>
                <div className="flex flex-wrap gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="w-20 h-20 rounded-lg overflow-hidden">
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-medium mb-2">Keywords:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.keywords?.map((keyword, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            type="button"
            onClick={() => setShowReview(false)}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleConfirmSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            Confirm & Save
          </button>
        </div>
      </div>
    </div>
  );

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
                Product ID
              </label>
              <input
                type="text"
                name="productId"
                value={formData.productId || 'Will be auto-generated'}
                readOnly
                className="w-full rounded-lg border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">
                This ID will be automatically generated when the product is created
              </p>
            </div>

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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Brand <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={refreshBrands}
                  disabled={loadingBrands}
                  className="inline-flex items-center px-2 py-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  <ArrowPathIcon className={`h-4 w-4 mr-1 ${loadingBrands ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={refreshCategories}
                  disabled={loadingCategories}
                  className="inline-flex items-center px-2 py-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  <ArrowPathIcon className={`h-4 w-4 mr-1 ${loadingCategories ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Sub Category
                </label>
                <button
                  type="button"
                  onClick={refreshSubCategories}
                  disabled={loadingSubCategories}
                  className="inline-flex items-center px-2 py-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  <ArrowPathIcon className={`h-4 w-4 mr-1 ${loadingSubCategories ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
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
                className={`w-full rounded-lg border ${
                  Number(formData.price) > Number(formData.mrp)
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                required
              />
              {Number(formData.price) > Number(formData.mrp) && (
                <p className="mt-1 text-sm text-red-500">Price cannot exceed MRP</p>
              )}
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
              purchase Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="purchasePrice"
                value={formData.purchasePrice}
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
                  className={`w-full rounded-lg border ${
                    Number(formData.maxSelectableQuantity) > Number(formData.stockCount)
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
                {Number(formData.maxSelectableQuantity) > Number(formData.stockCount) && (
                  <p className="mt-1 text-sm text-red-500">Cannot exceed stock count</p>
                )}
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
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleKeywordInput}
                  className="flex-1 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  placeholder="Type and press Enter to add keywords"
                />
             
              </div>
              
              <p className="text-xs text-gray-500 ml-1">
                Press Enter or use comma to add keywords, or click the button to add each character as a keyword
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

      {/* Variations Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Product Variations</h3>
          <button
            type="button"
            onClick={() => setIsVariationDialogOpen(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Variation
          </button>
        </div>

        {/* Variations List */}
        <div className="space-y-4">
          {formData.variations.map((variation, index) => (
            <div key={variation.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={variation.name}
                    onChange={(e) => handleVariationChange(index, 'name', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Weight</label>
                  <input
                    type="text"
                    value={variation.weightWithSIUnit}
                    onChange={(e) => handleVariationChange(index, 'weightWithSIUnit', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeVariation(index)}
                className="inline-flex items-center p-1 border border-transparent rounded-full text-red-600 hover:bg-red-50"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Variation Search Dialog */}
        {isVariationDialogOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Search Products</label>
                <input
                  type="text"
                  value={variationSearch}
                  onChange={(e) => setVariationSearch(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Search by product name..."
                />
              </div>

              <div className="max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner />
                  </div>
                ) : (
                  searchResults.map(product => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => addVariation(product)}
                    >
                      <div>
                        <div className="font-medium">{product.productName}</div>
                        <div className="text-sm text-gray-500">{product.productId}</div>
                      </div>
                      <PlusIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsVariationDialogOpen(false);
                    setVariationSearch('');
                    setSearchResults([]);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
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
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {product ? 'Update' : 'Create'}
        </button>
      </div>

      {showReview && <ReviewModal />}
    </form>
  );
} 