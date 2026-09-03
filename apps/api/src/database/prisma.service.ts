import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const resolveConnectionString = () =>
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.PRISMA_DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const connectionString = resolveConnectionString();
    if (connectionString && !process.env.DATABASE_URL) {
      process.env.DATABASE_URL = connectionString;
    }
    super(connectionString ? { datasourceUrl: connectionString } : undefined);
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Prisma client connected to database successfully.');
    } catch (error: any) {
      this.logger.warn(
        `Database connection could not be established immediately (${error.message}). Running in mock/standalone mode.`,
      );
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch (e) {
      // ignore
    }
  }
}
