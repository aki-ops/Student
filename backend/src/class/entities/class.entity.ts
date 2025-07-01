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
  @Field(() => String)
  subject: string;

  @Prop()
  @Field()
  className: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @Field(() => User, { nullable: true })
  teacher: User;

  @Prop()
  @Field(() => ID)
  teacherId: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User' })
  @Field(() => [User], { nullable: true })
  students: User[];

  @Prop({ type: [String] })
  @Field(() => [ID])
  studentIds: string[];
  
}



export const ClassSchema = SchemaFactory.createForClass(Class);
