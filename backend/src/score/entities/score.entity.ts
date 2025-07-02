import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

@Schema()
@ObjectType()
export class Score extends Document {
  @Field(() => ID, { name: 'id' })
  get scoreId(): string {
    return this._id ? this._id.toString() : '';
  }

  @Prop({ type: String }) // học sinh
  @Field()
  studentId: string;

  @Prop({ type: String }) // lớp học
  @Field()
  classId: string;

  @Prop()
  @Field()
  subject: string;

  @Prop()
  @Field(() => Int)
  score: number;
}

export const ScoreSchema = SchemaFactory.createForClass(Score);

