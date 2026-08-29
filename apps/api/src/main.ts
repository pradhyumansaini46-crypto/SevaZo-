import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('SevazoAdminAPI');
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  });

  // Global API Prefix
  const globalPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(globalPrefix);

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Interceptor & Exception Filter
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Sevazo Admin API')
    .setDescription(
      'Sevazo Unified Commerce & Logistics Platform — Admin Management API documentation for managing users, catalog, orders, deliveries, finances, marketing, support, and analytics.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter admin JWT token',
        in: 'header',
      },
      'bearer',
    )
    .addTag('Admin Auth', 'Authentication and profile management')
    .addTag('Admin Users', 'Staff and internal administrator management')
    .addTag('Roles', 'RBAC roles and access matrices')
    .addTag('Permissions', 'System-wide granular permissions')
    .addTag('Customer Management', 'Customer accounts, addresses, and order history')
    .addTag('Vendor Management', 'Store management, KYC documents, and approval workflows')
    .addTag('Rider Management', 'Delivery rider fleet, verification, and live tracking')
    .addTag('Categories', 'Hierarchical category tree management')
    .addTag('Brands', 'Product brand catalogs')
    .addTag('Product Management', 'Product approval queue, catalog, and inventory')
    .addTag('Order Management', 'Lifecycle states, order fulfillment, and cancellation')
    .addTag('Delivery Management', 'Dispatch jobs, live rider assignments, and delivery zones')
    .addTag('Payment Management', 'Transaction logs and gateway reconciliation')
    .addTag('Refund Management', 'Customer refund requests and approvals')
    .addTag('Settlement Management', 'Automated and manual vendor payout batches')
    .addTag('Commission Management', 'Vendor commission rates and platform earnings ledger')
    .addTag('Coupons', 'Promotional discounts and coupon usage limits')
    .addTag('Promotions & Banners', 'Marketing campaigns and app banners')
    .addTag('Support & Disputes', 'Customer support tickets and commerce disputes')
    .addTag('Analytics', 'Executive dashboard metrics and time-series telemetry')
    .addTag('Audit Logs', 'Platform administrative activity audit logs')
    .addTag('Platform Settings', 'Global commerce and logistics system parameters')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Sevazo Admin API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
    },
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`🚀 Sevazo Admin API listening on http://localhost:${port}/${globalPrefix}`);
  logger.log(`📚 Swagger Documentation active at http://localhost:${port}/api/docs`);
}

bootstrap();
