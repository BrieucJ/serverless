// import Joi from 'joi'
// import { db } from '../utils/db.js'
// const { ValidationError } = Joi

// const lookup = async (value: string) => {
//   const user = await db.collection('users').find({ email: value }).toArray()
//   if (user.length !== 0) {
//     throw new ValidationError(
//       'string.email',
//       [
//         {
//           message: 'email_must_be_unique',
//           path: ['email'],
//           type: 'string.email',
//           context: {
//             key: 'email',
//             label: 'email',
//             value,
//           },
//         },
//       ],
//       value,
//     )
//   }
//   return value
// }

// const isObjectId = function (value: any) {
//   const objIdPattern = /^[0-9a-fA-F]{24}$/
//   return Boolean(value) && !Array.isArray(value) && objIdPattern.test(String(value))
// }

// export default Joi.object({
//   _id: Joi.custom((value, helpers) => {
//     if (!isObjectId(value)) {
//       return helpers.error('any.invalid')
//     }
//     return value as string
//   }),
//   username: Joi.string().trim().min(3).max(50).required().messages({
//     'string.base': 'username_is_required',
//     'string.min': 'username_must_be_at_least_3_characters',
//     'string.max': 'username_must_be_less_than_50_characters',
//     'any.required': 'username_is_required',
//     'string.empty': 'username_is_required',
//     'any.invalid': 'username_is_required',
//   }),
//   email: Joi.string().trim().email().required().external(lookup).messages({
//     'string.email': 'email_must_be_an_email',
//     'string.base': 'email_is_required',
//     'any.required': 'email_is_required',
//     'string.empty': 'email_is_required',
//     'any.invalid': 'email_is_required',
//   }),
//   password: Joi.string().min(8).required().messages({
//     'string.min': 'password_must_be_at_least_8_characters',
//     'string.base': 'password_is_required',
//     'any.required': 'password_is_required',
//     'string.empty': 'password_is_required',
//     'any.invalid': 'password_is_required',
//   }),
//   confirmed: Joi.boolean().required().default(false),
//   createdAt: Joi.date().required().default(new Date()),
//   updatedAt: Joi.date().required().default(new Date()),
// })

import mongoose from 'mongoose'
import { UserInputError } from 'apollo-server-express'
import { hashPassword } from '../utils/authentication.js'

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      minlength: [3, 'username_must_be_at_least_3_characters'],
      maxlength: [50, 'username_must_be_less_than_50_characters'],
      required: [true, 'username_is_required'],
    },
    email: {
      type: String,
      match: [/\S+@\S+\.\S+/, 'email_must_be_an_email'],
      required: [true, 'email_is_required'],
      unique: true,
    },
    password: {
      type: String,
      minlength: [8, 'password_must_be_at_least_8_characters'],
      required: [true, 'password_is_required'],
    },
    confirmed: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true },
)

UserSchema.pre('save', function (next) {
  this.password = hashPassword(this.password)
  next()
})

UserSchema.post('save', function (error: any, _doc: any, next: any) {
  if (error.code === 11000) {
    const error = new mongoose.Error.ValidationError(this)
    error.errors.email = new mongoose.Error.ValidatorError({ message: 'email_must_be_unique', type: 'unique', path: 'email', value: this.email })
    next(new UserInputError('BAD_USER_INPUT', { errors: error.errors }))
  } else if (error.name === 'ValidationError') {
    next(new UserInputError('BAD_USER_INPUT', { errors: error.errors }))
  } else {
    next(new UserInputError('BAD_USER_INPUT', { error }))
  }
})
const User = mongoose.model('User', UserSchema)

export default User
