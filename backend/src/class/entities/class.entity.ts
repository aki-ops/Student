import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from '../../users/entities/user.entity';


@Schema()
@ObjectType()
export class Class extends Document {
  @Field(() => ID)
  declare id: string;

  @Prop()
  @Field()
  className: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @Field(() => User)
  teacherId: User;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User' })
  @Field(() => [User])
  studentIds: User[];
}



export const ClassSchema = SchemaFactory.createForClass(Class);
