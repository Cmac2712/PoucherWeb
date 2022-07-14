const { v4: uuidv4 } = require('uuid');
const { ApolloServer, gql } = require('apollo-server-lambda');

const typeDefs = gql`
  type Bookmark {
    id: ID!
    title: String
    url: String
  }

  input BookmarkInput {
    title: String
    url: String
  }

  type Query {
    bookmarks: [Bookmark]
  }

  type Mutation {
    addBookmark(bookmark: BookmarkInput): Bookmark 
    deleteBookmark(id: ID!): ID 
  }
`
  
var bookmarks = [
  {
    id: '1',
    title: 'Random Image',
    url: 'https://picsum.photos/200/300'
  },
  {
    id: '2',
    title: 'Random Article',
    url: 'https://www.random.org/',
  },
  {
    id: '3',
    title: 'Random Image 2',
    url: 'https://picsum.photos/200/300'
  }
];

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    bookmarks: () => bookmarks,
  }
  ,
  Mutation: {
    addBookmark: (root, { bookmark }) => {
      bookmarks.push(
        {
          id: uuidv4(),
          ...bookmark
        }
      );
      return bookmark;
    },
    deleteBookmark: (root, { id } ) => {
      bookmarks = bookmarks.filter(bookmark => bookmark.id !== id);
      return id
    }
  } 
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  csrfPrevention: true,
  cache: 'bounded',
});

exports.graphqlHandler = server.createHandler();
