'use strict';
import * as Joi from 'joi';

export const quizHeading = Joi.object({
  title: Joi.string().trim().min(3).max(30).required(),
});

export const createUserSchema = Joi.object({
  name: Joi.string().trim().required().min(3),
  password: Joi.string().trim().required().min(6),
  email: Joi.string().trim().required(),
});

export const LoginUserSchema = Joi.object({
  password: Joi.string().trim().required().min(6),
  email: Joi.string()
    .trim()
    .pattern(/^[A-Za-z1-9_.]{3,}@[A-Za-z]{3,}[.]{1}[A-Za-z.]{3,6}$/)
    .message('invalid email')
    .email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net'] },
    })
    .required(),
});

export const createQuestionSchema = Joi.object({
  question: Joi.string().trim().required().min(1),
  answerOptions: Joi.array()
    .min(2)
    .unique((a, b) => a.answerText === b.answerText)
    .items(
      Joi.object({
        answerText: Joi.string().trim().min(1).message('attttt').required(),
        isCorrect: Joi.boolean().required(),
      }).error(new Error('Cannot submit Empty options / answersss')),
    ),
  answerCount: Joi.number().required(),
  hasMultiAns: Joi.boolean().required(),
  quiz: Joi.string().required(),
});

export const createQuestionSchema1 = Joi.object({
  question: Joi.string().trim().required().min(1),
  answerOptions: Joi.array()
    .min(2)
    .unique((a, b) => a.answerText === b.answerText)
    .items(
      Joi.object({
        answerText: Joi.string().trim().min(1).message('attttt').required(),
        isCorrect: Joi.boolean().required(),
      }).error(new Error('Cannot submit Empty options / answersss')),
    ),
  answerCount: Joi.number().required(),
  hasMultiAns: Joi.boolean().required(),
});

export const createQuizSchema = Joi.object({
  title: Joi.string().trim().required().min(3),
  question: createQuestionSchema1,
  isPublished: Joi.boolean().required(),
  user: Joi.string().trim().required(),
});
