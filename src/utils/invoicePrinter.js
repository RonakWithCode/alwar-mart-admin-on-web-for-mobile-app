const PRINTER_COMMANDS = {
  INIT: '\x1B\x40',           // Initialize printer
  ALIGN_CENTER: '\x1B\x61\x01',
  ALIGN_LEFT: '\x1B\x61\x00',
  EMPHASIZE_ON: '\x1B\x45\x01',
  EMPHASIZE_OFF: '\x1B\x45\x00',
  FONT_SMALL: '\x1B\x21\x01',
  FONT_NORMAL: '\x1B\x21\x00',
  DOUBLE_WIDTH: '\x1B\x21\x20',
  CUT_PAPER: '\x1D\x56\x42\x00',
  LINE_FEED: '\x0A'
};

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const printInvoice = async (invoiceData) => {
  try {
    // Connect to printer (implementation depends on your printer setup)
    const printer = await connectToPrinter();
    
    // Start building the invoice content
    let content = '';
    
    // Initialize printer
    content += PRINTER_COMMANDS.INIT;
    
    // Header
    content += PRINTER_COMMANDS.ALIGN_CENTER;
    content += PRINTER_COMMANDS.DOUBLE_WIDTH;
    content += 'ALWAR MART\n';
    content += PRINTER_COMMANDS.FONT_NORMAL;
    content += 'Phone: 7023941072\n';
    content += 'Email: contact@alwarmart.com\n\n';
    
    // Order Details
    content += PRINTER_COMMANDS.ALIGN_LEFT;
    content += PRINTER_COMMANDS.EMPHASIZE_ON;
    content += `Order #${invoiceData.orderDetails.orderId}\n`;
    content += `Date: ${invoiceData.orderDetails.orderDate}\n`;
    content += PRINTER_COMMANDS.EMPHASIZE_OFF;
    
    // Customer Details
    content += `\nCustomer: ${invoiceData.orderDetails.customerName}\n`;
    content += `Phone: ${invoiceData.orderDetails.customerPhone}\n\n`;
    
    // Shipping Address
    content += 'Shipping Address:\n';
    content += `${invoiceData.orderDetails.shippingAddress.fullName}\n`;
    content += `${invoiceData.orderDetails.shippingAddress.address}\n`;
    if (invoiceData.orderDetails.shippingAddress.landmark) {
      content += `Landmark: ${invoiceData.orderDetails.shippingAddress.landmark}\n`;
    }
    content += `Phone: ${invoiceData.orderDetails.shippingAddress.phone}\n\n`;
    
    // Items
    content += PRINTER_COMMANDS.EMPHASIZE_ON;
    content += 'Items:\n';
    content += '-'.repeat(48) + '\n';
    content += 'Item                  Qty    Price    Total\n';
    content += '-'.repeat(48) + '\n';
    content += PRINTER_COMMANDS.EMPHASIZE_OFF;
    
    invoiceData.items.forEach(item => {
      const name = item.name.padEnd(20).substring(0, 20);
      const qty = item.quantity.toString().padStart(4);
      const price = item.price.toString().padStart(8);
      const total = item.total.toString().padStart(8);
      content += `${name} ${qty} ${price} ${total}\n`;
      if (item.variation) {
        content += `  ${item.variation}\n`;
      }
    });
    
    content += '-'.repeat(48) + '\n\n';
    
    // Pricing Summary
    content += PRINTER_COMMANDS.ALIGN_RIGHT;
    content += `Subtotal: ${invoiceData.pricing.subtotal}\n`;
    if (invoiceData.pricing.discount > 0) {
      content += `Discount (${invoiceData.pricing.couponCode}): -${invoiceData.pricing.discount}\n`;
    }
    if (invoiceData.pricing.shippingFee > 0) {
      content += `Shipping: ${invoiceData.pricing.shippingFee}\n`;
    }
    if (invoiceData.pricing.processingFees > 0) {
      content += `Processing Fees: ${invoiceData.pricing.processingFees}\n`;
    }
    if (invoiceData.pricing.donation > 0) {
      content += `Donation: ${invoiceData.pricing.donation}\n`;
    }
    content += PRINTER_COMMANDS.EMPHASIZE_ON;
    content += `Total: ${invoiceData.pricing.total}\n\n`;
    content += PRINTER_COMMANDS.EMPHASIZE_OFF;
    
    // Payment Info
    content += PRINTER_COMMANDS.ALIGN_LEFT;
    content += `Payment Method: ${invoiceData.payment.method}\n`;
    content += `Payment Status: ${invoiceData.payment.status}\n\n`;
    
    // Terms and Conditions
    content += PRINTER_COMMANDS.FONT_SMALL;
    content += 'Terms & Conditions:\n';
    content += '1. All sales are final\n';
    content += '2. Returns accepted within 7 days with receipt\n';
    content += '3. Damaged items must be reported within 24 hours\n';
    content += '4. Prices include GST where applicable\n\n';
    
    // Footer
    content += PRINTER_COMMANDS.ALIGN_CENTER;
    content += PRINTER_COMMANDS.FONT_NORMAL;
    content += 'Thank you for shopping at Alwar Mart!\n';
    content += 'Visit us again soon!\n\n';
    
    // Cut paper
    content += PRINTER_COMMANDS.CUT_PAPER;
    
    // Send to printer
    await printer.print(content);
    
  } catch (error) {
    console.error('Printing failed:', error);
    throw new Error('Failed to print invoice');
  }
};

export const generatePDF = async (invoiceData) => {
  try {
    const doc = new jsPDF();
    
    // Add logo and header
    doc.setFontSize(20);
    doc.text('ALWAR MART', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text('Phone: 7023941072', 105, 30, { align: 'center' });
    doc.text('Email: contact@alwarmart.com', 105, 35, { align: 'center' });
    
    // Order and Customer Details
    doc.setFontSize(12);
    doc.text(`Order #${invoiceData.orderDetails.orderId}`, 15, 50);
    doc.text(`Date: ${invoiceData.orderDetails.orderDate}`, 15, 57);
    
    doc.text('Customer Details:', 15, 70);
    doc.setFontSize(10);
    doc.text(`Name: ${invoiceData.orderDetails.customerName}`, 15, 77);
    doc.text(`Phone: ${invoiceData.orderDetails.customerPhone}`, 15, 84);
    
    // Shipping Address
    doc.setFontSize(12);
    doc.text('Shipping Address:', 15, 97);
    doc.setFontSize(10);
    doc.text(invoiceData.orderDetails.shippingAddress.fullName, 15, 104);
    doc.text(invoiceData.orderDetails.shippingAddress.address, 15, 111);
    if (invoiceData.orderDetails.shippingAddress.landmark) {
      doc.text(`Landmark: ${invoiceData.orderDetails.shippingAddress.landmark}`, 15, 118);
    }
    
    // Items Table
    const tableData = invoiceData.items.map(item => [
      item.name,
      item.quantity,
      item.price,
      item.total,
      item.variation || ''
    ]);
    
    doc.autoTable({
      startY: 130,
      head: [['Item', 'Qty', 'Price', 'Total', 'Variation']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [66, 66, 66] }
    });
    
    // Summary
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Subtotal: ${invoiceData.pricing.subtotal}`, 150, finalY, { align: 'right' });
    let currentY = finalY;
    
    if (invoiceData.pricing.discount > 0) {
      currentY += 7;
      doc.text(`Discount: -${invoiceData.pricing.discount}`, 150, currentY, { align: 'right' });
    }
    
    if (invoiceData.pricing.shippingFee > 0) {
      currentY += 7;
      doc.text(`Shipping: ${invoiceData.pricing.shippingFee}`, 150, currentY, { align: 'right' });
    }
    
    currentY += 7;
    doc.setFontSize(12);
    doc.text(`Total: ${invoiceData.pricing.total}`, 150, currentY, { align: 'right' });
    
    // Payment Info
    currentY += 15;
    doc.setFontSize(10);
    doc.text(`Payment Method: ${invoiceData.payment.method}`, 15, currentY);
    doc.text(`Payment Status: ${invoiceData.payment.status}`, 15, currentY + 7);
    
    // Terms and Conditions
    currentY += 20;
    doc.setFontSize(8);
    doc.text('Terms & Conditions:', 15, currentY);
    doc.text('1. All sales are final', 15, currentY + 5);
    doc.text('2. Returns accepted within 7 days with receipt', 15, currentY + 10);
    doc.text('3. Damaged items must be reported within 24 hours', 15, currentY + 15);
    doc.text('4. Prices include GST where applicable', 15, currentY + 20);
    
    // Footer
    doc.setFontSize(10);
    doc.text('Thank you for shopping at Alwar Mart!', 105, 280, { align: 'center' });
    
    // Save the PDF
    doc.save(`AlwarMart_Invoice_${invoiceData.orderDetails.orderId}.pdf`);
    
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw new Error('Failed to generate PDF');
  }
};

// This function needs to be implemented based on your printer setup
async function connectToPrinter() {
  // Implementation depends on your printer connection method (USB, Network, etc.)
  // Return a printer object with a print method
  throw new Error('Printer connection not implemented');
} 