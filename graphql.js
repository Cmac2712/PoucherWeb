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
  updateUser,
  getTags,
  updateTag
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
  }

  type User {
    id: ID
    name: String
    email: String
  }

  type Tag {
    ID: ID!
    authorID: ID!
    bookmarkID: String 
    title: String
  }

  input BookmarkInput {
    id: ID
    title: String
    url: String
    authorID: ID
    description: String
    screenshotURL: String
  }

  input UserInput {
    id: ID
    name: String
    email: String
  }

  input TagInput {
    id: ID
    bookmarkID: String
    title: String
  }

  type Query {
    getTags(user: UserInput):[Tag]
    createUser(user: UserInput):User
    getUser(input: UserInput):User
    searchBookmarks(offset: Int, limit: Int, input: BookmarkInput): [Bookmark]
    getBookmarksByAuthor(id: ID!, offset: Int, limit: Int): [Bookmark]
    getBookmarksCount(input: BookmarkInput): Int
  }

  type Mutation {
    updateTag(tag: TagInput):Tag
    updateUser(user: UserInput):User
    createBookmark(bookmark: BookmarkInput): Bookmark 
    updateBookmark(id: ID!, updates: BookmarkInput): Bookmark 
    deleteBookmark(id: ID!): Bookmark 
  }
`

const resolvers = {
  Query: {
    getTags: (root, { id }) => getTags(id),
    createUser: (root, input) => createUser(input),
    getUser: (root, { input: { id } }) => getUser(id),
    searchBookmarks: (root, { offset, limit, input: { title, description, authorID } }) => searchBookmarks(offset, limit, authorID, title, description),
    getBookmarksByAuthor: (root, { id, offset, limit }) => getBookmarksByAuthor(id, offset, limit),
    getBookmarksCount: (root, { input: { authorID, title, description} }) => getBookmarksCount(authorID, title, description)
  },
  Mutation: {
    updateTag: (root, input) => updateTag(input),
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
