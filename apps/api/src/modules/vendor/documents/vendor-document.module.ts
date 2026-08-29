import { Module } from '@nestjs/common';
import { VendorDocumentService } from './vendor-document.service';
import { VendorDocumentController } from './vendor-document.controller';
import { VendorAuthModule } from '../auth/vendor-auth.module';

@Module({
  imports: [VendorAuthModule],
  controllers: [VendorDocumentController],
  providers: [VendorDocumentService],
  exports: [VendorDocumentService],
})
export class VendorDocumentModule {}
