class ShoppingCartsProduct {
  constructor({
    isAvailable = false,
    productId = '',
    productName = '',
    productDescription = '',
    brand = '',
    category = '',
    subCategory = '',
    price = 0,
    mrp = 0,
    discount = 0,
    stockCount = 0,
    minSelectableQuantity = 1,
    maxSelectableQuantity = 1,
    selectableQuantity = 1,
    weight = '',
    weightSIUnit = '',
    productLife = '',
    productType = '',
    productIsFoodItem = '',
    keywords = [],
    productImage = [],
    variations = null
  } = {}) {
    this.isAvailable = isAvailable;
    this.productId = productId;
    this.productName = productName;
    this.productDescription = productDescription;
    this.brand = brand;
    this.category = category;
    this.subCategory = subCategory;
    this.price = price;
    this.mrp = mrp;
    this.discount = discount;
    this.stockCount = stockCount;
    this.minSelectableQuantity = minSelectableQuantity;
    this.maxSelectableQuantity = maxSelectableQuantity;
    this.selectableQuantity = selectableQuantity;
    this.weight = weight;
    this.weightSIUnit = weightSIUnit;
    this.productLife = productLife;
    this.productType = productType;
    this.productIsFoodItem = productIsFoodItem;
    this.keywords = keywords;
    this.productImage = productImage;
    this.variations = variations;
  }

  toFirestore() {
    return {
      isAvailable: this.isAvailable,
      productId: this.productId,
      productName: this.productName,
      productDescription: this.productDescription,
      brand: this.brand,
      category: this.category,
      subCategory: this.subCategory,
      price: this.price,
      mrp: this.mrp,
      discount: this.discount,
      stockCount: this.stockCount,
      minSelectableQuantity: this.minSelectableQuantity,
      maxSelectableQuantity: this.maxSelectableQuantity,
      selectableQuantity: this.selectableQuantity,
      weight: this.weight,
      weightSIUnit: this.weightSIUnit,
      productLife: this.productLife,
      productType: this.productType,
      productIsFoodItem: this.productIsFoodItem,
      keywords: this.keywords,
      productImage: this.productImage,
      variations: this.variations
    };
  }

  static fromFirestore(data) {
    if (!data) return new ShoppingCartsProduct();

    return new ShoppingCartsProduct({
      isAvailable: data.isAvailable || false,
      productId: data.productId || '',
      productName: data.productName || '',
      productDescription: data.productDescription || '',
      brand: data.brand || '',
      category: data.category || '',
      subCategory: data.subCategory || '',
      price: data.price || 0,
      mrp: data.mrp || 0,
      discount: data.discount || 0,
      stockCount: data.stockCount || 0,
      minSelectableQuantity: data.minSelectableQuantity || 1,
      maxSelectableQuantity: data.maxSelectableQuantity || 1,
      selectableQuantity: data.selectableQuantity || 1,
      weight: data.weight || '',
      weightSIUnit: data.weightSIUnit || '',
      productLife: data.productLife || '',
      productType: data.productType || '',
      productIsFoodItem: data.productIsFoodItem || '',
      keywords: Array.isArray(data.keywords) ? data.keywords : [],
      productImage: Array.isArray(data.productImage) ? data.productImage : [],
      variations: data.variations || null
    });
  }

  // Getters
  getProductId() { return this.productId; }
  getProductName() { return this.productName; }
  getPrice() { return this.price; }
  getMrp() { return this.mrp; }
  getDiscount() { return this.discount; }
  getStockCount() { return this.stockCount; }
  getSelectableQuantity() { return this.selectableQuantity; }
  isProductAvailable() { return this.isAvailable; }

  // Setters
  setProductId(productId) { this.productId = productId; }
  setProductName(productName) { this.productName = productName; }
  setPrice(price) { this.price = price; }
  setMrp(mrp) { this.mrp = mrp; }
  setDiscount(discount) { this.discount = discount; }
  setStockCount(stockCount) { this.stockCount = stockCount; }
  setSelectableQuantity(quantity) { this.selectableQuantity = quantity; }
  setAvailable(available) { this.isAvailable = available; }
}

export default ShoppingCartsProduct; 