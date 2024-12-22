class Variation {
  constructor({
    id = '',
    name = '',
    weightWithSIUnit = ''
  } = {}) {
    this.id = id;
    this.name = name;
    this.weightWithSIUnit = weightWithSIUnit;
  }

  toFirestore() {
    return {
      id: this.id,
      name: this.name,
      weightWithSIUnit: this.weightWithSIUnit
    };
  }

  static fromFirestore(data) {
    return new Variation({
      id: data.id || '',
      name: data.name || '',
      weightWithSIUnit: data.weightWithSIUnit || ''
    });
  }
}

export default Variation; 