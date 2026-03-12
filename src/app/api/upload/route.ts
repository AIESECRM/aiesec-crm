import { NextRequest, NextResponse } from "next/server";
import { uploadFileToFTP } from "@/lib/ftp";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }

    // 1. Dosya Türü Kontrolü (.pdf ve resimler)
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Sadece PDF ve resim (JPG, PNG, WEBP) dosyaları yüklenebilir!" },
        { status: 400 }
      );
    }

    // 2. Boyut Kontrolü (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Dosya boyutu 5MB'dan büyük olamaz." },
        { status: 400 }
      );
    }

    // 3. Dosyayı Buffer'a çevir
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // 4. Benzersiz dosya ismi oluştur
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFileName = `${Date.now()}-${cleanFileName}`;

    // 5. FTP ile Sunucuya Yükle
    const publicUrl = await uploadFileToFTP(fileBuffer, uniqueFileName);

    // Başarı Durumu: Dosyanın public erişilebilir yolunu döndür
    return NextResponse.json(
      { success: true, url: publicUrl, name: uniqueFileName },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json(
      { error: "Dosya yüklenirken bir hata oluştu: " + error.message },
      { status: 500 }
    );
  }
}
