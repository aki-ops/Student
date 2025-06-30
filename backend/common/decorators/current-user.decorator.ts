// current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';


export const CurrentUser = createParamDecorator(
  async (_data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user;


    return {
      id: user.id,
      username: user.username,
      role: user.role,
    };
  },
);
