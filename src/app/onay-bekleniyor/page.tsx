'use client';

import React from 'react';
import { Clock, Mail, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function OnayBekleniyorPage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#f9fafb', padding: '24px'
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '16px', padding: '48px',
        maxWidth: '480px', width: '100%', textAlign: 'center',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
      }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          backgroundColor: '#fef9c3', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 24px'
        }}>
          <Clock style={{ width: '40px', height: '40px', color: '#ca8a04' }} />
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
          Onayınız Bekleniyor
        </h1>

        <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.6', marginBottom: '24px' }}>
          Hesabınız başarıyla oluşturuldu. Sisteme erişebilmek için yöneticinizin onayı bekleniyor.
        </p>

        <div style={{
          backgroundColor: '#f0f9ff', border: '1px solid #bae6fd',
          borderRadius: '12px', padding: '16px', marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <Mail style={{ width: '18px', height: '18px', color: '#0369a1' }} />
            <span style={{ fontSize: '14px', color: '#0369a1', fontWeight: '500' }}>
              Onaylandığınızda e-posta ile bilgilendirileceksiniz.
            </span>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            margin: '0 auto', padding: '10px 24px',
            backgroundColor: '#f3f4f6', color: '#374151',
            border: 'none', borderRadius: '8px', cursor: 'pointer',
            fontSize: '14px', fontWeight: '500'
          }}
        >
          <LogOut style={{ width: '16px', height: '16px' }} />
          Çıkış Yap
        </button>
      </div>
    </div>
  );
}