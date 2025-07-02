import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AttendanceRecord } from '../dto/create-attendance.input';
import * as mongoose from 'mongoose';
import { AttendanceRecordSchema } from '../dto/create-attendance.input';

@Schema()
@ObjectType()
export class Attendance extends Document {
  @Field(() => ID, { name: 'id' })
  declare readonly id: string;

  @Prop({ type: String })
  @Field()
  classId: string;

  @Prop({ required: true })
  @Field()
  date: Date;

  @Prop({ type: [AttendanceRecordSchema], default: [] })
  @Field(() => [AttendanceRecord])
  records: AttendanceRecord[];
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
