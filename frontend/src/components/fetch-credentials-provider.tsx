"use client";

import { useEffect } from "react";

export function FetchCredentialsProvider() {
  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    window.fetch = (input, init = {}) => {
      const mergedInit: RequestInit = {
        ...init,
        credentials: "include",
      };
      return originalFetch(input, mergedInit);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}
