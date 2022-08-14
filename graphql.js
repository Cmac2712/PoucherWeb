const { ApolloServer, gql } = require("apollo-server-lambda");
const { v4: uuidv4, } = require('uuid');
const { allBookmarks, deleteBookmark, createBookmark } = require('./src/db/index.js');

const typeDefs = gql`
  type Bookmark {
    id: ID!
    title: String
    url: String
    videoUrl: String
    createdAt: String
  }

  input BookmarkInput {
    title: String
    url: String
    videoUrl: String
  }

  type Query {
    bookmarks: [Bookmark]
  }

  type Mutation {
    createBookmark(bookmark: BookmarkInput): Bookmark 
    deleteBookmark(id: ID!): Bookmark 
  }
`
  
// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
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
