import React from 'react';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PrintButton from '@/components/common/PrintButton';

export default async function ContractPage({ params }: { params: { id: string } }) {
    const offer = await prisma.offer.findUnique({
        where: { id: parseInt(params.id) },
        include: { 
            company: true,
            createdBy: { select: { id: true, name: true } }
        }
    });

    if (!offer) {
        notFound();
    }

    const { company } = offer;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px', fontFamily: 'serif', lineHeight: 1.6 }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>HİZMET SATIŞ SÖZLEŞMESİ</h1>
                <p style={{ color: '#555' }}>Tarih: {new Date().toLocaleDateString('tr-TR')}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                <div>
                    <h3 style={{ fontWeight: 'bold' }}>HİZMET SAĞLAYICI:</h3>
                    <p>AIESEC Türkiye</p>
                    <p>Örnek Mah. STK Cad. No: 1</p>
                    <p>İstanbul / Türkiye</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <h3 style={{ fontWeight: 'bold' }}>MÜŞTERİ:</h3>
                    <p><strong>{company.name}</strong></p>
                    <p>{company.location || 'Adres Belirtilmemiş'}</p>
                    {company.taxId && <p>Vergi No: {company.taxId}</p>}
                </div>
            </div>

            <h3 style={{ fontWeight: 'bold', marginTop: '30px' }}>1. TARAFLAR</h3>
            <p>
                İşbu sözleşme, bir tarafta AIESEC Türkiye (bundan böyle "Hizmet Sağlayıcı" olarak anılacaktır)
                ile diğer tarafta <strong>{company.name}</strong> (bundan böyle "Müşteri" olarak anılacaktır)
                arasında aşağıda belirtilen şartlar dahilinde akdedilmiştir.
            </p>

            <h3 style={{ fontWeight: 'bold', marginTop: '30px' }}>2. SÖZLEŞMENİN KONUSU</h3>
            <p>
                İşbu sözleşmenin konusu, Müşteri'nin ihtiyaçları doğrultusunda belirlenen "{offer.title}" kapsamındaki 
                {offer.product} programı hizmetlerinin Hizmet Sağlayıcı tarafından Müşteri'ye sunulmasıdır.
            </p>

            <h3 style={{ fontWeight: 'bold', marginTop: '30px' }}>3. MALİ HÜKÜMLER</h3>
            <p>
                Taraflar, yukarıda belirtilen hizmetin bedeli olarak
                <strong> {offer.value ? offer.value.toLocaleString('tr-TR') : 'Belirtilmemiş'} TRY</strong> (+ KDV)
                tutarında anlaşmaya varmışlardır.
            </p>

            <h3 style={{ fontWeight: 'bold', marginTop: '30px' }}>4. İMZA</h3>
            <p>
                İşbu belge, {new Date().toLocaleDateString('tr-TR')} tarihinde taraflarca okunarak imzalanmıştır.
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '80px', textAlign: 'center' }}>
                <div style={{ width: '40%' }}>
                    <p style={{ fontWeight: 'bold' }}>HİZMET SAĞLAYICI</p>
                    <p>AIESEC Türkiye Temsilcisi</p>
                    <p>{offer.createdBy?.name}</p>
                    <div style={{ marginTop: '40px', borderTop: '1px solid black' }}>İmza</div>
                </div>
                <div style={{ width: '40%' }}>
                    <p style={{ fontWeight: 'bold' }}>MÜŞTERİ</p>
                    <p>{company.name} Yetkilisi</p>
                    <br />
                    <div style={{ marginTop: '40px', borderTop: '1px solid black' }}>İmza</div>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '60px' }}>
                <PrintButton />
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        button { display: none !important; }
                    }
                `}} />
            </div>
        </div>
    );
}