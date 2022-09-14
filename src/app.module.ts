import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import config from 'ormconfig';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Question } from './question.entity';
import { QuestionController } from './question/question.controller';
import { QuestionService } from './question/question.service';
import { Quiz } from './quiz.entity';
import { QuizController } from './Quiz/quiz.controller';
import { QuizService } from './Quiz/quiz.service';
import { User } from './user.entity';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(config),
    TypeOrmModule.forFeature([User, Question, Quiz]),
    CacheModule.register(),
  ],
  controllers: [
    AppController,
    UserController,
    QuizController,
    QuestionController,
  ],
  providers: [AppService, UserService, QuestionService, QuizService],
})
export class AppModule {}
