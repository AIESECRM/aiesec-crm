import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
import JSZip from "jszip";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function addFolderToZip(zip: JSZip, folderPath: string, zipFolder: JSZip) {
  const entries = readdirSync(folderPath);
  for (const entry of entries) {
    const fullPath = join(folderPath, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      // .git gibi gizli klasörleri atla
      if (entry.startsWith('.')) continue;
      const subFolder = zipFolder.folder(entry)!;
      addFolderToZip(zip, fullPath, subFolder);
    } else {
      const content = readFileSync(fullPath);
      zipFolder.file(entry, content);
    }
  }
}

export async function GET(req: NextRequest) {
  try {
    // Proje kök dizininde chrome-extension klasörünü bul
    const extensionDir = join(process.cwd(), "chrome-extension");

    if (!existsSync(extensionDir)) {
      return NextResponse.json(
        { error: "Eklenti dosyaları bulunamadı." },
        { status: 404 }
      );
    }

    const zip = new JSZip();
    const folder = zip.folder("aiesec-crm-extension")!;
    addFolderToZip(zip, extensionDir, folder);

    const zipData = await zip.generateAsync({
      type: "arraybuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
    });

    return new Response(zipData, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="aiesec-crm-extension.zip"',
        "Content-Length": zipData.byteLength.toString(),
      },
    });
  } catch (error: any) {
    console.error("Extension download error:", error);
    return NextResponse.json(
      { error: "Eklenti dosyası oluşturulurken hata oluştu." },
      { status: 500 }
    );
  }
}
