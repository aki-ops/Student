import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

@Schema()
@ObjectType()
export class Score extends Document {
  @Field(() => ID)
  declare id: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' }) // học sinh
  @Field()
  studentId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }) // lớp học
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

