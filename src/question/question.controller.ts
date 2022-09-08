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
import { AuthDecor, IAuth } from 'src/Decor/AuthDecor';
import { AuthGuard } from 'src/Guard/auth.guard';
import { createQuestionSchema } from 'src/joi-schema/joi-schema';
import { Question } from 'src/question.entity';
import { Quiz } from 'src/quiz.entity';

import { QuestionService } from './question.service';

@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  //!------------------Post a Question---------------------
  @UseGuards(AuthGuard)
  @Post()
  async createQuestion(@Body() body: any, @AuthDecor() auth: IAuth) {
    const { value, error } = createQuestionSchema.validate(body);
    const quizId = body.quiz;
    const existingQuiz = await Quiz.findOne({
      where: { id: quizId },
      relations: ['questions', 'user'],
    });

    if (auth.authUser.id !== existingQuiz.user.id) {
      throw new HttpException('Permission Denied', HttpStatus.NOT_ACCEPTABLE);
    }

    if (existingQuiz.isPublished) {
      throw new HttpException(
        'Quiz published ,cannot edit',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    let noCorrectOption = 0;
    body.answerOptions.forEach((element) => {
      if (element.isCorrect === true) {
        noCorrectOption += 1;
      }
    });
    if (
      noCorrectOption === 0 ||
      (existingQuiz.questions && existingQuiz.questions?.length > 0)
    ) {
      if (noCorrectOption === 0) {
        throw new HttpException(
          'Atleast One Coorect Answer Required',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }
      let c = 0;
      if (existingQuiz.questions) {
        for (let index = 0; index < existingQuiz.questions.length; index++) {
          let e = existingQuiz.questions[index];
          if (e.question == value.question) {
            c += 1;
            throw new HttpException(
              'Duplicate Question ,Please Check',
              HttpStatus.NOT_ACCEPTABLE,
            );
          }
        }
      }

      if (c >= 1) {
        throw new HttpException(
          'Duplicate Question ,Please Check',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }
    }

    if (error) {
      throw new HttpException(error.message, HttpStatus.NOT_ACCEPTABLE);
    }

    return this.questionService.createQuestion(value);
  }

  //!--------------------get by ID------------------
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.questionService.getOneById(id);
  }

  //!------------------PAtch----------------------------------------
  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @AuthDecor() auth: IAuth,
  ) {
    if (Object.keys(body).length === 0) {
      throw new HttpException(
        'No data Received to update',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
    const question = await Question.findOne({
      where: { id },
      relations: {
        quiz: {
          user: true,
        },
      },
    });
    if (!question)
      throw new HttpException('Question doesnt exist', HttpStatus.NOT_FOUND);
    if (auth.authUser.id !== question.quiz.user.id) {
      throw new HttpException('Permission Denied', HttpStatus.BAD_REQUEST);
    }
    if (question.quiz.isPublished) {
      throw new HttpException(
        'Quiz is Published ,Cannot Edit',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.questionService.updatebyID(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @AuthDecor() auth: IAuth) {
    const question = await Question.findOne({
      where: { id },
      relations: {
        quiz: {
          user: true,
        },
      },
    });
    if (!question)
      throw new HttpException('Question doesnt exist', HttpStatus.NOT_FOUND);
    if (auth.authUser.id !== question.quiz.user.id) {
      throw new HttpException('Permission Denied', HttpStatus.BAD_REQUEST);
    }
    if (question.quiz.isPublished) {
      throw new HttpException(
        'Quiz is Published ,Cannot Edit',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.questionService.deleteQuestion(id);
  }
}
