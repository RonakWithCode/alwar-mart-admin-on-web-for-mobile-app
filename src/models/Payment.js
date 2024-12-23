class Payment {
  constructor({
    paymentMethod = '',
    paymentStatus = ''
  } = {}) {
    this.paymentMethod = paymentMethod;
    this.paymentStatus = paymentStatus;
  }

  toFirestore() {
    return {
      paymentMethod: this.paymentMethod,
      paymentStatus: this.paymentStatus
    };
  }

  static fromFirestore(data) {
    return new Payment(data);
  }
}

export default Payment; 