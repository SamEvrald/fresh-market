// src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../common/entities/profile.entity'; // Import UserRole enum
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No roles specified, access granted
    }

    const { user } = context.switchToHttp().getRequest();

    // Ensure user and user.profile exist and user.profile.role is available
    if (!user || !user.profile || !user.profile.role) {
      return false; // No user or role found on request
    }

    return requiredRoles.some((role) => user.profile.role === role);
  }
}