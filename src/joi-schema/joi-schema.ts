import * as Joi from 'joi';

export const quizHeading = Joi.object({
  title: Joi.string().alphanum().min(3).max(30).required(),

  description: Joi.string().alphanum().min(3).max(70).required(),
});

export const createUserSchema = Joi.object({
  name: Joi.string().required().min(3),
  password: Joi.string().required().min(6),
  email: Joi.string().required(),
});

export const createQuestionSchema = Joi.object({
  question: Joi.string().required().min(1),
  answerOptions: Joi.array().items(
    Joi.object({
      answerText: Joi.string().required(),
      isCorrect: Joi.string().required(),
    }),
  ),
  answerCount: Joi.number().required(),
  hasMultiAns: Joi.boolean().required(),
  quiz: Joi.string().required(),
});

export const createQuizSchema = Joi.object({
  title: Joi.string().required().min(3),

  isPublished: Joi.boolean().required(),
  user: Joi.string().required(),
});
