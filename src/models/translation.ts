import mongoose, { Types, CallbackWithoutResultAndOptionalError } from 'mongoose'
import { UserInputError } from 'apollo-server-express'

type ITranslation = {
  _id: Types.ObjectId
  key: string
  value: string
  locale: string
  ns: string
}

const TranslationSchema = new mongoose.Schema<ITranslation>(
  {
    key: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    locale: {
      type: String,
      required: true,
    },
    ns: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
)

TranslationSchema.index({ key: 1, locale: 1 }, { unique: true })

TranslationSchema.post('save', function (error: any, doc: ITranslation, next: CallbackWithoutResultAndOptionalError) {
  /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment */
  if (error.name === 'MongoServerError' && error.code === 11000) {
    const newError = new mongoose.Error.ValidationError(error)
    newError.errors.key_locale = new mongoose.Error.ValidatorError({
      message: 'key_and_locale_must_be_unique_together',
      type: 'unique',
      path: 'key_locale',
      value: doc.key,
    })
    next(new UserInputError('BAD_USER_INPUT', { errors: newError.errors }))
  }
  next(error)
})

const Translation = mongoose.model<ITranslation>('Translation', TranslationSchema)
await Translation.createIndexes()

export default Translation
