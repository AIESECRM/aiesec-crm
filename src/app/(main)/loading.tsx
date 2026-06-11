import React from 'react';

export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: '#6b7280', gap: '16px' }}>
      <div style={{
        borderBottomColor: '#037ef3', borderRadius: '50%', width: '32px', height: '32px',
        border: '3px solid #e5e7eb', borderTopColor: '#037ef3', animation: 'spin 1s linear infinite'
      }} className="animate-spin"></div>
      <span style={{ fontSize: '14px', fontWeight: 500 }}>Yükleniyor...</span>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
