import { User } from '../models/index.js'
import { db, connect } from '../utils/db.js'
import { gql } from 'apollo-server-express'
import casual from 'casual'
import { initTestServer } from '../utils/testing.js'
import jwt from 'jsonwebtoken'

/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */

const ME_QUERY = gql`
  query Me {
    me {
      username
      email
    }
  }
`

const LOGIN_QUERY = gql`
  query Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      refreshToken
    }
  }
`

describe('User resolver', () => {
  let testServer: any
  let token: string
  const testUser = {
    username: casual.username,
    email: casual.email,
    password: casual.password + casual.password, //min length
  }

  beforeAll(async () => {
    await connect()
    testServer = await initTestServer()
    await User.create(testUser)
  })

  it('me Query | should return the current logged in user', async () => {
    const loginResp = await testServer.execute({
      query: LOGIN_QUERY,
      variables: { email: testUser.email, password: testUser.password },
    })
    token = loginResp.data.login.accessToken
    const result = await testServer.execute({
      query: ME_QUERY,
      context: { headers: { authorization: token } },
    })
    expect(result.errors).toBeUndefined()
    expect(result.data?.me.username).toBe(testUser.username)
    expect(result.data?.me.email).toBe(testUser.email)
  })

  it('me Query | should not return the current logged-in user without valid accessToken', async () => {
    const result = await testServer.execute({
      query: ME_QUERY,
      context: { headers: { authorization: '' } },
    })
    expect(result.data).toBe(null)
    expect(result.errors).toBeDefined()
    expect(result.errors[0].message).toBe('must_be_logged_in')
  })

  it('me Query | should not return the current logged-in user with an expired accessToken', async () => {
    const expiredToken = 'Bearer ' + jwt.sign({ email: testUser.email }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '1' }) //expires in 1ms
    const result = await testServer.execute({
      query: ME_QUERY,
      context: { headers: { authorization: expiredToken } },
    })
    expect(result.errors).toBeDefined()
    expect(result.errors?.[0].message).toBe('accessToken_expired')
    expect(result.data).toBe(null)
  })

  afterAll(async () => {
    await testServer.stop()
    await db.dropDatabase()
    await db.close()
  })
})
