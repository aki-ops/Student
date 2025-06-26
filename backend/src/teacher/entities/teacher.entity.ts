// src/student/entities/student.entity.ts
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@ObjectType()
@Schema()
export class Teacher extends Document {
  @Field(() => ID)
  declare _id: string;

  @Prop({ required: true })
  @Field()
  fullName: string;

  @Prop()
  @Field()
  birthDate: string;
}

export const TeacherSchema = SchemaFactory.createForClass(Teacher);
