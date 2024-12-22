class SubCategory {
  constructor({
    id = '',
    subCategoryName = '',
    createdAt = new Date().toISOString()
  } = {}) {
    this.id = id;
    this.subCategoryName = subCategoryName;
    this.createdAt = createdAt;
  }

  toFirestore() {
    return {
      subCategoryName: this.subCategoryName
    };
  }
}

export default SubCategory; 