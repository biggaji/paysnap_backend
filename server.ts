import { config } from  'dotenv';
if (process.env.NODE_ENV !== "production") {
  config();
}

import { ApolloServer, AuthenticationError} from 'apollo-server-express';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import express from 'express';
import typeDefs from './src/typedefs';
import resolvers from './src/resolvers';
import decodeUser from './@utils/decodeUser';


(async function() {
  const app = express();

  const httpServer = createServer(app);

  const schema = makeExecutableSchema({ typeDefs, resolvers });
  
  
  
  const server = new ApolloServer({
    schema,
    plugins: [{
      async serverWillStart() {
        return {
          async drainServer() {
            subscriptionServer.close();
          }
        };
      }
    }],
    context: async ({ req }) => {
      
      let token = req.headers.authorization || req.headers.x_user_token;
      const user = await decodeUser(token);
      
      if(!user) {
        throw new AuthenticationError("Session expired, login again!");
      } else {
        return user;
      }
      
    }
  });
  
  // subscription server
  
  const subscriptionServer = SubscriptionServer.create({
    schema,
    execute,
    subscribe,
  }, {
    server: httpServer,
    path: server.graphqlPath
  });

   await server.start();
   server.applyMiddleware({ app });

   const PORT = 4000;
   httpServer.listen(PORT, () =>
     console.log(`Server is now running on http://localhost:${PORT}/graphql`)
   );
  
})();




// const mocks = {
//   Query: () => ({
//     getUser: () => [...new Array(1)],
//   }),
//   User: () => ({
//     id: () => "a7f15e8d-9334-464a-9527-7a46044aacbf",
//     fullname: () => "John Doe",
//     email: () => "johndoe@mail.com",
//     username: () => "Johndoe",
//     country: () => "Usa",
//     password: () => "hshhdhuu83366",
//     isActivated: () => true,
//     avatar: () =>
//       "https://res.cloudinary.com/dety84pbu/image/upload/v1606816219/kitty-veyron-sm_mctf3c.jpg",
//     accountBalance: () => 100000,
//     createdAt: () => "2021-07-23 14:59:31.064562+01",
//     updateAt: () => "2021-07-24 14:59:31.064562+01",
//     transactions: () => {
//         return [{
//           id: "a7f15e8d-9334-464a-9527-7a46044aacbf",
//           amount: 20000,
//           transactionStatus: "success",
//           senderId: "a7f15e8d-9334-464a-9527-7a46044aacbf",
//           receiverId: "a7f15e8d-9334-464a-9527-7a46044aacbf",
//           transactedAt: "2021-07-23 14:59:31.064562+01",
//     }
//         }];
//   }),
// };




// server.listen().then(() => {
//     console.log(`
//     🚀  Server is running!
//     🔉  Listening on port 4000
//     📭  Query at https://studio.apollographql.com/dev
//   `);
// });