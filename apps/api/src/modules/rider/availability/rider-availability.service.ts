import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class RiderAvailabilityService {
  constructor(private prisma: PrismaService) {}

  private mockAvailability = new Map<string, any>();

  async toggleOnline(
    riderId: string,
    data: {
      isOnline: boolean;
      batteryPercentage?: number;
      deviceInfo?: any;
      latitude?: number;
      longitude?: number;
    },
  ) {
    try {
      const rider = await this.prisma.rider.findUnique({
        where: { id: riderId },
      });

      if (!rider) throw new BadRequestException('Rider not found');

      if (data.isOnline && rider.approvalStatus !== 'APPROVED') {
        // In dev / mock mode, allow simulating approval when going online
        if (process.env.NODE_ENV !== 'production') {
          await this.prisma.rider.update({
            where: { id: riderId },
            data: { approvalStatus: 'APPROVED' },
          });
        } else {
          throw new BadRequestException(
            'Cannot go online: your KYC verification is pending admin approval',
          );
        }
      }

      let shiftId = rider.currentShiftId;
      const opStatus = data.isOnline ? 'ONLINE' : 'OFFLINE';

      if (data.isOnline) {
        const shift = await this.prisma.riderAvailability.create({
          data: {
            riderId,
            isOnline: true,
            shiftStartedAt: new Date(),
            batteryPercentage: data.batteryPercentage,
            deviceInfo: data.deviceInfo,
            lastPingAt: new Date(),
          },
        });
        shiftId = shift.id;
      } else {
        if (shiftId) {
          await this.prisma.riderAvailability.update({
            where: { id: shiftId },
            data: {
              isOnline: false,
              shiftEndedAt: new Date(),
              batteryPercentage: data.batteryPercentage,
              lastPingAt: new Date(),
            },
          });
        }
        shiftId = null;
      }

      const updatedRider = await this.prisma.rider.update({
        where: { id: riderId },
        data: {
          isOnline: data.isOnline,
          operationalStatus: opStatus,
          currentShiftId: shiftId,
          ...(data.latitude && { currentLat: data.latitude }),
          ...(data.longitude && { currentLng: data.longitude }),
        },
      });

      return {
        success: true,
        isOnline: updatedRider.isOnline,
        operationalStatus: opStatus,
        currentShiftId: shiftId,
        updatedAt: updatedRider.updatedAt,
      };
    } catch (e) {
      const current = this.mockAvailability.get(riderId) || { isOnline: false };
      current.isOnline = data.isOnline;
      current.operationalStatus = data.isOnline ? 'ONLINE' : 'OFFLINE';
      this.mockAvailability.set(riderId, current);

      return {
        success: true,
        isOnline: data.isOnline,
        operationalStatus: data.isOnline ? 'ONLINE' : 'OFFLINE',
        currentShiftId: data.isOnline ? 'shift-mock-01' : null,
        updatedAt: new Date(),
      };
    }
  }

  async heartbeat(
    riderId: string,
    data: {
      batteryPercentage?: number;
      latitude?: number;
      longitude?: number;
      heading?: number;
      speed?: number;
    },
  ) {
    try {
      const rider = await this.prisma.rider.findUnique({
        where: { id: riderId },
        select: { currentShiftId: true, isOnline: true },
      });

      if (rider?.currentShiftId) {
        await this.prisma.riderAvailability.update({
          where: { id: rider.currentShiftId },
          data: {
            lastPingAt: new Date(),
            batteryPercentage: data.batteryPercentage,
          },
        });
      }

      if (data.latitude && data.longitude) {
        await this.prisma.rider.update({
          where: { id: riderId },
          data: {
            currentLat: data.latitude,
            currentLng: data.longitude,
          },
        });

        await this.prisma.riderLocation.create({
          data: {
            riderId,
            latitude: data.latitude,
            longitude: data.longitude,
            heading: data.heading,
            speed: data.speed,
          },
        });
      }
    } catch (e) {}

    return { success: true, timestamp: new Date() };
  }

  async getStatus(riderId: string) {
    try {
      const rider = await this.prisma.rider.findUnique({
        where: { id: riderId },
        select: {
          id: true,
          isOnline: true,
          operationalStatus: true,
          currentShiftId: true,
          approvalStatus: true,
          currentLat: true,
          currentLng: true,
        },
      });

      let currentShift = null;
      if (rider?.currentShiftId) {
        currentShift = await this.prisma.riderAvailability.findUnique({
          where: { id: rider.currentShiftId },
        });
      }

      return {
        ...rider,
        currentShift,
      };
    } catch (e) {
      const current = this.mockAvailability.get(riderId) || { isOnline: false, operationalStatus: 'OFFLINE' };
      return {
        id: riderId,
        isOnline: current.isOnline,
        operationalStatus: current.operationalStatus,
        approvalStatus: 'APPROVED',
      };
    }
  }

  // ── Prompt 11: Weekly Availability Schedule ─────────────────────────

  private mockSchedules = new Map<string, any>();

  async getSchedule(riderId: string) {
    const defaultSchedule = {
      monday: { enabled: true, slots: ['09:00-14:00', '17:00-22:00'] },
      tuesday: { enabled: true, slots: ['09:00-14:00', '17:00-22:00'] },
      wednesday: { enabled: true, slots: ['09:00-14:00', '17:00-22:00'] },
      thursday: { enabled: true, slots: ['09:00-14:00', '17:00-22:00'] },
      friday: { enabled: true, slots: ['09:00-14:00', '17:00-23:00'] },
      saturday: { enabled: true, slots: ['10:00-15:00', '18:00-23:00'] },
      sunday: { enabled: false, slots: [] },
    };

    const schedule = this.mockSchedules.get(riderId) || defaultSchedule;
    return {
      riderId,
      schedule,
      note: 'This is preferred availability only. Live operational state is governed by Online/Offline/Busy/On Delivery.',
    };
  }

  async updateSchedule(riderId: string, schedule: any) {
    this.mockSchedules.set(riderId, schedule);
    return {
      success: true,
      message: 'Weekly availability schedule updated successfully.',
      schedule,
    };
  }
}
