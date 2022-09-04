import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/Guard/auth.guard';
import { createQuestionSchema } from 'src/joi-schema/joi-schema';

import { QuestionService } from './question.service';

@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @UseGuards(AuthGuard)
  @Post()
  createQuestion(@Body() body: any) {
    const { value, error } = createQuestionSchema.validate(body);
    if (error) {
      throw new HttpException(error.message, HttpStatus.NOT_ACCEPTABLE);
    }

    return this.questionService.createQuestion(body);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.questionService.getOneById(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.questionService.updatebyID(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionService.deleteUser(id);
  }
}
