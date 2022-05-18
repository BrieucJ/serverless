import '../utils/config.js'
import userSchema from './user.js'
import casual from 'casual'
import { db, connect, client } from '../utils/db.js'
import { UserType } from '../utils/types.js'

/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */
describe('User schema', () => {
  const newUser = {
    username: casual.username,
    email: casual.email,
    password: casual.password + casual.password,
    confirmed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeAll(async () => {
    await connect()
  })

  it('should validate new user', async () => {
    const resp: UserType = (await userSchema.validateAsync(newUser, { abortEarly: false })) as UserType
    expect(resp).toEqual(newUser)
  })

  it('should not validate user with same email', async () => {
    await db.collection('users').insertOne(newUser)
    await userSchema.validateAsync(newUser, { abortEarly: false }).catch((error) => {
      expect(error.details.length).toBe(1)
      expect(error.details[0].message).toBe('email_must_be_unique')
    })
  })

  it('should not validate incorrect email', async () => {
    const testUser = { ...newUser, email: 'xx' }
    await userSchema.validateAsync(testUser, { abortEarly: false }).catch((error) => {
      expect(error.details.length).toBe(1)
      expect(error.details[0].message).toBe('email_must_be_an_email')
    })
  })

  it('should not validate user with an empty email', async () => {
    const testUser = { ...newUser, email: '' }
    await userSchema.validateAsync(testUser, { abortEarly: false }).catch((error) => {
      expect(error.details.length).toBe(1)
      expect(error.details[0].message).toBe('email_is_required')
    })
  })

  it('should not validate user with a null email', async () => {
    const testUser = { ...newUser, email: null }
    await userSchema.validateAsync(testUser, { abortEarly: false }).catch((error) => {
      expect(error.details.length).toBe(1)
      expect(error.details[0].message).toBe('email_is_required')
    })
  })

  it('should not validate user with an undefined email', async () => {
    const testUser = { ...newUser, email: undefined }
    await userSchema.validateAsync(testUser, { abortEarly: false }).catch((error) => {
      expect(error.details.length).toBe(1)
      expect(error.details[0].message).toBe('email_is_required')
    })
  })

  it('should not validate user with a username too short', async () => {
    const testUser = { ...newUser, username: 'xx' }
    await userSchema.validateAsync(testUser, { abortEarly: false }).catch((error) => {
      expect(error.details.length).toBe(1)
      expect(error.details[0].message).toBe('username_must_be_at_least_3_characters')
    })
  })

  it('should not validate user with a username too long', async () => {
    const testUser = { ...newUser, username: 'x'.repeat(51) }
    await userSchema.validateAsync(testUser, { abortEarly: false }).catch((error) => {
      expect(error.details.length).toBe(1)
      expect(error.details[0].message).toBe('username_must_be_less_than_50_characters')
    })
  })

  it('should not validate user with an empty username', async () => {
    const testUser = { ...newUser, username: '' }
    await userSchema.validateAsync(testUser, { abortEarly: false }).catch((error) => {
      expect(error.details.length).toBe(1)
      expect(error.details[0].message).toBe('username_is_required')
    })
  })

  it('should not validate user with a null username', async () => {
    const testUser = { ...newUser, username: null }
    await userSchema.validateAsync(testUser, { abortEarly: false }).catch((error) => {
      expect(error.details.length).toBe(1)
      expect(error.details[0].message).toBe('username_is_required')
    })
  })

  it('should not validate user with an undefined username', async () => {
    const testUser = { ...newUser, username: undefined }
    await userSchema.validateAsync(testUser, { abortEarly: false }).catch((error) => {
      expect(error.details.length).toBe(1)
      expect(error.details[0].message).toBe('username_is_required')
    })
  })

  it('should not validate user with a password too short', async () => {
    const testUser = { ...newUser, password: 'x'.repeat(7) }
    await userSchema.validateAsync(testUser, { abortEarly: false }).catch((error) => {
      expect(error.details.length).toBe(1)
      expect(error.details[0].message).toBe('password_must_be_at_least_8_characters')
    })
  })

  it('should not validate user with an empty password', async () => {
    const testUser = { ...newUser, password: '' }
    await userSchema.validateAsync(testUser, { abortEarly: false }).catch((error) => {
      expect(error.details.length).toBe(1)
      expect(error.details[0].message).toBe('password_is_required')
    })
  })

  it('should not validate user with a null password', async () => {
    const testUser = { ...newUser, password: null }
    await userSchema.validateAsync(testUser, { abortEarly: false }).catch((error) => {
      expect(error.details.length).toBe(1)
      expect(error.details[0].message).toBe('password_is_required')
    })
  })

  it('should not validate user with an undefined password', async () => {
    const testUser = { ...newUser, password: undefined }
    await userSchema.validateAsync(testUser, { abortEarly: false }).catch((error) => {
      expect(error.details.length).toBe(1)
      expect(error.details[0].message).toBe('password_is_required')
    })
  })

  it('should not validate user with an empty password, username and email', async () => {
    const testUser = { ...newUser, password: '', username: '', email: '' }
    await userSchema.validateAsync(testUser, { abortEarly: false }).catch((error) => {
      expect(error.details.length).toBe(3)
      expect(error.details[0].message).toBe('username_is_required')
      expect(error.details[1].message).toBe('email_is_required')
      expect(error.details[2].message).toBe('password_is_required')
    })
  })

  it('should not validate user with an undefined password, username and email', async () => {
    const testUser = { ...newUser, password: undefined, username: undefined, email: undefined }
    await userSchema.validateAsync(testUser, { abortEarly: false }).catch((error) => {
      expect(error.details.length).toBe(3)
      expect(error.details[0].message).toBe('username_is_required')
      expect(error.details[1].message).toBe('email_is_required')
      expect(error.details[2].message).toBe('password_is_required')
    })
  })

  it('should not validate user with a null password, username and email', async () => {
    const testUser = { ...newUser, password: null, username: null, email: null }
    await userSchema.validateAsync(testUser, { abortEarly: false }).catch((error) => {
      expect(error.details.length).toBe(3)
      expect(error.details[0].message).toBe('username_is_required')
      expect(error.details[1].message).toBe('email_is_required')
      expect(error.details[2].message).toBe('password_is_required')
    })
  })

  afterAll(async () => {
    await db.dropDatabase()
    await client.close()
  })
})
