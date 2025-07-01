// src/notification/dto/create-notification.input.ts
import { InputType, Field, ID } from '@nestjs/graphql';

// create-notification.input.ts
@InputType()
export class CreateNotificationInput {
  @Field()
  message: string;

  @Field(() => [ID], { nullable: true })
  recipients?: string[];

}

