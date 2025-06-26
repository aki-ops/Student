// src/common/enums/user-role.enum.ts
export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}

import { registerEnumType } from '@nestjs/graphql';

registerEnumType(UserRole, {
  name: 'UserRole', // tên enum trong schema GraphQL
  description: 'User roles in the system',
});
