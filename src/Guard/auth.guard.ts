import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    try {
      const token = request.headers.token;
      // console.log(token);
      const decoded = jwt.verify(token, 'secret');
      console.log('decoded', decoded);
      const user = await User.findOne({ where: { id: decoded.id } });
      console.log(user);
      if (user) {
        request.authUser = user;
        return true;
      }
    } catch (err) {
      // err
      throw new UnauthorizedException();
    }
  }
}
