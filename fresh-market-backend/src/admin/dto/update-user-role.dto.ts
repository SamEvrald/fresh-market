// src/admin/dto/update-user-role.dto.ts
import { IsEnum } from 'class-validator';
import { UserRole } from '../../common/entities/profile.entity'; // Import UserRole enum

export class UpdateUserRoleDto {
  @IsEnum(UserRole, { message: 'Invalid user role provided.' })
  role: UserRole;
}