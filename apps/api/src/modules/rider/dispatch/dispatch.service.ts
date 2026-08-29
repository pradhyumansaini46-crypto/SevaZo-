import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

export interface RiderCandidateScore {
  riderId: string;
  distanceKm: number;
  etaMinutes: number;
  distanceScore: number;
  etaScore: number;
  availabilityScore: number;
  zoneScore: number;
  totalScore: number;
  breakdown: {
    distance_score: number;
    eta_score: number;
    availability_score: number;
    zone_score: number;
  };
}

@Injectable()
export class DispatchService {
  private logger = new Logger(DispatchService.name);

  constructor(private prisma: PrismaService) {}

  // 1. Haversine distance formula in kilometers
  private calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
  }

  // 2. Estimate ETA in minutes (assuming average urban speed 25 km/h + 3 min buffer)
  private calculateEtaMinutes(distanceKm: number): number {
    const avgSpeedKmh = 25;
    const travelTimeMinutes = (distanceKm / avgSpeedKmh) * 60;
    return Math.round(travelTimeMinutes + 3);
  }

  // 3. V1 Multi-Factor Scoring Algorithm:
  // score = distance_score + eta_score + availability_score + zone_score
  calculateRiderScore(
    rider: any,
    storeLat: number,
    storeLng: number,
    storeZoneId?: string | null,
  ): RiderCandidateScore {
    const riderLat = rider.currentLat || 28.6139;
    const riderLng = rider.currentLng || 77.209;

    const distanceKm = this.calculateDistanceKm(storeLat, storeLng, riderLat, riderLng);
    const etaMinutes = this.calculateEtaMinutes(distanceKm);

    // Factor 1: Distance Score (Max 35 points: 0km -> 35pts, 10km+ -> 0pts)
    const distanceScore = Math.max(0, parseFloat((35 * (1 - distanceKm / 10)).toFixed(2)));

    // Factor 2: ETA Score (Max 25 points: <=3 mins -> 25pts, 25+ mins -> 0pts)
    const etaScore = Math.max(0, parseFloat((25 * (1 - etaMinutes / 25)).toFixed(2)));

    // Factor 3: Availability & Fleet Health Score (Max 25 points)
    let availabilityScore = 0;
    const activeOrders = rider._count?.deliveries || 0;
    if (activeOrders === 0) availabilityScore += 15;
    else if (activeOrders === 1) availabilityScore += 5;

    const battery = rider.availabilityLogs?.[0]?.batteryPercentage ?? 80;
    if (battery >= 50) availabilityScore += 5;
    else if (battery >= 20) availabilityScore += 2;

    const acceptanceRate = Number(rider.acceptanceRate) || 100;
    availabilityScore += parseFloat(((acceptanceRate / 100) * 5).toFixed(2));

    // Factor 4: Zone & Vehicle Alignment Score (Max 15 points)
    let zoneScore = 0;
    if (storeZoneId && rider.zoneId === storeZoneId) {
      zoneScore += 10;
    } else {
      zoneScore += 5; // Default nearby area coverage
    }

    if (rider.vehicleType === 'BIKE' || rider.vehicleType === 'SCOOTER' || rider.vehicleType === 'ELECTRIC_VEHICLE') {
      zoneScore += 5;
    }

    const totalScore = parseFloat(
      (distanceScore + etaScore + availabilityScore + zoneScore).toFixed(2),
    );

    return {
      riderId: rider.id,
      distanceKm,
      etaMinutes,
      distanceScore,
      etaScore,
      availabilityScore,
      zoneScore,
      totalScore,
      breakdown: {
        distance_score: distanceScore,
        eta_score: etaScore,
        availability_score: availabilityScore,
        zone_score: zoneScore,
      },
    };
  }

  // 4. Dispatch Flow: Find Online Riders -> Check Zone & Vehicle -> Distance & ETA -> Rank -> Offer Job
  async dispatchDelivery(deliveryId: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        order: {
          include: {
            vendor: { include: { addresses: true } },
            deliveryAddress: true,
          },
        },
      },
    });

    if (!delivery) {
      this.logger.error(`Delivery ${deliveryId} not found for dispatch`);
      return null;
    }

    const vendorAddress = delivery.order.vendor.addresses[0];
    const storeLat = vendorAddress?.latitude || 28.6139;
    const storeLng = vendorAddress?.longitude || 77.209;
    const storeZoneId = delivery.zoneId;

    // Step 1: Find Online & Approved active riders
    const onlineRiders = await this.prisma.rider.findMany({
      where: {
        isOnline: true,
        approvalStatus: 'APPROVED',
        status: 'ACTIVE',
        currentLat: { not: null },
        currentLng: { not: null },
      },
      include: {
        availabilityLogs: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            deliveries: {
              where: {
                status: {
                  in: [
                    'RIDER_ACCEPTED',
                    'RIDER_AT_VENDOR',
                    'PICKUP_VERIFIED',
                    'PICKED_UP',
                    'IN_TRANSIT',
                    'RIDER_AT_CUSTOMER',
                  ],
                },
              },
            },
          },
        },
      },
    });

    // Step 2 & 3: Filter candidates by active load capacity (< 2 active trips)
    const availableCandidates = onlineRiders.filter(
      (r) => r._count.deliveries < 2,
    );

    if (availableCandidates.length === 0) {
      this.logger.warn(`No candidate riders available for delivery ${deliveryId}`);
      await this.prisma.delivery.update({
        where: { id: deliveryId },
        data: { status: 'PENDING_ASSIGNMENT' },
      });
      return { success: false, message: 'No available riders nearby' };
    }

    // Step 4, 5 & 6: Calculate scores for each candidate
    const scoredCandidates = availableCandidates.map((rider) =>
      this.calculateRiderScore(rider, storeLat, storeLng, storeZoneId),
    );

    // Step 7: Rank candidates descending by totalScore
    scoredCandidates.sort((a, b) => b.totalScore - a.totalScore);

    const topCandidate = scoredCandidates[0];
    const expireAt = new Date(Date.now() + 30 * 1000); // 30s timeout

    // Step 8: Offer Job -> Create DeliveryAssignment with ASSIGNMENT_OFFERED state
    const assignment = await this.prisma.deliveryAssignment.create({
      data: {
        deliveryId,
        riderId: topCandidate.riderId,
        status: 'OFFERED',
        expireAt,
      },
    });

    // Transition delivery state to ASSIGNMENT_OFFERED
    await this.prisma.delivery.update({
      where: { id: deliveryId },
      data: { status: 'ASSIGNMENT_OFFERED' },
    });

    // Audit status history
    await this.prisma.deliveryStatusHistory.create({
      data: {
        deliveryId,
        fromStatus: 'PENDING_ASSIGNMENT',
        toStatus: 'ASSIGNMENT_OFFERED',
        changedBy: 'SYSTEM',
        notes: `Delivery offered to Rider ${topCandidate.riderId} (Score: ${topCandidate.totalScore}, Distance: ${topCandidate.distanceKm} km, ETA: ${topCandidate.etaMinutes} mins)`,
      },
    });

    this.logger.log(
      `Job offered for Delivery ${deliveryId} -> Rider ${topCandidate.riderId} | Score: ${topCandidate.totalScore} (Dist: ${topCandidate.distanceScore}, ETA: ${topCandidate.etaScore}, Avail: ${topCandidate.availabilityScore}, Zone: ${topCandidate.zoneScore})`,
    );

    return {
      success: true,
      assignmentId: assignment.id,
      offeredRiderId: topCandidate.riderId,
      topCandidateScore: topCandidate,
      rankedCandidatesCount: scoredCandidates.length,
    };
  }
}
