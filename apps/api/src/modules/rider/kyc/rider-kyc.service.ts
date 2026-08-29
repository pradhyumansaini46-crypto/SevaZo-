import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class RiderKycService {
  constructor(private prisma: PrismaService) {}

  async getKycStatus(riderId: string) {
    const documents = await this.prisma.riderDocument.findMany({
      where: { riderId },
      orderBy: { createdAt: 'desc' },
    });

    const rider = await this.prisma.rider.findUnique({
      where: { id: riderId },
      select: { approvalStatus: true, rejectionReason: true },
    });

    const requiredTypes = [
      'AADHAAR_FRONT',
      'AADHAAR_BACK',
      'PAN',
      'DRIVING_LICENSE',
    ];

    const uploadedTypes = documents.map((d) => d.documentType);
    const missingTypes = requiredTypes.filter((t) => !uploadedTypes.includes(t));

    return {
      approvalStatus: rider?.approvalStatus || 'PENDING',
      rejectionReason: rider?.rejectionReason,
      isKycComplete: missingTypes.length === 0,
      missingTypes,
      documents,
    };
  }

  async uploadDocument(
    riderId: string,
    data: {
      type: string;
      documentNumber: string;
      fileUrl: string;
      fileKey?: string;
    },
  ) {
    if (!data.type || !data.documentNumber || !data.fileUrl) {
      throw new BadRequestException('Type, document number and file URL are required');
    }

    const existing = await this.prisma.riderDocument.findFirst({
      where: { riderId, documentType: data.type },
    });

    if (existing) {
      return this.prisma.riderDocument.update({
        where: { id: existing.id },
        data: {
          documentNumber: data.documentNumber,
          fileUrl: data.fileUrl,
          fileKey: data.fileKey || data.fileUrl,
          status: 'PENDING',
          verifiedAt: null,
          rejectionReason: null,
        },
      });
    }

    const doc = await this.prisma.riderDocument.create({
      data: {
        riderId,
        documentType: data.type,
        documentNumber: data.documentNumber,
        fileUrl: data.fileUrl,
        fileKey: data.fileKey || data.fileUrl,
        status: 'PENDING',
      },
    });

    // Update rider approval status to UNDER_REVIEW
    await this.prisma.rider.update({
      where: { id: riderId },
      data: { approvalStatus: 'UNDER_REVIEW' },
    });

    return doc;
  }
}
