import { API_BASE_URL } from "@/lib/auth";

interface ResolvedSchool {
  id: string;
}

export async function resolveSchoolIdFromHost(
  signal?: AbortSignal,
): Promise<string | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const host = window.location.hostname;
  if (!host) {
    return null;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/schools/resolve?host=${encodeURIComponent(host)}`,
      {
        credentials: "include",
        signal,
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as Partial<ResolvedSchool>;
    return typeof data.id === "string" ? data.id : null;
  } catch {
    return null;
  }
}
