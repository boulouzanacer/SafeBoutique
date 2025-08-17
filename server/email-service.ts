import nodemailer from 'nodemailer';
import { Order } from '@shared/schema';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface OrderEmailData extends Order {
  customerName: string;
  customerEmail: string;
  items: Array<{
    produit: string;
    quantity: number;
    price: number;
  }>;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private fromEmail: string;

  constructor() {
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@safesoft-boutique.com';
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailConfig: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    };

    // Only create transporter if SMTP credentials are provided
    if (emailConfig.auth.user && emailConfig.auth.pass) {
      this.transporter = nodemailer.createTransporter(emailConfig);
    }
  }

  async sendOrderConfirmation(orderData: OrderEmailData): Promise<boolean> {
    if (!this.transporter) {
      console.warn('Email service not configured - skipping order confirmation email');
      return false;
    }

    try {
      const emailHtml = this.generateOrderConfirmationHtml(orderData);
      const emailText = this.generateOrderConfirmationText(orderData);

      await this.transporter.sendMail({
        from: `SafeSoft Boutique <${this.fromEmail}>`,
        to: orderData.customerEmail,
        subject: `Order Confirmation #${orderData.recordid}`,
        html: emailHtml,
        text: emailText
      });

      console.log(`Order confirmation email sent for order #${orderData.recordid}`);
      return true;
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
      return false;
    }
  }

  async sendOrderStatusUpdate(orderData: OrderEmailData, newStatus: string): Promise<boolean> {
    if (!this.transporter) {
      console.warn('Email service not configured - skipping status update email');
      return false;
    }

    try {
      const emailHtml = this.generateStatusUpdateHtml(orderData, newStatus);
      const emailText = this.generateStatusUpdateText(orderData, newStatus);

      await this.transporter.sendMail({
        from: `SafeSoft Boutique <${this.fromEmail}>`,
        to: orderData.customerEmail,
        subject: `Order Update #${orderData.recordid} - ${newStatus}`,
        html: emailHtml,
        text: emailText
      });

      console.log(`Status update email sent for order #${orderData.recordid}`);
      return true;
    } catch (error) {
      console.error('Failed to send status update email:', error);
      return false;
    }
  }

  private generateOrderConfirmationHtml(order: OrderEmailData): string {
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.produit}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${(item.quantity * item.price).toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin-bottom: 10px;">SafeSoft Boutique</h1>
          <h2 style="color: #34495e; font-weight: 300;">Order Confirmation</h2>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="margin-top: 0; color: #2c3e50;">Hello ${order.customerName}!</h3>
          <p>Thank you for your order. We've received your order and it's being processed.</p>
          <p><strong>Order Number:</strong> #${order.recordid}</p>
          <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Payment Method:</strong> Cash on Delivery (COD)</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
              <tr style="background: #34495e; color: white;">
                <th style="padding: 12px; text-align: left;">Product</th>
                <th style="padding: 12px; text-align: center;">Quantity</th>
                <th style="padding: 12px; text-align: right;">Price</th>
                <th style="padding: 12px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr style="background: #ecf0f1; font-weight: bold;">
                <td colspan="3" style="padding: 12px; text-align: right;">Total:</td>
                <td style="padding: 12px; text-align: right;">$${order.totalAmount?.toFixed(2) || '0.00'}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="margin-top: 0; color: #27ae60;">What's Next?</h3>
          <p>• We'll process your order within 1-2 business days</p>
          <p>• You'll receive another email when your order ships</p>
          <p>• Payment will be collected upon delivery</p>
          <p>• Expected delivery: 3-5 business days</p>
        </div>

        <div style="text-align: center; padding: 20px; border-top: 1px solid #eee; color: #666;">
          <p>If you have any questions about your order, please contact our customer service.</p>
          <p style="margin: 0;"><strong>SafeSoft Boutique</strong> - Your trusted partner for professional solutions</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateOrderConfirmationText(order: OrderEmailData): string {
    const itemsText = order.items.map(item => 
      `${item.produit} - Qty: ${item.quantity} - $${item.price.toFixed(2)} each - Total: $${(item.quantity * item.price).toFixed(2)}`
    ).join('\n');

    return `
SAFESOFT BOUTIQUE - ORDER CONFIRMATION

Hello ${order.customerName}!

Thank you for your order. We've received your order and it's being processed.

Order Number: #${order.recordid}
Order Date: ${new Date().toLocaleDateString()}
Payment Method: Cash on Delivery (COD)

ORDER DETAILS:
${itemsText}

Total: $${order.totalAmount?.toFixed(2) || '0.00'}

WHAT'S NEXT?
• We'll process your order within 1-2 business days
• You'll receive another email when your order ships
• Payment will be collected upon delivery
• Expected delivery: 3-5 business days

If you have any questions about your order, please contact our customer service.

SafeSoft Boutique - Your trusted partner for professional solutions
    `;
  }

  private generateStatusUpdateHtml(order: OrderEmailData, newStatus: string): string {
    const statusColors: { [key: string]: string } = {
      'processing': '#f39c12',
      'shipped': '#3498db',
      'delivered': '#27ae60',
      'cancelled': '#e74c3c'
    };

    const statusColor = statusColors[newStatus.toLowerCase()] || '#34495e';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Status Update</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin-bottom: 10px;">SafeSoft Boutique</h1>
          <h2 style="color: #34495e; font-weight: 300;">Order Status Update</h2>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="margin-top: 0; color: #2c3e50;">Hello ${order.customerName}!</h3>
          <p>Your order status has been updated.</p>
          <p><strong>Order Number:</strong> #${order.recordid}</p>
          <p><strong>New Status:</strong> <span style="color: ${statusColor}; font-weight: bold; text-transform: uppercase;">${newStatus}</span></p>
        </div>

        <div style="text-align: center; padding: 20px; border-top: 1px solid #eee; color: #666;">
          <p>If you have any questions about your order, please contact our customer service.</p>
          <p style="margin: 0;"><strong>SafeSoft Boutique</strong> - Your trusted partner for professional solutions</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateStatusUpdateText(order: OrderEmailData, newStatus: string): string {
    return `
SAFESOFT BOUTIQUE - ORDER STATUS UPDATE

Hello ${order.customerName}!

Your order status has been updated.

Order Number: #${order.recordid}
New Status: ${newStatus.toUpperCase()}

If you have any questions about your order, please contact our customer service.

SafeSoft Boutique - Your trusted partner for professional solutions
    `;
  }
}

export const emailService = new EmailService();