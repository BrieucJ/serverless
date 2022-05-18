import '../utils/config.js'
import { UserController } from './index.js'
// import { comparePassword } from '../utils/authentication.js'
import casual from 'casual'
import { db, connect, client } from '../utils/db.js'
// import { ValidationError } from 'joi'

/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */
describe('User controller', () => {
  const newUser = {
    username: casual.username,
    email: casual.email,
    password: casual.password + casual.password,
  }

  beforeAll(async () => {
    await connect()
  })

  it('should create a new user', async () => {
    const resp = await UserController.create(newUser)
    console.log(resp)
    // expect(resp.acknowledged).toBeTruthy()
    // const userCount = await db.collection('users').countDocuments()
    // expect(userCount).toEqual(1)
    // const user = await db.collection('users').findOne({ _id: resp.insertedId })
    // expect(user?.username).toEqual(newUser.username)
    // expect(user?.email).toEqual(newUser.email)
    // expect(user?.confirmed).toBeFalsy()
    // const passwordComparison = await comparePassword(newUser.password, user?.password)
    // expect(passwordComparison).toBeTruthy()
  })

  //   it('should reject creating user with same email', async () => {
  //     await UserController.create(newUser).catch((error: ValidationError) => {
  //       expect(error.details[0].message).toBe('email_must_be_unique')
  //     })
  //     const userCount = await db.collection('users').countDocuments()
  //     expect(userCount).toEqual(1)
  //   })

  //   it('should reject a wrong email', async () => {
  //     await UserController.create(newUser).catch((error: ValidationError) => {
  //       expect(error.details[0].message).toBe('email_must_be_unique')
  //     })
  //     const userCount = await db.collection('users').countDocuments()
  //     expect(userCount).toEqual(1)
  //   })

  //   it('should reject a password too short', async () => {
  //     const user = User.create({
  //       username: 'different_username_3',
  //       email: 'email@email.com',
  //       password: '1',
  //     })

  //     await user.save().catch((error: UserInputError) => {
  //       expect(error.extensions.errors.length).toEqual(1)
  //       expect(error.extensions.code).toEqual('BAD_USER_INPUT')
  //       expect(Object.keys(error.extensions.errors[0].constraints)[0]).toBe('minLength')
  //       expect(Object.values(error.extensions.errors[0].constraints)[0]).toBe('password_must_be_at_least_8_characters')
  //     })
  //     const userCount = await User.count()
  //     expect(userCount).toEqual(1)
  //   })

  //   it('should reject a username too short', async () => {
  //     const user = User.create({
  //       username: 'a',
  //       email: 'email@email.com',
  //       password: '123456789',
  //     })

  //     await user.save().catch((error: UserInputError) => {
  //       expect(error.extensions.errors.length).toEqual(1)
  //       expect(error.extensions.code).toEqual('BAD_USER_INPUT')
  //       expect(Object.keys(error.extensions.errors[0].constraints)[0]).toBe('isLength')
  //       expect(Object.values(error.extensions.errors[0].constraints)[0]).toBe('username_must_be_between_3_and_50_characters')
  //     })
  //     const userCount = await User.count()
  //     expect(userCount).toEqual(1)
  //   })

  //   it('should reject a username too long', async () => {
  //     const user = User.create({
  //       username: 'x'.repeat(51),
  //       email: 'email@email2.com',
  //       password: '123456789',
  //     })

  //     await user.save().catch((error: UserInputError) => {
  //       expect(error.extensions.errors.length).toEqual(1)
  //       expect(error.extensions.code).toEqual('BAD_USER_INPUT')
  //       expect(Object.keys(error.extensions.errors[0].constraints)[0]).toBe('isLength')
  //       expect(Object.values(error.extensions.errors[0].constraints)[0]).toBe('username_must_be_between_3_and_50_characters')
  //     })
  //     const userCount = await User.count()
  //     expect(userCount).toEqual(1)
  //   })

  afterAll(async () => {
    await db.dropDatabase()
    await client.close()
  })
})
