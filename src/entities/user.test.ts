import '../utils/config.js'
import User from './user.js'
import source from '../utils/source.js'
import { comparePassword } from '../utils/authentication.js'
import { UserInputError } from 'apollo-server-express'
// ValidationError
import casual from 'casual'

/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */
describe('User entity', () => {
  const newUser = {
    username: casual.username,
    email: casual.email,
    password: casual.password + casual.password,
  }

  beforeAll(async () => {
    await source.initialize()
    await source.dropDatabase()
    await source.synchronize()
  })

  it('should create a new user', async () => {
    const user = await User.create({ ...newUser }).save()
    const userCount = await User.count()
    expect(userCount).toEqual(1)
    expect(user.username).toEqual(newUser.username)
    expect(user.email).toEqual(newUser.email)
    expect(user.confirmed).toBeFalsy()
    const passwordComparison = await comparePassword(newUser.password, user.password)
    expect(passwordComparison).toBeTruthy()
  })

  it('should reject creating user with same email', async () => {
    const user = User.create({
      username: 'different_username',
      email: newUser.email,
      password: newUser.password,
    })
    await user.save().catch((error: UserInputError) => {
      expect(error.extensions.errors.length).toEqual(1)
      expect(error.extensions.code).toEqual('BAD_USER_INPUT')
      expect(Object.keys(error.extensions.errors[0].constraints)[0]).toBe('IsEmailUnique')
      expect(Object.values(error.extensions.errors[0].constraints)[0]).toBe('email_must_be_unique')
    })
    const userCount = await User.count()
    expect(userCount).toEqual(1)
  })

  it('should reject a wrong email', async () => {
    const user = User.create({
      username: 'different_username_2',
      email: 'email',
      password: newUser.password,
    })

    await user.save().catch((error: UserInputError) => {
      expect(error.extensions.errors.length).toEqual(1)
      expect(error.extensions.code).toEqual('BAD_USER_INPUT')
      expect(Object.keys(error.extensions.errors[0].constraints)[0]).toBe('isEmail')
      expect(Object.values(error.extensions.errors[0].constraints)[0]).toBe('email_must_be_an_email')
    })
    const userCount = await User.count()
    expect(userCount).toEqual(1)
  })

  it('should reject a password too short', async () => {
    const user = User.create({
      username: 'different_username_3',
      email: 'email@email.com',
      password: '1',
    })

    await user.save().catch((error: UserInputError) => {
      expect(error.extensions.errors.length).toEqual(1)
      expect(error.extensions.code).toEqual('BAD_USER_INPUT')
      expect(Object.keys(error.extensions.errors[0].constraints)[0]).toBe('minLength')
      expect(Object.values(error.extensions.errors[0].constraints)[0]).toBe('password_must_be_at_least_8_characters')
    })
    const userCount = await User.count()
    expect(userCount).toEqual(1)
  })

  it('should reject a username too short', async () => {
    const user = User.create({
      username: 'a',
      email: 'email@email.com',
      password: '123456789',
    })

    await user.save().catch((error: UserInputError) => {
      expect(error.extensions.errors.length).toEqual(1)
      expect(error.extensions.code).toEqual('BAD_USER_INPUT')
      expect(Object.keys(error.extensions.errors[0].constraints)[0]).toBe('isLength')
      expect(Object.values(error.extensions.errors[0].constraints)[0]).toBe('username_must_be_between_3_and_50_characters')
    })
    const userCount = await User.count()
    expect(userCount).toEqual(1)
  })

  it('should reject a username too long', async () => {
    const user = User.create({
      username: 'x'.repeat(51),
      email: 'email@email2.com',
      password: '123456789',
    })

    await user.save().catch((error: UserInputError) => {
      expect(error.extensions.errors.length).toEqual(1)
      expect(error.extensions.code).toEqual('BAD_USER_INPUT')
      expect(Object.keys(error.extensions.errors[0].constraints)[0]).toBe('isLength')
      expect(Object.values(error.extensions.errors[0].constraints)[0]).toBe('username_must_be_between_3_and_50_characters')
    })
    const userCount = await User.count()
    expect(userCount).toEqual(1)
  })

  afterAll(async () => {
    await source.destroy()
  })
})
