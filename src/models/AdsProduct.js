export default class AdsProduct {
  static SPONSOR_TYPES = {
    SEARCH_ADS: 'searchAds',
    HOME_ADS: 'homeAds',
    CATEGORY_ADS: 'categoryAds'
  };

  static PRIORITY_LEVELS = {
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low'
  };

  constructor({ productId, sponsorTypes = [] }) {
    this.productId = productId;
    this.sponsorTypes = sponsorTypes; // Array of {type, priorityLevel}
    this.createdAt = new Date().toISOString();
  }

  toFirestore() {
    return {
      productId: this.productId,
      sponsorTypes: this.sponsorTypes,
      createdAt: this.createdAt
    };
  }
} 