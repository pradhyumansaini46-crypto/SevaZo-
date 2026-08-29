import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { SETTLEMENT_QUEUE, JOB_PROCESS_SETTLEMENT } from '../queue.constants';
import { PrismaService } from '@/database/prisma.service';

@Processor(SETTLEMENT_QUEUE)
export class SettlementProcessor extends WorkerHost {
  private readonly logger = new Logger(SettlementProcessor.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing settlement job ${job.id}: ${job.name}`);
    if (job.name === JOB_PROCESS_SETTLEMENT) {
      const { settlementId } = job.data;
      const settlement = await this.prisma.settlement.update({
        where: { id: settlementId },
        data: {
          status: 'SETTLED',
          settledAt: new Date(),
          bankReference: `TXN-SETTLE-${Date.now()}`,
        },
      });
      this.logger.log(`Settlement ${settlementId} successfully processed`);
      return settlement;
    }
  }
}
