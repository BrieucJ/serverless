import { db } from '../utils/db.js'
import { ObjectId } from 'mongodb'
import { hashPassword } from '../utils/authentication.js'
import { userSchema } from '../models/index.js'
import { RegisterInput, UserType } from '../utils/types.js'

export const create = async (params: RegisterInput) => {
  const defaultParams = {
    createdAt: new Date(),
    updatedAt: new Date(),
    confirmed: false,
  }
  params = { ...defaultParams, ...params }
  params.password = hashPassword(params.password)
  const validatedParams: UserType = (await userSchema.validateAsync(params, { abortEarly: false })) as UserType
  return await db.collection('users').insertOne(validatedParams)
}

export const getById = async (id: string) => {
  const resp = await db.collection('users').findOne({ _id: new ObjectId(id) }, { projection: { password: 0 } })
  return resp
}
