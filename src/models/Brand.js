class Brand {
  constructor({
    id = '',
    brandName = '',
    brandIcon = '',
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString()
  } = {}) {
    this.id = id;
    this.brandName = brandName;
    this.brandIcon = brandIcon;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toFirestore() {
    return {
      brandName: this.brandName,
      brandIcon: this.brandIcon,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export default Brand; 