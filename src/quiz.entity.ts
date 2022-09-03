import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from './question.entity';
import { User } from './user.entity';

@Entity()
export class Quiz extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  isPublished: boolean;

  @Column({ length: 6, default: 'N/A' })
  permaLink: string;

  @OneToMany(() => Question, (ques) => ques.quiz)
  questions: Question[];

  @ManyToOne(() => User, (user) => user.quizes, { onDelete: 'CASCADE' })
  user: User;
}
