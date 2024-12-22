class Category {
  constructor({
    tag = '',
    imageUri = ''
  } = {}) {
    this.tag = tag;
    this.imageUri = imageUri;
  }

  toFirestore() {
    return {
      tag: this.tag,
      imageUri: this.imageUri
    };
  }
}

export default Category; 