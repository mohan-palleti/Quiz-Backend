import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Query,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/Guard/auth.guard';
import * as jwt from 'jsonwebtoken';
import { createQuizSchema } from 'src/joi-schema/joi-schema';

import { QuizService } from './quiz.service';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @UseGuards(AuthGuard)
  @Post()
  createQuiz(@Body() body: any, @Req() request: Request) {
    const token = request.headers?.token;

    const decoded = jwt.verify(token, 'secret');
    const id = decoded.id;
    body = { ...body, user: id };
    const { error } = createQuizSchema.validate(body);
    if (error) {
      throw new HttpException(error.message, HttpStatus.NOT_ACCEPTABLE);
    }

    return this.quizService.createQuiz(body);
  }

  @Get()
  findAll(@Query() { page, limit }: { page: number; limit: number }) {
    // console.log(page);
    return this.quizService.getAll(+page, +limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizService.getOneById(id);
  }

  @Get('permaLink/:id')
  findByLink(@Param('id') id: string) {
    return this.quizService.getOnePermaLink(id);
  }

  @Post('score/:permalink')
  getScore(@Param('permalink') permalink: string, @Body() body: any) {
    return this.quizService.getScore(permalink, body);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.quizService.updatebyID(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quizService.deleteQuiz(id);
  }
}
