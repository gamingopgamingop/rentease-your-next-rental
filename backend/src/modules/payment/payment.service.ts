import prisma from '../../database/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';
import { Prisma } from '@prisma/client';
import crypto from 'crypto';

export class PaymentService {
  async processPayment(
    payerId: string,
    bookingId: string,
    paymentMethod: string = 'mock_card'
  ) {
    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { item: true },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Verify user is the renter
    if (booking.renterId !== payerId) {
      throw new AppError('You can only pay for your own bookings', 403);
    }

    // Check if already paid
    const existingPayment = await prisma.payment.findFirst({
      where: {
        bookingId,
        status: 'COMPLETED',
      },
    });

    if (existingPayment) {
      throw new AppError('Booking already paid', 400);
    }

    // Mock payment processing
    const transactionId = this.generateTransactionId();
    
    // Simulate payment processing (in production, integrate with Stripe/PayPal)
    const paymentSuccess = await this.mockPaymentGateway(booking.totalPrice);

    if (!paymentSuccess) {
      throw new AppError('Payment failed', 402);
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        payerId,
        amount: booking.totalPrice,
        paymentMethod,
        status: 'COMPLETED',
        transactionId,
        receiptUrl: `/api/payments/receipt/${transactionId}`,
      },
    });

    // Update booking status to confirmed
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
    });

    return payment;
  }

  async getPaymentByTransactionId(transactionId: string) {
    const payment = await prisma.payment.findUnique({
      where: { transactionId },
      include: {
        booking: {
          include: {
            item: true,
          },
        },
        payer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    return payment;
  }

  async getUserPayments(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { payerId: userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          booking: {
            select: {
              id: true,
              startDate: true,
              endDate: true,
              item: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.payment.count({ where: { payerId: userId } }),
    ]);

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private generateTransactionId(): string {
    return `TXN-${Date.now()}-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
  }

  private async mockPaymentGateway(amount: Prisma.Decimal): Promise<boolean> {
    // Simulate payment gateway delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Mock: 95% success rate
    return Math.random() > 0.05;
  }
}
