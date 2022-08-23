const { ApolloServer, gql } = require("apollo-server-lambda");
const { v4: uuidv4, } = require('uuid');
const { allBookmarks, deleteBookmark, createBookmark, updateBookmark } = require('./src/db/index.js');

const typeDefs = gql`
  type Bookmark {
    id: ID!
    title: String
    description: String
    url: String
    videoURL: String
    screenshotURL: String
    createdAt: String
  }

  input BookmarkInput {
    title: String
    url: String
    description: String
    screenshotURL: String
  }

  type Query {
    bookmarks: [Bookmark]
  }

  type Mutation {
    createBookmark(bookmark: BookmarkInput): Bookmark 
    updateBookmark(id: ID!, updates: BookmarkInput): Bookmark 
    deleteBookmark(id: ID!): Bookmark 
  }
`

const resolvers = {
  Query: {
    bookmarks: () => allBookmarks()
  },
  Mutation: {
    updateBookmark: (root, { id, updates }) => updateBookmark(id, updates),
    createBookmark: (root, { bookmark }) => createBookmark({
      ...bookmark,
      authorId: 1,
    }),
    deleteBookmark: (root, { id } ) => deleteBookmark(id)
  } 
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  csrfPrevention: true,
  cache: 'bounded'
});

exports.graphqlHandler = server.createHandler();
