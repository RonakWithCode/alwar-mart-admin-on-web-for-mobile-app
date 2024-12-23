import { ref, get, update, query, orderByChild, equalTo } from 'firebase/database';
import { realTimeDatabase } from '@/lib/firebase';
import Order from '@/models/Order';

export class OrderService {
  static ORDER_STATUS = {
    PROCESSING: 'Processing',
    CONFIRMED: 'Confirmed',
    OUTFORDELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
    CUSTOMER_REJECTED: 'Customer Rejected',
    CUSTOMER_NOT_AVAILABLE: 'Customer Not Available'
  };

  static async getAllOrders() {
    try {
      const ordersRef = ref(realTimeDatabase, 'Order');
      const snapshot = await get(ordersRef);
      
      if (!snapshot.exists()) return [];

      const orders = [];
      
      // Iterate through each user
      const users = snapshot.val();
      for (const userId in users) {
        // Iterate through each order of the user
        const userOrders = users[userId];
        for (const orderId in userOrders) {
          const orderData = userOrders[orderId];
          // if (orderData.orderStatus === OrderService.ORDER_STATUS.PROCESSING) {
            orders.push({
              id: orderId,
              userId: userId,
              ...Order.fromFirestore(orderData)
            });
          // }
        }
      }
      
      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new Error('Failed to fetch orders');
    }
  }

  static async searchOrders(searchTerm) {
    try {
      const ordersRef = ref(realTimeDatabase, 'Order');
      const snapshot = await get(ordersRef);
      
      if (!snapshot.exists()) return [];

      const results = [];
      const users = snapshot.val();

      // Search through all users and their orders
      for (const userId in users) {
        const userOrders = users[userId];
        for (const orderId in userOrders) {
          const orderData = userOrders[orderId];
          
          // Check if order matches search criteria
          if (
            (orderId === searchTerm || 
             orderData.customer?.phoneNumber === searchTerm) &&
            orderData.orderStatus === OrderService.ORDER_STATUS.PROCESSING
          ) {
            results.push({
              id: orderId,
              userId: userId,
              ...Order.fromFirestore(orderData)
            });
          }
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error searching orders:', error);
      throw new Error('Failed to search orders');
    }
  }

  static async updateOrderStatus(userId, orderId, status) {
    try {
      await update(ref(realTimeDatabase, `Order/${userId}/${orderId}`), {
        orderStatus: status
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error('Failed to update order status');
    }
  }
} 