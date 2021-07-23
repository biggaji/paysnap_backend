import { gql } from 'apollo-server';

const typedefs = gql`

    type Query {
        getUser(id:ID!): User
    }

    type User {
        id:ID!
    }
`;

export default typedefs;