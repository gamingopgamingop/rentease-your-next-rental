import { Router } from 'express';
import { PaymentController } from './payment.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validation.js';
import { processPaymentSchema } from '../../middleware/validation.js';

const router = Router();
const paymentController = new PaymentController();

// All routes require authentication
router.use(authenticate);

// POST /api/payments/process
router.post('/process', validate(processPaymentSchema), paymentController.processPayment);

// GET /api/payments/my-payments
router.get('/my-payments', paymentController.getUserPayments);

// GET /api/payments/receipt/:transactionId
router.get('/receipt/:transactionId', paymentController.getPaymentReceipt);

export default router;
