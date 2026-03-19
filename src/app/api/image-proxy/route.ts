import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return new NextResponse("Görsel URL parametresi eksik", { status: 400 });
  }

  try {
    const fetchRes = await fetch(url);
    
    if (!fetchRes.ok) {
        throw new Error(`HTTP Error: ${fetchRes.status}`);
    }

    const buffer = await fetchRes.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": fetchRes.headers.get("content-type") || "image/jpeg",
        // Tarayıcı ve Vercel CDN tarafında önbellekleme
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200", 
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return new NextResponse("Görsel proxy sunucusundan alınamadı", { status: 500 });
  }
}
