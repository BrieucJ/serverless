import { gql } from 'apollo-server-express'

export default gql`
  type Translation {
    key: String!
    value: String!
    locale: String!
    ns: String!
  }

  type Query {
    translations(locale: String!, ns: String!): [Translation]
  }
`
