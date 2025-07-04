import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { REFRESH_ACCESS_TOKEN } from '../graphql/mutations';
import { fromPromise } from '@apollo/client';

const httpLink = createHttpLink({
  uri: 'http://localhost:3000/graphql',
  credentials: 'include',
});

let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

const resolvePendingRequests = () => {
  pendingRequests.forEach(callback => callback());
  pendingRequests = [];
};

const refreshClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  credentials: 'include',
});

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors) {
    const unauth = graphQLErrors.find(
      err => err.extensions?.code === 'UNAUTHENTICATED'
    );
    if (unauth) {
      if (!isRefreshing) {
        isRefreshing = true;
        return fromPromise(
          refreshClient
            .mutate({ mutation: REFRESH_ACCESS_TOKEN })
            .then(() => {
              resolvePendingRequests();
            })
            .catch(() => {
              window.location.href = '/login';
            })
            .finally(() => {
              isRefreshing = false;
            })
        ).flatMap(() =>
          fromPromise(
            new Promise(resolve => {
              pendingRequests.push(() => {
                forward(operation).subscribe({
                  next: result => resolve(result),
                  error: error => resolve(error),
                });
              });
            })
          )
        );
      }
      return fromPromise(
        new Promise(resolve => {
          pendingRequests.push(() => {
            forward(operation).subscribe({
              next: result => resolve(result),
              error: error => resolve(error),
            });
          });
        })
      );
    }
  }
});

export const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache(),
});
