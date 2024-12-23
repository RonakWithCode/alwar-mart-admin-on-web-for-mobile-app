import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { OrderService } from '@/services/OrderService';

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

                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900 mb-4">
                      Order Details #{order.orderId}
                    </Dialog.Title>

                    {/* Order Status and Actions */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Status Actions</h4>
                      <div className="flex gap-2 flex-wrap">
                        {order.orderStatus === OrderService.ORDER_STATUS.PROCESSING && (
                          <>
                            <button
                              onClick={() => onStatusUpdate(order, OrderService.ORDER_STATUS.CONFIRMED)}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                            >
                              Confirm Order
                            </button>
                            <button
                              onClick={() => onStatusUpdate(order, OrderService.ORDER_STATUS.CANCELLED)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
                            >
                              Cancel Order
                            </button>
                          </>
                        )}
                        {/* Add other status action buttons */}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Customer Information */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Customer Information</h4>
                        <p className="text-sm text-gray-900">{order.customer.fullName}</p>
                        <p className="text-sm text-gray-600">{order.customer.phoneNumber}</p>
                        {order.customer.phoneNumber2 && (
                          <p className="text-sm text-gray-600">{order.customer.phoneNumber2}</p>
                        )}
                      </div>

                      {/* Shipping Information */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Shipping Information</h4>
                        <p className="text-sm text-gray-900">{order.shipping.shippingAddress.fullName}</p>
                        <p className="text-sm text-gray-600">{order.shipping.shippingAddress.flatHouse}</p>
                        <p className="text-sm text-gray-600">{order.shipping.shippingAddress.address}</p>
                        <p className="text-sm text-gray-600">{order.shipping.shippingAddress.landmark}</p>
                      </div>

                      {/* Order Items */}
                      <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Order Items</h4>
                        <div className="mt-2">
                          {order.orderItems.map((item, index) => (
                            <div key={index} className="flex justify-between py-2 border-b last:border-0">
                              <div>
                                <p className="text-sm text-gray-900">{item.productName}</p>
                                <p className="text-xs text-gray-600">
                                  Qty: {item.selectableQuantity} × {formatCurrency(item.price)}
                                </p>
                              </div>
                              <p className="text-sm font-medium text-gray-900">
                                {formatCurrency(item.price * item.selectableQuantity)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Payment Information */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Payment Details</h4>
                        <p className="text-sm text-gray-900">Method: {order.payment.paymentMethod}</p>
                        <p className="text-sm text-gray-600">Status: {order.payment.paymentStatus}</p>
                      </div>

                      {/* Order Summary */}
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
                          {order.processingFees > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Processing Fees:</span>
                              <span className="text-gray-900">{formatCurrency(order.processingFees)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm font-medium pt-2 border-t">
                            <span className="text-gray-900">Total:</span>
                            <span className="text-gray-900">
                              {formatCurrency(order.orderTotalPrice - order.couponCodeValue + order.processingFees)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Information */}
                    {order.notes && (
                      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
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