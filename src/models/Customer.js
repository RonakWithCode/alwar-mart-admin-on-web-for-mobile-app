class Customer {
  constructor({
    customerId = '',
    fullName = '',
    phoneNumber = '',
    phoneNumber2 = ''
  } = {}) {
    this.customerId = customerId;
    this.fullName = fullName;
    this.phoneNumber = phoneNumber;
    this.phoneNumber2 = phoneNumber2;
  }

  toFirestore() {
    return {
      customerId: this.customerId,
      fullName: this.fullName,
      phoneNumber: this.phoneNumber,
      phoneNumber2: this.phoneNumber2
    };
  }

  static fromFirestore(data) {
    return new Customer(data);
  }
}

export default Customer; 