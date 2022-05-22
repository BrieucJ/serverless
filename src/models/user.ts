import mongoose, { Types, HydratedDocument, CallbackWithoutResultAndOptionalError } from 'mongoose'
const { MongooseError } = mongoose
import { MongoServerError } from 'mongodb'
import { UserInputError } from 'apollo-server-express'
import { hashPassword } from '../utils/authentication.js'

type IUser = {
  _id: Types.ObjectId
  username: string
  email: string
  password: string
  confirmed: boolean
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new mongoose.Schema<IUser>(
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

UserSchema.pre<HydratedDocument<IUser>>('save', function (next: CallbackWithoutResultAndOptionalError) {
  this.password = hashPassword(this.password)
  next()
})

UserSchema.post('save', function (error: any, doc: IUser, next: CallbackWithoutResultAndOptionalError) {
  // console.log('instance', typeof error)
  // console.log('error.name', error.name)
  // console.log('MongoServerError', error instanceof MongoServerError)
  // console.log('error.constructor', error.constructor.name)
  /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment */
  if (error.name === 'MongoServerError' && error.code === 11000) {
    // console.log('Duplicate Error')
    const newError = new mongoose.Error.ValidationError(error)
    newError.errors.email = new mongoose.Error.ValidatorError({
      message: 'email_must_be_unique',
      type: 'unique',
      path: 'email',
      value: doc.email,
    })
    // console.log('ERROR', newError)
    next(new UserInputError('BAD_USER_INPUT', { errors: newError.errors }))
  } else {
    // console.log('ValidationError')
    next(new UserInputError('BAD_USER_INPUT', { errors: error }))
  }
})
const User = mongoose.model<IUser>('User', UserSchema)

export default User
