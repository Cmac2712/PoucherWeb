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
  uri: "https://gt0i6i2x1i.execute-api.us-east-1.amazonaws.com/dev/",
  cache: new InMemoryCache()
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
