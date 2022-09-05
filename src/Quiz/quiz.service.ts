import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { response } from 'express';
import { IAuth } from 'src/Decor/AuthDecor';
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
          const ans = option[submitted[0]].isCorrect;
          if (ans === 'true') {
            score += 1;
          }
        } else {
          submitted = submitted.sort((a: number, b: number) => a - b);
          let totalAnswer = 0;
          let count = 0;
          EachQ.answerOptions.forEach((option, index) => {
            if (submitted.includes(index) && option.isCorrect === 'true') {
              count += 1;
            }
            if (option.isCorrect === 'true') totalAnswer += 1;
          });
          if (count === totalAnswer) {
            console.log('math');
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
  async createQuiz(body: any) {
    const createdQuiz = await this.quizRepository.save(body);
    return createdQuiz;
  }

  async deleteQuiz(id: string, auth: IAuth) {
    console.log(id);
    const Allquiz = await this.quizRepository.find({
      relations: ['questions', 'user'],
    });
    const quiz = Allquiz.find((element) => element.id == id);
    if (!quiz) {
      throw new HttpException('Quiz Not Available', HttpStatus.NOT_FOUND);
    }
    if (quiz.user.id !== auth.authUser.id) {
      throw new HttpException('Permission Denied', HttpStatus.NOT_ACCEPTABLE);
    }
    await this.quizRepository.delete({ id });
    return { response: 'Quiz Deleted' };
  }

  async updatebyID(id: string, body: any, auth: IAuth) {
    if (body?.isPublished) {
      const Allquiz = await this.quizRepository.find({
        where: { id: id },
        relations: ['questions', 'user'],
      });
      const quiz = Allquiz.find((element) => element.id == id);
      if (!quiz) {
        throw new HttpException('Quiz Not Available', HttpStatus.NOT_FOUND);
      }
      if (quiz.user.id !== auth.authUser.id) {
        throw new HttpException('Permission Denied', HttpStatus.NOT_ACCEPTABLE);
      }
      if (quiz.isPublished)
        throw new HttpException('Access Denied', HttpStatus.NOT_ACCEPTABLE);
      if (quiz.questions.length === 0) {
        throw new HttpException(
          ' Cannot Publish,No Questions in the Quiz',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }
    } else
      throw new HttpException(
        'Quiz Already Published',
        HttpStatus.NOT_ACCEPTABLE,
      );
    await Quiz.update(id, body);
    const quiz = await Quiz.findOneBy({ id });
    return quiz;
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
    //return publishedQuizes;
  }

  async getOneById(id: string, auth: IAuth): Promise<any> {
    try {
      const Allquiz = await this.quizRepository.find({
        relations: ['questions', 'user'],
      });
      const quiz = Allquiz.find((element) => element.id == id);

      if (!quiz) {
        throw new HttpException('Quiz Not Available', HttpStatus.NOT_FOUND);
      }
      if (quiz.isPublished)
        throw new HttpException(
          'Permission Denied, Quiz Already Published',
          HttpStatus.NOT_ACCEPTABLE,
        );

      // console.log('auth', auth);
      if (quiz.user.id !== auth.authUser.id) {
        throw new HttpException('Permission Denied', HttpStatus.NOT_ACCEPTABLE);
      }

      const { permaLink, isPublished, user, ...Quiz } = quiz;

      return Quiz;
    } catch (error) {
      throw error;
    }
  }
}
