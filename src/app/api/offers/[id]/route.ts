import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { title, value, product, duration, openStatus } = body;

    const offerId = parseInt(params.id);

    const updatedOffer = await prisma.offer.update({
      where: { id: offerId },
      data: {
        title,
        product,
        duration,
        openStatus,
        value: typeof value === 'number' ? value : parseFloat(value),
      },
    });

    return NextResponse.json({ success: true, offer: updatedOffer });
  } catch (error: any) {
    console.error('PATCH /api/offers/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update offer' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const offerId = parseInt(params.id);

    await prisma.offer.delete({
      where: { id: offerId }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/offers/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete offer' }, { status: 500 });
  }
}
