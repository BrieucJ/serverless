import { DocumentNode } from 'graphql'
import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'

export type Tokens = {
  accessToken: string
  refreshToken: string
}

export type DecodedToken = {
  email: string
  iat: number
  exp: number
}

export enum TokenType {
  accessToken,
  refreshToken,
  confirmToken,
  forgotToken,
}

export type LoginInput = {
  email: string
  password: string
}

export type RegisterInput = {
  email: string
  username: string
  password: string
}

export type confirmEmailInput = {
  confirmToken: string
}

export type changePasswordInput = {
  forgotToken: string
  password: string
}

export type refreshTokensInput = {
  refreshToken: string
}

export type forgotPasswordInput = {
  email: string
}

export type Error = {
  message: string
}

type Nullable<T> = T | null

type UserContext = {
  _id: ObjectId
}

export type Context = {
  req: Request
  res: Response
  user?: Nullable<UserContext>
}

export type ExecuteArguments = {
  query: DocumentNode
  variables: { [key: string]: string }
  context: Context
}

export type UserType = {
  _id: ObjectId
  username: string
  email: string
  password: Nullable<string>
  confirmed: boolean
  createdAt: Date
  updatedAt: Date
}
