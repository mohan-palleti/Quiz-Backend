'use strict';
import * as Joi from 'joi';

export const quizHeading = Joi.object({
  title: Joi.string().trim().min(3).max(30).required(),

  description: Joi.string().trim().min(3).max(70).required(),
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
  answerOptions: Joi.array().items(
    Joi.object({
      answerText: Joi.string().trim().required(),
      isCorrect: Joi.string().trim().required(),
    }),
  ),
  answerCount: Joi.number().required(),
  hasMultiAns: Joi.boolean().required(),
  quiz: Joi.string().required(),
});

export const createQuizSchema = Joi.object({
  title: Joi.string().trim().required().min(3),

  isPublished: Joi.boolean().required(),
  user: Joi.string().trim().required(),
});
