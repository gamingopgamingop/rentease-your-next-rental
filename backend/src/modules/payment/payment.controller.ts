import { Response, NextFunction } from 'express';
import { PaymentService } from './payment.service.js';
import { AuthRequest } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

const paymentService = new PaymentService();

export class PaymentController {
  processPayment = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const payerId = req.user!.id;
    const { bookingId, paymentMethod } = req.body;

    const payment = await paymentService.processPayment(
      payerId,
      bookingId,
      paymentMethod
    );

    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      data: payment,
    });
  });

  getPaymentReceipt = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { transactionId } = req.params;

    const payment = await paymentService.getPaymentByTransactionId(transactionId);

    res.status(200).json({
      success: true,
      message: 'Payment receipt retrieved successfully',
      data: payment,
    });
  });

  getUserPayments = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await paymentService.getUserPayments(userId, page, limit);

    res.status(200).json({
      success: true,
      message: 'Payments retrieved successfully',
      data: result.payments,
      pagination: result.pagination,
    });
  });
}
