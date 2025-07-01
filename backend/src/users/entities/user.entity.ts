import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../../../common/enums/user-role.enum';


@ObjectType()
@Schema()
export class User extends Document {
  @Field(() => ID)
  declare readonly id: string

  @Prop({ required: true, unique: true })
  @Field()
  username: string;
  
  @Prop({ required: false })
  @Field({ nullable: true })
  fullName?: string;

  @Prop({ required: true })
  @Field()
  password: string;

  @Prop({ enum: UserRole, required: true })
  @Field()
  role: UserRole;

  @Prop({ type: [{ type: 'ObjectId', ref: 'Class' }] })
  @Field(() => [ID])
  classes: string[];

}

@ObjectType()
export class LoginResponse {
  @Field()
  access_token: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
