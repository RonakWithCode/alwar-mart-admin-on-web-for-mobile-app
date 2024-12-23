import AddressModel from './AddressModel';

class Shipping {
  constructor({
    shippingMethod = '',
    shippingFee = '',
    deliveredData = null,
    shippingAddress = new AddressModel(),
    shippingStatus = ''
  } = {}) {
    this.shippingMethod = shippingMethod;
    this.shippingFee = shippingFee;
    this.deliveredData = deliveredData;
    this.shippingAddress = shippingAddress instanceof AddressModel 
      ? shippingAddress 
      : new AddressModel(shippingAddress);
    this.shippingStatus = shippingStatus;
  }

  toFirestore() {
    return {
      shippingMethod: this.shippingMethod,
      shippingFee: this.shippingFee,
      deliveredData: this.deliveredData,
      shippingAddress: this.shippingAddress.toFirestore(),
      shippingStatus: this.shippingStatus
    };
  }

  static fromFirestore(data) {
    return new Shipping({
      shippingMethod: data.shippingMethod || '',
      shippingFee: data.shippingFee || '',
      deliveredData: data.deliveredData ? new Date(data.deliveredData) : null,
      shippingAddress: AddressModel.fromFirestore(data.shippingAddress || {}),
      shippingStatus: data.shippingStatus || ''
    });
  }

  // Getters and setters
  getShippingMethod() {
    return this.shippingMethod;
  }

  setShippingMethod(shippingMethod) {
    this.shippingMethod = shippingMethod;
  }

  getShippingFee() {
    return this.shippingFee;
  }

  setShippingFee(shippingFee) {
    this.shippingFee = shippingFee;
  }

  getDeliveredData() {
    return this.deliveredData;
  }

  setDeliveredData(deliveredData) {
    this.deliveredData = deliveredData;
  }

  getShippingAddress() {
    return this.shippingAddress;
  }

  setShippingAddress(shippingAddress) {
    this.shippingAddress = shippingAddress instanceof AddressModel 
      ? shippingAddress 
      : new AddressModel(shippingAddress);
  }

  getShippingStatus() {
    return this.shippingStatus;
  }

  setShippingStatus(shippingStatus) {
    this.shippingStatus = shippingStatus;
  }
}

export default Shipping; 