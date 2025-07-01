import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateClassInput {
  @Field()
  className: string;

  @Field()
  subject: string;

  @Field({ nullable: true })
  teacherId?: string;
}