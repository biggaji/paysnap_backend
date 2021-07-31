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
        getUser: [User!],
        login(opts:LoginInputs!):LoginResponse!
    }

    type Mutation {
        createAccount(opts:CreateAccountInputs!): CreateAccountMutationResponse!,
        activateAccount(token:String!): ActivateAccountResponse!
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
    
    type ActivateAccountResponse {
        code:String!
        success:Boolean!
        message:String!
        user:User
    }

    type LoginResponse {
        user:User
        token:String
    }

    type CreateAccountMutationResponse {
        code: String!
        success: Boolean!
        message: String!
        user: User,
        token: String
    }

    type User {
        id: ID!
        fullname: String!
        email: String!
        username: String!
        country: String!
        password: String!
        isactivated: Boolean
        verificationtoken:String
        avatar: String
        accountbalance: Int!
        createdat: Date!
        updatedat: Date
        transactions: [Transaction!]
    }

    type Transaction {
        id:ID!
        amount:Int!
        transactionstatus: transactionStatus!
        senderid:ID!
        receiverid:ID!
        transactedat:Date!
    }

    enum transactionStatus {
        PENDING
        SUCCESSFUL
        FAILED
    }
`;

export default typedefs;