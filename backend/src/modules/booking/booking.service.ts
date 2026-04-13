import prisma from '../../database/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';
import { Prisma } from '@prisma/client';

export class BookingService {
  async createBooking(
    renterId: string,
    itemId: string,
    startDate: string,
    endDate: string
  ) {
    // Get item details
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new AppError('Item not found', 404);
    }

    if (!item.isAvailable) {
      throw new AppError('Item is not available for booking', 400);
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      throw new AppError('End date must be after start date', 400);
    }

    if (start < new Date()) {
      throw new AppError('Start date cannot be in the past', 400);
    }

    // Check item availability dates
    if (item.availableFrom && start < new Date(item.availableFrom)) {
      throw new AppError('Booking start date is before item availability', 400);
    }

    if (item.availableTo && end > new Date(item.availableTo)) {
      throw new AppError('Booking end date is after item availability', 400);
    }

    // Check for overlapping bookings (prevent double booking)
    const overlappingBooking = await prisma.booking.findFirst({
      where: {
        itemId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          {
            AND: [
              { startDate: { lte: start } },
              { endDate: { gte: start } },
            ],
          },
          {
            AND: [
              { startDate: { lte: end } },
              { endDate: { gte: end } },
            ],
          },
          {
            AND: [
              { startDate: { gte: start } },
              { endDate: { lte: end } },
            ],
          },
        ],
      },
    });

    if (overlappingBooking) {
      throw new AppError('Item is already booked for the selected dates', 409);
    }

    // Calculate total price
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = new Prisma.Decimal(item.pricePerDay).mul(days);

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        itemId,
        renterId,
        ownerId: item.ownerId,
        startDate: start,
        endDate: end,
        totalPrice,
        status: 'PENDING',
      },
      include: {
        item: {
          select: {
            name: true,
            pricePerDay: true,
          },
        },
      },
    });

    return booking;
  }

  async getBookingById(bookingId: string, userId: string) {
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        OR: [{ renterId: userId }, { ownerId: userId }],
      },
      include: {
        item: true,
        renter: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        payments: true,
      },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    return booking;
  }

  async getUserBookings(userId: string, role: 'RENTER' | 'OWNER', page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const where = role === 'RENTER' 
      ? { renterId: userId }
      : { ownerId: userId };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          item: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              pricePerDay: true,
            },
          },
          ...(role === 'RENTER'
            ? {
                owner: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              }
            : {
                renter: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              }),
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateBookingStatus(
    bookingId: string,
    userId: string,
    role: string,
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  ) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Verify user is the owner or renter
    if (role === 'OWNER' && booking.ownerId !== userId) {
      throw new AppError('You do not have permission to update this booking', 403);
    }

    if (role === 'RENTER' && booking.renterId !== userId) {
      throw new AppError('You do not have permission to update this booking', 403);
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED'],
      CANCELLED: [],
      COMPLETED: [],
    };

    if (!validTransitions[booking.status].includes(status)) {
      throw new AppError(
        `Cannot transition from ${booking.status} to ${status}`,
        400
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    return updatedBooking;
  }
}
