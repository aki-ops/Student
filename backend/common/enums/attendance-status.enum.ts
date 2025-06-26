export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED',
}

import { registerEnumType } from '@nestjs/graphql';


registerEnumType(AttendanceStatus, {
  name: 'AttendanceStatus',
});
