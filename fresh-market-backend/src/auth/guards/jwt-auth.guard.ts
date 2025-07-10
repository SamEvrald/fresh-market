// src/auth/guards/jwt-auth.guard.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    // You can throw an exception based on "err" or "info" errors
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication failed. Please log in again.');
    }
    return user;
  }
}