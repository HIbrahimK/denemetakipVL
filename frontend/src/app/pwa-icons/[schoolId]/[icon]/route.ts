import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/auth";

export const runtime = "nodejs";

const ALLOWED_ICONS = new Set([
  "icon-72x72.png",
  "icon-96x96.png",
  "icon-128x128.png",
  "icon-144x144.png",
  "icon-152x152.png",
  "icon-192x192.png",
  "icon-384x384.png",
  "icon-512x512.png",
  "favicon-32x32.png",
]);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ schoolId: string; icon: string }> },
) {
  const { schoolId, icon } = await context.params;

  if (!ALLOWED_ICONS.has(icon)) {
    return NextResponse.json({ message: "Icon not found" }, { status: 404 });
  }

  const iconUrl = `${API_BASE_URL}/uploads/pwa-icons/${schoolId}/${icon}`;

  try {
    const response = await fetch(iconUrl, { cache: "no-store" });

    if (response.ok) {
      const contentType = response.headers.get("content-type") || "image/png";
      const buffer = Buffer.from(await response.arrayBuffer());
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }
  } catch {
    // Fallback below
  }

  const fallbackUrl = new URL(`/icons/${icon}`, request.url);
  return NextResponse.redirect(fallbackUrl, { status: 302 });
}
