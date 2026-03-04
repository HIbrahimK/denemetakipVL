import { jwtVerify } from "jose";

export const AUTH_COOKIE_NAME = "token";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  schoolId: string;
  iat: number;
  exp: number;
}

/**
 * Verify JWT token using jose (edge-compatible).
 * Returns payload if valid, null otherwise.
 */
export async function verifyToken(
  token: string
): Promise<JwtPayload | null> {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET is not configured");
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}
