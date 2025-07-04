import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateUserInput {

  @Field(() => String, { nullable: true })
  refreshToken?: string | null;
}
