class AddressModel {
  constructor({
    fullName = '',
    mobileNumber = '',
    flatHouse = '',
    address = '',
    landmark = '',
    isHomeSelected = false
  } = {}) {
    this.fullName = fullName;
    this.mobileNumber = mobileNumber;
    this.flatHouse = flatHouse;
    this.address = address;
    this.landmark = landmark;
    this.isHomeSelected = isHomeSelected;
  }

  toFirestore() {
    return {
      fullName: this.fullName,
      mobileNumber: this.mobileNumber,
      flatHouse: this.flatHouse,
      address: this.address,
      landmark: this.landmark,
      isHomeSelected: this.isHomeSelected
    };
  }

  static fromFirestore(data) {
    return new AddressModel({
      fullName: data.fullName || '',
      mobileNumber: data.mobileNumber || '',
      flatHouse: data.flatHouse || '',
      address: data.address || '',
      landmark: data.landmark || '',
      isHomeSelected: data.isHomeSelected || false
    });
  }
}

export default AddressModel; 