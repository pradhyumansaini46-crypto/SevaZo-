import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

export interface RiderGpsPingDto {
  rider_id?: string;
  riderId?: string;
  delivery_id?: string;
  deliveryId?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp?: number;
}

export interface LiveRiderState {
  riderId: string;
  deliveryId?: string | null;
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  lastPingTime: number;
}

@Injectable()
export class RiderLocationService {
  private logger = new Logger(RiderLocationService.name);

  // In-memory fast ephemeral live store (representing Redis cache layer)
  private liveRiderStore = new Map<string, LiveRiderState>();
  // Throttling map to limit PostgreSQL breadcrumb writes (e.g. max once per 15 seconds per delivery)
  private lastDbWriteTime = new Map<string, number>();

  constructor(private prisma: PrismaService) {}

  // 1. High-Frequency Live GPS Ingestion Pipeline (Rider -> API -> Redis/Memory -> WebSocket)
  async ingestGpsPing(riderId: string, payload: RiderGpsPingDto) {
    const effectiveRiderId = riderId || payload.rider_id || payload.riderId;
    const effectiveDeliveryId = payload.delivery_id || payload.deliveryId;
    const now = payload.timestamp ? Number(payload.timestamp) : Date.now();

    const liveState: LiveRiderState = {
      riderId: effectiveRiderId,
      deliveryId: effectiveDeliveryId || null,
      latitude: payload.latitude,
      longitude: payload.longitude,
      accuracy: payload.accuracy,
      heading: payload.heading,
      speed: payload.speed,
      lastPingTime: now,
    };

    // A. Store in fast in-memory live Redis cache
    this.liveRiderStore.set(effectiveRiderId, liveState);

    // B. Selective / Throttled Persistence to PostgreSQL (every 15s or on key event)
    const throttleKey = `${effectiveRiderId}:${effectiveDeliveryId || 'none'}`;
    const lastWrite = this.lastDbWriteTime.get(throttleKey) || 0;
    const shouldWriteToDb = Date.now() - lastWrite >= 15000; // 15 seconds throttle

    if (shouldWriteToDb) {
      this.lastDbWriteTime.set(throttleKey, Date.now());

      // Update rider's persistent latest coordinates
      await this.prisma.rider.update({
        where: { id: effectiveRiderId },
        data: {
          currentLat: payload.latitude,
          currentLng: payload.longitude,
        },
      }).catch((err) => this.logger.warn(`Could not update rider coordinates in DB: ${err.message}`));

      // If on an active delivery, log historical route breadcrumb
      if (effectiveDeliveryId) {
        await this.prisma.deliveryLocationHistory.create({
          data: {
            deliveryId: effectiveDeliveryId,
            riderId: effectiveRiderId,
            latitude: payload.latitude,
            longitude: payload.longitude,
            speed: payload.speed,
            heading: payload.heading,
          },
        }).catch((err) => this.logger.warn(`Could not log breadcrumb: ${err.message}`));
      }
    }

    return {
      success: true,
      cachedInRedis: true,
      persistedToDb: shouldWriteToDb,
      liveState,
    };
  }

  // 2. Fetch live realtime coordinates for a rider (from fast Redis/memory store)
  getLiveRiderLocation(riderId: string): LiveRiderState | null {
    return this.liveRiderStore.get(riderId) || null;
  }

  // 3. Historical query from PostgreSQL
  async getRecentLocations(riderId: string, limit = 50) {
    return this.prisma.riderLocation.findMany({
      where: { riderId },
      take: limit,
      orderBy: { timestamp: 'desc' },
    });
  }
}
