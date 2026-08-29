import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '@/database/prisma.service';
import { SETTLEMENT_QUEUE, JOB_PROCESS_SETTLEMENT } from '@/queue/queue.constants';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

@Injectable()
export class SettlementsService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue(SETTLEMENT_QUEUE) private settlementQueue: Queue,
  ) {}

  async findAll(query: PaginationQueryDto) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      this.prisma.settlement.count(),
      this.prisma.settlement.findMany({
        skip,
        take: limit,
        include: { vendor: { select: { id: true, businessName: true, ownerName: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async triggerSettlement(settlementId: string) {
    await this.settlementQueue.add(JOB_PROCESS_SETTLEMENT, { settlementId });
    return { queued: true, settlementId, message: 'Settlement job scheduled' };
  }
}
