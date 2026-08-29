import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class VendorDocumentService {
  constructor(private prisma: PrismaService) {}

  async listDocuments(vendorId: string) {
    const docs = await this.prisma.vendorDocument.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: docs,
    };
  }

  async generatePresignedUrl(
    vendorId: string,
    payload: { documentType: string; fileName: string; mimeType: string },
  ) {
    const cleanDoc = payload.documentType.toLowerCase();
    const fileKey = `vendors/${vendorId}/kyc/${cleanDoc}_${Date.now()}_${payload.fileName}`;
    const uploadUrl = `https://storage.sevazo.com/upload/${fileKey}?token=mock-presigned-token-2026`;

    return {
      success: true,
      fileKey,
      uploadUrl,
      publicUrl: `https://storage.sevazo.com/${fileKey}`,
      headers: {
        'Content-Type': payload.mimeType || 'application/pdf',
      },
    };
  }

  async completeUpload(
    vendorId: string,
    payload: {
      documentType: string;
      fileKey: string;
      fileUrl: string;
      documentNumber: string;
      documentExpiry?: string;
    },
  ) {
    const existing = await this.prisma.vendorDocument.findFirst({
      where: { vendorId, type: payload.documentType },
    });

    let doc;
    if (existing) {
      doc = await this.prisma.vendorDocument.update({
        where: { id: existing.id },
        data: {
          documentNumber: payload.documentNumber,
          fileKey: payload.fileKey,
          fileUrl: payload.fileUrl,
          status: 'UPLOADED',
          documentExpiry: payload.documentExpiry ? new Date(payload.documentExpiry) : null,
          verified: false,
          rejectionReason: null,
        },
      });
    } else {
      doc = await this.prisma.vendorDocument.create({
        data: {
          vendorId,
          type: payload.documentType,
          documentNumber: payload.documentNumber,
          fileKey: payload.fileKey,
          fileUrl: payload.fileUrl,
          status: 'UPLOADED',
          documentExpiry: payload.documentExpiry ? new Date(payload.documentExpiry) : null,
          verified: false,
        },
      });
    }

    return {
      success: true,
      data: doc,
    };
  }

  async uploadDocument(vendorId: string, dto: { type: string; documentNumber: string; fileUrl: string; fileKey?: string }) {
    return this.prisma.vendorDocument.create({
      data: {
        vendorId,
        type: dto.type,
        documentNumber: dto.documentNumber,
        fileUrl: dto.fileUrl,
        fileKey: dto.fileKey || `docs/${vendorId}/${dto.type.toLowerCase()}_${Date.now()}.pdf`,
        status: 'UPLOADED',
        verified: false,
      },
    });
  }

  async deleteDocument(vendorId: string, docId: string) {
    const doc = await this.prisma.vendorDocument.findFirst({
      where: { id: docId, vendorId },
    });
    if (!doc) throw new NotFoundException('Document not found');
    return this.prisma.vendorDocument.delete({ where: { id: docId } });
  }
}
