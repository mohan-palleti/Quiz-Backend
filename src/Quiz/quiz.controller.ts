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
import { AuthGuard } from 'src/Guard/auth.guard';
import { createQuizSchema } from 'src/joi-schema/joi-schema';
import { QuizService } from './quiz.service';
import { AuthDecor, IAuth } from 'src/Decor/AuthDecor';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @UseGuards(AuthGuard)
  @Post()
  createQuiz(@Body() body: any, @AuthDecor() auth: IAuth) {
    const id = auth.authUser.id;
    body = { ...body, user: id };
    const { error } = createQuizSchema.validate(body);
    if (error) {
      throw new HttpException(error.message, HttpStatus.NOT_ACCEPTABLE);
    }
    const { question, ...quiz } = body;
    let noCorrectOption = 0;
    question.answerOptions.forEach((element) => {
      if (element.isCorrect === true) {
        noCorrectOption += 1;
      }
    });
    if (noCorrectOption === 0) {
      if (noCorrectOption === 0) {
        throw new HttpException(
          'Atleast One Coorect Answer Required',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }
    }

    return this.quizService.createQuiz(question, quiz);
  }

  @Get()
  findAll(@Query() { page, limit }: { page: number; limit: number }) {
    return this.quizService.getAll(+page, +limit);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @AuthDecor() auth: IAuth) {
    return this.quizService.getOneById(id, auth);
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
  update(@Param('id') id: string, @Body() body: any, @AuthDecor() auth: IAuth) {
    return this.quizService.updatebyID(id, body, auth);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @AuthDecor() auth: IAuth) {
    return this.quizService.deleteQuiz(id, auth);
  }
}
