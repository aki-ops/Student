import './globals.css';
import type { Metadata } from 'next';
import { ApolloWrapper } from '@/components/ApolloWrapper';

export const metadata: Metadata = {
  title: 'My Frontend',
  description: 'Education System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  );
}
