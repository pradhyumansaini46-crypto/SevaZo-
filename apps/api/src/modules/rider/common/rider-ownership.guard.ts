import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

/**
 * Point 48: Rider Security — Ownership Guard
 * 
 * Ensures that the authenticated rider can ONLY access their own resources.
 * Rider RID-1001 must NEVER access RID-1002's documents, bank, profile, deliveries, or earnings.
 * 
 * Usage: Apply @UseGuards(RiderAuthGuard, RiderOwnershipGuard) on any controller
 * that accesses rider-specific resources via :riderId param.
 */
@Injectable()
export class RiderOwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authenticatedRider = request.rider;
    const paramRiderId = request.params?.riderId;

    // If no :riderId param in route, ownership check is not applicable
    if (!paramRiderId) {
      return true;
    }

    // Authenticated rider must match the resource owner
    if (authenticatedRider?.id !== paramRiderId) {
      throw new ForbiddenException(
        'Access denied. You can only access your own resources.',
      );
    }

    return true;
  }
}
