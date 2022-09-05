import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';

import { Request, Response } from 'express';
import { AuthGuard } from 'src/Guard/auth.guard';
import * as jwt from 'jsonwebtoken';
import { createUserSchema } from 'src/joi-schema/joi-schema';
import { AuthDecor, IAuth } from 'src/Decor/AuthDecor';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  LoginUser(@Body() body: any, @Res({ passthrough: true }) response: Response) {
    return this.userService.loginUser(body, response);
  }

  @Post('register')
  createUser(@Body() body: any) {
    const { value, error } = createUserSchema.validate(body);
    if (error) {
      throw new HttpException(error.message, HttpStatus.NOT_ACCEPTABLE);
    }
    return this.userService.createUser(body);
  }

  @UseGuards(AuthGuard)
  @Get('quiz')
  findOne(
    @Query() { page, limit }: { page: number; limit: number },
    @AuthDecor() auth: IAuth,
  ) {
    const id = auth.authUser.id;

    return this.userService.getOneById(id, +page, +limit);
  }
}
