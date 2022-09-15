import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  gql
} from "@apollo/client";
import './index.css'
import { offsetLimitPagination } from '@apollo/client/utilities';

const cache = new InMemoryCache({
  // typePolicies: {
  //   Query: {
  //     fields: {
  //       getBookmarksByAuthor: {
  //         read(existing, { args: { offset, limit }}) {
  //           console.log('existing: ', existing)
  //           return existing && existing.slice(offset, offset + limit);
  //         },
  //         ...offsetLimitPagination(["id"]),
  //       }
  //     }
  //   }
  // }
})

const client = new ApolloClient({ 
  uri: import.meta.env.VITE_SERVER_ENDPOINT,
  cache
});

ReactDOM
  .createRoot(document.getElementById('root')!)
  .render(
    <React.StrictMode>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </React.StrictMode>
  )

export { client }