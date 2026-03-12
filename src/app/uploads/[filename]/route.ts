import { NextRequest, NextResponse } from "next/server";
import { downloadFileFromFTP } from "@/lib/ftp";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params;
    
    // FTP'den dosyayı çek
    const fileBuffer = await downloadFileFromFTP(filename);

    // Tarayıcıya PDF olarak döndür
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "public, max-age=31536000, immutable"
      },
    });
  } catch (error) {
    console.error("File Proxy Error:", error);
    return new NextResponse("Dosya bulunamadı veya bir hata oluştu.", { status: 404 });
  }
}
