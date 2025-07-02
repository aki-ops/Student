import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { AttendanceStatus } from '../../../common/enums/attendance-status.enum';
import * as mongoose from 'mongoose';
import { Prop, Schema } from '@nestjs/mongoose';
import { SchemaFactory } from '@nestjs/mongoose';

@ObjectType()
@InputType('AttendanceRecordInput')
@Schema({_id : false})
export class AttendanceRecord {
  @Prop({ type: String }) // student
  @Field()
  studentId: string;

    @Prop({ required: true })
  @Field(() => AttendanceStatus)
  status: AttendanceStatus;
}

@ObjectType()
@InputType()
export class CreateAttendanceInput {
  @Field()
  classId: string;

  @Field()
  date: Date;

  @Field(() => [AttendanceRecord])
  records: AttendanceRecord[];
}

export const AttendanceRecordSchema = SchemaFactory.createForClass(AttendanceRecord);

