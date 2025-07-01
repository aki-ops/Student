// src/notification/entities/notification.entity.ts
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
@ObjectType()
export class Notification {
  @Field(() => ID)
  _id: string;

  @Prop()
  @Field()
  message: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @Field(() => ID)
  sender: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }] })
  @Field(() => [ID])
  recipients: string[];

  @Prop()
  @Field()
  createdAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
