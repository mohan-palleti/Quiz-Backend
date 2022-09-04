import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/user.entity';

export interface IAuth {
  authUser: User;
  token: string;
}
export const AuthDecor = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IAuth => {
    const request = ctx.switchToHttp().getRequest();
    const authUser = request.authUser;
    const token = request.headers.token;
    return { authUser, token };
  },
);
