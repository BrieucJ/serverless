import Joi from 'joi'
import { db } from '../utils/db.js'
const { ValidationError } = Joi

const lookup = async (value: string) => {
  const user = await db.collection('users').find({ email: value }).toArray()
  if (user.length !== 0) {
    throw new ValidationError(
      'string.email',
      [
        {
          message: 'email_must_be_unique',
          path: ['email'],
          type: 'string.email',
          context: {
            key: 'email',
            label: 'email',
            value,
          },
        },
      ],
      value,
    )
  }
  return value
}

const isObjectId = function (value: any) {
  const objIdPattern = /^[0-9a-fA-F]{24}$/
  return Boolean(value) && !Array.isArray(value) && objIdPattern.test(String(value))
}

export default Joi.object({
  _id: Joi.custom((value, helpers) => {
    if (!isObjectId(value)) {
      return helpers.error('any.invalid')
    }
    return value
  }),
  username: Joi.string().trim().min(3).max(50).required().messages({
    'string.base': 'username_is_required',
    'string.min': 'username_must_be_at_least_3_characters',
    'string.max': 'username_must_be_less_than_50_characters',
    'any.required': 'username_is_required',
    'string.empty': 'username_is_required',
    'any.invalid': 'username_is_required',
  }),
  email: Joi.string().trim().email().required().external(lookup).messages({
    'string.email': 'email_must_be_an_email',
    'string.base': 'email_is_required',
    'any.required': 'email_is_required',
    'string.empty': 'email_is_required',
    'any.invalid': 'email_is_required',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'password_must_be_at_least_8_characters',
    'string.base': 'password_is_required',
    'any.required': 'password_is_required',
    'string.empty': 'password_is_required',
    'any.invalid': 'password_is_required',
  }),
  confirmed: Joi.boolean().required().default(false),
  createdAt: Joi.date().required().default(new Date()),
  updatedAt: Joi.date().required().default(new Date()),
})
