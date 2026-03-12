import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deleteFileFromFTP } from "@/lib/ftp";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz!" }, { status: 401 });

  try {
    const { name, image } = await req.json();
    const userSession = session.user as any;
    const userId = parseInt(userSession.id);

    // Eğer yeni bir resim gelmişse eskisini sunucudan silelim
    if (image) {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { image: true } as any
      }) as any;

      if (currentUser?.image) {
        try {
          // URL'den dosya adını ve klasörü ayıkla
          // Örn: https://www.aiesecrm.com/uploads/pp/123-img.jpg
          const publicUrl = process.env.FTP_PUBLIC_URL || '';
          const relativePath = currentUser.image.replace(publicUrl, '').replace(/^\//, '');
          const parts = relativePath.split('/');
          
          if (parts.length >= 2) {
            const subDir = parts[0];
            const fileName = parts[1];
            await deleteFileFromFTP(fileName, subDir);
          } else if (parts.length === 1) {
            const fileName = parts[0];
            await deleteFileFromFTP(fileName);
          }
        } catch (e) {
          console.error("Eski profil resmi silinirken hata:", e);
        }
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(image && { image }),
      },
      select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          chapter: true
      } as any
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ error: "Profil güncellenirken bir hata oluştu." }, { status: 500 });
  }
}
