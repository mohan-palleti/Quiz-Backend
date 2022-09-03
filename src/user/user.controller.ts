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
    @Req() request: Request,
    @Query() { page, limit }: { page: number; limit: number },
  ) {
    const token = request.headers?.token;

    const decoded = jwt.verify(token, 'secret');
    const id = decoded.id;
    console.log(decoded);

    return this.userService.getOneById(id, +page, +limit);
  }
}
