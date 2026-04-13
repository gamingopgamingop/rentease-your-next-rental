import prisma from '../../database/prisma.js';
import { Prisma } from '@prisma/client';

export interface PricingSuggestion {
  suggestedPrice: number;
  basePrice: number;
  demandMultiplier: number;
  locationMultiplier: number;
  categoryMultiplier: number;
  reasoning: string[];
}

export class SmartPricingService {
  // Base prices by category
  private basePrices: Record<string, number> = {
    TOOLS: 25,
    ELECTRONICS: 35,
    APPLIANCES: 30,
    VEHICLES: 75,
    SPORTS: 20,
    FURNITURE: 40,
    CLOTHING: 15,
    OTHER: 20,
  };

  // Demand multipliers (based on booking frequency)
  private demandMultipliers: Record<string, number> = {
    high: 1.4,
    medium: 1.2,
    low: 1.0,
  };

  // Location multipliers (metro areas have higher prices)
  private locationMultipliers: Record<string, number> = {
    'new york': 1.5,
    'san francisco': 1.5,
    'los angeles': 1.4,
    'chicago': 1.3,
    'boston': 1.3,
    'seattle': 1.3,
    'miami': 1.2,
    'denver': 1.2,
    'austin': 1.2,
  };

  async suggestPrice(
    category: string,
    location?: string
  ): Promise<PricingSuggestion> {
    const reasoning: string[] = [];

    // 1. Get base price for category
    const basePrice = this.basePrices[category] || this.basePrices.OTHER;
    reasoning.push(`Base price for ${category}: $${basePrice}/day`);

    // 2. Calculate demand multiplier
    const demandLevel = await this.calculateDemand(category);
    const demandMultiplier = this.demandMultipliers[demandLevel];
    reasoning.push(
      `Demand level: ${demandLevel} (${demandMultiplier}x multiplier)`
    );

    // 3. Calculate location multiplier
    const locationMultiplier = this.calculateLocationMultiplier(location);
    if (locationMultiplier > 1.0) {
      reasoning.push(
        `Premium location detected: ${locationMultiplier}x multiplier`
      );
    } else {
      reasoning.push('Standard location pricing');
    }

    // 4. Calculate category popularity modifier
    const categoryMultiplier = await this.getCategoryPopularity(category);
    if (categoryMultiplier > 1.0) {
      reasoning.push(
        `High category demand: ${categoryMultiplier}x multiplier`
      );
    }

    // 5. Calculate final suggested price
    const suggestedPrice = Math.round(
      basePrice * demandMultiplier * locationMultiplier * categoryMultiplier
    );

    return {
      suggestedPrice,
      basePrice,
      demandMultiplier,
      locationMultiplier,
      categoryMultiplier,
      reasoning,
    };
  }

  private async calculateDemand(
    category: string
  ): Promise<'high' | 'medium' | 'low'> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Count bookings for this category in last 30 days
    const bookingCount = await prisma.booking.count({
      where: {
        item: {
          category: category as any,
        },
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Determine demand level
    if (bookingCount > 50) return 'high';
    if (bookingCount > 20) return 'medium';
    return 'low';
  }

  private calculateLocationMultiplier(location?: string): number {
    if (!location) return 1.0;

    const normalizedLocation = location.toLowerCase();

    // Check if location matches any premium area
    for (const [key, multiplier] of Object.entries(this.locationMultipliers)) {
      if (normalizedLocation.includes(key)) {
        return multiplier;
      }
    }

    return 1.0;
  }

  private async getCategoryPopularity(category: string): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get total items in category
    const totalItems = await prisma.item.count({
      where: { category: category as any },
    });

    // Get booked items in category
    const bookedItems = await prisma.item.count({
      where: {
        category: category as any,
        bookings: {
          some: {
            createdAt: {
              gte: thirtyDaysAgo,
            },
          },
        },
      },
    });

    // Calculate booking rate
    if (totalItems === 0) return 1.0;
    const bookingRate = bookedItems / totalItems;

    // Higher booking rate = higher demand
    if (bookingRate > 0.6) return 1.3;
    if (bookingRate > 0.3) return 1.15;
    return 1.0;
  }

  // Get pricing analytics for owner
  async getPricingAnalytics(ownerId: string) {
    const items = await prisma.item.findMany({
      where: { ownerId },
      include: {
        bookings: {
          where: {
            status: 'COMPLETED',
          },
        },
      },
    });

    const analytics = items.map((item) => {
      const totalRevenue = item.bookings.reduce(
        (sum, booking) => sum + Number(booking.totalPrice),
        0
      );
      const bookingCount = item.bookings.length;
      const utilizationRate =
        bookingCount > 0
          ? Math.min((bookingCount / 30) * 100, 100)
          : 0;

      return {
        itemId: item.id,
        itemName: item.name,
        currentPrice: Number(item.pricePerDay),
        totalRevenue,
        bookingCount,
        utilizationRate: utilizationRate.toFixed(1) + '%',
        suggestedPrice: this.suggestOptimalPrice(
          item.category,
          item.location || '',
          utilizationRate
        ),
      };
    });

    return analytics;
  }

  private suggestOptimalPrice(
    category: string,
    location: string,
    utilizationRate: number
  ): number {
    const basePrice = this.basePrices[category] || this.basePrices.OTHER;
    const locationMultiplier = this.calculateLocationMultiplier(location);

    // If utilization is high, suggest higher price
    // If utilization is low, suggest lower price to attract more bookings
    let utilizationMultiplier = 1.0;
    if (utilizationRate > 70) utilizationMultiplier = 1.2;
    else if (utilizationRate > 50) utilizationMultiplier = 1.1;
    else if (utilizationRate < 20) utilizationMultiplier = 0.85;
    else if (utilizationRate < 30) utilizationMultiplier = 0.9;

    return Math.round(
      basePrice * this.demandMultipliers.medium * locationMultiplier * utilizationMultiplier
    );
  }
}
