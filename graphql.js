const { ApolloServer, gql } = require("apollo-server-lambda");
const { v4: uuidv4, } = require('uuid');
const { 
  searchBookmarks, 
  deleteBookmark, 
  createBookmark, 
  updateBookmark, 
  getBookmarksByAuthor, 
  getBookmarksCount,
  getUser,
  createUser,
  updateUser
} = require('./src/db/index.js');

const typeDefs = gql`
  type Bookmark {
    id: ID!
    authorID: ID!
    title: String
    description: String
    url: String
    videoURL: String
    screenshotURL: String
    createdAt: String
    tags: String
  }

  type User {
    id: ID
    name: String
    email: String
    tags: String
  }

  input BookmarkInput {
    id: ID
    title: String
    url: String
    authorID: ID
    description: String
    screenshotURL: String
    tags: String
  }

  input UserInput {
    id: ID
    name: String
    email: String
    tags: String
  }

  type Query {
    createUser(user: UserInput):User
    getUser(input: UserInput):User
    searchBookmarks(offset: Int, limit: Int, input: BookmarkInput): [Bookmark]
    getBookmarksByAuthor(id: ID!, offset: Int, limit: Int): [Bookmark]
    getBookmarksCount(input: BookmarkInput): Int
  }

  type Mutation {
    updateUser(user: UserInput):User
    createBookmark(bookmark: BookmarkInput): Bookmark 
    updateBookmark(id: ID!, updates: BookmarkInput): Bookmark 
    deleteBookmark(id: ID!): Bookmark 
  }
`

const resolvers = {
  Query: {
    createUser: (root, input) => createUser(input),
    getUser: (root, { input: { id } }) => getUser(id),
    searchBookmarks: (root, { offset, limit, input: { title, description, authorID, tags } }) => searchBookmarks(offset, limit, authorID, title, description, tags),
    getBookmarksByAuthor: (root, { id, offset, limit }) => getBookmarksByAuthor(id, offset, limit),
    getBookmarksCount: (root, { input: { authorID, title, description} }) => getBookmarksCount(authorID, title, description)
  },
  Mutation: {
    updateUser: (root, input) => updateUser(input),
    updateBookmark: (root, { id, updates }) => updateBookmark(id, updates),
    createBookmark: (root, { bookmark }) => createBookmark({
      ...bookmark
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
