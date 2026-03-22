import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // Sadece Node arkaplanında çalışabilmesi için

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return new NextResponse("Görsel URL parametresi eksik", { status: 400 });
  }

  // GÜVENLİK (SSRF KORUMASI): İstek atılan adres SADECE kendi CDN sunucumuz olabilir.
  // Başka sitelere Vercel'i köprü yaptırmamak için bu kontrol hayatidir!
  if (!url.startsWith("https://cdn.aiesecrm.com/") && !url.startsWith("http://cdn.aiesecrm.com/")) {
    return new NextResponse("Sadece aiesecrm.com adresine proxy yapılabilir", { status: 403 });
  }

  // Güvenlik Duvarını sadece bu "bilindik" CDN işlemi için kaldır:
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  try {
    const fetchRes = await fetch(url);
    
    if (!fetchRes.ok) {
        throw new Error(`HTTP Sunucusu Hatası: ${fetchRes.status}`);
    }

    // GÜVENLİK (XSS KORUMASI): Ne gelirse gelsin, istemciye bunu bir HTML olarak sakın okutma,
    // zorunlu olarak "image (resim)" formatında servis et.
    const contentType = fetchRes.headers.get("content-type") || "";
    const safeContentType = contentType.includes("image") ? contentType : "application/octet-stream";

    const buffer = await fetchRes.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": safeContentType,
        // Dosyalar inline (sayfa içinde resim) olarak işlenmeli
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200", 
      },
    });
  } catch (error) {
    console.error("Image proxy hatası:", error);
    return new NextResponse("Görsel indirilirken çöktü", { status: 500 });
  } finally {
    // İşlem biter bitmez Vercel'in standart güvenlik katmanını tekrar kilitle
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1";
  }
}
