import { gql } from 'apollo-server-express';
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
    getTransactions(opts: FetchTransactionInputs): FetchTransactionResponse!
    getNextTransactions(
      limit: Int!
      calOpts: String!
      after: String!
    ): FetchTransactionResponse!
    checkIfUsernameExist(username: String!): User
    checkIfEmailExist(email: String!): User
    resendActivationCode(email: String!): ResendActivationCodeResponse!
    requestCashRefill: RequestCashRefillResponse!
    deleteAccount: DeleteAccountResponse!
  }

  type Mutation {
    createAccount(opts: CreateAccountInputs!): CreateAccountMutationResponse!
    activateAccount(code: String!): ActivateAccountResponse!
    sendMoney(opts: SendMoneyInputs!): SendMoneyResponse!
    setTransactionPin(pin: Int!): Boolean!
    addAvatar(avatarUrl: String!): AddAvatarResponse!
    updateActivationCodeColumnToNull(email: String!): UpdateActivationCodeColumnResponse!
    updateAvatar(avatarUrl: String!): AddAvatarResponse!
    updateTransactionPin(opts: UpdateTransactionPinInputs!): UpdateTransactionPinResponse!
    updatePassword(opts: UpdatePasswordInputs!): UpdatePasswordResponse!
  }

  type Subscription {
    newTransaction: Transaction
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
    limit: Int!
    calOpts: String!
  }

  input UpdateTransactionPinInputs {
    oldpin: Int!
    newpin: Int!
  }

  input UpdatePasswordInputs {
    oldpassword: String!
    newpassword: String!
  }

  input SendMoneyInputs {
    receiverUsername: String!
    amount: Int!
    pin: Int!
  }

  type ActivateAccountResponse {
    code: String!
    success: Boolean!
    message: String!
    user: User
  }

  type ResendActivationCodeResponse {
    code: String!
    success: Boolean!
    message: String!
    activation_code: Int!
  }

  type UpdateActivationCodeColumnResponse {
    code: String!
    success: Boolean!
    message: String!
    activation_code: User
    updated: Boolean
  }

  type RequestCashRefillResponse {
    code: String!
    success: Boolean!
    message: String!
    refilled: Boolean
  }

  type AddAvatarResponse {
    code: String!
    success: Boolean!
    message: String!
    avatar: User
  }

  type UpdateTransactionPinResponse {
    code: String!
    success: Boolean!
    message: String!
    pinUpdated: Boolean!
  }

  type UpdatePasswordResponse {
    code: String!
    success: Boolean!
    message: String!
    passwordUpdated: Boolean!
  }

  type SendMoneyResponse {
    code: String!
    success: Boolean!
    message: String!
    transaction: Transaction
  }

  type FetchTransactionResponse {
    transactions: [Transaction!]
    hasNextPage: Boolean
    cursor: String
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

  type DeleteAccountResponse {
    code: String!
    success: Boolean!
    message: String!
    deleted: Boolean!
  }

  type User {
    id: ID!
    fullname: String!
    email: String!
    username: String!
    country: String!
    password: String!
    pin: String
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