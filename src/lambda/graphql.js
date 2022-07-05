// src/lambda/graphql.js
const { ApolloServer, gql } = require("apollo-server-lambda");

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello: (parent, args, context) => {
      return "Hello, world!";
    }
  }
};

// https://stackoverflow.com/a/71629935
const getHandler = (event, context) => {
  const server = new ApolloServer({
      typeDefs,
      resolvers
  });

  const graphqlHandler = server.createHandler();

  if (!event.requestContext) {
      event.requestContext = context;
  }
  return graphqlHandler(event, context);
}

exports.handler = getHandler;
