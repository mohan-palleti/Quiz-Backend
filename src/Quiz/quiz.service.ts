import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
      if (submitted.length === 1) {
        let option = EachQ.answerOptions;
        const ans = option[submitted[0]].isCorrect;
        if (ans === 'true') {
          score += 1;
        }
      } else if (submitted.length > 1) {
        submitted = submitted.sort((a: number, b: number) => a - b);
        let count = 1;
        EachQ.answerOptions.forEach((option, index) => {
          if (submitted.includes(index) && option.isCorrect === 'false') {
            count = 0;
          }
        });
        if (count === 1) {
          score += 1;
        }
      } else {
        score += 0;
      }
    });

    //throw new Error('Method not implemented.');
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
    // const quiz = Quiz.find({
    //   where: { title: createdQuiz.title, description: body.description },
    // });

    return createdQuiz;
  }

  async deleteQuiz(id: string) {
    console.log(id);
    await this.quizRepository.delete({ id });
    return { response: 'Quiz Deleted' };
  }

  async updatebyID(id: string, body: any) {
    await Quiz.update(id, body);
    const question = await Quiz.findOneBy({ id });
    return question;
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

  async getOneById(id: string): Promise<any> {
    try {
      const Allquiz = await this.quizRepository.find({
        relations: { questions: true },
      });
      const quiz = Allquiz.find((element) => element.id == id);

      const { permaLink, isPublished, ...Quiz } = quiz;

      return Quiz;
    } catch (error) {
      throw error;
    }
  }
}
