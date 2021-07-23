import { ApolloServer } from 'apollo-server';
import typeDefs from './src/typedefs';
import resolvers from './src/resolvers';

const server = new ApolloServer({
    typeDefs
});

server.listen().then(() => {
    console.log(`
    🚀  Server is running!
    🔉  Listening on port 4000
    📭  Query at https://studio.apollographql.com/dev
  `);
});