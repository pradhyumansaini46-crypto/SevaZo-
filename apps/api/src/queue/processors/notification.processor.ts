import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { NOTIFICATION_QUEUE, JOB_SEND_ALERT } from '../queue.constants';

@Processor(NOTIFICATION_QUEUE)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Sending notification ${job.id}: ${job.name}`);
    if (job.name === JOB_SEND_ALERT) {
      const { recipient, title, message } = job.data;
      this.logger.log(`[ALERT] To: ${recipient} | ${title}: ${message}`);
      return { sent: true, at: new Date() };
    }
  }
}
