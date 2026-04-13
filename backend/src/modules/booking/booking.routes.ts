import { Router } from 'express';
import { BookingController } from './booking.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validation.js';
import { createBookingSchema, updateBookingStatusSchema } from '../../middleware/validation.js';

const router = Router();
const bookingController = new BookingController();

// All routes require authentication
router.use(authenticate);

// POST /api/bookings
router.post('/', validate(createBookingSchema), bookingController.createBooking);

// GET /api/bookings/my-bookings
router.get('/my-bookings', bookingController.getUserBookings);

// GET /api/bookings/:id
router.get('/:id', bookingController.getBookingById);

// PUT /api/bookings/:id/status
router.put('/:id/status', validate(updateBookingStatusSchema), bookingController.updateBookingStatus);

export default router;
