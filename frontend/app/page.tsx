'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import { CURRENT_USER_QUERY } from "@/graphql/queries";

export default function Home() {
  const router = useRouter();
  const { data, loading } = useQuery(CURRENT_USER_QUERY);
  useEffect(() => {
    if (!loading) {
      if (data?.current_User) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [data, loading, router]);
  return null;
}

// No input fields in this file, so nothing to change for input visibility.
