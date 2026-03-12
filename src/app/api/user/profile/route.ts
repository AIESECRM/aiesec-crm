import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz!" }, { status: 401 });

  try {
    const { name, image } = await req.json();
    const userId = (session.user as any).id;

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
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
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ error: "Profil güncellenirken bir hata oluştu." }, { status: 500 });
  }
}
