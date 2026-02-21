"use client";

import { useEffect } from "react";
import { API_BASE_URL } from "@/lib/auth";

const getLoginPathByRole = (role?: string) => {
  if (role === "STUDENT") return "/login/student";
  if (role === "PARENT") return "/login/parent";
  return "/login/school";
};

export function FetchCredentialsProvider() {
  useEffect(() => {
    const originalFetch = window.fetch.bind(window);
    let redirectInProgress = false;

    window.fetch = async (input, init = {}) => {
      const mergedInit: RequestInit = {
        ...init,
        credentials: "include",
      };

      const response = await originalFetch(input, mergedInit);

      const requestUrl =
        typeof input === "string"
          ? input
          : input instanceof Request
          ? input.url
          : "";

      const isApiRequest = requestUrl.startsWith(API_BASE_URL) || requestUrl.startsWith("/api/");

      if (
        response.status === 401 &&
        isApiRequest &&
        !redirectInProgress &&
        !window.location.pathname.startsWith("/login")
      ) {
        redirectInProgress = true;

        let role: string | undefined;
        try {
          const userStr = localStorage.getItem("user");
          role = userStr ? JSON.parse(userStr)?.role : undefined;
        } catch {
          role = undefined;
        }

        localStorage.removeItem("user");
        localStorage.removeItem("auth");
        document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

        window.location.href = getLoginPathByRole(role);
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}
