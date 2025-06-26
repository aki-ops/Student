import { CreateScoreInput } from './create-score.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateScoreInput extends PartialType(CreateScoreInput) {
  @Field(() => Int)
  id: number;
}
