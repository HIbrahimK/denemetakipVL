import { cookies } from "next/headers";
import { API_BASE_URL } from "@/lib/auth";

export const runtime = "nodejs";

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512] as const;

type TokenPayload = {
  schoolId?: string;
};

type SchoolManifestData = {
  name?: string;
  appShortName?: string;
  updatedAt?: string;
};

function parseTokenPayload(token?: string): TokenPayload {
  if (!token) {
    return {};
  }

  try {
    const payloadSegment = token.split(".")[1];
    if (!payloadSegment) {
      return {};
    }

    const normalized = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json) as TokenPayload;
  } catch {
    return {};
  }
}

async function fetchSchoolData(
  schoolId: string,
  token: string,
): Promise<SchoolManifestData | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/schools/${schoolId}`, {
      headers: {
        Cookie: `token=${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as SchoolManifestData;
  } catch {
    return null;
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = parseTokenPayload(token);
  const schoolId = payload.schoolId;

  let appName = "Deneme Takip Sistemi";
  let iconVersion = "";

  if (schoolId && token) {
    const school = await fetchSchoolData(schoolId, token);
    if (school?.appShortName?.trim()) {
      appName = school.appShortName.trim();
    } else if (school?.name?.trim()) {
      appName = school.name.trim();
    }
    if (school?.updatedAt) {
      iconVersion = `?v=${new Date(school.updatedAt).getTime()}`;
    }
  }

  const iconPrefix = schoolId ? `/pwa-icons/${schoolId}` : "/icons";
  const icons = ICON_SIZES.map((size) => ({
    src: `${iconPrefix}/icon-${size}x${size}.png${iconVersion}`,
    sizes: `${size}x${size}`,
    type: "image/png",
    purpose: "maskable any",
  }));

  const manifest = {
    id: "/",
    name: appName,
    short_name: appName,
    description: "Okul deneme sinavi takip sistemi",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#1e1e2d",
    theme_color: "#1e1e2d",
    lang: "tr",
    icons,
    screenshots: [
      {
        src: "/screenshots/dashboard.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
      },
      {
        src: "/screenshots/mobile.png",
        sizes: "750x1334",
        type: "image/png",
        form_factor: "narrow",
      },
    ],
    categories: ["education", "productivity"],
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
