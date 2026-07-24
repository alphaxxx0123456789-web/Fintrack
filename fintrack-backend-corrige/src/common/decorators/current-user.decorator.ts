import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Injecte l'utilisateur authentifié (attaché par JwtStrategy) dans le handler.
 * Utilisation : findMine(@CurrentUser() user: AuthenticatedUser)
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
