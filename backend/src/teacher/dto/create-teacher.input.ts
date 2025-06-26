import { InputType, Int, Field } from '@nestjs/graphql';
import { UserRole } from 'common/enums/user-role.enum';


@InputType()
export class CreateTeacherWithUserInput {
  @Field() fullName: string;
  @Field() birthDate: string;

  // User login info
  @Field() username: string;
  @Field() password: string;
}