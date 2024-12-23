import Customer from './Customer';
import Payment from './Payment';
import Shipping from './Shipping';
import ShoppingCartsProduct from './ShoppingCartsProduct';

class Order {
  constructor({
    orderId = '',
    customer = new Customer(),
    orderItems = [],
    orderTotalPrice = 0,
    couponCode = '',
    couponCodeValue = 0,
    orderStatus = '',
    payment = new Payment(),
    shipping = new Shipping(),
    orderDate = new Date(),
    notes = '',
    token = '',
    donate = 0,
    processingFees = 0
  } = {}) {
    this.orderId = orderId;
    this.customer = customer instanceof Customer ? customer : new Customer(customer);
    this.orderItems = orderItems;
    this.orderTotalPrice = orderTotalPrice;
    this.couponCode = couponCode;
    this.couponCodeValue = couponCodeValue;
    this.orderStatus = orderStatus;
    this.payment = payment instanceof Payment ? payment : new Payment(payment);
    this.shipping = shipping instanceof Shipping ? shipping : new Shipping(shipping);
    this.orderDate = orderDate instanceof Date ? orderDate : new Date(orderDate);
    this.notes = notes;
    this.token = token;
    this.donate = donate;
    this.processingFees = processingFees;
  }

  toFirestore() {
    return {
      orderId: this.orderId,
      customer: this.customer.toFirestore(),
      orderItems: this.orderItems.map(item => item.toFirestore()),
      orderTotalPrice: this.orderTotalPrice,
      couponCode: this.couponCode,
      couponCodeValue: this.couponCodeValue,
      orderStatus: this.orderStatus,
      payment: this.payment.toFirestore(),
      shipping: this.shipping.toFirestore(),
      orderDate: this.orderDate,
      notes: this.notes,
      token: this.token,
      donate: this.donate,
      processingFees: this.processingFees
    };
  }

  static fromFirestore(data) {
    if (!data) return new Order();
    
    return new Order({
      ...data,
      customer: Customer.fromFirestore(data.customer),
      orderItems: Array.isArray(data.orderItems) 
        ? data.orderItems.map(item => ShoppingCartsProduct.fromFirestore(item))
        : [],
      payment: Payment.fromFirestore(data.payment),
      shipping: Shipping.fromFirestore(data.shipping),
      orderDate: data.orderDate instanceof Date ? data.orderDate : new Date(data.orderDate)
    });
  }
}

export default Order; 