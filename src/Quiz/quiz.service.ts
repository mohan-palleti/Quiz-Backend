import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { nanoid } from 'nanoid';
import { IAuth } from 'src/Decor/AuthDecor';
import { Question } from 'src/question.entity';
import { Quiz } from 'src/quiz.entity';
import { Repository } from 'typeorm';

@Injectable()
export class QuizService {
  async getScore(permalink: string, body: any) {
    const quiz = await this.quizRepository.findOne({
      where: { permaLink: permalink },
      relations: ['questions'],
    });
    const { questions } = quiz;
    const correctOrder = questions.sort(
      (a, b) => +(a.question > b.question) || -(a.question < b.question),
    );

    let score = 0;
    correctOrder.forEach((EachQ, index) => {
      let submitted = body[index];
      if (submitted?.length === 0) {
        score += 0;
      } else {
        if (!EachQ.hasMultiAns) {
          let option = EachQ.answerOptions;
          if (submitted?.length > 1) {
            throw new HttpException(
              'option doesnt exist',
              HttpStatus.BAD_REQUEST,
            );
          } else if (!option[submitted[0]]) {
            throw new HttpException(
              'option doesnt exist',
              HttpStatus.BAD_REQUEST,
            );
          }
          const ans = option[submitted[0]].isCorrect;
          if (ans === true) {
            score += 1;
          }
        } else {
          submitted = submitted.sort((a: number, b: number) => a - b);
          let totalAnswer = 0;
          let count = 0;
          for (let i = 0; i < submitted.length; i++) {
            if (!EachQ.answerOptions[submitted[i]]) {
              throw new HttpException(
                'Option doesnt exits',
                HttpStatus.BAD_REQUEST,
              );
            }
          }
          EachQ.answerOptions.forEach((option, index) => {
            if (submitted.includes(index) && option.isCorrect === true) {
              count += 1;
            }
            if (option.isCorrect === true) totalAnswer += 1;
          });
          if (count === totalAnswer) {
            score += 1;
          }
        }
      }
    });

    return { result: score };
  }

  async getOnePermaLink(id: string) {
    try {
      const Allquiz = await this.quizRepository.find({
        relations: { questions: true },
      });
      const quiz = Allquiz.find((element) => element.permaLink == id);
      const { title, questions, isPublished } = quiz;
      let Sortquestions = questions.map((EachQ) => {
        const { question, hasMultiAns } = EachQ;
        let sortedOptions = EachQ.answerOptions.map((option) => {
          let slicedOption = { answerText: option.answerText };
          return slicedOption;
        });
        let eachQues = { question, hasMultiAns, answerOptions: sortedOptions };
        return eachQues;
      });

      return { questions: Sortquestions, title, isPublished };
    } catch (error) {
      throw error;
    }
  }
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
  ) {}
  async createQuiz(question: any, quiz: any) {
    const createdQuiz = await this.quizRepository.save(quiz);
    const firstQuestion = { ...question, quiz: createdQuiz.id };
    await Question.save(firstQuestion);

    return createdQuiz;
  }

  async deleteQuiz(id: string, auth: IAuth) {
    const quiz = await Quiz.findOne({
      where: { id },
      relations: ['questions', 'user'],
    });

    if (!quiz) {
      throw new HttpException('Quiz Not Available', HttpStatus.NOT_FOUND);
    }
    if (quiz.user.id !== auth.authUser.id) {
      throw new HttpException('Permission Denied', HttpStatus.NOT_ACCEPTABLE);
    }
    await this.quizRepository.delete({ id });
    return { response: 'Quiz Deleted' };
  }

  //!-------------PAtch-------------------
  async updatebyID(id: string, body: any, auth: IAuth) {
    if (Object.keys(body).length === 1) {
      const quiz = await this.quizRepository.findOne({
        where: { id: id },
        relations: ['questions', 'user'],
      });
      console.log(auth.authUser);
      if (!quiz) {
        throw new HttpException('Quiz Not Available', HttpStatus.NOT_FOUND);
      }
      if (quiz.user.id !== auth.authUser.id) {
        throw new HttpException('Permission Denied', HttpStatus.BAD_REQUEST);
      }
      if (quiz.isPublished)
        throw new HttpException(
          'Cant Edit Published Quiz',
          HttpStatus.BAD_REQUEST,
        );
      else {
        if (body?.title) {
          await Quiz.update(id, body);
          const newQuiz = await Quiz.findOneBy({ id });
          return newQuiz;
        } else {
          let checkPerma = true;
          while (checkPerma) {
            const permaLink = nanoid(6);
            const existQuiz = await Quiz.findOne({ where: { permaLink } });
            if (!existQuiz) {
              await Quiz.update(id, { ...body, permaLink });
              const newQuiz = await Quiz.findOneBy({ id });
              checkPerma = false;
              return newQuiz;
            }
          }
        }
      }
    } else {
      throw new HttpException(
        'Cannot Take Extra Fields for quiz',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getAll(page: number, limit: number): Promise<any> {
    const publishedQuizes = await this.quizRepository.find({
      where: { isPublished: true },
    });
    const pageNumber = page || 1;
    const size = limit || 2;
    const indexOfLastQuiz = pageNumber * size;
    const indexOfFirstQuiz = indexOfLastQuiz - size;
    const currentQuiz = publishedQuizes?.slice(
      indexOfFirstQuiz,
      indexOfLastQuiz,
    );
    const totalPages = Math.ceil(publishedQuizes.length / size);
    return { currentQuiz, totalPages };
  }

  async getOneById(id: string, auth: IAuth): Promise<any> {
    try {
      const quiz = await this.quizRepository.findOne({
        where: { id },
        relations: ['questions', 'user'],
      });

      if (!quiz) {
        throw new HttpException('Quiz Not Available', HttpStatus.NOT_FOUND);
      }
      if (quiz.isPublished)
        throw new HttpException(
          'Permission Denied, Quiz Already Published',
          HttpStatus.BAD_REQUEST,
        );

      if (quiz.user.id !== auth.authUser.id) {
        throw new HttpException('Permission Denied', HttpStatus.BAD_REQUEST);
      }

      const { permaLink, isPublished, user, ...Quiz } = quiz;

      return Quiz;
    } catch (error) {
      throw error;
    }
  }
}
