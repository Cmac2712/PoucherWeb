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

const client = new ApolloClient({ 
  uri: "https://izpcehh3ef.execute-api.eu-west-2.amazonaws.com/dev/",
  cache: new InMemoryCache(),
  fetchOptions: {
    mode: 'no-cors',
  }
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
