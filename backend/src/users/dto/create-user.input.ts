import { InputType, Int, Field } from '@nestjs/graphql';
import { UserRole } from 'common/enums/user-role.enum';

@InputType()
export class LoginInput {
  @Field()
  username: string;

  @Field()
  password: string;
}

@InputType()
export class CreateUserInput {
  @Field()
  fullName: string;

  @Field()
  username: string;

  @Field()
  password: string;

  @Field(() => UserRole)
  role: UserRole;

}

