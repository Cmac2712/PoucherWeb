const { ApolloServer, gql } = require("apollo-server-lambda");
const { v4: uuidv4, } = require('uuid');
const { allBookmarks, deleteBookmark, createBookmark } = require('./src/db/index.js');

const typeDefs = gql`
  type Bookmark {
    id: ID!
    title: String
    description: String
    url: String
    videoUrl: String
    createdAt: String
  }

  input BookmarkInput {
    title: String
    url: String
    description: String
    videoUrl?: String
  }

  type Query {
    bookmarks: [Bookmark]
  }

  type Mutation {
    createBookmark(bookmark: BookmarkInput): Bookmark 
    deleteBookmark(id: ID!): Bookmark 
  }
`
  
const resolvers = {
  Query: {
    bookmarks: () => allBookmarks()
  }
  ,
  Mutation: {
    createBookmark: (root, { bookmark }) => createBookmark({
      ...bookmark,
      authorId: 1,
    }),
    deleteBookmark: (root, { id } ) => {
      return deleteBookmark(id)
    }
  } 
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  csrfPrevention: true,
  cache: 'bounded'
});

exports.graphqlHandler = server.createHandler();
