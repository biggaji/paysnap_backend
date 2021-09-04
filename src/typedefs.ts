import { gql } from 'apollo-server';
import { GraphQLScalarType, Kind } from 'graphql';

// Writing a custom scalar type for date
export const dateScalar = new GraphQLScalarType ({
        name: 'Date',
        description: 'Date custom scalar type',
        serialize(value) {
            return value.getTime();
        },
        parseValue(value) {
            return new Date(value);
        },
        parseLiteral(ast) {
            if(ast.kind === Kind.INT) {
                return new Date(parseInt(ast.value, 10));
            }
            return null;
        }
    });


const typedefs = gql`
  scalar Date

  type Query {
    getUser: [User!]
    login(opts: LoginInputs!): LoginResponse!
    getAUser(id: ID!): User!
    me: User!
    getTransaction(opts:FetchTransactionInputs): FetchTransactionResponse!
    getNextTransactions(limit:Int!, calOpts:String!, after:String!):FetchTransactionResponse!
  }

  type Mutation {
    createAccount(opts: CreateAccountInputs!): CreateAccountMutationResponse!
    activateAccount(token: String!): ActivateAccountResponse!
    sendMoney(opts: SendMoneyInputs!): SendMoneyResponse!
    setupPin(pin:Int!): Boolean!
    addAvatar(avatarUrl:String!):AddAvatarResponse!
  }

  input CreateAccountInputs {
    fullname: String!
    email: String!
    username: String!
    country: String!
    password: String!
  }

  input LoginInputs {
    username: String!
    password: String!
  }

  input FetchTransactionInputs {
      limit:Int!
      calOpts:String!
  }

  type ActivateAccountResponse {
    code: String!
    success: Boolean!
    message: String!
    user: User
  }

  type AddAvatarResponse {
    code: String!
    success: Boolean!
    message: String!
    avatar: User
  }

  input SendMoneyInputs {
    receiverUsername: String!
    amount: Int!
    pin:Int!
  }

  type SendMoneyResponse {
    code: String!
    success: Boolean!
    message: String!
    transaction: Transaction
  }

  type FetchTransactionResponse {
    transactions: [Transaction!]
    hasNextPage:Boolean,
    cursor:String
  }

  type LoginResponse {
    user: User
    token: String
  }

  type CreateAccountMutationResponse {
    code: String!
    success: Boolean!
    message: String!
    user: User
    token: String
  }

  type User {
    id: ID!
    fullname: String!
    email: String!
    username: String!
    country: String!
    password: String!
    pin:String
    isactivated: Boolean
    verificationtoken: String
    avatar: String
    accountbalance: Int!
    createdat: Date!
    updatedat: Date
    transactions: [Transaction!]
  }

  type Transaction {
    id: ID!
    amount: Int!
    transactionstatus: String!
    senderid: ID!
    receiverid: ID!
    transactedat: Date!
  }

  enum transactionStatus {
    PENDING
    SUCCESSFUL
    FAILED
  }
`;

export default typedefs;