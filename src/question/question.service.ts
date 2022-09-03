import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Question } from 'src/question.entity';
import { Quiz } from 'src/quiz.entity';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

  async createQuestion(body: any) {
    const quizId = body.quiz;
    const quiz = await Quiz.find({
      where: { id: quizId },
      relations: ['questions'],
    });
    const quizOne = quiz.find((ele) => ele.id === quizId);
    if (quizOne.questions.length > 10) {
      throw new HttpException(
        'questionLimit reached',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const question = await Question.save(body);

    return question;
  }
  async deleteUser(id: string) {
    const deleteQuestion = await Question.delete(id);
    return deleteQuestion;
  }

  async updatebyID(id: string, body: any) {
    await Question.update(id, body);
    const question = await Question.findOneBy({ id });
    return question;
  }
  getAll(): Promise<any> {
    return this.questionRepository.find();
  }

  async getOneById(id: string): Promise<Question> {
    try {
      const question = await this.questionRepository.findOneBy({ id });
      //console.log(question);
      return question;
    } catch (error) {
      throw error;
    }
  }
}
