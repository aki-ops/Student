import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateScoreInput {
  @Field()
  studentId: string;

  @Field()
  classId: string;

  @Field()
  subject: string;

  @Field(() => Number)
  score: number;
}

