"use client";

import { AuthProvider } from '@/context/AuthContext';
import { ApolloProvider } from '@apollo/client';
import client from '@/lib/apollo-client';
import { ReactNode } from 'react';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>{children}</AuthProvider>
    </ApolloProvider>
  );
}
