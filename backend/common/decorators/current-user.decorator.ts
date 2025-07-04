// current-user.decorator.ts
import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

interface UserContext {
  id: string;
  username: string;
  role: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserContext => {
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req?.user;

    if (!user) {
      throw new UnauthorizedException('User not found in context');
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
    };
  },
);
