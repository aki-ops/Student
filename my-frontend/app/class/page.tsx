"use client";

import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { useRouter } from 'next/navigation';

export default function ClassPage() {
  const router = useRouter();
  // TODO: Fetch and display classes
  return (
    <ProtectedRoute>
      <Layout>
        <h1 className="text-2xl font-bold mb-4">Classes</h1>
        <p>Class list will be shown here.</p>
      </Layout>
    </ProtectedRoute>
  );
}
