import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { OrderService } from '@/services/OrderService';
import Image from 'next/image';

export default function OrderDetailsModal({ order, onClose, onStatusUpdate }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Status action buttons with different colors
  const statusActions = [
    { status: OrderService.ORDER_STATUS.CONFIRMED, color: 'bg-green-600 hover:bg-green-700' },
    { status: OrderService.ORDER_STATUS.OUTFORDELIVERY, color: 'bg-blue-600 hover:bg-blue-700' },
    { status: OrderService.ORDER_STATUS.DELIVERED, color: 'bg-purple-600 hover:bg-purple-700' },
    { status: OrderService.ORDER_STATUS.CANCELLED, color: 'bg-red-600 hover:bg-red-700' },
    { status: OrderService.ORDER_STATUS.CUSTOMER_REJECTED, color: 'bg-orange-600 hover:bg-orange-700' },
    { status: OrderService.ORDER_STATUS.CUSTOMER_NOT_AVAILABLE, color: 'bg-gray-600 hover:bg-gray-700' }
  ];

  return (
    <Transition.Root show={true} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="border-b pb-4 mb-4">
                  <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900">
                    Order #{order.orderId}
                  </Dialog.Title>
                  <p className="mt-1 text-sm text-gray-500">
                    Placed on {formatDate(order.orderDate)}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Customer Details</h4>
                      <p className="text-sm text-gray-900">{order.customer.fullName}</p>
                      <p className="text-sm text-gray-600">Primary: {order.customer.phoneNumber}</p>
                      {order.customer.phoneNumber2 && (
                        <p className="text-sm text-gray-600">Secondary: {order.customer.phoneNumber2}</p>
                      )}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Delivery Address</h4>
                      <p className="text-sm text-gray-900">{order.shipping.shippingAddress.fullName}</p>
                      <p className="text-sm text-gray-600">{order.shipping.shippingAddress.flatHouse}</p>
                      <p className="text-sm text-gray-600">{order.shipping.shippingAddress.address}</p>
                      {order.shipping.shippingAddress.landmark && (
                        <p className="text-sm text-gray-600">Landmark: {order.shipping.shippingAddress.landmark}</p>
                      )}
                      <p className="text-sm text-gray-600">Phone: {order.shipping.shippingAddress.mobileNumber}</p>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                          order.shipping.shippingAddress.isHomeSelected ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.shipping.shippingAddress.isHomeSelected ? 'Home' : 'Other'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Update Order Status</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {statusActions.map(({ status, color }) => (
                          <button
                            key={status}
                            onClick={() => onStatusUpdate(order, status)}
                            disabled={order.orderStatus === status}
                            className={`${color} text-white px-3 py-2 text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500 mb-4">Order Items</h4>
                      <div className="space-y-4">
                        {order.orderItems.map((item, index) => (
                          <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                            {item.productImage && item.productImage[0] && (
                              <div className="relative w-20 h-20">
                                <Image
                                  src={item.productImage[0]}
                                  alt={item.productName}
                                  fill
                                  className="object-cover rounded-md"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <h5 className="text-sm font-medium text-gray-900">{item.productName}</h5>
                              <p className="text-sm text-gray-600">
                                Quantity: {item.selectableQuantity} × {formatCurrency(item.price)}
                              </p>
                              {item.variations && (
                                <p className="text-sm text-gray-600">
                                  Variation: {item.variations.variationName} - {item.variations.variationValue}
                                </p>
                              )}
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(item.price * item.selectableQuantity)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Payment Details</h4>
                      <p className="text-sm text-gray-900">Method: {order.payment.paymentMethod}</p>
                      <p className="text-sm text-gray-600">Status: {order.payment.paymentStatus}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Order Summary</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="text-gray-900">{formatCurrency(order.orderTotalPrice)}</span>
                        </div>
                        {order.couponCodeValue > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Discount ({order.couponCode}):</span>
                            <span className="text-red-600">-{formatCurrency(order.couponCodeValue)}</span>
                          </div>
                        )}
                        {order.shipping.shippingFee && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Shipping Fee:</span>
                            <span className="text-gray-900">{formatCurrency(order.shipping.shippingFee)}</span>
                          </div>
                        )}
                        {order.donate > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Donation:</span>
                            <span className="text-green-600">{formatCurrency(order.donate)}</span>
                          </div>
                        )}
                        {order.processingFees > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Processing Fees:</span>
                            <span className="text-gray-900">{formatCurrency(order.processingFees)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm font-medium pt-2 border-t">
                          <span className="text-gray-900">Total:</span>
                          <span className="text-gray-900">
                            {formatCurrency(
                              order.orderTotalPrice - 
                              order.couponCodeValue + 
                              (parseFloat(order.shipping.shippingFee) || 0) + 
                              order.processingFees + 
                              order.donate
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Order Notes</h4>
                        <p className="text-sm text-gray-600">{order.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 