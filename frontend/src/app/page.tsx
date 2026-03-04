"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Root page — middleware handles the redirect.
 * Client-side fallback: auth → dashboard, no auth → school login.
 * Landing page is a separate app (2eh.net / localhost:3002).
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check for auth token
    const token = document.cookie
      .split(";")
      .find((c) => c.trim().startsWith("token="));

    if (token) {
      try {
        const value = token.split("=").slice(1).join("=");
        const payload = value.split(".")[1];
        const decoded = JSON.parse(atob(payload));

        if (decoded.role === "STUDENT") {
          router.replace("/dashboard/student/results");
        } else if (decoded.role === "PARENT") {
          router.replace("/dashboard/parent/students");
        } else {
          router.replace("/dashboard");
        }
        return;
      } catch {
        // Invalid token
      }
    }

    // No valid token → school login page
    router.replace("/login/school");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f172a]">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Yönlendiriliyor...
        </p>
      </div>
    </div>
  );
}
