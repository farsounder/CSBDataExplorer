import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { NOAA_CACHE_TAG } from "@/services/noaa-csb-api";

export async function POST(request: NextRequest) {
  const expectedToken = process.env.NOAA_REVALIDATE_TOKEN;
  if (!expectedToken) {
    return NextResponse.json(
      {
        ok: false,
        message: "NOAA_REVALIDATE_TOKEN is not configured on the server",
      },
      { status: 500 }
    );
  }

  const providedToken =
    request.headers.get("x-revalidate-token") || (await request.json().catch(() => null))?.token;
  if (!providedToken || providedToken !== expectedToken) {
    return NextResponse.json(
      {
        ok: false,
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  revalidateTag(NOAA_CACHE_TAG, "max");

  return NextResponse.json({
    ok: true,
    message: "NOAA cache revalidated",
    tag: NOAA_CACHE_TAG,
    timestamp: new Date().toISOString(),
  });
}
