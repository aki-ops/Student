// src/notification/entities/notification.entity.ts
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
@ObjectType()
export class Notification extends Document {
  @Field(() => ID, { name: 'id' })
  declare readonly id: string;

  @Prop()
  @Field()
  message: string;

  @Prop({ type: String })
  @Field(() => ID)
  sender: string;

  @Prop({ type: [String] })
  @Field(() => [ID])
  recipients: string[];

  @Prop()
  @Field()
  createdAt: Date;

  @Prop({ type: [String], default: [] })
  @Field(() => [ID], { defaultValue: [] })
  readBy: string[];

  @Prop({ default: false })
  @Field({ defaultValue: false })
  isRead: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
