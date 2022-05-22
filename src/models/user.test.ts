import '../utils/config.js'
import User from './user.js'
import casual from 'casual'
import { db, connect } from '../utils/db.js'
import { comparePassword } from '../utils/authentication.js'

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */
describe('User model', () => {
  const newUser = {
    username: casual.username,
    email: casual.email,
    password: casual.password + casual.password,
  }

  beforeAll(async () => {
    await connect()
  })

  it('should create a new user', async () => {
    const user = await User.create(newUser)
    const userCount = await User.countDocuments()
    expect(userCount).toEqual(1)
    expect(user?.username).toEqual(newUser.username)
    expect(user?.email).toEqual(newUser.email)
    expect(user?.confirmed).toBeFalsy()
    const passwordComparison = await comparePassword(newUser.password, user?.password)
    expect(passwordComparison).toBeTruthy()
  })

  it('should not create user with same email', async () => {
    await User.create(newUser).catch((error) => {
      expect(error.extensions.code).toBe('BAD_USER_INPUT')
      expect(error.name).toBe('UserInputError')
      const errors = error.extensions.errors
      expect(Object.keys(errors).length).toBe(1)
      expect(errors['email'].message).toBe('email_must_be_unique')
    })
  })

  it('should not create user with incorrect email', async () => {
    const testUser = { ...newUser, email: 'xx' }
    await User.create(testUser).catch((error) => {
      expect(error.extensions.code).toBe('BAD_USER_INPUT')
      expect(error.name).toBe('UserInputError')
      const errors = error.extensions.errors
      expect(Object.keys(errors).length).toBe(1)
      expect(errors['email'].message).toBe('email_must_be_an_email')
    })
  })

  it('should not validate user with an empty email', async () => {
    const testUser = { ...newUser, email: '' }
    await User.create(testUser).catch((error) => {
      expect(error.extensions.code).toBe('BAD_USER_INPUT')
      expect(error.name).toBe('UserInputError')
      const errors = error.extensions.errors
      expect(Object.keys(errors).length).toBe(1)
      expect(errors['email'].message).toBe('email_is_required')
    })
  })

  it('should not validate user with a null email', async () => {
    const testUser = { ...newUser, email: null }
    await User.create(testUser).catch((error) => {
      expect(error.extensions.code).toBe('BAD_USER_INPUT')
      expect(error.name).toBe('UserInputError')
      const errors = error.extensions.errors
      expect(Object.keys(errors).length).toBe(1)
      expect(errors['email'].message).toBe('email_is_required')
    })
  })

  it('should not validate user with an undefined email', async () => {
    const testUser = { ...newUser, email: undefined }
    await User.create(testUser).catch((error) => {
      expect(error.extensions.code).toBe('BAD_USER_INPUT')
      expect(error.name).toBe('UserInputError')
      const errors = error.extensions.errors
      expect(Object.keys(errors).length).toBe(1)
      expect(errors['email'].message).toBe('email_is_required')
    })
  })

  it('should not validate user with a username too short', async () => {
    const testUser = { ...newUser, username: 'xx' }
    await User.create(testUser).catch((error) => {
      expect(error.extensions.code).toBe('BAD_USER_INPUT')
      expect(error.name).toBe('UserInputError')
      const errors = error.extensions.errors
      expect(Object.keys(errors).length).toBe(1)
      expect(errors['username'].message).toBe('username_must_be_at_least_3_characters')
    })
  })

  it('should not validate user with a username too long', async () => {
    const testUser = { ...newUser, username: 'x'.repeat(51) }
    await User.create(testUser).catch((error) => {
      expect(error.extensions.code).toBe('BAD_USER_INPUT')
      expect(error.name).toBe('UserInputError')
      const errors = error.extensions.errors
      expect(Object.keys(errors).length).toBe(1)
      expect(errors['username'].message).toBe('username_must_be_less_than_50_characters')
    })
  })

  it('should not validate user with an empty username', async () => {
    const testUser = { ...newUser, username: '' }
    await User.create(testUser).catch((error) => {
      expect(error.extensions.code).toBe('BAD_USER_INPUT')
      expect(error.name).toBe('UserInputError')
      const errors = error.extensions.errors
      expect(Object.keys(errors).length).toBe(1)
      expect(errors['username'].message).toBe('username_is_required')
    })
  })

  it('should not validate user with a null username', async () => {
    const testUser = { ...newUser, username: null }
    await User.create(testUser).catch((error) => {
      expect(error.extensions.code).toBe('BAD_USER_INPUT')
      expect(error.name).toBe('UserInputError')
      const errors = error.extensions.errors
      expect(Object.keys(errors).length).toBe(1)
      expect(errors['username'].message).toBe('username_is_required')
    })
  })

  it('should not validate user with an undefined username', async () => {
    const testUser = { ...newUser, username: undefined }
    await User.create(testUser).catch((error) => {
      expect(error.extensions.code).toBe('BAD_USER_INPUT')
      expect(error.name).toBe('UserInputError')
      const errors = error.extensions.errors
      expect(Object.keys(errors).length).toBe(1)
      expect(errors['username'].message).toBe('username_is_required')
    })
  })

  it('should not validate user with a password too short', async () => {
    const testUser = { ...newUser, password: 'x'.repeat(7) }
    await User.create(testUser).catch((error) => {
      expect(error.extensions.code).toBe('BAD_USER_INPUT')
      expect(error.name).toBe('UserInputError')
      const errors = error.extensions.errors
      expect(Object.keys(errors).length).toBe(1)
      expect(errors['password'].message).toBe('password_must_be_at_least_8_characters')
    })
  })

  it('should not validate user with an empty password', async () => {
    const testUser = { ...newUser, password: '' }
    await User.create(testUser).catch((error) => {
      expect(error.extensions.code).toBe('BAD_USER_INPUT')
      expect(error.name).toBe('UserInputError')
      const errors = error.extensions.errors
      expect(Object.keys(errors).length).toBe(1)
      expect(errors['password'].message).toBe('password_is_required')
    })
  })

  it('should not validate user with a null password', async () => {
    const testUser = { ...newUser, password: null }
    await User.create(testUser).catch((error) => {
      expect(error.extensions.code).toBe('BAD_USER_INPUT')
      expect(error.name).toBe('UserInputError')
      const errors = error.extensions.errors
      expect(Object.keys(errors).length).toBe(1)
      expect(errors['password'].message).toBe('password_is_required')
    })
  })

  it('should not validate user with an undefined password', async () => {
    const testUser = { ...newUser, password: undefined }
    await User.create(testUser).catch((error) => {
      expect(error.extensions.code).toBe('BAD_USER_INPUT')
      expect(error.name).toBe('UserInputError')
      const errors = error.extensions.errors
      expect(Object.keys(errors).length).toBe(1)
      expect(errors['password'].message).toBe('password_is_required')
    })
  })

  it('should not validate user with an empty password, username and email', async () => {
    const testUser = { ...newUser, password: '', username: '', email: '' }
    await User.create(testUser).catch((error) => {
      expect(error.extensions.code).toBe('BAD_USER_INPUT')
      expect(error.name).toBe('UserInputError')
      const errors = error.extensions.errors
      expect(Object.keys(errors).length).toBe(3)
      expect(errors['username'].message).toBe('username_is_required')
      expect(errors['email'].message).toBe('email_is_required')
      expect(errors['password'].message).toBe('password_is_required')
    })
  })

  it('should not validate user with an undefined password, username and email', async () => {
    const testUser = { ...newUser, password: undefined, username: undefined, email: undefined }
    await User.create(testUser).catch((error) => {
      expect(error.extensions.code).toBe('BAD_USER_INPUT')
      expect(error.name).toBe('UserInputError')
      const errors = error.extensions.errors
      expect(Object.keys(errors).length).toBe(3)
      expect(errors['username'].message).toBe('username_is_required')
      expect(errors['email'].message).toBe('email_is_required')
      expect(errors['password'].message).toBe('password_is_required')
    })
  })

  it('should not validate user with a null password, username and email', async () => {
    const testUser = { ...newUser, password: null, username: null, email: null }
    await User.create(testUser).catch((error) => {
      expect(error.extensions.code).toBe('BAD_USER_INPUT')
      expect(error.name).toBe('UserInputError')
      const errors = error.extensions.errors
      expect(Object.keys(errors).length).toBe(3)
      expect(errors['username'].message).toBe('username_is_required')
      expect(errors['email'].message).toBe('email_is_required')
      expect(errors['password'].message).toBe('password_is_required')
    })
  })

  afterAll(async () => {
    await db.dropDatabase()
    await db.close()
  })
})
