import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import * as jwt from 'jsonwebtoken';

import { comparePasswords, encodePassword } from 'src/utils/bcrypt';

import { Response } from 'express';

import { Quiz } from 'src/quiz.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  getAll(): Promise<User[]> {
    return this.userRepository.find({ relations: ['quizes'] }); //select * from user
  }

  async getUserQuiz(id: string, page: number, limit: number): Promise<any> {
    try {
      //delete empty quiz(loop over quizes)

      //send quiz with questions

      const user = await User.findOne({ where: { id }, relations: ['quizes'] });
      const quizes = user.quizes;

      const pageNumber = page || 1;
      const size = limit || 2;
      const indexOfLastQuiz = pageNumber * size;
      const indexOfFirstQuiz = indexOfLastQuiz - size;
      const currentQuiz = quizes?.slice(indexOfFirstQuiz, indexOfLastQuiz);

      const totalPages = Math.ceil(quizes.length / size);
      return { currentQuiz, totalPages };
    } catch (error) {
      throw error;
    }
  }

  async getUserReservation(id: string): Promise<any> {
    try {
      const userList = await this.userRepository.find();

      const reservation = userList.find((ele) => ele.id === id);

      return reservation;
    } catch (error) {
      throw error;
    }
  }

  async loginUser(body: any, response: Response): Promise<any> {
    try {
      let res = 'name or password was wrong ';
      const users = await this.userRepository.find();
      let matchedUser = users.find((e) => e.email === body.email);
      if (matchedUser) {
        const Matched = comparePasswords(body.password, matchedUser.password);

        if (Matched === true) {
          const token = jwt.sign(
            {
              id: matchedUser.id,
            },
            'secret',
          );
          const { password, email, name, ...info } = matchedUser;

          return {
            token,
          };
        } else {
          throw new HttpException(res, 401);
        }
      } else throw new HttpException(res, 401);
    } catch (error) {
      throw error;
    }
  }

  async createUser(body: any): Promise<string> {
    try {
      const users = await this.userRepository.find();
      let matchedUser = users.find((e) => e.email === body.email);
      if (matchedUser) {
        throw new HttpException('user already exists', 402);
      }
      let password = encodePassword(body.password);
      const newUser = this.userRepository.create({ ...body, password });

      this.userRepository.save(newUser);

      return 'Account Created Successfully';
    } catch (error) {
      return error;
    }
  }

  async deleteUser(id: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: id },
    });
    return this.userRepository.remove(user);
  }

  async updatebyID(id: string, body: User): Promise<User> {
    await this.userRepository.update(id, body);
    const user = await this.userRepository.findOne({
      where: { id: id },
    });
    return user;
  }
}
