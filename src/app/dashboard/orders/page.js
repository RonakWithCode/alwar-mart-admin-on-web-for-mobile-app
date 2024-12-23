'use client';
import { useState, useEffect } from 'react';
import { OrderService } from '@/services/OrderService';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { MagnifyingGlassIcon, EyeIcon } from '@heroicons/react/24/outline';
import OrderDetailsModal from '@/components/orders/OrderDetailsModal';

// Status color mapping
const getStatusColor = (status) => {
  switch (status) {
    case OrderService.ORDER_STATUS.CONFIRMED:
      return 'bg-green-100 text-green-800';
    case OrderService.ORDER_STATUS.OUTFORDELIVERY:
      return 'bg-blue-100 text-blue-800';
    case OrderService.ORDER_STATUS.DELIVERED:
      return 'bg-purple-100 text-purple-800';
    case OrderService.ORDER_STATUS.CANCELLED:
      return 'bg-red-100 text-red-800';
    case OrderService.ORDER_STATUS.CUSTOMER_REJECTED:
      return 'bg-orange-100 text-orange-800';
    case OrderService.ORDER_STATUS.CUSTOMER_NOT_AVAILABLE:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-yellow-100 text-yellow-800'; // PROCESSING
  }
};

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Format date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export default function OrderManagement() {
  // State management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0); // For manual refresh
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load orders on mount and refresh
  useEffect(() => {
    loadOrders();
  }, [refreshKey]);

  // Load orders from service
  const loadOrders = async () => {
    try {
      setLoading(true);
      const allOrders = await OrderService.getAllOrders();
      setOrders(allOrders);
      setFilteredOrders(allOrders);
    } catch (error) {
      console.error('Load orders error:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setFilteredOrders(orders);
      return;
    }

    try {
      const results = await OrderService.searchOrders(searchTerm);
      setFilteredOrders(results);
      if (results.length === 0) {
        toast.error('No orders found');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    }
  };

  // Handle status updates
  const handleStatusUpdate = async (order, newStatus) => {
    try {
      await OrderService.updateOrderStatus(order.userId, order.id, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      loadOrders();
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update order status');
    }
  };

  // Handle manual refresh
  const handleRefresh = () => {
    setRefreshKey(old => old + 1);
  };

  // Handle view order details
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Main render
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Order Management</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
          >
            Refresh
          </button>
          <div className="text-sm text-gray-500">
            {filteredOrders.length} Orders
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by order ID or phone number"
            className="w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
          >
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No orders found</p>
        </div>
      ) : (
        /* Orders Table */
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{order.orderId}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(order.orderDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.customer.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customer.phoneNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(order.orderTotalPrice)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.payment.paymentMethod}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.payment.paymentStatus}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <EyeIcon className="h-4 w-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedOrder(null);
          }}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}