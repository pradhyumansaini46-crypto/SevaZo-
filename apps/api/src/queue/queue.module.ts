import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SETTLEMENT_QUEUE, NOTIFICATION_QUEUE } from './queue.constants';
import { SettlementProcessor } from './processors/settlement.processor';
import { NotificationProcessor } from './processors/notification.processor';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          password: config.get<string>('REDIS_PASSWORD') || undefined,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: SETTLEMENT_QUEUE },
      { name: NOTIFICATION_QUEUE },
    ),
  ],
  providers: [SettlementProcessor, NotificationProcessor],
  exports: [BullModule],
})
export class QueueModule {}
