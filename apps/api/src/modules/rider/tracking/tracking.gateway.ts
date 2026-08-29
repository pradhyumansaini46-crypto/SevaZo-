import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { RiderLocationService, RiderGpsPingDto } from '../location/rider-location.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/tracking',
})
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger(TrackingGateway.name);

  constructor(private locationService: RiderLocationService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Realtime client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Realtime client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_delivery')
  handleJoinDelivery(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { deliveryId: string },
  ) {
    if (!data?.deliveryId) return { success: false, error: 'Missing deliveryId' };
    const room = `delivery:${data.deliveryId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
    return { success: true, room };
  }

  @SubscribeMessage('leave_delivery')
  handleLeaveDelivery(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { deliveryId: string },
  ) {
    if (!data?.deliveryId) return { success: false };
    const room = `delivery:${data.deliveryId}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} left room ${room}`);
    return { success: true, room };
  }

  @SubscribeMessage('rider_location_ping')
  async handleRiderLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: RiderGpsPingDto,
  ) {
    const riderId = payload.rider_id || payload.riderId || (client as any).riderId;
    if (!riderId || !payload.latitude || !payload.longitude) {
      return { success: false, error: 'Invalid location payload' };
    }

    // 1. Ingest into fast Redis / In-memory location store
    const ingestResult = await this.locationService.ingestGpsPing(riderId, payload);

    // 2. Broadcast to delivery tracking room if deliveryId is attached
    const deliveryId = payload.delivery_id || payload.deliveryId;
    if (deliveryId) {
      this.server.to(`delivery:${deliveryId}`).emit('location_update', {
        deliveryId,
        riderId,
        latitude: payload.latitude,
        longitude: payload.longitude,
        heading: payload.heading,
        speed: payload.speed,
        accuracy: payload.accuracy,
        timestamp: payload.timestamp || Date.now(),
      });
    }

    return { success: true, cached: ingestResult.cachedInRedis };
  }

  // Method to broadcast delivery status updates from backend controllers/services
  broadcastStatusChange(deliveryId: string, status: string, details?: any) {
    if (!this.server) return;
    this.server.to(`delivery:${deliveryId}`).emit('delivery_status_changed', {
      deliveryId,
      status,
      details,
      timestamp: new Date().toISOString(),
    });
  }
}
