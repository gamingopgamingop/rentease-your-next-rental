import { Response, NextFunction } from 'express';
import { BookingService } from './booking.service.js';
import { AuthRequest } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

const bookingService = new BookingService();

export class BookingController {
  createBooking = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const renterId = req.user!.id;
    const { itemId, startDate, endDate } = req.body;

    const booking = await bookingService.createBooking(
      renterId,
      itemId,
      startDate,
      endDate
    );

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
    });
  });

  getBookingById = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const booking = await bookingService.getBookingById(id, userId);

    res.status(200).json({
      success: true,
      message: 'Booking retrieved successfully',
      data: booking,
    });
  });

  getUserBookings = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const userRole = req.user!.role as 'RENTER' | 'OWNER';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await bookingService.getUserBookings(userId, userRole, page, limit);

    res.status(200).json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: result.bookings,
      pagination: result.pagination,
    });
  });

  updateBookingStatus = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { id } = req.params;
    const { status } = req.body;

    const booking = await bookingService.updateBookingStatus(id, userId, userRole, status);

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking,
    });
  });
}
