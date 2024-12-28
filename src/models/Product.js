class Product {
  static PRODUCT_TYPES = [
    "Grocery",
    "Vegetables and Fruits",
    "Dairy Products",
    "Bakery Items",
    "Spices and Condiments",
    "Snacks and Beverages",
    "Personal Care",
    "Skin Care",
    "Hair Care",
    "Baby Care",
    "Household Essentials",
    "Stationery",
    "Kitchen Essentials",
    "Packaged Food",
    "Pet Care",
    "Electrical Items",
    "Women's Essentials",
    "Men's Essentials",
    "Health and Wellness",
    "Miscellaneous Items",
    "Festive Products"
  ];

  static FOOD_ITEM_TYPES = {
    FoodNonVeg: "FoodNonVeg",
    VegetableAndFruit: "VegetableAndFruit",
    FoodVeg: "FoodVeg",
    nonFood: "nonFood"
  };
  static WEIGHT_SI_UNITS = {
    Kg: "Kg",
    Grams: "Grams",
    HalfKg: "Half Kg",
    QuarterKg: "Quarter Kg",
    Litre: "Litre",
    HalfLitre: "Half Litre",
    Milliliters: "Milliliters",
    Piece: "Piece",
    Pieces: "Pieces",
    Dozen: "Dozen",
    HalfDozen: "Half Dozen",
    Pack: "Pack",
    Box: "Box",
    Carton: "Carton",
    Packet: "Packet",
    Bag: "Bag",
    Bundle: "Bundle",
    Pouch: "Pouch",
    Sachet: "Sachet",
    Quintal: "Quintal (100 Kg)",
    Tola: "Tola (11.66 g)",
    Bunch: "Bunch",
    Strip: "Strip",
    Roll: "Roll",
    Sheet: "Sheet",
    Pair: "Pair",
    Bottle: "Bottle",
    Can: "Can",
    Jar: "Jar",
    Unit: "Unit",
    Other: "Other"
  };

  constructor({
    available = false,
    productId = '',
    productName = '',
    productDescription = '',
    brand = '',
    category = '',
    subCategory = '',
    price = 0,
    mrp = 0,
    purchasePrice = 0,
    discount = 0,
    stockCount = 0,
    minSelectableQuantity = 1,
    maxSelectableQuantity = 1,
    selectableQuantity = 1,
    weight = '',
    weightSIUnit = '',
    productLife = '',
    productType = '',
    productIsFoodItem = Product.FOOD_ITEM_TYPES.nonFood,
    keywords = [],
    productImage = [],
    variations = [],
    barcode = ''
  } = {}) {
    this.available = available;
    this.productId = productId;
    this.productName = productName;
    this.productDescription = productDescription;
    this.brand = brand;
    this.category = category;
    this.subCategory = subCategory;
    this.price = price;
    this.mrp = mrp;
    this.purchasePrice = purchasePrice;
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
    this.variations = Array.isArray(variations) ? variations : [];
    this.barcode = barcode;
  }

  static fromFirestore(data) {
    return new Product({
      ...data,
      variations: Array.isArray(data.variations) ? data.variations : []
    });
  }

  toFirestore() {
    return {
      available: this.available,
      productId: this.productId,
      productName: this.productName,
      productDescription: this.productDescription,
      brand: this.brand,
      category: this.category,
      subCategory: this.subCategory,
      price: this.price,
      mrp: this.mrp,
      purchasePrice: this.purchasePrice,
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
      variations: Array.isArray(this.variations) ? this.variations : [],
      barcode: this.barcode
    };
  }
}

export default Product; 