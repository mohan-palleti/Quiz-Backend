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

  //!------------------PAtch----------------------------------------
  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @AuthDecor() auth: IAuth,
  ) {
    const { value, error } = createQuestionSchema.validate(body);
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
    const quizId = question.quiz.id;
    const existingQuiz = await Quiz.findOne({
      where: { id: quizId },
      relations: ['questions', 'user'],
    });
    if (quizId !== value.quiz) {
      throw new HttpException(
        'Question doesnt belong to the quiz',
        HttpStatus.BAD_REQUEST,
      );
    }
    let noCorrectOption = 0;
    body.answerOptions.forEach((element) => {
      if (element.isCorrect === true) {
        noCorrectOption += 1;
      }
    });
    if (body.answerCount === 0) {
      throw new HttpException(
        'Answer count should not be Zero',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (body.answerCount !== noCorrectOption) {
      throw new HttpException(
        'Incorrect values in answer count',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!body.hasMultiAns && noCorrectOption > 1) {
      throw new HttpException(
        'Incorrect values submitted',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
    if (body.hasMultiAns && noCorrectOption === 0)
      throw new HttpException('incorrect values', HttpStatus.BAD_REQUEST);
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
      if (existingQuiz.questions) {
        let c = 0;
        for (let index = 0; index < existingQuiz.questions.length; index++) {
          let e = existingQuiz.questions[index];
          if (e.question == value.question) {
            if (question.id === e.id) continue;
            c += 1;
            throw new HttpException(
              'Duplicate Question ,Please Check',
              HttpStatus.NOT_ACCEPTABLE,
            );
          }
        }
      }
    }

    if (error) {
      throw new HttpException(error.message, HttpStatus.NOT_ACCEPTABLE);
    }

    return this.questionService.updatebyID(id, body);
  }

  //!-------------------------Delete question-----------------
  @UseGuards(AuthGuard)
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
