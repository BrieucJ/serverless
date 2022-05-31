import { ForbiddenError, UserInputError } from 'apollo-server-express'
import { User } from '../models/index.js'
import {
  Context,
  DecodedToken,
  Tokens,
  TokenType,
  LoginInput,
  refreshTokensInput,
  forgotPasswordInput,
  RegisterInput,
  confirmEmailInput,
  changePasswordInput,
} from '../utils/types.js'
import { comparePassword, createToken, verifyToken } from '../utils/authentication.js'
import mailer from '../utils/mailer.js'
import logger from '../utils/logger.js'

export default {
  Query: {
    async login(_parent: any, args: LoginInput, _context: Context, _info: any): Promise<Tokens> {
      const user = await User.findOne({ email: args.email })
      if (!user) throw new UserInputError('wrong_email_or_password')
      await comparePassword(args.password, user.password)
      const accessToken: string = createToken(TokenType.accessToken, user)
      const refreshToken: string = createToken(TokenType.refreshToken, user)
      return { accessToken, refreshToken }
    },
    async refreshTokens(_parent: any, args: refreshTokensInput, _context: Context, _info: any): Promise<Tokens> {
      const decodedToken: DecodedToken = verifyToken(TokenType.refreshToken, args.refreshToken)
      const user = await User.findOne({ email: decodedToken.email })
      if (!user) throw new ForbiddenError('refreshToken_invalid')
      const accessToken: string = createToken(TokenType.accessToken, user)
      const refreshToken: string = createToken(TokenType.refreshToken, user)
      return { accessToken, refreshToken }
    },
    async forgotPassword(_parent: any, args: forgotPasswordInput, _context: Context, _info: any): Promise<string> {
      const user = await User.findOne({ email: args.email })
      if (user) {
        await mailer(user, 'forgotPasswordEmail').catch((error) => {
          logger.error(error)
        })
      }
      return 'email_sent_if_exist'
    },
  },
  Mutation: {
    async register(_parent: any, args: RegisterInput, _context: Context, _info: any): Promise<Tokens> {
      const user = await User.create(args)
      const accessToken: string = createToken(TokenType.accessToken, user)
      const refreshToken: string = createToken(TokenType.refreshToken, user)
      return { accessToken, refreshToken }
    },
    async confirmEmail(_parent: any, args: confirmEmailInput, _context: Context, _info: any): Promise<Tokens> {
      const decodedToken: DecodedToken = verifyToken(TokenType.confirmToken, args.confirmToken)
      const user = await User.findOne({ email: decodedToken.email })
      if (!user) throw new ForbiddenError('confirmToken_invalid')
      user.confirmed = true
      await user.save()
      const accessToken: string = createToken(TokenType.accessToken, user)
      const refreshToken: string = createToken(TokenType.refreshToken, user)
      return { accessToken, refreshToken }
    },
    async changePassword(_parent: any, args: changePasswordInput, _context: Context, _info: any): Promise<Tokens> {
      const decodedToken: DecodedToken = verifyToken(TokenType.forgotToken, args.forgotToken)
      const user = await User.findOne({ email: decodedToken.email })
      if (!user) throw new ForbiddenError('forgotToken_invalid')
      user.password = args.password
      await user.save()
      const accessToken: string = createToken(TokenType.accessToken, user)
      const refreshToken: string = createToken(TokenType.refreshToken, user)
      return { accessToken, refreshToken }
    },
  },
}
