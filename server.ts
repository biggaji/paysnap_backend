import { config } from  'dotenv';
config();
import { ApolloServer } from 'apollo-server';
import typeDefs from './src/typedefs';
import resolvers from './src/resolvers';

const mocks = {
  Query: () => ({
    getUser: () => [...new Array(1)],
  }),
  User: () => ({
    id: () => "a7f15e8d-9334-464a-9527-7a46044aacbf",
    fullname: () => "John Doe",
    email: () => "johndoe@mail.com",
    username: () => "Johndoe",
    country: () => "Usa",
    password: () => "hshhdhuu83366",
    isActivated: () => true,
    avatar: () =>
      "https://res.cloudinary.com/dety84pbu/image/upload/v1606816219/kitty-veyron-sm_mctf3c.jpg",
    accountBalance: () => 100000,
    createdAt: () => "2021-07-23 14:59:31.064562+01",
    updateAt: () => "2021-07-24 14:59:31.064562+01",
    transactions: () => {
        return [{
          id: "a7f15e8d-9334-464a-9527-7a46044aacbf",
          amount: 20000,
          transactionStatus: "success",
          senderId: "a7f15e8d-9334-464a-9527-7a46044aacbf",
          receiverId: "a7f15e8d-9334-464a-9527-7a46044aacbf",
          transactedAt: "2021-07-23 14:59:31.064562+01",
        }];
    }
  }),
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
    mocks:false
});

server.listen().then(() => {
    console.log(`
    🚀  Server is running!
    🔉  Listening on port 4000
    📭  Query at https://studio.apollographql.com/dev
  `);
});